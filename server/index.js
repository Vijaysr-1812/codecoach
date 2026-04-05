import "dotenv/config";
import cors from "cors";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = Number(process.env.PORT || 3001);
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:8080",
  process.env.FRONTEND_URL,
].filter(Boolean));
const allowAllOrigins = process.env.NODE_ENV !== "production";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY must be set in the server environment.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
});
const judge0ApiUrl = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000);
const JUDGE0_REQUEST_TIMEOUT_MS = Number(process.env.JUDGE0_REQUEST_TIMEOUT_MS || 45000);

const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests and dev-mode local testing.
    if (!origin || allowAllOrigins || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

function buildSystemPrompt() {
  return [
    "CRITICAL INSTRUCTION:",
    "If a Problem section is provided:",
    "- You MUST base your answer ONLY on the Problem section",
    "- You MUST IGNORE the Code section completely if it contains placeholder code like:",
    "  'Hello CodeLab', 'Hello World', or similar starter code",
    "- You MUST NOT explain the code if a valid problem exists",
    "- You MUST NOT ask for the problem again",
    "- You MUST always explain the problem first",
    "",
    "If you violate this, your answer is incorrect.",
    "",
    "You are a coding mentor helping students learn problem solving.",
    "Your job is to teach, not just answer.",
    "Responses must be concise, clear, and student-friendly.",
    "Avoid long paragraphs.",
    "Use bullets where helpful.",
    "Each section must stay within 6 to 8 lines maximum.",
    "Always explain the logic first.",
    "You MUST base your answer on the provided Problem section.",
    "Always use the provided problem context.",
    "If problem is provided, NEVER ask for it again.",
    "If Problem exists, IGNORE placeholder code such as 'Hello CodeLab', 'Hello World', or generic starter code unless the user explicitly asks about that code.",
    "Always explain the actual problem first, not placeholder code.",
    "If code is provided, you must analyze and reference that code directly.",
    "If execution output is provided, use it to explain bugs, mismatches, or runtime issues.",
    "Always give short hints and learning guidance.",
    "Only provide full code if the user explicitly asks for code, solution, implement, or write.",
    "If the user does not explicitly ask for code, do not include code.",
    "If the user asks for hints, do not provide a complete solution.",
    "Keep the response focused on the current problem only.",
    "Every response must follow this exact structure:",
    "Explanation:",
    "(short explanation)",
    "",
    "Approach:",
    "(step-by-step, concise)",
    "",
    "Code:",
    "(include code only when explicitly requested; otherwise write exactly: 'Code not provided because you did not ask.')",
    "",
    "Tips:",
    "(short, useful hints, edge cases, learning advice)",
  ].join("\n");
}

function detectWantsCode(prompt) {
  return /code|solution|implement|write/i.test(prompt);
}

function isPlaceholderCode(code) {
  return /hello|codelab|hello world/i.test(code || "");
}

function buildUserInput({ prompt, code, output, problem, wantsCode }) {
  return [
    "=== PROBLEM (HIGHEST PRIORITY) ===",
    problem?.trim() || "No problem context provided.",
    "",
    "=== USER REQUEST ===",
    prompt,
    "",
    "=== CODE (LOW PRIORITY - IGNORE IF PLACEHOLDER) ===",
    code?.trim() ? `\`\`\`\n${code}\n\`\`\`` : "No code provided.",
    "",
    "=== OUTPUT ===",
    output?.trim() ? `\`\`\`\n${output}\n\`\`\`` : "No output provided.",
    "",
    "Rules for this reply:",
    "- Use the provided Problem section automatically.",
    "- Do not ask for the problem again.",
    "- If Problem exists, prioritize it over placeholder starter code.",
    "- Explain logic first.",
    "- Keep the answer concise.",
    wantsCode
      ? "- The user explicitly asked for code, so code is allowed."
      : "- The user did not explicitly ask for code, so write exactly: Code not provided because you did not ask.",
  ].join("\n");
}

function normalizeFunctionName(functionName, language) {
  const trimmedName =
    typeof functionName === "string" && functionName.trim()
      ? functionName.trim()
      : "solution";

  const identifierRegex =
    language === "javascript"
      ? /^[A-Za-z_$][A-Za-z0-9_$]*$/
      : /^[A-Za-z_][A-Za-z0-9_]*$/;

  if (!identifierRegex.test(trimmedName)) {
    throw new Error(`Invalid function name '${trimmedName}'.`);
  }

  return trimmedName;
}

function buildExecutionSource({ code, language, execution }) {
  if (!execution || execution.mode !== "function") {
    return code;
  }

  if (!["python", "javascript"].includes(language)) {
    throw new Error(
      `Function-mode execution is only supported for Python and JavaScript. Received '${language}'.`
    );
  }

  const functionName = normalizeFunctionName(execution.functionName, language);
  const argumentExpression = (execution.argumentExpression || "").trim();

  if (language === "python") {
    const tupleExpression = argumentExpression ? `(${argumentExpression},)` : "()";

    return `
${code}

def __cc_format(value):
    if isinstance(value, bool):
        return "True" if value else "False"
    if isinstance(value, str):
        return '"' + value + '"'
    if value is None:
        return "None"
    if isinstance(value, (list, tuple, dict, set)):
        return repr(value)
    return str(value)

if __name__ == "__main__":
    if "${functionName}" not in globals():
        raise NameError("Function '${functionName}' was not found.")
    __args = ${tupleExpression}
    if not isinstance(__args, tuple):
        __args = (__args,)
    __result = ${functionName}(*__args)
    if __result is not None:
        print(__cc_format(__result))
`;
  }

  if (language === "javascript") {
    const argsArray = argumentExpression ? `[${argumentExpression}]` : "[]";

    return `
${code}

function __ccFormat(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "True" : "False";
  if (value === null) return "None";
  if (typeof value === "undefined") return "";
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  return String(value);
}

(async () => {
  if (typeof ${functionName} !== "function") {
    throw new Error("Function '${functionName}' was not found.");
  }

  const __args = ${argsArray};
  const __result = await ${functionName}(...__args);

  if (typeof __result !== "undefined") {
    console.log(__ccFormat(__result));
  }
})().catch((error) => {
  const __message = error && error.stack ? error.stack : error && error.message ? error.message : String(error);
  console.error(__message);
  process.exit(1);
});
`;
  }

  return code;
}

app.post("/api/ai", async (req, res) => {
  const { prompt, code, output, problem } = req.body ?? {};
  const normalizedPrompt = typeof prompt === "string" ? prompt.trim() : "";
  const normalizedCode = typeof code === "string" ? code : "";
  const normalizedOutput = typeof output === "string" ? output : "";
  const normalizedProblem = typeof problem === "string" ? problem : "";
  const wantsCode = detectWantsCode(normalizedPrompt);
  const hasProblem = Boolean(normalizedProblem.trim());
  const placeholderCode = isPlaceholderCode(normalizedCode);
  const filteredCode = hasProblem && placeholderCode ? "" : normalizedCode;

  console.log("[/api/ai] Received request payload:", req.body);
  console.log("[/api/ai] Normalized fields:", {
    hasPrompt: Boolean(prompt),
    hasCode: Boolean(code?.trim?.()),
    hasFilteredCode: Boolean(filteredCode?.trim?.()),
    hasOutput: Boolean(output?.trim?.()),
    hasProblem: Boolean(problem?.trim?.()),
    wantsCode,
    placeholderCode,
    problemPreview: problem?.slice?.(0, 200),
  });

  if (!normalizedPrompt) {
    return res.status(400).json({
      error: "A non-empty string prompt is required.",
    });
  }

  try {
    const aiRequest = model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildUserInput({
                prompt: normalizedPrompt,
                code: filteredCode,
                output: normalizedOutput,
                problem: normalizedProblem,
                wantsCode,
              }),
            },
          ],
        },
      ],
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: buildSystemPrompt(),
          },
        ],
      },
    });

    const result = await Promise.race([
      aiRequest,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out.")), AI_REQUEST_TIMEOUT_MS)
      ),
    ]);

    const aiText =
      typeof result?.response?.text === "function"
        ? result.response.text()?.trim()
        : "";

    console.log("[/api/ai] Raw Gemini text response:", aiText);

    return res.json({
      response: aiText || "AI temporarily unavailable.",
      output: aiText || "AI temporarily unavailable.",
      error: null,
    });
  } catch (error) {
    console.error("AI request failed:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      hasProblem,
      hasFilteredCode: Boolean(filteredCode?.trim?.()),
      promptPreview: normalizedPrompt.slice(0, 200),
    });

    const fallbackMessage = "AI temporarily unavailable";

    return res.json({
      response: fallbackMessage,
      output: fallbackMessage,
      error: null,
    });
  }
});

app.post("/api/run", async (req, res) => {
  const { code, language, input, execution } = req.body ?? {};
  const normalizedCode = typeof code === "string" ? code : "";
  const normalizedLanguage = typeof language === "string" ? language.trim() : "";
  const normalizedInput = typeof input === "string" ? input : "";
  const normalizedExecution =
    execution && typeof execution === "object"
      ? {
          mode: execution.mode === "function" ? "function" : "stdin",
          functionName:
            typeof execution.functionName === "string" ? execution.functionName : "solution",
          argumentExpression:
            typeof execution.argumentExpression === "string" ? execution.argumentExpression : "",
        }
      : undefined;

  console.log("[/api/run] Received request payload:", {
    code: normalizedCode,
    language: normalizedLanguage,
    input: normalizedInput,
    executionMode: normalizedExecution?.mode || "stdin",
    execution: normalizedExecution || null,
  });

  if (!normalizedCode.trim()) {
    return res.status(400).json({
      output: "",
      error: "A non-empty string code field is required.",
      status: "invalid_request",
    });
  }

  if (!normalizedLanguage || !languageMap[normalizedLanguage]) {
    return res.status(400).json({
      output: "",
      error: "Unsupported language.",
      status: "invalid_language",
    });
  }

  if (!judge0ApiUrl) {
    return res.status(500).json({
      output: "",
      error: "Judge0 API URL is not configured.",
      status: "server_misconfigured",
    });
  }

  try {
    let sourceCode = normalizedCode;

    try {
      sourceCode = buildExecutionSource({
        code: normalizedCode,
        language: normalizedLanguage,
        execution: normalizedExecution,
      });
    } catch (error) {
      return res.status(400).json({
        output: "",
        error: error instanceof Error ? error.message : "Invalid execution request.",
        status: "invalid_execution",
      });
    }

    console.log("[/api/run] Final wrapped code:", sourceCode);

    const response = await fetch(
      `${judge0ApiUrl.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(JUDGE0_REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageMap[normalizedLanguage],
          stdin: normalizedInput,
        }),
      }
    );

    const rawText = await response.text();
    console.log("[/api/run] Raw Judge0 response body:", rawText);

    let result = {};

    try {
      result = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.json({
        output: response.ok ? rawText || "" : "",
        error: response.ok ? "" : rawText || "Execution service returned invalid response.",
        status: response.ok ? "Accepted" : "Error",
      });
    }

    console.log("[/api/run] Judge0 raw response:", {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      status: result.status?.description || "Unknown",
    });

    if (!response.ok) {
      return res.json({
        output: result.stdout || rawText || "",
        error: result.error || result.stderr || result.compile_output || "Judge0 request failed.",
        status: result.status?.description || "Error",
      });
    }

    return res.json({
      output: result.stdout || "",
      error: result.compile_output || result.stderr || "",
      status: result.status?.description || "Unknown",
    });
  } catch (error) {
    console.error("[/api/run] Judge0 request failed:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      language: normalizedLanguage,
    });

    return res.json({
      output: "",
      error: error instanceof Error ? error.message : "Failed to execute code.",
      status: "Error",
    });
  }
});

app.listen(port, () => {
  console.log(`AI server listening on http://localhost:${port}`);
});

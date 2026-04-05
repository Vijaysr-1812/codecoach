const RUNNER_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:3001";
const RUNNER_REQUEST_TIMEOUT_MS = 45000;

interface RunCodeRequest {
  code: string;
  language: string;
  input?: string;
  execution?: {
    mode: "stdin" | "function";
    functionName?: string;
    argumentExpression?: string;
  };
}

interface RunCodeResponse {
  output: string;
  error: string;
  status: string;
}

export async function runCodeViaBackend({
  code,
  language,
  input,
  execution,
}: RunCodeRequest): Promise<RunCodeResponse> {
  if (!code.trim()) {
    throw new Error("Code is required.");
  }

  if (!language.trim()) {
    throw new Error("Language is required.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), RUNNER_REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      code,
      language,
      input: input || "",
      execution,
    };

    console.log("[codeRunnerClient] Sending /api/run payload:", payload);

    const result = await fetch(`${RUNNER_API_BASE_URL}/api/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    const rawText = await result.text();
    console.log("[codeRunnerClient] Raw /api/run response:", {
      ok: result.ok,
      status: result.status,
      body: rawText,
    });

    let data: Partial<RunCodeResponse> & { error?: string };

    try {
      data = rawText
        ? (JSON.parse(rawText) as RunCodeResponse & { error?: string })
        : { output: "", error: "Empty server response.", status: "unknown_error" };
    } catch {
      data = {
        output: result.ok ? rawText : "",
        error: result.ok ? "" : rawText || "Execution service returned invalid response.",
        status: result.ok ? "Unknown" : "Error",
      };
    }

    return {
      output: data.output || "",
      error: data.error || "",
      status: data.status || (result.ok ? "Unknown" : "Error"),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        output: "",
        error: "Code execution timed out. Please try again.",
        status: "Error",
      };
    }

    if (error instanceof Error) {
      console.error("[codeRunnerClient] Request failed:", error.message);
      return {
        output: "",
        error: error.message,
        status: "Error",
      };
    }

    return {
      output: "",
      error: "Failed to run code.",
      status: "Error",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

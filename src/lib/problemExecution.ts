export type ProblemExecutionMode = "function" | "stdin";

export interface ProblemExecutionConfig {
  mode: ProblemExecutionMode;
  functionName?: string;
}

const PYTHON_FUNCTION_REGEX = /(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/;
const JAVASCRIPT_FUNCTION_REGEXES = [
  /(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/,
  /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/,
  /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][A-Za-z0-9_$]*\s*=>/,
];
const CPP_FUNCTION_REGEX =
  /(?:^|\n)\s*(?!if\b|for\b|while\b|switch\b|catch\b)(?:[\w:<>~*&]+\s+)+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{}]*\)\s*(?:const\s*)?\{/;

export function inferFunctionName(source: string, language: string): string {
  const trimmedSource = source.trim();

  if (language === "python") {
    const match = trimmedSource.match(PYTHON_FUNCTION_REGEX);
    return match?.[1] || "solution";
  }

  if (language === "javascript") {
    const match = JAVASCRIPT_FUNCTION_REGEXES.map((regex) => trimmedSource.match(regex)).find(Boolean);
    return match?.[1] || "solution";
  }

  if (language === "cpp") {
    const match = trimmedSource.match(CPP_FUNCTION_REGEX);
    return match?.[1] || "solution";
  }

  return "solution";
}

export function detectExecutionMode(source: string, starterCode?: string): ProblemExecutionMode {
  const combined = `${starterCode || ""}\n${source}`;
  const lowered = combined.toLowerCase();

  if (
    lowered.includes("input(") ||
    lowered.includes("cin >>") ||
    lowered.includes("getline(cin") ||
    lowered.includes("prompt(") ||
    lowered.includes("process.stdin") ||
    lowered.includes("readline(")
  ) {
    return "stdin";
  }

  if (
    PYTHON_FUNCTION_REGEX.test(combined) ||
    JAVASCRIPT_FUNCTION_REGEXES.some((regex) => regex.test(combined)) ||
    CPP_FUNCTION_REGEX.test(combined)
  ) {
    return "function";
  }

  return "stdin";
}

export function buildExecutionInstructions(config: ProblemExecutionConfig) {
  if (config.mode === "function") {
    return `Write only the function${config.functionName ? ` \`${config.functionName}(...)\`` : ""}. Run Code uses the Input box as function arguments. Run Test Cases uses the predefined cases.`;
  }

  return "Use input/print style code. Run Code uses the Input box as stdin. Run Test Cases uses the predefined stdin cases.";
}

export function normalizeExecutionOutput(value = ""): string {
  const trimmed = value.trim().replace(/\r\n/g, "\n");

  if (!trimmed) {
    return "";
  }

  let normalized = "";
  let quote: '"' | "'" | null = null;
  let outsideToken = "";
  const punctuation = new Set(["[", "]", "{", "}", "(", ")", ",", ":", "\n"]);

  const flushOutsideToken = () => {
    if (!outsideToken) {
      return;
    }

    normalized += outsideToken
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null")
      .replace(/\btrue\b/g, "true")
      .replace(/\bfalse\b/g, "false")
      .replace(/\bnone\b/g, "null")
      .replace(/\bnull\b/g, "null");

    outsideToken = "";
  };

  for (let index = 0; index < trimmed.length; index += 1) {
    const currentChar = trimmed[index];
    const previousChar = index > 0 ? trimmed[index - 1] : "";

    if ((currentChar === '"' || currentChar === "'") && previousChar !== "\\") {
      flushOutsideToken();
      quote = quote === currentChar ? null : quote ? quote : currentChar;
      normalized += currentChar;
      continue;
    }

    if (quote) {
      normalized += currentChar;
      continue;
    }

    if (/\s/.test(currentChar)) {
      flushOutsideToken();

      const nextNonWhitespace = trimmed.slice(index + 1).match(/\S/);
      const previousOutputChar = normalized[normalized.length - 1] || "";
      const nextChar = nextNonWhitespace ? nextNonWhitespace[0] : "";

      if (
        !previousOutputChar ||
        previousOutputChar === " " ||
        punctuation.has(previousOutputChar) ||
        punctuation.has(nextChar)
      ) {
        continue;
      }

      normalized += " ";
      continue;
    }

    if (/[A-Za-z]/.test(currentChar)) {
      outsideToken += currentChar;
      continue;
    }

    flushOutsideToken();
    normalized += currentChar;
  }

  flushOutsideToken();
  return normalized.trim();
}

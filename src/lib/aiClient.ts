const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:3001";
const AI_REQUEST_TIMEOUT_MS = 45000;

interface AiAssistantRequest {
  prompt: string;
  code?: string;
  output?: string;
  problem?: string;
}

interface AiAssistantResponse {
  response: string;
  output?: string;
  error?: string | null;
}

export async function requestAiAssistant({
  prompt,
  code,
  output,
  problem,
}: AiAssistantRequest): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("A prompt is required.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      prompt: prompt.trim(),
      code: code?.trim() || "",
      output: output?.trim() || "",
      problem: problem?.trim() || "",
    };

    console.log("[aiClient] Sending /api/ai payload:", payload);

    const result = await fetch(`${AI_API_BASE_URL}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    const rawText = await result.text();
    console.log("[aiClient] Raw /api/ai response:", {
      ok: result.ok,
      status: result.status,
      body: rawText,
    });

    let data: AiAssistantResponse;

    try {
      data = rawText
        ? (JSON.parse(rawText) as AiAssistantResponse)
        : { response: "", output: "", error: "Empty server response." };
    } catch {
      data = {
        response: rawText || "AI temporarily unavailable.",
        output: rawText || "AI temporarily unavailable.",
        error: null,
      };
    }

    const message =
      data.response?.trim() ||
      data.output?.trim() ||
      rawText.trim() ||
      (result.ok ? "" : data.error || "AI temporarily unavailable.");

    if (message) {
      return message;
    }

    return "AI temporarily unavailable. Please try again.";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "AI temporarily unavailable. Please try again.";
    }

    if (error instanceof Error) {
      console.error("[aiClient] Request failed:", error.message);
      return `AI temporarily unavailable.\n\n${error.message}`;
    }

    return "AI temporarily unavailable. Please try again.";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

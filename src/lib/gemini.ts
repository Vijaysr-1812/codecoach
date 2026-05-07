import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────
//  Client setup
// ─────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL_NAME = 'gemini-2.5-flash';

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!API_KEY || API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
    throw new Error('VITE_GEMINI_API_KEY is not set in .env');
  }
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

function getModel() {
  return getClient().getGenerativeModel({ model: MODEL_NAME });
}

function getRawErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try { return JSON.stringify(error); } catch { return 'Unknown error'; }
}

export function getAIErrorMessage(error: unknown): string {
  const message = getRawErrorMessage(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('vite_gemini_api_key')) return 'Please add your Gemini API key to .env as VITE_GEMINI_API_KEY.';
  if (normalized.includes('quota') || normalized.includes('[429') || normalized.includes('resource_exhausted')) return `Gemini quota exceeded for ${MODEL_NAME}. Wait for quota reset, enable billing/increase quota in Google AI Studio, or use a different Gemini API key/project.`;
  if (normalized.includes('api key not valid') || normalized.includes('api_key_invalid') || normalized.includes('[400') || normalized.includes('[403')) return 'Gemini API key was rejected. Check that VITE_GEMINI_API_KEY is correct and allowed for the Gemini API.';
  if (normalized.includes('failed to fetch') || normalized.includes('network')) return 'Could not reach Gemini. Check your internet connection and try again.';
  if (normalized.includes('[503') || normalized.includes('overloaded') || normalized.includes('unavailable')) return 'Gemini is temporarily unavailable. Try again in a minute.';

  return `AI request failed: ${message}`;
}

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
export interface AIProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: string;
  hints: string[];
  testCases: { input: string; output: string }[];
  starterCode: Record<string, string>;
}

export interface CodeReview {
  quality: number;
  efficiency: number;
  readability: number;
  feedback: string;
  suggestions: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface VivaQuestion {
  question: string;
  hint: string;
}

export interface RoadmapPathItem {
  topic: string;
  why_you_need_it: string;
  practice_problem_seed: string;
  est_minutes: number;
}

export interface GeneratedRoadmap {
  weak_topics: string[];
  strengths: string[];
  path: RoadmapPathItem[];
  next_level_eta: string;
  summary: string;
}

export interface RoadmapSubmissionContext {
  level: string;
  score: number;
  language: string;
  questions: Array<{
    title: string;
    difficulty: string;
    passed: boolean;
    user_code: string;
    first_failing_input?: string;
    first_failing_expected?: string;
    first_failing_got?: string;
  }>;
}

// ─────────────────────────────────────────────
//  Helpers Ported From Your Express Server
// ─────────────────────────────────────────────
function detectWantsCode(prompt: string) {
  return /code|solution|implement|write/i.test(prompt);
}

function isPlaceholderCode(code: string) {
  return /hello|codelab|hello world/i.test(code || "");
}

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

// ─────────────────────────────────────────────
//  1. CONTEXTUAL CHAT (WITH STRICT NODE.JS LOGIC)
// ─────────────────────────────────────────────
export async function chatWithAI(
  userMessage: string,
  context: {
    currentProblem: AIProblem | null;
    currentCode: string;
    language: string;
    chatHistory: { role: 'user' | 'model'; parts: string }[];
    output?: string;
  }
): Promise<string> {
  try {
    const model = getModel();
    const systemContext = buildSystemPrompt();

    const wantsCode = detectWantsCode(userMessage);
    const hasProblem = Boolean(context.currentProblem);
    const placeholderCode = isPlaceholderCode(context.currentCode);
    const filteredCode = hasProblem && placeholderCode ? "" : context.currentCode;

    const formattedUserInput = [
      "=== PROBLEM (HIGHEST PRIORITY) ===",
      context.currentProblem ? `Title: ${context.currentProblem.title}\nDescription: ${context.currentProblem.description}` : "No problem context provided.",
      "",
      "=== USER REQUEST ===",
      userMessage,
      "",
      "=== CODE (LOW PRIORITY - IGNORE IF PLACEHOLDER) ===",
      filteredCode?.trim() ? `\`\`\`${context.language}\n${filteredCode}\n\`\`\`` : "No code provided.",
      "",
      "=== OUTPUT ===",
      context.output?.trim() ? `\`\`\`\n${context.output}\n\`\`\`` : "No output provided.",
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

    let safeHistory = context.chatHistory
      .filter(h => h.parts && h.parts.trim() !== '')
      .map(h => ({
        role: h.role,
        parts: [{ text: h.parts }],
      }));

    const firstUserIdx = safeHistory.findIndex(h => h.role === 'user');
    if (firstUserIdx > 0) {
      safeHistory = safeHistory.slice(firstUserIdx);
    } else if (firstUserIdx === -1) {
      safeHistory = []; 
    }

    if (!userMessage || userMessage.trim() === '') {
      throw new Error("Message cannot be empty.");
    }

    const chat = model.startChat({
      history: safeHistory,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemContext }]
      },
    });

    const result = await chat.sendMessage([{ text: formattedUserInput }]);
    return result.response.text();

  } catch (error: unknown) {
    console.error("=== CODECOACH CHAT API ERROR ===", error);
    throw error;
  }
}

// ─────────────────────────────────────────────
//  2. DYNAMIC PROBLEM GENERATOR
// ─────────────────────────────────────────────
export async function generateProblem(
  language: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  topic?: string
): Promise<AIProblem> {
  const model = getModel();
  const topicHint = topic ? `Topic focus: ${topic}` : 'Pick any classic algorithm/data-structure topic.';

  const prompt = `
Generate a coding problem for a student. Return ONLY valid JSON, no markdown.

Requirements:
- Language: ${language}
- Difficulty: ${difficulty}
- ${topicHint}

JSON schema (return exactly this structure):
{
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "description": "Full problem description with constraints",
  "examples": "Input: ...\\nOutput: ...\\nExplanation: ...",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "testCases": [
    {"input": "sample input 1", "output": "expected output 1"},
    {"input": "sample input 2", "output": "expected output 2"}
  ],
  "starterCode": {
    "python": "# starter code here",
    "javascript": "// starter code here",
    "java": "// starter code here",
    "cpp": "// starter code here",
    "c": "// starter code here"
  }
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as AIProblem;
  } catch {
    return {
      title: 'Array Sum', difficulty,
      description: 'Given an array of integers, return the sum of all elements.',
      examples: 'Input: [1, 2, 3, 4, 5]\nOutput: 15',
      hints: ['Iterate through the array', 'Add each element to a running total'],
      testCases: [{ input: '[1, 2, 3]', output: '6' }, { input: '[0, -1, 1]', output: '0' }],
      starterCode: {
        python: 'def solve(nums):\n    # Write your solution\n    pass',
        javascript: 'function solve(nums) {\n    // Write your solution\n}',
        java: 'class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}',
        cpp: '#include<vector>\nusing namespace std;\nint solve(vector<int>& nums) {\n    return 0;\n}',
        c: '#include<stdio.h>\nint solve(int* nums, int n) {\n    return 0;\n}',
      },
    };
  }
}

// ─────────────────────────────────────────────
//  3. SMART PROGRESSIVE HINTS
// ─────────────────────────────────────────────
export async function getProgressiveHint(
  level: 1 | 2 | 3,
  problem: AIProblem,
  currentCode: string,
  language: string
): Promise<string> {
  const model = getModel();
  const levelDesc = {
    1: 'Give a conceptual hint — mention the relevant concept or data structure, but no code or algorithm.',
    2: 'Give an algorithmic hint — describe the approach/steps in plain English, no code.',
    3: 'Give pseudocode — show the algorithm as pseudocode, NOT actual code in any language.',
  };

  const prompt = `
Problem: "${problem.title}"
${problem.description}

Student's current code (${language}):
\`\`\`${language}
${currentCode || '(nothing written yet)'}
\`\`\`

${levelDesc[level]}

Keep it to 3-4 sentences. Be encouraging. Do NOT reveal the full solution.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─────────────────────────────────────────────
//  4. AI CODE REVIEW
// ─────────────────────────────────────────────
export async function reviewCode(
  code: string,
  language: string,
  problem: AIProblem | null,
  output: string
): Promise<CodeReview> {
  const model = getModel();

  const prompt = `
Review this ${language} code for the problem: "${problem?.title ?? 'General Coding'}".

Code:
\`\`\`${language}
${code}
\`\`\`

Program Output: ${output || '(no output)'}

Return ONLY valid JSON with this exact structure:
{
  "quality": <integer 0-10>,
  "efficiency": <integer 0-10>,
  "readability": <integer 0-10>,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "feedback": "2-3 sentence overall feedback",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as CodeReview;
  } catch {
    return {
      quality: 7, efficiency: 6, readability: 7,
      timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
      feedback: 'Good attempt! Consider edge cases and variable naming.',
      suggestions: ['Add comments explaining your logic', 'Consider edge cases like empty input', 'Review variable naming'],
    };
  }
}

// ─────────────────────────────────────────────
//  5. VIVA QUESTION GENERATOR
// ─────────────────────────────────────────────
export async function generateVivaQuestions(
  code: string,
  language: string,
  problem: AIProblem | null
): Promise<VivaQuestion[]> {
  const model = getModel();

  const prompt = `
A student solved the problem "${problem?.title ?? 'coding problem'}" in ${language}.

Their solution:
\`\`\`${language}
${code}
\`\`\`

Generate exactly 3 viva (oral exam) questions to test if they truly understand their solution.
Return ONLY valid JSON array:
[
  {"question": "Question 1?", "hint": "Think about..."},
  {"question": "Question 2?", "hint": "Consider..."},
  {"question": "Question 3?", "hint": "What if..."}
]
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as VivaQuestion[];
  } catch {
    return [
      { question: 'What is the time complexity of your solution?', hint: 'Count the number of iterations.' },
      { question: 'What happens if the input array is empty?', hint: 'Trace through your code with an empty input.' },
      { question: 'How would you optimize this if the input size was 10 million?', hint: 'Think about more efficient data structures.' },
    ];
  }
}

// ─────────────────────────────────────────────
//  6. PERSONALIZED ROADMAP GENERATOR
// ─────────────────────────────────────────────
export async function generateRoadmap(ctx: RoadmapSubmissionContext): Promise<GeneratedRoadmap> {
  const model = getModel();

  const questionsBlock = ctx.questions.map((q, i) => {
    const failureBlock = !q.passed && q.first_failing_input
      ? `First failing test case:\n  Input:    ${q.first_failing_input}\n  Expected: ${q.first_failing_expected}\n  Got:      ${q.first_failing_got}`
      : '';
    return `Q${i + 1}: "${q.title}" (${q.difficulty}) — ${q.passed ? 'PASSED' : 'FAILED'}
Student's ${ctx.language} code:
\`\`\`${ctx.language}
${q.user_code || '(empty)'}
\`\`\`
${failureBlock}`;
  }).join('\n---\n');

  const prompt = `
You are a coding curriculum advisor. A student just finished a placement exam.

Overall: scored ${ctx.score}%, placed at "${ctx.level}" level. Primary language: ${ctx.language}.

Per-question results:
${questionsBlock}

Based on WHAT SPECIFICALLY the student got wrong, generate a PERSONALIZED learning roadmap.

Return ONLY valid JSON (no markdown fences):
{
  "weak_topics": ["specific skill gap"],
  "strengths": ["specific strength"],
  "path": [
    {
      "topic": "Specific topic/skill",
      "why_you_need_it": "One sentence tying it to their actual mistake.",
      "practice_problem_seed": "One-sentence description of a targeted practice problem",
      "est_minutes": 30
    }
  ],
  "next_level_eta": "Realistic ETA like '2 weeks at 1h/day'",
  "summary": "2 sentences addressed to the student in second person — encouraging but honest."
}

Path MUST have 3-6 items, ordered by priority.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as GeneratedRoadmap;
  } catch {
    return {
      weak_topics: ['Fundamentals review'],
      strengths: [],
      path: [
        { topic: 'Arrays & iteration', why_you_need_it: 'Foundational for every subsequent topic.', practice_problem_seed: 'Write a function that returns the sum of every other element in an array.', est_minutes: 20 },
        { topic: 'String manipulation', why_you_need_it: 'Builds the two-pointer habit you will reuse in harder problems.', practice_problem_seed: 'Reverse a string in place without built-in reverse.', est_minutes: 20 },
        { topic: 'Binary search', why_you_need_it: 'Classic divide-and-conquer pattern interviewers expect.', practice_problem_seed: 'Find the insertion index for a target in a sorted array.', est_minutes: 30 },
      ],
      next_level_eta: '2 weeks at 1h/day',
      summary: 'Keep going — focus on the weak areas first and you will level up quickly.',
    };
  }
}
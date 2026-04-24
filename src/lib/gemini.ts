// ─────────────────────────────────────────────
//  Client setup — Groq REST API (native fetch, browser-safe)
// ─────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

async function complete(messages: Message[]): Promise<string> {
  if (!API_KEY || API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE') {
    throw new Error('VITE_GROQ_API_KEY is not set in .env');
  }
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let msg = `Groq API error ${res.status}`;
    try { msg = JSON.parse(errText)?.error?.message ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
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
//  1. CONTEXTUAL CHAT
// ─────────────────────────────────────────────
export async function chatWithAI(
  userMessage: string,
  context: {
    currentProblem: AIProblem | null;
    currentCode: string;
    language: string;
    chatHistory: { role: 'user' | 'model'; parts: string }[];
  }
): Promise<string> {
  const systemPrompt = `You are CodeCoach AI, an expert coding mentor helping students learn programming.
Your tone is encouraging, concise, and educational.

CURRENT CONTEXT:
- Language: ${context.language}
- Problem: ${context.currentProblem?.title ?? 'None selected'}
- Problem Description: ${context.currentProblem?.description ?? 'N/A'}
- Student's Current Code:
\`\`\`${context.language}
${context.currentCode || '(empty)'}
\`\`\`

INSTRUCTIONS:
- If asked about hints, give ONE hint at a time — don't reveal the full solution.
- If asked to debug, point to the specific line or logic issue.
- Format code with proper markdown code blocks.
- Keep responses under 200 words unless a detailed explanation is needed.
- If the student asks for a new problem, say "Click the 🎯 Generate Problem button to get a fresh one!"`;

  // Drop leading model messages — LLM APIs require history to start with user
  const firstUserIdx = context.chatHistory.findIndex(h => h.role === 'user');
  const trimmed = firstUserIdx >= 0 ? context.chatHistory.slice(firstUserIdx) : [];

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...trimmed.map(h => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as Message['role'],
      content: h.parts,
    })),
    { role: 'user', content: userMessage },
  ];

  return complete(messages);
}

// ─────────────────────────────────────────────
//  2. DYNAMIC PROBLEM GENERATOR
// ─────────────────────────────────────────────
export async function generateProblem(
  language: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  topic?: string
): Promise<AIProblem> {
  const topicHint = topic ? `Topic focus: ${topic}` : 'Pick any classic algorithm/data-structure topic.';

  const prompt = `Generate a coding problem for a student. Return ONLY valid JSON, no markdown.

Requirements:
- Language: ${language}
- Difficulty: ${difficulty}
- ${topicHint}

JSON schema:
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
}`;

  const text = await complete([{ role: 'user', content: prompt }]);
  const jsonText = text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

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
        python: 'def solve(nums):\n    pass',
        javascript: 'function solve(nums) {}',
        java: 'class Solution {\n    public int solve(int[] nums) { return 0; }\n}',
        cpp: '#include<vector>\nusing namespace std;\nint solve(vector<int>& nums) { return 0; }',
        c: '#include<stdio.h>\nint solve(int* nums, int n) { return 0; }',
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
  const levelDesc = {
    1: 'Give a conceptual hint — mention the relevant concept or data structure, but no code.',
    2: 'Give an algorithmic hint — describe the approach in plain English, no code.',
    3: 'Give pseudocode — show the algorithm as pseudocode, NOT actual code.',
  };

  const prompt = `Problem: "${problem.title}"\n${problem.description}\n\nStudent's code (${language}):\n\`\`\`${language}\n${currentCode || '(nothing written yet)'}\n\`\`\`\n\n${levelDesc[level]}\n\nKeep it to 3-4 sentences. Be encouraging. Do NOT reveal the full solution.`;

  return complete([{ role: 'user', content: prompt }]);
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
  const prompt = `Review this ${language} code for: "${problem?.title ?? 'General Coding'}".

Code:
\`\`\`${language}
${code}
\`\`\`

Output: ${output || '(no output)'}

Return ONLY valid JSON:
{
  "quality": <0-10>,
  "efficiency": <0-10>,
  "readability": <0-10>,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "feedback": "2-3 sentence overall feedback",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  const text = await complete([{ role: 'user', content: prompt }]);
  const jsonText = text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as CodeReview;
  } catch {
    return {
      quality: 7, efficiency: 6, readability: 7,
      timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
      feedback: 'Good attempt! Consider edge cases and variable naming.',
      suggestions: ['Add comments', 'Consider edge cases like empty input', 'Review variable naming'],
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
  const prompt = `A student solved "${problem?.title ?? 'coding problem'}" in ${language}.\n\nSolution:\n\`\`\`${language}\n${code}\n\`\`\`\n\nGenerate exactly 3 viva questions. Return ONLY valid JSON array:\n[\n  {"question": "Q1?", "hint": "Think about..."},\n  {"question": "Q2?", "hint": "Consider..."},\n  {"question": "Q3?", "hint": "What if..."}\n]`;

  const text = await complete([{ role: 'user', content: prompt }]);
  const jsonText = text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as VivaQuestion[];
  } catch {
    return [
      { question: 'What is the time complexity?', hint: 'Count iterations.' },
      { question: 'What if the input is empty?', hint: 'Trace through your code.' },
      { question: 'How would you optimize for 10M inputs?', hint: 'Think about data structures.' },
    ];
  }
}

// ─────────────────────────────────────────────
//  6. PERSONALIZED ROADMAP GENERATOR
// ─────────────────────────────────────────────
export async function generateRoadmap(ctx: RoadmapSubmissionContext): Promise<GeneratedRoadmap> {
  const questionsBlock = ctx.questions.map((q, i) => {
    const fail = !q.passed && q.first_failing_input
      ? `\n  Failing: input=${q.first_failing_input}, expected=${q.first_failing_expected}, got=${q.first_failing_got}`
      : '';
    return `Q${i + 1}: "${q.title}" (${q.difficulty}) — ${q.passed ? 'PASSED' : 'FAILED'}${fail}\n\`\`\`${ctx.language}\n${q.user_code || '(empty)'}\n\`\`\``;
  }).join('\n---\n');

  const prompt = `Coding curriculum advisor. Student scored ${ctx.score}% at "${ctx.level}" level in ${ctx.language}.

${questionsBlock}

Generate a PERSONALIZED roadmap based on their actual mistakes. Return ONLY valid JSON:
{
  "weak_topics": ["specific gap"],
  "strengths": ["specific strength"],
  "path": [{"topic": "...", "why_you_need_it": "...", "practice_problem_seed": "...", "est_minutes": 30}],
  "next_level_eta": "2 weeks at 1h/day",
  "summary": "2 encouraging sentences to the student."
}
Path: 3-6 items ordered by priority.`;

  const text = await complete([{ role: 'user', content: prompt }]);
  const jsonText = text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(jsonText) as GeneratedRoadmap;
  } catch {
    return {
      weak_topics: ['Fundamentals review'], strengths: [],
      path: [
        { topic: 'Arrays & iteration', why_you_need_it: 'Foundational for every topic.', practice_problem_seed: 'Sum every other element.', est_minutes: 20 },
        { topic: 'String manipulation', why_you_need_it: 'Builds two-pointer habit.', practice_problem_seed: 'Reverse string in place.', est_minutes: 20 },
      ],
      next_level_eta: '2 weeks at 1h/day',
      summary: 'Keep going — focus on weak areas first and you will level up quickly.',
    };
  }
}

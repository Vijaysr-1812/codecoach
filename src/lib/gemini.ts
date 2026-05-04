import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────
//  Client setup
// ─────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!API_KEY || API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
    throw new Error('VITE_GEMINI_API_KEY is not set in .env');
  }
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
  return genAI;
}

function getModel() {
  return getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
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
  const model = getModel();

  const systemContext = `
You are CodeCoach AI, an expert coding mentor helping students learn programming.
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
- If the student asks for a new problem, say "Click the 🎯 Generate Problem button to get a fresh one!"
`.trim();

  // Drop leading model messages — Gemini requires history to start with 'user'
  const firstUserIdx = context.chatHistory.findIndex(h => h.role === 'user');
  const trimmed = firstUserIdx >= 0 ? context.chatHistory.slice(firstUserIdx) : [];

  const history = trimmed.map(h => ({
    role: h.role,
    parts: [{ text: h.parts }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction: { parts: [{ text: systemContext }] },
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
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

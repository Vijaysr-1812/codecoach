import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Play, Brain, Terminal, Code, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { requestAiAssistant } from '@/lib/aiClient';
import { runCodeViaBackend } from '@/lib/codeRunnerClient';
import { ROADMAP_DATA, PracticeProblem as RoadmapPracticeProblem, RoadmapNode } from '@/data/roadmapData';
import {
  ProblemExecutionConfig,
  ProblemExecutionMode,
  buildExecutionInstructions,
  detectExecutionMode,
  inferFunctionName,
  normalizeExecutionOutput,
} from '@/lib/problemExecution';

interface StudentData {
  name: string;
  rollNumber: string;
  totalProblems: number;
  streakCount: number;
  achievements: string[];
}

interface Problem {
  id?: string;
  title: string;
  difficulty: string;
  description: string;
  example: string;
  expectedOutput: string;
  hints: string[];
  starterCode?: string;
  executionMode?: ProblemExecutionMode;
  functionName?: string;
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  referenceSolution?: string;
}

function buildProblemContext(problem: Problem | null) {
  if (!problem) return undefined;

  return [
    `Title: ${problem.title}`,
    `Difficulty: ${problem.difficulty}`,
    `Description: ${problem.description}`,
    `Example: ${problem.example}`,
    `Expected Output: ${problem.expectedOutput}`,
    `Test Cases: ${problem.testCases.map((testCase, index) => `#${index + 1} input=${JSON.stringify(testCase.input)} expected=${JSON.stringify(testCase.expected)}`).join(' | ')}`,
    `Available Hints: ${problem.hints.join(' | ')}`,
  ].join('\n');
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  status: 'Passed' | 'Failed';
  error?: string;
}

interface ValidationSummary {
  title: string;
  passed: number;
  total: number;
}

const normalize = (str = '') => str.replace(/\s/g, '');

function flattenRoadmapNodes(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenRoadmapNodes(node.children) : [])]);
}

function buildRoadmapProblem(node: RoadmapNode, roadmapProblem: RoadmapPracticeProblem): Problem {
  const functionName = roadmapProblem.functionName || inferFunctionName(roadmapProblem.starterCode, 'python');
  const executionMode = roadmapProblem.executionMode || 'function';
  const firstTestCase = roadmapProblem.testCases[0];

  return {
    id: node.id,
    title: roadmapProblem.title,
    difficulty: roadmapProblem.difficulty,
    description: roadmapProblem.description,
    example: firstTestCase
      ? `Input: ${firstTestCase.input}\nOutput: ${firstTestCase.expected}`
      : 'No example available.',
    expectedOutput: normalizeExpectedValue(firstTestCase?.expected || ''),
    hints: [
      executionMode === 'function'
        ? `Write only the function ${functionName}(...) and return the result.`
        : 'Read from input and print the final answer.',
      'Use Run Code to try a custom input.',
      'Use Run Test Cases to validate against all predefined tests.',
    ],
    starterCode: roadmapProblem.starterCode,
    executionMode,
    functionName,
    testCases: roadmapProblem.testCases.map((testCase) => ({
      input: testCase.input.trim(),
      expected: normalizeExpectedValue(testCase.expected),
    })),
  };
}

function normalizeExpectedValue(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\s*,\s*/g, ',')
    .replace(/\[\s*/g, '[')
    .replace(/\s*\]/g, ']')
    .trim();
}

function fixTestCaseInput(problemTitle: string, input: string) {
  const trimmedInput = input.trim();

  if (problemTitle === 'Two Sum' && trimmedInput && !trimmedInput.includes('\n')) {
    const parts = trimmedInput.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts.slice(0, -1).join(' ')}\n${parts[parts.length - 1]}`;
    }
  }

  return trimmedInput;
}

const rawPracticeProblems: Problem[] = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    expectedOutput: '[0, 1]',
    hints: ['Use a hash map to store the values and their indices', 'For each element, check if target - element exists in the map'],
    testCases: [
      { input: '2 7 11 15\n9', expected: '[0,1]' },
      { input: '3 2 4\n6', expected: '[1,2]' },
      { input: '3 3\n6', expected: '[0,1]' },
    ],
    referenceSolution: `nums = list(map(int, input().split()))
target = int(input().strip())
seen = {}

for index, value in enumerate(nums):
    needed = target - value
    if needed in seen:
        print(f"[{seen[needed]},{index}]")
        break
    seen[value] = index`,
  },
  {
    title: 'Palindrome Check',
    difficulty: 'Easy',
    description: 'Write a function to check if a given string is a palindrome (reads the same forwards and backwards).',
    example: "Input: 'racecar'\nOutput: True\nInput: 'hello'\nOutput: False",
    expectedOutput: 'True',
    hints: ['Compare characters from start and end', 'Use two pointers approach', 'Consider case sensitivity'],
    testCases: [
      { input: 'racecar', expected: 'True' },
      { input: 'hello', expected: 'False' },
      { input: 'madam', expected: 'True' },
    ],
    referenceSolution: `text = input().strip()
print(str(text == text[::-1]))`,
  },
  {
    title: 'Fibonacci Sequence',
    difficulty: 'Medium',
    description: 'Write a function to generate the nth Fibonacci number. The sequence starts with 0, 1.',
    example: 'Input: n = 5\nOutput: 5\nSequence: 0, 1, 1, 2, 3, 5',
    expectedOutput: '5',
    hints: ['Use dynamic programming for efficiency', 'Consider recursive approach with memoization', 'Base cases are F(0) = 0, F(1) = 1'],
    testCases: [
      { input: '0', expected: '0' },
      { input: '5', expected: '5' },
      { input: '8', expected: '21' },
    ],
    referenceSolution: `n = int(input().strip())
if n == 0:
    print(0)
elif n == 1:
    print(1)
else:
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    print(b)`,
  },
];

const practiceProblems: Problem[] = rawPracticeProblems.map((problem) => ({
  ...problem,
  expectedOutput: normalizeExpectedValue(problem.expectedOutput),
  testCases: problem.testCases.map((testCase) => ({
    input: fixTestCaseInput(problem.title, testCase.input),
    expected: normalizeExpectedValue(testCase.expected),
  })),
}));

export default function PracticePage() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [executionError, setExecutionError] = useState('');
  const [executionStatus, setExecutionStatus] = useState('Idle');
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary[]>([]);
  const [isValidatingProblems, setIsValidatingProblems] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const problemContext = buildProblemContext(currentProblem);
  const canUseAssistant = Boolean(problemContext?.trim()) && !isGeneratingProblem;
  const testCases = currentProblem?.testCases || [];
  const passedTests = testResults.filter((result) => result.status === 'Passed').length;
  const executionConfig: ProblemExecutionConfig = currentProblem
    ? {
        mode: currentProblem.executionMode || detectExecutionMode(code, currentProblem.starterCode),
        functionName:
          currentProblem.functionName || inferFunctionName(code || currentProblem.starterCode || "", selectedLanguage),
      }
    : { mode: 'stdin' };
  const executionInstructions = buildExecutionInstructions(executionConfig);

  useEffect(() => {
    try {
      const studentData = localStorage.getItem('currentStudent');
      if (!studentData) {
        const mockStudent = {
          name: 'Demo Student',
          rollNumber: 'DEMO001',
          totalProblems: 0,
          streakCount: 0,
          achievements: []
        };
        setStudent(mockStudent);
        localStorage.setItem('currentStudent', JSON.stringify(mockStudent));
      } else {
        setStudent(JSON.parse(studentData));
      }
    } catch (error) {
      console.error('Failed to parse currentStudent from localStorage:', error);
      const fallbackStudent = {
        name: 'Demo Student',
        rollNumber: 'DEMO001',
        totalProblems: 0,
        streakCount: 0,
        achievements: []
      };
      setStudent(fallbackStudent);
      localStorage.setItem('currentStudent', JSON.stringify(fallbackStudent));
    }

    setChatHistory([
      { type: 'ai', message: "Hello! I'm your AI coding assistant. I can help you with:\n- Explaining coding concepts\n- Debugging your code\n- Generating practice problems\n- Code optimization tips\n\nWhat would you like to work on today?" }
    ]);

    const topicId = new URLSearchParams(location.search).get('topicId');
    if (!topicId) {
      void generateProblem();
    }
  }, [location.search, navigate]);

  const languages = [
    { value: 'python', label: 'Python', starter: '# Write your Python code here\nprint("Hello, CodeLab!")' },
    { value: 'javascript', label: 'JavaScript', starter: '// Write your JavaScript code here\nconsole.log("Hello, CodeLab!");' },
    { value: 'cpp', label: 'C++', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeLab!" << endl;\n    return 0;\n}' },
  ];

  const loadProblem = (problem: Problem) => {
    setCurrentProblem(problem);
    setTestResults([]);
    setOutput('');
    setExecutionError('');
    setExecutionStatus('Idle');
    setInput(problem.testCases[0]?.input || '');

    if (problem.starterCode) {
      setCode(problem.starterCode);
    } else {
      const selectedLang = languages.find((lang) => lang.value === selectedLanguage);
      setCode(selectedLang?.starter || '');
    }
  };

  useEffect(() => {
    const selectedLang = languages.find(lang => lang.value === selectedLanguage);
    if (selectedLang && !code) {
      setCode(selectedLang.starter);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    console.log('[Practice] currentProblem updated:', currentProblem);
  }, [currentProblem]);

  const generateProblem = async () => {
    setIsGeneratingProblem(true);

    setTimeout(() => {
      const randomProblem = practiceProblems[Math.floor(Math.random() * practiceProblems.length)];
      loadProblem(randomProblem);
      setIsGeneratingProblem(false);
    }, 2000);
  };

  useEffect(() => {
    const topicId = new URLSearchParams(location.search).get('topicId');
    if (!topicId) {
      return;
    }

    const roadmapNode = Object.values(ROADMAP_DATA)
      .flatMap((nodes) => flattenRoadmapNodes(nodes))
      .find((node) => node.id === topicId && node.problem);

    if (!roadmapNode?.problem) {
      toast.error('Roadmap problem not found');
      void generateProblem();
      return;
    }

    setSelectedLanguage('python');
    loadProblem(buildRoadmapProblem(roadmapNode, roadmapNode.problem));
  }, [location.search]);

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    const effectiveInput =
      executionConfig.mode === 'function'
        ? (input.trim() || currentProblem?.testCases[0]?.input || '')
        : input;

    setIsRunning(true);
    setOutput('');
    setExecutionError('');
    setExecutionStatus('Running...');

    try {
      const result = await runCodeViaBackend({
        code,
        language: selectedLanguage,
        input: effectiveInput,
        execution:
          executionConfig.mode === 'function'
            ? {
                mode: 'function',
                functionName: executionConfig.functionName,
                argumentExpression: effectiveInput,
              }
            : undefined,
      });

      setExecutionStatus(result.status);

      if (result.error) {
        setExecutionError(result.error);
        setOutput('');
      } else if (result.output) {
        setOutput(result.output);
        setExecutionError('');
      } else {
        setOutput('');
        setExecutionError('Program executed successfully, but no output was printed.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run code.';
      setExecutionStatus('Execution failed');
      setOutput('');
      setExecutionError(message);
      toast.error('Code execution failed', {
        description: message,
      });
    }

    setIsRunning(false);
  };

  const runTestCases = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    if (!testCases.length) {
      toast.error('No test cases available for this problem');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);

    try {
      const results: TestResult[] = [];

      for (const [index, testCase] of testCases.entries()) {
        const result = await runCodeViaBackend({
          code,
          language: selectedLanguage,
          input: testCase.input,
          execution:
            executionConfig.mode === 'function'
              ? {
                  mode: 'function',
                  functionName: executionConfig.functionName,
                  argumentExpression: testCase.input,
                }
              : undefined,
        });

        const actual = (result.output || '').trim();
        const expected = testCase.expected.trim();
        const hasError = Boolean(result.error);
        const didPass = !hasError && normalizeExecutionOutput(actual) === normalizeExecutionOutput(expected);

        console.log('[Practice] Test case result:', {
          problem: currentProblem?.title,
          testCase: index + 1,
          input: testCase.input,
          expected,
          actual,
          error: result.error || '',
          status: didPass ? 'Passed' : 'Failed',
        });

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual,
          status: didPass ? 'Passed' : 'Failed',
          error: hasError ? result.error : undefined,
        });
      }

      setTestResults(results);
      setOutput('');
      setExecutionError('');
      setExecutionStatus(`Passed ${results.filter((result) => result.status === 'Passed').length}/${results.length} tests`);

      if (results.every((result) => result.status === 'Passed')) {
        toast.success('All test cases passed');
      } else {
        toast.error('Some test cases failed', {
          description: `Passed ${results.filter((result) => result.status === 'Passed').length} of ${results.length}`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run test cases.';
      setExecutionStatus('Test execution failed');
      setTestResults([]);
      toast.error('Test case execution failed', {
        description: message,
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const validateAllProblems = async () => {
    setIsValidatingProblems(true);
    setValidationSummary([]);

    try {
      const summary: ValidationSummary[] = [];

      for (const problem of practiceProblems) {
        let passed = 0;
        const validationExecutionConfig: ProblemExecutionConfig = {
          mode: problem.executionMode || detectExecutionMode(problem.referenceSolution || '', problem.starterCode),
          functionName: problem.functionName || inferFunctionName(problem.referenceSolution || problem.starterCode || '', 'python'),
        };

        for (const [index, testCase] of problem.testCases.entries()) {
          const result = await runCodeViaBackend({
            code: problem.referenceSolution || '',
            language: 'python',
            input: testCase.input,
            execution:
              validationExecutionConfig.mode === 'function'
                ? {
                    mode: 'function',
                    functionName: validationExecutionConfig.functionName,
                    argumentExpression: testCase.input,
                  }
                : undefined,
          });

          const actual = (result.output || '').trim();
          const expected = testCase.expected.trim();
          const didPass = !result.error && normalizeExecutionOutput(actual) === normalizeExecutionOutput(expected);

          console.log('[Practice] Validation result:', {
            problem: problem.title,
            testCase: index + 1,
            input: testCase.input,
            expected,
            actual,
            error: result.error || '',
            status: didPass ? 'Passed' : 'Failed',
          });

          if (didPass) {
            passed += 1;
          }
        }

        summary.push({
          title: problem.title,
          passed,
          total: problem.testCases.length,
        });
      }

      setValidationSummary(summary);
      console.log(
        '[Practice] Validation summary:\n' +
          summary.map((item) => `Problem: ${item.title} - ${item.passed}/${item.total} Passed`).join('\n')
      );

      if (summary.every((item) => item.passed === item.total)) {
        toast.success('All problems validated successfully');
      } else {
        toast.error('Some practice problems still have failing test cases');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate problems.';
      toast.error('Problem validation failed', {
        description: message,
      });
    } finally {
      setIsValidatingProblems(false);
    }
  };

  const submitChatPrompt = async (rawMessage: string) => {
    const userMessage = rawMessage.trim();
    if (!userMessage) return;
    if (!problemContext || problemContext.trim() === '') {
      toast.error('Problem not ready', {
        description: 'Wait for the current problem to load before asking the assistant.',
      });
      return;
    }

    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsLoadingResponse(true);

    try {
      const prompt =
        userMessage.toLowerCase().includes('hint') && currentProblem
          ? `Give me developer-focused hints for this problem: ${currentProblem.title}\n\nProblem description:\n${currentProblem.description}\n\nExample:\n${currentProblem.example}`
          : userMessage;

      const requestPayload = {
        prompt,
        code,
        output: [executionStatus ? `Status: ${executionStatus}` : '', output, executionError].filter(Boolean).join('\n\n'),
        problem: problemContext,
      };

      console.log('[Practice] Sending /api/ai payload:', requestPayload);

      const aiResponse = await requestAiAssistant(requestPayload);

      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get AI response.';

      setChatHistory(prev => [
        ...prev,
        {
          type: 'ai',
          message: `I couldn't process that request right now.\n\n${message}`,
        },
      ]);
      toast.error('AI assistant request failed', {
        description: message,
      });
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const sendChatMessage = async () => {
    await submitChatPrompt(chatMessage);
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,255,204,0.15)_1px,transparent_0)] bg-[length:20px_20px] animate-pulse"></div>
      </div>

      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-cyan-400" />
                  AI-Powered Practice
                </h1>
                <p className="text-sm text-gray-300">Interactive coding with AI assistance</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 text-cyan-300 border-cyan-500/30">
              Problems Solved: {student.totalProblems}
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {currentProblem && (
          <Card className="mb-6 bg-slate-900/40 backdrop-blur-lg border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-white">
                  <Terminal className="w-5 h-5 mr-2 text-green-400" />
                  Current Challenge: {currentProblem.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={
                    currentProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    currentProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {currentProblem.difficulty}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void generateProblem()}
                    disabled={isGeneratingProblem}
                    className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    {isGeneratingProblem ? (
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    New Problem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void validateAllProblems()}
                    disabled={isValidatingProblems}
                    className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                  >
                    {isValidatingProblems ? (
                      <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Validate All Problems
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Description</h4>
                <p className="text-gray-300">{currentProblem.description}</p>
                <p className="text-xs text-cyan-300 mt-2">{executionInstructions}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">Example</h4>
                <pre className="bg-slate-950 p-3 rounded text-sm text-green-400 font-mono border border-cyan-500/30">{currentProblem.example}</pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">Test Cases</h4>
                <div className="space-y-2">
                  {testCases.map((testCase, index) => (
                    <div key={`${currentProblem.title}-test-${index}`} className="bg-slate-950 p-3 rounded border border-cyan-500/20 text-sm">
                      <div className="text-cyan-300 font-medium mb-1">Test Case {index + 1}</div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        <span className="text-white">Input:</span> {testCase.input || '(empty)'}
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        <span className="text-white">Expected:</span> {testCase.expected}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {validationSummary.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-white">Validation Summary</h4>
                  <div className="space-y-2">
                    {validationSummary.map((item) => (
                      <div
                        key={item.title}
                        className={`rounded border p-3 text-sm ${
                          item.passed === item.total
                            ? 'border-green-500/30 bg-green-500/10 text-green-300'
                            : 'border-red-500/30 bg-red-500/10 text-red-300'
                        }`}
                      >
                        Problem: {item.title} - {item.passed}/{item.total} Passed
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-slate-900/40 backdrop-blur-lg border-cyan-500/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Brain className="w-5 h-5 mr-2 text-cyan-400" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-80 overflow-y-auto space-y-3 p-3 bg-slate-800/30 rounded-lg">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`p-3 rounded-lg ${chat.type === 'user' ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 ml-6 border border-cyan-500/30' : 'bg-slate-700/50 mr-6 border border-slate-600'}`}>
                    <div className="text-sm font-medium mb-1 text-white">
                      {chat.type === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-gray-300">{chat.message}</div>
                  </div>
                ))}
                {isLoadingResponse && (
                  <div className="bg-slate-700/50 mr-6 p-3 rounded-lg border border-slate-600">
                    <div className="text-sm font-medium mb-1 text-white">AI Assistant</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Ask for help, hints, or explanations..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void sendChatMessage();
                    }
                  }}
                  className="flex-1 bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
                  disabled={!canUseAssistant || isLoadingResponse}
                />
                <Button onClick={() => void sendChatMessage()} disabled={!canUseAssistant || isLoadingResponse} className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {currentProblem && (
                <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-lg border border-cyan-500/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void submitChatPrompt(`Give me hints for ${currentProblem.title}`)}
                    className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    disabled={!canUseAssistant || isLoadingResponse}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Hints for Current Problem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-lg border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-white">
                  <Code className="w-5 h-5 mr-2 text-cyan-400" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => {
                      if (currentProblem?.id && executionConfig.mode === 'function' && value !== 'python') {
                        toast.info('Roadmap challenges are standardized for Python function execution.');
                        setSelectedLanguage('python');
                        return;
                      }

                      setSelectedLanguage(value);
                    }}
                  >
                    <SelectTrigger className="w-40 bg-slate-800/50 border-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-cyan-500/30">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-white hover:bg-slate-700">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`code-editor min-h-[300px] font-mono text-sm border focus:border-cyan-400 ${
                  selectedLanguage === 'python' ? 'bg-[#0d1117] text-[#e6edf3] border-[#30363d]' :
                  selectedLanguage === 'javascript' ? 'bg-[#1e1e1e] text-[#dcdcaa] border-[#3c3c3c]' :
                  selectedLanguage === 'java' ? 'bg-[#1b1f23] text-[#c8e1ff] border-[#30363d]' :
                  selectedLanguage === 'cpp' || selectedLanguage === 'c' ? 'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]' :
                  'bg-slate-950 text-white border-cyan-500/30'
                }`}
              />

              <p className="text-xs text-cyan-300">
                {executionConfig.mode === 'function'
                  ? `Write only ${executionConfig.functionName || 'solution'}(...). Use the Input box for function arguments like the test cases.`
                  : 'Use input/print style code. The Input box is passed to your program as stdin.'}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Input (stdin)</label>
                  <Textarea
                    placeholder={
                      executionConfig.mode === 'function'
                        ? 'Enter function arguments exactly like a test case, e.g. [1,2,3], 4'
                        : 'Enter input for your program...'
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-24 text-sm bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Output</label>
                  <div className="terminal min-h-24 bg-slate-950 border border-cyan-500/30 rounded-md p-3 overflow-auto">
                    <div className="text-xs text-cyan-300 mb-2">Status: {executionStatus}</div>
                    <div className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                      <span className="text-white">Output:</span>
                      {'\n'}
                      {output || 'No output'}
                    </div>
                    {executionError && (
                      <div className="text-sm text-red-400 font-mono whitespace-pre-wrap mt-3">
                        <span className="text-red-300">Error:</span>
                        {'\n'}
                        {executionError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={runCode} disabled={isRunning || isRunningTests} className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => void runTestCases()}
                  disabled={isRunning || isRunningTests || !testCases.length}
                  variant="outline"
                  className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  {isRunningTests ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin mr-2" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Test Cases
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-slate-900/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Test Results</h4>
                  <Badge className="bg-slate-800 text-cyan-300 border-cyan-500/30">
                    Passed: {passedTests} / {testResults.length || testCases.length}
                  </Badge>
                </div>

                {testResults.length === 0 ? (
                  <p className="text-sm text-gray-400">Run test cases to see pass/fail results for this problem.</p>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={`result-${index}`}
                        className={`rounded-md border p-3 text-sm ${
                          result.status === 'Passed'
                            ? 'border-green-500/30 bg-green-500/10'
                            : 'border-red-500/30 bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">Test Case {index + 1}</span>
                          <span className={result.status === 'Passed' ? 'text-green-400' : 'text-red-400'}>
                            {result.status}
                          </span>
                        </div>
                        <div className="text-gray-300 whitespace-pre-wrap">
                          <span className="text-white">Input:</span> {result.input || '(empty)'}
                        </div>
                        <div className="text-gray-300 whitespace-pre-wrap">
                          <span className="text-white">Expected:</span> {result.expected}
                        </div>
                        <div className="text-gray-300 whitespace-pre-wrap">
                          <span className="text-white">Actual:</span> {result.actual || '(no output)'}
                        </div>
                        {result.error && (
                          <div className="text-red-300 whitespace-pre-wrap mt-2">
                            <span className="text-red-200">Error:</span> {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

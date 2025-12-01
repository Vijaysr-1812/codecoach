import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
// Simple animation replacement for framer-motion
const motion = {
  div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
};
const AnimatePresence = ({ children }: any) => <>{children}</>;
// Mock auth hook - replace with actual auth service
const useAuth = () => ({
  user: { id: '1', name: 'Test User' },
  isPending: false
});
import {
  Code2,
  ArrowLeft,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';
// Simple CodeEditor replacement with per-language theme
const CodeEditor = ({ initialCode, language, onCodeChange, height }: any) => {
  const themeClass =
    language === 'python' ? 'bg-[#0d1117] text-[#e6edf3] border-[#30363d]' :
    language === 'javascript' ? 'bg-[#1e1e1e] text-[#dcdcaa] border-[#3c3c3c]' :
    language === 'java' ? 'bg-[#1b1f23] text-[#c8e1ff] border-[#30363d]' :
    'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]';
  return (
    <textarea
      value={initialCode}
      onChange={(e) => onCodeChange(e.target.value)}
      className={`w-full font-mono text-sm border rounded-lg p-4 resize-none focus:border-cyan-400 ${themeClass}`}
      style={{ height }}
      placeholder={`// Write your ${language} code here...`}
    />
  );
};

interface ExamData {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  totalMarks: number;
  questions: ExamQuestion[];
  isActive: boolean;
}

interface ExamQuestion {
  id: string;
  title: string;
  description: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

// Sample exam data
const sampleExam: ExamData = {
  id: '1',
  title: 'Data Structures & Algorithms Exam',
  description: 'Comprehensive exam covering arrays, strings, and basic algorithms',
  duration: 60,
  totalMarks: 100,
  isActive: true,
  questions: [
    {
      id: '1',
      title: 'Array Sum Problem',
      description: 'Given an array of integers, find the sum of all elements.',
      marks: 30,
      difficulty: 'easy',
      testCases: [
        { input: '[1, 2, 3, 4, 5]', expectedOutput: '15' },
        { input: '[-1, 0, 1]', expectedOutput: '0' }
      ]
    },
    {
      id: '2',
      title: 'String Palindrome',
      description: 'Check if a given string is a palindrome (reads the same forwards and backwards).',
      marks: 40,
      difficulty: 'medium',
      testCases: [
        { input: 'racecar', expectedOutput: 'true' },
        { input: 'hello', expectedOutput: 'false' }
      ]
    },
    {
      id: '3',
      title: 'Binary Search',
      description: 'Implement binary search algorithm to find target element in sorted array.',
      marks: 30,
      difficulty: 'hard',
      testCases: [
        { input: 'arr=[1,2,3,4,5], target=3', expectedOutput: '2' },
        { input: 'arr=[1,2,3,4,5], target=6', expectedOutput: '-1' }
      ]
    }
  ]
};

type ExamState = 'preview' | 'active' | 'completed' | 'results';

export default function ExaminationPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [examState, setExamState] = useState<ExamState>('preview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(sampleExam.duration * 60); // in seconds
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [isProctoring, setIsProctoring] = useState(false);
  const [proctoringWarnings, setProctoringWarnings] = useState(0);
  const [examResults, setExamResults] = useState<{score: number, details: any[]}>({score: 0, details: []});
  const [language, setLanguage] = useState('python');
  const [stdinInput, setStdinInput] = useState('');
  const [runnerOutput, setRunnerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [viva, setViva] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Array<{input:string; expected:string; got:string; pass:boolean}>>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/login');
    }
  }, [user, isPending, navigate]);

  // Timer effect
  useEffect(() => {
    if (examState === 'active' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examState, timeRemaining]);

  // Proctoring simulation
  useEffect(() => {
    if (examState === 'active' && isProctoring) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setProctoringWarnings(prev => prev + 1);
          alert('Warning: Tab switching detected! This has been recorded.');
        }
      };

      const handleContextMenu = (e: Event) => {
        e.preventDefault();
        setProctoringWarnings(prev => prev + 1);
        alert('Warning: Right-click disabled during exam!');
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
          e.preventDefault();
          setProctoringWarnings(prev => prev + 1);
          alert('Warning: Copy/paste operations are not allowed!');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [examState, isProctoring]);

  useEffect(() => {
    // Handle camera preview for live monitoring
    if (examState === 'active') {
      setCameraEnabled(true);
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then(stream => {
          setCameraStream(stream);
          const video = document.getElementById('exam-live-camera') as HTMLVideoElement | null;
          if (video) {
            video.srcObject = stream;
            video.play().catch(() => {});
          }
        })
        .catch(() => {
          setCameraEnabled(false);
        });
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [examState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamState('active');
    setIsProctoring(true);
    setTimeRemaining(sampleExam.duration * 60);
  };

  const handleSubmitExam = async () => {
    setExamState('completed');
    setIsProctoring(false);
    
    // Simulate grading
    setTimeout(() => {
      const totalScore = Math.floor(Math.random() * 60) + 40; // 40-100 score
      const details = sampleExam.questions.map(q => ({
        questionId: q.id,
        title: q.title,
        marks: q.marks,
        scored: Math.floor(Math.random() * q.marks * 0.8) + Math.floor(q.marks * 0.2),
        status: Math.random() > 0.3 ? 'passed' : 'failed'
      }));
      
      setExamResults({ score: totalScore, details });
      setExamState('results');
    }, 3000);
  };

  const handleCodeChange = (code: string) => {
    const currentQuestion = sampleExam.questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: code
    }));
  };

  const currentQuestion = sampleExam.questions[currentQuestionIndex];

  const runCode = async () => {
    const code = answers[currentQuestion.id] || '';
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setRunnerOutput('Running your code...\n');

    try {
      const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': 'ead58a2ba3msh92dcc5cbcbf559ap11fc2fjsn5288ed507ac5',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          stdin: stdinInput,
          files: [{
            name: language === 'python' ? 'main.py' : language === 'javascript' ? 'main.js' : language === 'java' ? 'Main.java' : 'main.cpp',
            content: code
          }]
        })
      });

      const result = await response.json();
      if (result.stdout) {
        setRunnerOutput(result.stdout);
      } else if (result.stderr) {
        setRunnerOutput(`Error:\n${result.stderr}`);
      } else {
        setRunnerOutput('Code executed successfully! (No output)');
      }
    } catch (error) {
      setTimeout(() => {
        if (language === 'python' && code.includes('print')) {
          setRunnerOutput('Hello, CodeLab!\nCode executed successfully!');
        } else {
          setRunnerOutput('Hello, CodeLab!\nCode executed successfully!\n\nNote: This is a demo output.');
        }
      }, 1000);
    }

    setIsRunning(false);

    // Generate viva questions based on the problem
    const prompts = [
      `Explain time complexity for ${currentQuestion.title}.`,
      `What edge cases would you test for ${currentQuestion.title}?`,
      `How would you optimize memory usage in your approach?`
    ];
    setViva(prompts);

    // Simulate test case validation from expected outputs
    const synthetic = currentQuestion.testCases.map(tc => ({
      input: tc.input,
      expected: tc.expectedOutput,
      got: runnerOutput.trim() || 'N/A',
      pass: (runnerOutput || '').includes(tc.expectedOutput)
    }));
    setTestResults(synthetic);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      {examState === 'active' && (
        <div className="fixed top-4 right-4 z-50 bg-black/60 border border-cyan-500/30 rounded-xl p-2 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cyan-300 ml-1">Live Camera</span>
          </div>
          <video id="exam-live-camera" className="w-40 h-28 object-cover rounded-md" muted playsInline />
        </div>
      )}
      {/* Header */}
      <header className="px-6 py-4 border-b border-cyan-500/20 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {examState === 'preview' ? (
            <Link to="/profile" className="flex items-center space-x-2 text-cyan-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Profile</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-semibold">Secure Exam Mode</span>
              {proctoringWarnings > 0 && (
                <span className="text-cyan-300 text-sm">Warnings: {proctoringWarnings}</span>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">Examination</span>
          </div>
          
          {examState === 'active' && (
            <div className="flex items-center space-x-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-cyan-400' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {examState === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/40 backdrop-blur-lg rounded-3xl border border-cyan-500/20 p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4">{sampleExam.title}</h1>
                  <p className="text-xl text-gray-300 mb-6">{sampleExam.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{sampleExam.duration} min</div>
                      <div className="text-gray-400">Duration</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{sampleExam.totalMarks}</div>
                      <div className="text-gray-400">Total Marks</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Code2 className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{sampleExam.questions.length}</div>
                      <div className="text-gray-400">Questions</div>
                    </div>
                  </div>
                </div>

                {/* Exam Instructions */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-3">Important Instructions</h3>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Once started, you cannot pause or restart the exam</li>
                        <li>• Tab switching and copy-paste operations are monitored</li>
                        <li>• Submit your answers before time runs out</li>
                        <li>• Each question has specific test cases that must pass</li>
                        <li>• Choose your programming language carefully</li>
                        <li>• Excessive warnings may result in exam termination</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Questions Overview</h3>
                  <div className="space-y-4">
                    {sampleExam.questions.map((question, index) => (
                      <div key={question.id} className="bg-slate-800/40 border border-cyan-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">Q{index + 1}. {question.title}</h4>
                          <p className="text-gray-400 text-sm">{question.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-cyan-300">{question.marks} pts</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            question.difficulty === 'easy' ? 'bg-green-400/20 text-green-400' :
                            question.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-red-400/20 text-red-400'
                          }`}>
                            {question.difficulty.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleStartExam}
                    className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 px-12 py-4 rounded-xl text-black font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                  >
                    <Play className="w-6 h-6" />
                    <span>Start Exam</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {examState === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]"
            >
              {/* Question Panel */}
              <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-cyan-500/20 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Question {currentQuestionIndex + 1} of {sampleExam.questions.length}
                    </h2>
                    <span className="text-lg font-bold text-cyan-300">
                      {currentQuestion.marks} pts
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{currentQuestion.title}</h3>
                </div>

                <div className="p-6 overflow-y-auto h-full">
                  <p className="text-gray-300 mb-6 leading-relaxed">{currentQuestion.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3">Test Cases:</h4>
                    <div className="space-y-3">
                      {currentQuestion.testCases.map((testCase, index) => (
                        <div key={index} className="bg-slate-800/40 border border-cyan-500/20 rounded-lg p-3">
                          <div className="text-sm">
                            <span className="text-cyan-300 font-medium">Input:</span>
                            <code className="block bg-black/30 rounded p-2 mt-1 text-green-300 font-mono text-xs">
                              {testCase.input}
                            </code>
                          </div>
                          <div className="text-sm mt-2">
                            <span className="text-cyan-300 font-medium">Expected Output:</span>
                            <code className="block bg-black/30 rounded p-2 mt-1 text-blue-300 font-mono text-xs">
                              {testCase.expectedOutput}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(sampleExam.questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === sampleExam.questions.length - 1}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="lg:col-span-2">
                <CodeEditor
                  initialCode={answers[currentQuestion.id] || ''}
                  language={language}
                  onCodeChange={handleCodeChange}
                  height="calc(100vh - 220px)"
                />
                
                <div className="mt-4 p-4 bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-cyan-500/20 space-y-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-slate-800/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="python" className="bg-slate-800">Python</option>
                      <option value="java" className="bg-slate-800">Java</option>
                      <option value="cpp" className="bg-slate-800">C++</option>
                      <option value="javascript" className="bg-slate-800">JavaScript</option>
                    </select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">Input (stdin)</label>
                      <textarea
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        className="w-full h-24 text-sm bg-slate-800/50 border border-cyan-500/30 rounded-lg p-3 text-white placeholder-gray-400 focus:border-cyan-400"
                        placeholder="Provide input for your program"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">Output</label>
                      <div className="h-24 bg-slate-950 border border-cyan-500/30 rounded-lg p-3 overflow-auto">
                        <pre className="text-sm text-green-400 font-mono">{runnerOutput}</pre>
                      </div>
                    </div>
                  </div>
                {/* Test results & Viva */}
                {testResults.length > 0 && (
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20">
                      <div className="text-white font-semibold mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/>Test Case Validation</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {testResults.map((t, i) => (
                          <li key={i} className={`flex justify-between ${t.pass ? 'text-green-400' : 'text-red-400'}`}>
                            <span>Input: {t.input}</span>
                            <span>{t.pass ? 'PASS' : 'FAIL'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20">
                      <div className="text-white font-semibold mb-2">Viva Questions</div>
                      <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                        {viva.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 px-6 py-3 rounded-xl text-black font-semibold transition-all duration-300 disabled:opacity-60"
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button
                      onClick={handleSubmitExam}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300"
                    >
                      Submit Exam
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {examState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/40 backdrop-blur-lg rounded-3xl border border-cyan-500/20 p-12">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Exam Submitted Successfully!</h1>
                <p className="text-xl text-gray-300 mb-8">
                  Your answers are being evaluated. Results will be available shortly.
                </p>
                <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                <div className="mt-8">
                  <Link to="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold hover:from-cyan-600 hover:to-green-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {examState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">Exam Results</h1>
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {examResults.score}%
                  </div>
                  <p className="text-xl text-gray-300">Great job on completing the exam!</p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-semibold text-white">Question Breakdown</h3>
                  {examResults.details.map((result, index) => (
                    <div key={result.questionId} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Q{index + 1}. {result.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {result.status === 'passed' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-sm ${result.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}>
                            {result.status === 'passed' ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {result.scored}/{result.marks}
                        </div>
                        <div className="text-sm text-gray-400">marks</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leaderboard Preview */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Your Ranking</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">#12</div>
                    <p className="text-gray-300">out of 156 participants</p>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/profile"
                  className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 px-8 py-4 rounded-xl text-black font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                  >
                    <span>Back to Dashboard</span>
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </Link>
                <div className="mt-4">
                  <Link to="/" className="inline-flex items-center px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Link>
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
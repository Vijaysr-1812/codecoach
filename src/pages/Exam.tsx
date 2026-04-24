import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateRoadmap } from '@/lib/gemini';

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
  BarChart3,
  Map,
  Loader2,
} from 'lucide-react';

// --- TYPE DEFINITIONS FOR ANIMATION MOCKS ---
interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: object;
  animate?: object;
  exit?: object;
}

const motion = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  div: ({ children, className, initial, animate, exit, ...props }: MotionProps) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AnimatePresence = ({ children, mode }: { children: React.ReactNode; mode?: string }) => <>{children}</>;

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onCodeChange: (code: string) => void;
  height: string;
}

const CodeEditor = ({ initialCode, language, onCodeChange, height }: CodeEditorProps) => {
  const themeClass =
    language === 'python' ? 'bg-[#0d1117] text-[#e6edf3] border-[#30363d]' :
    language === 'javascript' ? 'bg-[#1e1e1e] text-[#dcdcaa] border-[#3c3c3c]' :
    language === 'java' ? 'bg-[#1b1f23] text-[#c8e1ff] border-[#30363d]' :
    'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();

    const target = e.currentTarget;

    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = target;
      const indent = '    ';

      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const before = value.slice(0, lineStart);
        const middle = value.slice(lineStart, selectionEnd);
        const after = value.slice(selectionEnd);
        const dedented = middle.replace(/^ {1,4}/gm, '');
        const removed = middle.length - dedented.length;
        const next = before + dedented + after;
        onCodeChange(next);
        requestAnimationFrame(() => {
          target.selectionStart = Math.max(lineStart, selectionStart - Math.min(4, removed));
          target.selectionEnd = selectionEnd - removed;
        });
      } else {
        const next = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
        onCodeChange(next);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = selectionStart + indent.length;
        });
      }
    }
  };

  return (
    <textarea
      value={initialCode}
      onChange={(e) => onCodeChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
      className={`w-full font-mono text-sm border rounded-lg p-4 resize-none focus:border-cyan-400 ${themeClass}`}
      style={{ height }}
      placeholder={`// Write your ${language} code here...`}
      spellCheck="false"
    />
  );
};

interface ExamData {
  id: string;
  title: string;
  description: string;
  duration: number;
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
  starterCodes: Record<string, string>;
  drivers: Record<string, string>;
  testCases: { input: string; expectedOutput: string }[];
  sampleCount: number;
}

interface ExamResultDetail {
  questionId: string;
  title: string;
  marks: number;
  scored: number;
  status: 'passed' | 'failed';
  userCode?: string;
  firstFailingInput?: string;
  firstFailingExpected?: string;
  firstFailingGot?: string;
}

type QuestionFirstFailure = { input: string; expected: string; got: string };

const SUPPORTED_LANGS = ['python', 'javascript', 'java', 'cpp'];

const getStarter = (question: ExamQuestion, lang: string): string => {
  return question.starterCodes?.[lang] ?? '';
};

type ExamState = 'preview' | 'active' | 'completed' | 'results';

export default function ExaminationPage() {
  const { session, loading } = useAuth();
  const user = session?.user;
  const isPending = loading;

  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [examError, setExamError] = useState<string | null>(null);

  const [examState, setExamState] = useState<ExamState>('preview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});

  const [isProctoring, setIsProctoring] = useState(false);
  const [proctoringWarnings, setProctoringWarnings] = useState(0);
  const [examResults, setExamResults] = useState<{ score: number; level: string; details: ExamResultDetail[] }>({
    score: 0,
    level: 'Beginner',
    details: [],
  });
  const [language, setLanguage] = useState('python');
  const [runnerOutput, setRunnerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [viva, setViva] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; got: string; pass: boolean }>>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [questionPassStatus, setQuestionPassStatus] = useState<Record<string, boolean>>({});
  const [questionFirstFailures, setQuestionFirstFailures] = useState<Record<string, QuestionFirstFailure>>({});

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/login');
    }
  }, [user, isPending, navigate]);

  // Load active exam + questions + test cases from Supabase
  useEffect(() => {
    let cancelled = false;

    const loadExam = async () => {
      setLoadingExam(true);
      setExamError(null);

      const { data: examRow, error: examErr } = await supabase
        .from('exams')
        .select('id, title, description, duration_minutes, total_marks')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (examErr || !examRow) {
        setExamError(examErr?.message ?? 'No active exam found. Run the migration in supabase/migrations.');
        setLoadingExam(false);
        return;
      }

      const { data: questions, error: qErr } = await supabase
        .from('exam_questions')
        .select(`
          id, title, description, difficulty, marks, position, starter_codes, drivers,
          exam_test_cases ( id, input, expected_output, position, is_sample )
        `)
        .eq('exam_id', examRow.id)
        .order('position', { ascending: true });

      if (cancelled) return;

      if (qErr || !questions || questions.length === 0) {
        setExamError(qErr?.message ?? 'This exam has no questions yet.');
        setLoadingExam(false);
        return;
      }

      const transformed: ExamData = {
        id: examRow.id,
        title: examRow.title,
        description: examRow.description ?? '',
        duration: examRow.duration_minutes,
        totalMarks: examRow.total_marks,
        isActive: true,
        questions: questions.map((q) => {
          const tcRows = (q.exam_test_cases ?? [])
            .slice()
            .sort((a: { position: number }, b: { position: number }) => a.position - b.position);
          return {
            id: q.id,
            title: q.title,
            description: q.description,
            marks: q.marks,
            difficulty: q.difficulty,
            starterCodes: (q.starter_codes as Record<string, string>) ?? {},
            drivers: (q.drivers as Record<string, string>) ?? {},
            testCases: tcRows.map((tc: { input: string; expected_output: string }) => ({
              input: tc.input,
              expectedOutput: tc.expected_output,
            })),
            sampleCount: tcRows.filter((tc: { is_sample: boolean }) => tc.is_sample).length || Math.min(2, tcRows.length),
          };
        }),
      };

      setExam(transformed);
      setTimeRemaining(transformed.duration * 60);
      setLoadingExam(false);
    };

    loadExam();

    return () => {
      cancelled = true;
    };
  }, []);

  // Pre-fill answers with language-specific starter code for each question
  useEffect(() => {
    if (examState === 'active' && exam) {
      const initial: Record<string, Record<string, string>> = {};
      exam.questions.forEach((q) => {
        initial[q.id] = {};
        SUPPORTED_LANGS.forEach((l) => {
          initial[q.id][l] = getStarter(q, l);
        });
      });
      setAnswers(initial);
    }
  }, [examState, exam]);

  const handleSubmitExam = useCallback(async () => {
    if (!user || !exam) return;

    setExamState('completed');
    setIsProctoring(false);

    setTimeout(async () => {
      let totalScore = 0;
      let totalQuestionsAnswered = 0;

      const details = exam.questions.map((q) => {
        const userAnswer = answers[q.id]?.[language] || '';
        const isAnswered = userAnswer.trim().length > 0 && !userAnswer.includes('return 0');
        if (isAnswered) totalQuestionsAnswered++;

        const passed = questionPassStatus[q.id] === true;
        const marksAwarded = passed ? q.marks : 0;
        totalScore += marksAwarded;

        const fail = questionFirstFailures[q.id];
        return {
          questionId: q.id,
          title: q.title,
          marks: q.marks,
          scored: marksAwarded,
          status: passed ? 'passed' : 'failed',
          userCode: userAnswer,
          firstFailingInput: fail?.input,
          firstFailingExpected: fail?.expected,
          firstFailingGot: fail?.got,
        } as ExamResultDetail;
      });

      if (totalQuestionsAnswered === 0) totalScore = 0;

      const percentageScore = Math.round((totalScore / exam.totalMarks) * 100);

      const totalDuration = exam.duration * 60;
      const timeUsed = totalDuration - timeRemaining;
      const speedScore = Math.round(Math.max(0, (1 - timeUsed / totalDuration) * 100));
      const passedCount = Object.values(questionPassStatus).filter(Boolean).length;
      const efficiencyScore = exam.questions.length > 0
        ? Math.round((passedCount / exam.questions.length) * 100)
        : 0;

      let assignedLevel = 'Beginner';
      if (percentageScore >= 80) assignedLevel = 'Expert';
      else if (percentageScore >= 50) assignedLevel = 'Medium';

      try {
        const { data: subRow, error: subError } = await supabase
          .from('exam_submissions')
          .insert({
            user_id: user.id,
            exam_id: exam.id,
            score: percentageScore,
            speed: speedScore,
            efficiency: efficiencyScore,
            time_taken: timeUsed,
            level_assigned: assignedLevel,
            language,
            question_results: details,
          })
          .select('id')
          .single();
        if (subError) console.error('Submission error:', subError);

        // Fire-and-forget: generate a personalized roadmap and persist it.
        // The Results screen links into /roadmap, where RoadmapPage will read the
        // latest user_roadmaps row for this user.
        if (!subError && subRow) {
          generateRoadmap({
            level: assignedLevel,
            score: percentageScore,
            language,
            questions: details.map((d) => ({
              title: d.title,
              difficulty: exam.questions.find((q) => q.id === d.questionId)?.difficulty ?? 'easy',
              passed: d.status === 'passed',
              user_code: d.userCode ?? '',
              first_failing_input: d.firstFailingInput,
              first_failing_expected: d.firstFailingExpected,
              first_failing_got: d.firstFailingGot,
            })),
          })
            .then(async (roadmap) => {
              await supabase.from('user_roadmaps').insert({
                user_id: user.id,
                submission_id: subRow.id,
                level: assignedLevel,
                roadmap_json: roadmap,
              });
            })
            .catch((err) => console.error('Roadmap generation failed:', err));
        }

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('total_problems')
          .eq('id', user.id)
          .single();

        const { error: profError } = await supabase
          .from('profiles')
          .update({
            current_skill_level: assignedLevel,
            total_problems: (currentProfile?.total_problems || 0) + exam.questions.length,
          })
          .eq('id', user.id);
        if (profError) console.error('Profile update error:', profError);

        const newAchievements: string[] = [];
        if (percentageScore >= 80) newAchievements.push('High Achiever');
        if (speedScore >= 70) newAchievements.push('Speed Demon');
        if (efficiencyScore >= 75) newAchievements.push('Code Optimizer');
        newAchievements.push('Exam Warrior');

        if (newAchievements.length > 0) {
          await supabase
            .from('achievements')
            .upsert(
              newAchievements.map((name) => ({ user_id: user.id, achievement_name: name })),
              { onConflict: 'user_id,achievement_name' },
            );
        }

        toast.success(`Exam Completed! You are placed in: ${assignedLevel}`);
      } catch (err) {
        console.error('Error saving exam results:', err);
        toast.error('Failed to save results to database.');
      }

      setExamResults({ score: percentageScore, level: assignedLevel, details });
      setExamState('results');
    }, 3000);
  }, [answers, exam, language, questionPassStatus, questionFirstFailures, timeRemaining, user]);

  // Timer effect
  useEffect(() => {
    if (examState === 'active' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examState, timeRemaining, handleSubmitExam]);

  // Proctoring
  useEffect(() => {
    if (examState === 'active' && isProctoring) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setProctoringWarnings((prev) => prev + 1);
          alert('Warning: Tab switching detected! This has been recorded.');
        }
      };
      const handleContextMenu = (e: Event) => {
        e.preventDefault();
        setProctoringWarnings((prev) => prev + 1);
        alert('Warning: Right-click disabled during exam!');
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
          e.preventDefault();
          setProctoringWarnings((prev) => prev + 1);
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
    let localStream: MediaStream | null = null;
    if (examState === 'active') {
      setCameraEnabled(true);
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then((stream) => {
          localStream = stream;
          const video = document.getElementById('exam-live-camera') as HTMLVideoElement | null;
          if (video) {
            video.srcObject = stream;
            video.play().catch(() => {});
          }
        })
        .catch(() => setCameraEnabled(false));
    }
    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, [examState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    if (!exam) return;
    setExamState('active');
    setIsProctoring(true);
    setTimeRemaining(exam.duration * 60);
  };

  const handleCodeChange = (code: string) => {
    if (!exam) return;
    const currentQuestion = exam.questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        [language]: code,
      },
    }));
  };

  const generateDriverCode = (
    userCode: string,
    lang: string,
    input: string,
    drivers: Record<string, string>,
  ) => {
    const template = drivers?.[lang];
    if (!template) return userCode;
    const escapedInput = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
    return template
      .split('{USER_CODE}').join(userCode)
      .split('{INPUT}').join(escapedInput);
  };

  const fileNameFor = (lang: string) => {
    switch (lang) {
      case 'python': return 'main.py';
      case 'javascript': return 'index.js';
      case 'java': return 'Main.java';
      case 'cpp': return 'main.cpp';
      default: return 'main.txt';
    }
  };

  const runCode = async () => {
    if (!exam) return;
    const currentQuestion = exam.questions[currentQuestionIndex];
    const code = answers[currentQuestion.id]?.[language] || '';
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setRunnerOutput('Running your code...\n');

    const testResultsTemp: { input: string; expected: string; got: string; pass: boolean }[] = [];
    let allPassed = true;

    for (const testCase of currentQuestion.testCases) {
      try {
        const driverCode = generateDriverCode(code, language, testCase.input, currentQuestion.drivers);
        const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
          method: 'POST',
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_ONECOMPILER_API_KEY,
            'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language,
            stdin: '',
            files: [
              {
                name: fileNameFor(language),
                content: driverCode,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Runner HTTP ${response.status}`);
        }
        const result = await response.json().catch(() => null);
        if (!result || typeof result !== 'object') {
          throw new Error('Runner returned an invalid response');
        }
        const actualOutput = (result.stdout || result.stderr || '').trim();
        const expectedOutput = testCase.expectedOutput.trim();
        // eslint-disable-next-line eqeqeq
        const passed = actualOutput == expectedOutput;

        if (!passed) allPassed = false;

        testResultsTemp.push({
          input: testCase.input,
          expected: expectedOutput,
          got: actualOutput,
          pass: passed,
        });
      } catch (error) {
        allPassed = false;
        const msg = error instanceof Error ? error.message : 'Execution Error';
        testResultsTemp.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          got: msg,
          pass: false,
        });
      }
    }

    setTestResults(testResultsTemp);
    setIsRunning(false);

    if (allPassed) {
      setRunnerOutput('All Test Cases Passed! 🎉');
      setQuestionPassStatus((prev) => ({ ...prev, [currentQuestion.id]: true }));
      setQuestionFirstFailures((prev) => {
        if (!(currentQuestion.id in prev)) return prev;
        const next = { ...prev };
        delete next[currentQuestion.id];
        return next;
      });
      toast.success('Solution Accepted!');
    } else {
      setRunnerOutput('Some test cases failed.');
      setQuestionPassStatus((prev) => ({ ...prev, [currentQuestion.id]: false }));
      const firstFail = testResultsTemp.find((t) => !t.pass);
      if (firstFail) {
        setQuestionFirstFailures((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            input: firstFail.input,
            expected: firstFail.expected,
            got: firstFail.got,
          },
        }));
      }
    }
  };

  // ---- Render gates ----
  if (isPending || loadingExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium">Loading exam…</span>
        </div>
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-slate-900/60 border border-red-500/30 rounded-2xl p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Exam unavailable</h2>
          <p className="text-gray-300 text-sm mb-4">{examError ?? 'Unknown error'}</p>
          <Link to="/profile" className="inline-flex items-center px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const sampleCount = Math.min(currentQuestion.sampleCount || 3, currentQuestion.testCases.length);

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
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4">{exam.title}</h1>
                  <p className="text-xl text-gray-300 mb-6">{exam.description}</p>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{exam.duration} min</div>
                      <div className="text-gray-400">Duration</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{exam.totalMarks}</div>
                      <div className="text-gray-400">Total Marks</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-cyan-500/20">
                      <Code2 className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{exam.questions.length}</div>
                      <div className="text-gray-400">Questions</div>
                    </div>
                  </div>
                </div>

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

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Questions Overview</h3>
                  <div className="space-y-4">
                    {exam.questions.map((question, index) => (
                      <div key={question.id} className="bg-slate-800/40 border border-cyan-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">Q{index + 1}. {question.title}</h4>
                          <p className="text-gray-400 text-sm">{question.description}</p>
                          <p className="text-xs text-cyan-300 mt-1">{question.testCases.length} test cases</p>
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
              <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-cyan-500/20 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Question {currentQuestionIndex + 1} of {exam.questions.length}
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
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">Sample Test Cases</h4>
                      <span className="text-xs text-cyan-300">
                        Showing {sampleCount} of {currentQuestion.testCases.length} — remaining are hidden and evaluated on Run
                      </span>
                    </div>
                    <div className="space-y-3">
                      {currentQuestion.testCases.slice(0, sampleCount).map((testCase, index) => (
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

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === exam.questions.length - 1}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <CodeEditor
                  initialCode={answers[currentQuestion.id]?.[language] ?? getStarter(currentQuestion, language)}
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium block text-white">Output</label>
                      <span className="text-xs text-cyan-300">
                        Inputs are pre-defined — {currentQuestion.testCases.length} hidden test cases will run automatically
                      </span>
                    </div>
                    <div className="h-24 bg-slate-950 border border-cyan-500/30 rounded-lg p-3 overflow-auto">
                      <pre className="text-sm text-green-400 font-mono">{runnerOutput}</pre>
                    </div>
                  </div>

                  {testResults.length > 0 && (() => {
                    const passedCount = testResults.filter((t) => t.pass).length;
                    const total = testResults.length;
                    const allPassed = passedCount === total;
                    const firstFailIdx = testResults.findIndex((t) => !t.pass);
                    return (
                      <div className="mt-4 space-y-3">
                        <div className={`rounded-xl p-4 border ${
                          allPassed
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {allPassed ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-green-300 font-semibold">Accepted</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span className="text-red-300 font-semibold">
                                    {firstFailIdx >= 0 ? `Wrong Answer on Test Case ${firstFailIdx + 1}` : 'Wrong Answer'}
                                  </span>
                                </>
                              )}
                            </div>
                            <span className={`text-sm font-mono ${allPassed ? 'text-green-300' : 'text-gray-300'}`}>
                              {passedCount} / {total} passed
                            </span>
                          </div>
                        </div>

                        <div className="bg-black/40 rounded-xl border border-cyan-500/20">
                          <div className="px-4 py-2 border-b border-cyan-500/20 text-sm text-white font-semibold">
                            Test Cases
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                            {testResults.map((t, i) => (
                              <div
                                key={i}
                                className={`px-4 py-3 text-xs font-mono ${
                                  t.pass ? 'bg-transparent' : 'bg-red-500/5'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-400 font-sans font-semibold">
                                    Case {i + 1}
                                  </span>
                                  <span className={`font-sans font-semibold ${t.pass ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.pass ? '✓ Passed' : '✗ Failed'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-[90px_1fr] gap-y-1 gap-x-2">
                                  <span className="text-gray-500 font-sans">Input:</span>
                                  <code className="text-cyan-200 break-all whitespace-pre-wrap">{t.input}</code>

                                  <span className="text-gray-500 font-sans">Expected:</span>
                                  <code className="text-blue-200 break-all whitespace-pre-wrap">{t.expected}</code>

                                  <span className="text-gray-500 font-sans">Got:</span>
                                  <code className={`break-all whitespace-pre-wrap ${t.pass ? 'text-green-300' : 'text-red-300'}`}>
                                    {t.got || '(no output)'}
                                  </code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {viva.length > 0 && (
                          <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20">
                            <div className="text-white font-semibold mb-2">Viva Questions</div>
                            <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                              {viva.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}

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

                  {examResults.score === 0 ? (
                    <p className="text-xl text-red-400 mt-2">
                      You didn't answer any questions correctly or skipped them all.
                    </p>
                  ) : (
                    <p className="text-xl text-gray-300">Great job on completing the exam!</p>
                  )}

                  <div className="text-xl text-white mt-4">
                    Assigned Level: <span className="text-cyan-400 font-bold">{examResults.level}</span>
                  </div>
                </div>

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
                            {result.status === 'passed' ? 'Passed' : 'Failed / Not Answered'}
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
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 px-8 py-4 rounded-xl text-black font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                  >
                    <Map className="w-5 h-5 mr-2" />
                    <span>View My {examResults.level} Roadmap</span>
                  </button>
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

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROADMAP_DATA, type RoadmapNode } from '@/data/roadmapData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Send, Play, Brain, Terminal, Code, Lightbulb,
  RefreshCw, Star, Mic, BookOpen, Loader2, ChevronRight,
  Zap, Shield, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  chatWithAI, generateProblem, getProgressiveHint,
  reviewCode, generateVivaQuestions,
  type AIProblem, type CodeReview, type VivaQuestion
} from '@/lib/gemini';

// ─── Types ────────────────────────────────────────────────
type ChatMsg = { role: 'user' | 'model'; parts: string };
type HintLevel = 1 | 2 | 3;
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
  'Dynamic Programming', 'Sorting & Searching', 'Recursion',
  'Hash Maps', 'Stack & Queue', 'Binary Search', 'Two Pointers',
];

const LANGUAGES = [
  { value: 'python',     label: 'Python',     ext: 'py' },
  { value: 'javascript', label: 'JavaScript', ext: 'js' },
  { value: 'java',       label: 'Java',       ext: 'java' },
  { value: 'cpp',        label: 'C++',        ext: 'cpp' },
  { value: 'c',          label: 'C',          ext: 'c' },
];

const ONECOMPILER_LANG: Record<string, string> = {
  python: 'python', javascript: 'nodejs', java: 'java', cpp: 'cpp', c: 'c',
};

// ─────────────────────────────────────────────────────────
// Walk every level's roadmap tree to find a node by id.
function findRoadmapNode(id: string): RoadmapNode | null {
  const walk = (nodes: RoadmapNode[]): RoadmapNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = walk(n.children);
        if (found) return found;
      }
    }
    return null;
  };
  for (const level of Object.keys(ROADMAP_DATA)) {
    const found = walk(ROADMAP_DATA[level]);
    if (found) return found;
  }
  return null;
}

// Convert a RoadmapNode (with its PracticeProblem) into the AIProblem shape Practice expects.
function roadmapNodeToAIProblem(node: RoadmapNode, language: string): AIProblem | null {
  if (!node.problem) return null;
  const p = node.problem;
  const examples =
    p.testCases
      ?.map((tc, i) => `Example ${i + 1}:\nInput:  ${tc.input}\nOutput: ${tc.expected}`)
      .join('\n\n') ?? '';
  return {
    title: p.title,
    difficulty: p.difficulty,
    description: p.description,
    examples,
    hints: [],
    testCases: p.testCases.map((tc) => ({ input: tc.input, output: tc.expected })),
    starterCode: { [language]: p.starterCode },
  };
}

export default function PracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, profile } = useAuth();

  // ── Editor state
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, CodeCoach!")');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // ── Problem state
  const [problem, setProblem] = useState<AIProblem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [topic, setTopic] = useState('any');

  // ── Chat state
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    {
      role: 'model',
      parts: "👋 Hi! I'm **CodeCoach AI**, your personal coding mentor powered by Gemini.\n\nI can help you:\n• 💡 Explain concepts and debug your code\n• 🎯 Generate personalised problems\n• 🔍 Review your code quality\n• 🎓 Prepare viva questions\n\nClick **🎯 Generate Problem** to start, or just ask me anything!",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Hint state
  const [hintLevel, setHintLevel] = useState<HintLevel>(1);
  const [hint, setHint] = useState('');
  const [isHinting, setIsHinting] = useState(false);

  // ── Code Review state
  const [review, setReview] = useState<CodeReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // ── Viva state
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>([]);
  const [isViva, setIsViva] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  // ── Active tab
  const [activeTab, setActiveTab] = useState('chat');

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Set starter code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  // If arriving from the roadmap with ?topicId=..., preload that challenge.
  const topicIdParam = searchParams.get('topicId');
  useEffect(() => {
    if (!topicIdParam) return;

    const node = findRoadmapNode(topicIdParam);
    if (!node) {
      toast.error(`Topic "${topicIdParam}" not found in the roadmap.`);
      return;
    }
    const aiProblem = roadmapNodeToAIProblem(node, language);
    if (!aiProblem) {
      toast.warning(`"${node.title}" has no practice challenge yet.`);
      return;
    }

    setProblem(aiProblem);
    setCode(aiProblem.starterCode[language] ?? node.problem!.starterCode);
    setOutput('');
    setReview(null);
    setVivaQuestions([]);
    setHint('');
    setHintLevel(1);
    setActiveTab('chat');
    setChatHistory((prev) => [
      ...prev,
      {
        role: 'model',
        parts: `🎯 Loaded from your roadmap: **${aiProblem.title}** (${aiProblem.difficulty})\n\n${aiProblem.description}\n\nGive it a try, or ask me for a hint!`,
      },
    ]);
    toast.success(`Loaded: ${aiProblem.title}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdParam]);

  // ─────────────────────────────────────────────────────────
  //  Generate Problem
  // ─────────────────────────────────────────────────────────
  const handleGenerateProblem = async () => {
    setIsGenerating(true);
    setReview(null);
    setVivaQuestions([]);
    setHint('');
    setHintLevel(1);
    toast.info('🤖 Gemini is crafting a problem for you…');

    try {
      const p = await generateProblem(language, difficulty, topic === 'any' ? undefined : topic);
      setProblem(p);
      setCode(p.starterCode?.[language] ?? `# Write your ${language} solution here`);
      setOutput('');
      setActiveTab('chat');
      toast.success(`✅ "${p.title}" is ready!`);

      // Announce in chat
      setChatHistory(prev => [
        ...prev,
        {
          role: 'model',
          parts: `🎯 New **${p.difficulty}** problem loaded: **${p.title}**\n\n${p.description}\n\nWhenever you're ready, click ▶️ **Run Code** or ask me for a hint!`,
        },
      ]);
    } catch (e: any) {
      toast.error('AI error: ' + (e.message ?? 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  Run Code via OneCompiler
  // ─────────────────────────────────────────────────────────
  const handleRunCode = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setIsRunning(true);
    setOutput('⏳ Running your code…\n');
    setReview(null);

    const apiKey = import.meta.env.VITE_ONECOMPILER_API_KEY as string;
    const fileName = `main.${LANGUAGES.find(l => l.value === language)?.ext ?? 'txt'}`;

    try {
      const res = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: ONECOMPILER_LANG[language] ?? language,
          stdin,
          files: [{ name: fileName, content: code }],
        }),
      });
      if (!res.ok) {
        setOutput(`⚠️ Execution server error (HTTP ${res.status}). Check your API key or try again.`);
        return;
      }
      const data = await res.json().catch(() => null);
      if (!data || typeof data !== 'object') {
        setOutput('⚠️ Execution server returned an invalid response.');
        return;
      }
      const out = data.stdout || data.stderr || '(No output)';
      setOutput(out);

      // Update total_problems in Supabase
      if (session?.user && data.stdout) {
        await supabase.from('profiles')
          .update({ total_problems: (profile?.total_problems ?? 0) + 1 })
          .eq('id', session.user.id);
      }
    } catch {
      setOutput('⚠️ Could not reach execution server. Check your API key or network.');
    } finally {
      setIsRunning(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  AI Chat
  // ─────────────────────────────────────────────────────────
  const handleSendChat = async (overrideMsg?: string) => {
    const msg = (overrideMsg ?? chatInput).trim();
    if (!msg) return;
    setChatInput('');

    const userMsg: ChatMsg = { role: 'user', parts: msg };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const reply = await chatWithAI(msg, {
        currentProblem: problem,
        currentCode: code,
        language,
        chatHistory,
      });
      setChatHistory(prev => [...prev, { role: 'model', parts: reply }]);
    } catch (e: any) {
      const errMsg = e.message?.includes('VITE_GEMINI_API_KEY')
        ? '⚠️ Please add your Gemini API key to .env (VITE_GEMINI_API_KEY)'
        : '⚠️ AI error: ' + (e.message ?? 'Unknown');
      setChatHistory(prev => [...prev, { role: 'model', parts: errMsg }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  Smart Hints
  // ─────────────────────────────────────────────────────────
  const handleGetHint = async () => {
    if (!problem) { toast.warning('Generate a problem first!'); return; }
    setIsHinting(true);
    setActiveTab('hints');

    try {
      const h = await getProgressiveHint(hintLevel, problem, code, language);
      setHint(h);
      if (hintLevel < 3) setHintLevel(prev => (prev + 1) as HintLevel);
    } catch (e: any) {
      toast.error('Hint error: ' + e.message);
    } finally {
      setIsHinting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  AI Code Review
  // ─────────────────────────────────────────────────────────
  const handleReview = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setIsReviewing(true);
    setActiveTab('review');
    toast.info('🔍 Gemini is reviewing your code…');

    try {
      const r = await reviewCode(code, language, problem, output);
      setReview(r);
    } catch (e: any) {
      toast.error('Review error: ' + e.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  Viva Questions
  // ─────────────────────────────────────────────────────────
  const handleViva = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setIsViva(true);
    setRevealedHints(new Set());
    setActiveTab('viva');
    toast.info('🎓 Generating viva questions…');

    try {
      const qs = await generateVivaQuestions(code, language, problem);
      setVivaQuestions(qs);
    } catch (e: any) {
      toast.error('Viva error: ' + e.message);
    } finally {
      setIsViva(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────────────────
  const scoreColor = (n: number) =>
    n >= 8 ? 'text-green-400' : n >= 5 ? 'text-yellow-400' : 'text-red-400';

  const difficultyColor: Record<Difficulty, string> = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const editorTheme: Record<string, string> = {
    python: 'bg-[#0d1117] text-[#e6edf3] border-[#30363d]',
    javascript: 'bg-[#1e1e1e] text-[#dcdcaa] border-[#3c3c3c]',
    java: 'bg-[#1b1f23] text-[#c8e1ff] border-[#30363d]',
    cpp: 'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]',
    c: 'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]',
  };

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,255,204,0.08)_1px,transparent_0)] bg-[length:24px_24px]" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
              className="text-cyan-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                AI Practice — Powered by Gemini
              </h1>
              <p className="text-xs text-gray-400">Chat • Problem Generator • Code Review • Viva</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
            {profile?.username ?? 'Student'} &bull; {profile?.total_problems ?? 0} solved
          </Badge>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 space-y-4">

        {/* ── Problem Generator Controls ── */}
        <Card className="bg-slate-900/50 border-cyan-500/20">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">Generate Problem:</span>

              <Select value={difficulty} onValueChange={v => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="w-28 h-8 bg-slate-800/50 border-cyan-500/30 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                    <SelectItem key={d} value={d} className="text-white">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="w-44 h-8 bg-slate-800/50 border-cyan-500/30 text-white text-sm">
                  <SelectValue placeholder="Any topic" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30 max-h-48">
                  <SelectItem value="any" className="text-gray-400">Any Topic</SelectItem>
                  {TOPICS.map(t => (
                    <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-8 bg-slate-800/50 border-cyan-500/30 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value} className="text-white">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleGenerateProblem} disabled={isGenerating} size="sm"
                className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 h-8">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                {isGenerating ? 'Generating…' : '🎯 Generate Problem'}
              </Button>

              {problem && (
                <div className="flex items-center gap-2 ml-auto">
                  <Badge className={difficultyColor[problem.difficulty]}>{problem.difficulty}</Badge>
                  <span className="text-white font-semibold text-sm">{problem.title}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Problem Statement ── */}
        {problem && (
          <Card className="bg-slate-900/40 border-cyan-500/20">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Terminal className="w-4 h-4 text-green-400" />
                {problem.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
              <p className="text-gray-300 text-sm">{problem.description}</p>
              <pre className="bg-slate-950 p-3 rounded text-xs text-green-400 font-mono border border-cyan-500/20 whitespace-pre-wrap">
                {problem.examples}
              </pre>
              {problem.testCases?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-gray-300">
                      <span className="text-cyan-400">In:</span> {tc.input}
                      <span className="text-cyan-400 ml-2">→ Out:</span> {tc.output}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Main Grid: Editor + AI Panel ── */}
        <div className="grid lg:grid-cols-5 gap-4">

          {/* ── Code Editor (3/5) ── */}
          <Card className="lg:col-span-3 bg-slate-900/40 border-cyan-500/20">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <Code className="w-4 h-4 text-cyan-400" /> Code Editor
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleReview} disabled={isReviewing} variant="outline" size="sm"
                    className="h-7 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs">
                    {isReviewing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    AI Review
                  </Button>
                  <Button onClick={handleViva} disabled={isViva} variant="outline" size="sm"
                    className="h-7 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs">
                    {isViva ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                    Viva
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <Textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className={`font-mono text-sm min-h-[280px] border resize-none focus:border-cyan-400 ${editorTheme[language]}`}
                placeholder="Write your code here…"
                spellCheck={false}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Input (stdin)</p>
                  <Textarea value={stdin} onChange={e => setStdin(e.target.value)}
                    className="h-20 text-xs bg-slate-800/50 border-cyan-500/30 text-white resize-none"
                    placeholder="Enter input…" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Output</p>
                  <div className="h-20 bg-slate-950 border border-cyan-500/30 rounded p-2 overflow-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
                  </div>
                </div>
              </div>

              <Button onClick={handleRunCode} disabled={isRunning}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
                {isRunning
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Running…</>
                  : <><Play className="w-4 h-4 mr-2" />▶ Run Code</>}
              </Button>
            </CardContent>
          </Card>

          {/* ── AI Panel (2/5) ── */}
          <Card className="lg:col-span-2 bg-slate-900/40 border-cyan-500/20">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Brain className="w-4 h-4 text-cyan-400" /> AI Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-slate-800/50 mb-3 h-8">
                  <TabsTrigger value="chat"   className="text-xs flex-1">💬 Chat</TabsTrigger>
                  <TabsTrigger value="hints"  className="text-xs flex-1">💡 Hints</TabsTrigger>
                  <TabsTrigger value="review" className="text-xs flex-1">🔍 Review</TabsTrigger>
                  <TabsTrigger value="viva"   className="text-xs flex-1">🎓 Viva</TabsTrigger>
                </TabsList>

                {/* ── Chat Tab ── */}
                <TabsContent value="chat" className="mt-0 space-y-2">
                  <div className="h-72 overflow-y-auto space-y-2 pr-1">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`text-xs rounded-lg p-2 whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-cyan-500/15 border border-cyan-500/20 ml-4 text-gray-200'
                          : 'bg-slate-700/50 border border-slate-600 mr-4 text-gray-300'
                      }`}>
                        <span className="font-bold text-[10px] block mb-1 text-gray-400">
                          {msg.role === 'user' ? '👤 You' : '🤖 CodeCoach AI'}
                        </span>
                        {msg.parts}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="bg-slate-700/50 border border-slate-600 mr-4 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-400 block mb-1">🤖 CodeCoach AI</span>
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                      placeholder="Ask anything about the problem…"
                      className="text-xs h-8 bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-500" />
                    <Button onClick={() => handleSendChat()} disabled={isChatLoading} size="sm"
                      className="h-8 bg-gradient-to-r from-cyan-500 to-green-500 px-2">
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Explain the problem', 'Debug my code', 'Suggest improvements'].map(q => (
                      <button key={q} onClick={() => handleSendChat(q)}
                        className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400
                          hover:bg-cyan-500/10 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* ── Hints Tab ── */}
                <TabsContent value="hints" className="mt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Progressive hints — each level reveals more detail</p>
                    <div className="flex gap-1">
                      {([1, 2, 3] as HintLevel[]).map(l => (
                        <span key={l} className={`text-[10px] px-2 py-0.5 rounded border ${
                          hintLevel > l
                            ? 'border-green-500/40 bg-green-500/10 text-green-400'
                            : hintLevel === l
                            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                            : 'border-slate-700 text-slate-500'
                        }`}>
                          L{l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {([
                      { level: 1, label: '💡 Concept', desc: 'What to use' },
                      { level: 2, label: '🗺 Approach', desc: 'How to think' },
                      { level: 3, label: '📝 Pseudocode', desc: 'Step by step' },
                    ] as { level: HintLevel; label: string; desc: string }[]).map(h => (
                      <button key={h.level}
                        onClick={() => { setHintLevel(h.level); handleGetHint(); }}
                        disabled={isHinting}
                        className={`flex-1 rounded-lg border p-2 text-center transition-all text-xs ${
                          hintLevel === h.level
                            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}>
                        <div className="font-medium">{h.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{h.desc}</div>
                      </button>
                    ))}
                  </div>

                  {isHinting && (
                    <div className="flex items-center gap-2 text-cyan-400 text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Gemini thinking…
                    </div>
                  )}

                  {hint && !isHinting && (
                    <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap">
                      <div className="flex items-center gap-1 mb-1 text-yellow-400 font-medium">
                        <Lightbulb className="w-3 h-3" />
                        Level {hintLevel === 1 ? 1 : hintLevel - 1} Hint
                      </div>
                      {hint}
                    </div>
                  )}

                  {!problem && (
                    <p className="text-xs text-gray-500 text-center pt-4">
                      Generate a problem first to unlock hints.
                    </p>
                  )}
                </TabsContent>

                {/* ── Review Tab ── */}
                <TabsContent value="review" className="mt-0 space-y-3">
                  {!review && !isReviewing && (
                    <div className="text-center py-8 space-y-3">
                      <Shield className="w-10 h-10 text-purple-400 mx-auto opacity-50" />
                      <p className="text-xs text-gray-500">Run your code first, then click<br /><strong className="text-purple-300">AI Review</strong> to get Gemini's analysis.</p>
                      <Button onClick={handleReview} size="sm"
                        className="bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:bg-purple-600/50">
                        <Eye className="w-3 h-3 mr-1" /> Review My Code
                      </Button>
                    </div>
                  )}

                  {isReviewing && (
                    <div className="flex flex-col items-center gap-2 py-8 text-purple-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-xs">Gemini is reading your code…</p>
                    </div>
                  )}

                  {review && !isReviewing && (
                    <div className="space-y-3">
                      {/* Score Bars */}
                      {[
                        { label: 'Code Quality',    value: review.quality,     color: 'bg-cyan-500' },
                        { label: 'Efficiency',       value: review.efficiency,  color: 'bg-green-500' },
                        { label: 'Readability',      value: review.readability, color: 'bg-purple-500' },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{s.label}</span>
                            <span className={scoreColor(s.value)}>{s.value}/10</span>
                          </div>
                          <Progress value={s.value * 10} className="h-1.5" />
                        </div>
                      ))}

                      {/* Complexity */}
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-800 rounded p-2 text-center">
                          <div className="text-[10px] text-gray-500">Time</div>
                          <div className="text-xs font-mono text-cyan-400">{review.timeComplexity}</div>
                        </div>
                        <div className="flex-1 bg-slate-800 rounded p-2 text-center">
                          <div className="text-[10px] text-gray-500">Space</div>
                          <div className="text-xs font-mono text-green-400">{review.spaceComplexity}</div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="bg-slate-800/50 rounded-lg p-2 text-xs text-gray-300">
                        <div className="font-medium text-white mb-1">Overall Feedback</div>
                        {review.feedback}
                      </div>

                      {/* Suggestions */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-white">Suggestions</div>
                        {review.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                            <ChevronRight className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── Viva Tab ── */}
                <TabsContent value="viva" className="mt-0 space-y-3">
                  {!vivaQuestions.length && !isViva && (
                    <div className="text-center py-8 space-y-3">
                      <Mic className="w-10 h-10 text-amber-400 mx-auto opacity-50" />
                      <p className="text-xs text-gray-500">Once you've solved the problem,<br />click <strong className="text-amber-300">Viva</strong> to test your understanding.</p>
                      <Button onClick={handleViva} size="sm"
                        className="bg-amber-600/30 border border-amber-500/30 text-amber-300 hover:bg-amber-600/50">
                        <Mic className="w-3 h-3 mr-1" /> Start Viva
                      </Button>
                    </div>
                  )}

                  {isViva && (
                    <div className="flex flex-col items-center gap-2 py-8 text-amber-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-xs">Crafting viva questions…</p>
                    </div>
                  )}

                  {vivaQuestions.length > 0 && !isViva && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">Answer these out loud to solidify your understanding:</p>
                      {vivaQuestions.map((q, i) => (
                        <div key={i} className="bg-slate-800/50 border border-amber-500/20 rounded-lg p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-white font-medium">{q.question}</p>
                          </div>
                          <button
                            onClick={() => setRevealedHints(prev => new Set([...prev, i]))}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            {revealedHints.has(i) ? q.hint : 'Reveal hint'}
                          </button>
                        </div>
                      ))}
                      <Button onClick={handleViva} variant="outline" size="sm"
                        className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs">
                        <RefreshCw className="w-3 h-3 mr-1" /> Generate New Questions
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pb-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-xs">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Home
          </Button>
        </div>

        {/* Helpful overlay when topicId is in URL but the node wasn't found / has no challenge */}
        {topicIdParam && !problem && (
          <div className="fixed bottom-4 right-4 z-20 max-w-xs rounded-lg border border-yellow-500/30 bg-slate-900/90 backdrop-blur-md p-3 text-xs text-yellow-300 shadow-lg">
            Couldn't load <span className="font-mono">{topicIdParam}</span> from the roadmap.
            Try generating a fresh problem instead.
          </div>
        )}
        {topicIdParam && problem && (
          <div className="fixed bottom-4 right-4 z-20 max-w-xs rounded-lg border border-cyan-500/30 bg-slate-900/90 backdrop-blur-md p-3 text-xs text-cyan-300 shadow-lg">
            ✅ Loaded from roadmap: <span className="font-semibold text-white">{problem.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

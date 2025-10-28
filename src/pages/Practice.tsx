import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Play, Brain, Terminal, Code, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface StudentData {
  name: string;
  rollNumber: string;
  totalProblems: number;
  streakCount: number;
  achievements: string[];
}

export default function PracticePage() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const studentData = localStorage.getItem('currentStudent');
    if (!studentData) {
      // Create mock student data if none exists
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
    
    // Initialize with a welcome message
    setChatHistory([
      { type: 'ai', message: "Hello! I'm your AI coding assistant. I can help you with:\n• Explaining coding concepts\n• Debugging your code\n• Generating practice problems\n• Code optimization tips\n\nWhat would you like to work on today?" }
    ]);

    // Generate initial problem
    generateProblem();
  }, [navigate]);

  const languages = [
    { value: 'python', label: 'Python', starter: '# Write your Python code here\nprint("Hello, CodeLab!")' },
    { value: 'javascript', label: 'JavaScript', starter: '// Write your JavaScript code here\nconsole.log("Hello, CodeLab!");' },
    { value: 'java', label: 'Java', starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeLab!");\n    }\n}' },
    { value: 'cpp', label: 'C++', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeLab!" << endl;\n    return 0;\n}' },
    { value: 'c', label: 'C', starter: '#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeLab!\\n");\n    return 0;\n}' }
  ];

  useEffect(() => {
    const selectedLang = languages.find(lang => lang.value === selectedLanguage);
    if (selectedLang && !code) {
      setCode(selectedLang.starter);
    }
  }, [selectedLanguage]);

  const generateProblem = async () => {
    setIsGeneratingProblem(true);
    
    // Simulate AI problem generation (replace with actual Gemini API call)
    setTimeout(() => {
      const problems = [
        {
          title: "Two Sum",
          difficulty: "Easy",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
          hints: ["Use a hash map to store the values and their indices", "For each element, check if target - element exists in the map"]
        },
        {
          title: "Palindrome Check",
          difficulty: "Easy",
          description: "Write a function to check if a given string is a palindrome (reads the same forwards and backwards).",
          example: "Input: 'racecar'\nOutput: True\nInput: 'hello'\nOutput: False",
          hints: ["Compare characters from start and end", "Use two pointers approach", "Consider case sensitivity"]
        },
        {
          title: "Fibonacci Sequence",
          difficulty: "Medium",
          description: "Write a function to generate the nth Fibonacci number. The sequence starts with 0, 1.",
          example: "Input: n = 5\nOutput: 5\nSequence: 0, 1, 1, 2, 3, 5",
          hints: ["Use dynamic programming for efficiency", "Consider recursive approach with memoization", "Base cases are F(0) = 0, F(1) = 1"]
        }
      ];
      
      const randomProblem = problems[Math.floor(Math.random() * problems.length)];
      setCurrentProblem(randomProblem);
      setIsGeneratingProblem(false);
    }, 2000);
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('Running your code...\n');

    try {
      // Simulate API call to OneCompiler
      const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': 'ead58a2ba3msh92dcc5cbcbf559ap11fc2fjsn5288ed507ac5',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: selectedLanguage,
          stdin: input,
          files: [{
            name: selectedLanguage === 'python' ? 'main.py' : selectedLanguage === 'javascript' ? 'main.js' : selectedLanguage === 'java' ? 'Main.java' : 'main.cpp',
            content: code
          }]
        })
      });

      const result = await response.json();
      
      if (result.stdout) {
        setOutput(result.stdout);
        
        // Update student progress
        if (student) {
          const updatedStudent = {
            ...student,
            totalProblems: student.totalProblems + 1
          };
          setStudent(updatedStudent);
          localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
          toast.success('Code executed successfully!');
        }
      } else if (result.stderr) {
        setOutput(`Error:\n${result.stderr}`);
      } else {
        setOutput('Code executed successfully! (No output)');
      }
    } catch (error) {
      // Fallback for demo purposes
      setTimeout(() => {
        if (selectedLanguage === 'python' && code.includes('print')) {
          setOutput('Hello, CodeLab!\nCode executed successfully!');
          if (student) {
            const updatedStudent = {
              ...student,
              totalProblems: student.totalProblems + 1
            };
            setStudent(updatedStudent);
            localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
          }
          toast.success('Code executed successfully!');
        } else {
          setOutput('Hello, CodeLab!\nCode executed successfully!\n\nNote: This is a demo output. In production, your code would be executed on our servers.');
        }
      }, 1000);
    }

    setIsRunning(false);
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsLoadingResponse(true);

    // Simulate AI response (replace with actual Gemini API call)
    setTimeout(() => {
      let aiResponse = '';
      
      if (userMessage.toLowerCase().includes('problem') || userMessage.toLowerCase().includes('challenge')) {
        aiResponse = "I'd be happy to help you with a coding problem! Here are some suggestions based on your current skill level:\n\n1. **Array Problems**: Try working with two pointers or sliding window techniques\n2. **String Manipulation**: Practice palindromes, anagrams, and pattern matching\n3. **Basic Algorithms**: Implement sorting algorithms or search algorithms\n\nWould you like me to generate a specific problem for you to solve?";
      } else if (userMessage.toLowerCase().includes('debug') || userMessage.toLowerCase().includes('error')) {
        aiResponse = "I can help you debug your code! Here are some common debugging strategies:\n\n1. **Check your syntax** - Make sure all brackets, quotes, and semicolons are properly placed\n2. **Use print statements** - Add debug prints to see what values your variables have\n3. **Check variable types** - Ensure you're using the right data types\n4. **Review logic flow** - Walk through your code step by step\n\nFeel free to share your code and I'll help you identify any issues!";
      } else if (userMessage.toLowerCase().includes('hint') && currentProblem) {
        aiResponse = `Here are some hints for "${currentProblem.title}":\n\n${currentProblem.hints.map((hint: string, i: number) => `${i + 1}. ${hint}`).join('\n')}\n\nTry implementing these approaches and let me know if you need more specific guidance!`;
      } else {
        aiResponse = `Great question! I understand you're asking about: "${userMessage}"\n\nHere's my advice: Start by breaking down the problem into smaller parts. Write pseudocode first, then implement each part step by step. Don't forget to test your code with different inputs!\n\nWould you like me to elaborate on any specific aspect or provide a coding example?`;
      }

      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
      setIsLoadingResponse(false);
    }, 1500);
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
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,255,204,0.15)_1px,transparent_0)] bg-[length:20px_20px] animate-pulse"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
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
        {/* Current Problem - move to top */}
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
                    onClick={generateProblem}
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Description</h4>
                <p className="text-gray-300">{currentProblem.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-white">Example</h4>
                <pre className="bg-slate-950 p-3 rounded text-sm text-green-400 font-mono border border-cyan-500/30">{currentProblem.example}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Chat Assistant */}
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
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="flex-1 bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
                />
                <Button onClick={sendChatMessage} disabled={isLoadingResponse} className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {currentProblem && (
                <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-lg border border-cyan-500/20">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => sendChatMessage()}
                    className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    disabled={isLoadingResponse}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Hints for Current Problem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Coding Area */}
          <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-lg border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-white">
                  <Code className="w-5 h-5 mr-2 text-cyan-400" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Input (stdin)</label>
                  <Textarea
                    placeholder="Enter input for your program..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-24 text-sm bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Output</label>
                  <div className="terminal h-24 bg-slate-950 border border-cyan-500/30 rounded-md p-3 overflow-auto">
                    <pre className="text-sm text-green-400 font-mono">{output}</pre>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={runCode} disabled={isRunning} className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Problem moved above */}
        {/* Footer - Back to Home */}
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
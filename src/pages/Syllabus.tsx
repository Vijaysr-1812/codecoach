import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Database, 
  Globe, 
  Cpu, 
  FileText,
  ArrowLeft 
} from 'lucide-react';
import Particles from '@/components/Particles';

const Syllabus = () => {
  const navigate = useNavigate();

  const syllabi = [
    {
      icon: Code,
      language: "Python",
      difficulty: "Beginner to Advanced",
      topics: [
        "Variables, Data Types & Operators",
        "Control Structures (if/else, loops)",
        "Functions & Lambda Expressions",
        "Object-Oriented Programming",
        "File Handling & Exception Handling",
        "Data Structures (Lists, Tuples, Dictionaries)",
        "Libraries (NumPy, Pandas basics)",
        "Algorithm Implementation"
      ],
      color: "bg-yellow-500/10 text-yellow-500"
    },
    {
      icon: Cpu,
      language: "C/C++",
      difficulty: "Intermediate to Advanced",
      topics: [
        "Syntax, Variables & Data Types",
        "Pointers & Memory Management",
        "Arrays & Strings",
        "Functions & Recursion",
        "Object-Oriented Programming (C++)",
        "STL Containers & Algorithms",
        "Dynamic Memory Allocation",
        "Advanced Data Structures"
      ],
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Database,
      language: "Java",
      difficulty: "Intermediate",
      topics: [
        "Java Fundamentals & Syntax",
        "Object-Oriented Concepts",
        "Inheritance & Polymorphism",
        "Exception Handling",
        "Collections Framework",
        "Multithreading Basics",
        "File I/O Operations",
        "Basic GUI Programming"
      ],
      color: "bg-orange-500/10 text-orange-500"
    },
    {
      icon: Globe,
      language: "JavaScript",
      difficulty: "Beginner to Intermediate",
      topics: [
        "Variables, Functions & Scope",
        "DOM Manipulation",
        "Event Handling",
        "Asynchronous Programming",
        "ES6+ Features",
        "Object-Oriented JavaScript",
        "Error Handling",
        "Basic Node.js Concepts"
      ],
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: FileText,
      language: "HTML/CSS",
      difficulty: "Beginner",
      topics: [
        "HTML5 Semantic Elements",
        "Forms & Input Validation",
        "CSS Selectors & Properties",
        "Flexbox & Grid Layout",
        "Responsive Web Design",
        "CSS Animations & Transitions",
        "Web Accessibility Basics",
        "Modern CSS Features"
      ],
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: Code,
      language: "Data Structures & Algorithms",
      difficulty: "Intermediate to Advanced",
      topics: [
        "Arrays & Linked Lists",
        "Stacks & Queues",
        "Trees & Binary Search Trees",
        "Graphs & Graph Algorithms",
        "Sorting & Searching Algorithms",
        "Dynamic Programming",
        "Greedy Algorithms",
        "Time & Space Complexity Analysis"
      ],
      color: "bg-red-500/10 text-red-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Syllabus
            </span>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <Badge className="px-4 py-2 text-lg bg-primary/10 text-primary border-primary/20">
            📚 Comprehensive Curriculum
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Examination Syllabus
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Master these topics to excel in your coding examinations. Our curriculum covers 
            everything from fundamental concepts to advanced programming techniques.
          </p>
        </div>
      </section>

      {/* Syllabus Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {syllabi.map((syllabus, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${syllabus.color} group-hover:scale-110 transition-transform`}>
                      <syllabus.icon className="h-6 w-6" />
                    </div>
                    <Badge className={syllabus.color}>
                      {syllabus.difficulty}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-2xl">{syllabus.language}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete coverage of essential topics
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-primary">Topics Covered:</h4>
                    <ul className="space-y-2">
                      {syllabus.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardContent className="py-12 text-center space-y-6">
              <BookOpen className="h-16 w-16 text-primary mx-auto" />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Examination Guidelines
                </h2>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-primary">Assessment Format:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Multiple programming challenges</li>
                      <li>• Real-time code execution</li>
                      <li>• Time-bound problem solving</li>
                      <li>• Difficulty progression</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-primary">Evaluation Criteria:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Code correctness & logic</li>
                      <li>• Algorithm efficiency</li>
                      <li>• Completion time</li>
                      <li>• Best practices adherence</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/practice')} 
                  className="neon-button"
                >
                  Start Practicing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="border-primary/20 hover:border-primary/40"
                >
                  Take Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Syllabus;
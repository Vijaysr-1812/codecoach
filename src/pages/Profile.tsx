import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Flame, CheckCircle2, Code2, BookOpenCheck, Trophy, BarChart3, MessagesSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // --- IMPORT AUTH HOOK ---

interface StudentData {
  name: string;
  totalProblems: number;
  streakCount: number;
  achievements: string[];
}

export default function Profile() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const navigate = useNavigate();
  // --- GET PROFILE FROM AUTH HOOK ---
  const { profile } = useAuth();

  useEffect(() => {
    // --- USE PROFILE USERNAME, FALLBACK TO 'User' ---
    const userName = profile?.username || 'User'; 
    const stored = localStorage.getItem('currentStudent');
    
    if (stored) {
      const parsedData = JSON.parse(stored);
      parsedData.name = userName; // Update with the correct username
      setStudent(parsedData);
    } else {
      const fresh: StudentData = {
        name: userName, // Set the correct username
        totalProblems: 0,
        streakCount: 0,
        achievements: []
      };
      setStudent(fresh);
      localStorage.setItem('currentStudent', JSON.stringify(fresh));
    }
  // --- ADD PROFILE TO DEPENDENCY ARRAY ---
  }, [profile]);

  if (!student) return null; // Or return a loading spinner

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            {/* This will now show the correct name */}
            <h1 className="text-2xl font-semibold">Welcome back, {student.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/practice')}>
            <Code2 className="h-4 w-4 mr-2"/>Enter Practice
          </Button>
          <Button onClick={() => navigate('/exam')} variant="outline">
            <BookOpenCheck className="h-4 w-4 mr-2"/>Enter Examination
          </Button>
        </div>
      </div>

      {/* ... (rest of your component is unchanged and fine) ... */}
      
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Day Streak</div>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="h-5 w-5 text-orange-500"/>
              <span className="text-2xl font-bold">{student.streakCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Problems Solved</div>
            <div className="text-2xl font-bold">{student.totalProblems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Achievements</div>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="h-5 w-5 text-amber-400"/>
              <span className="text-2xl font-bold">{student.achievements.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Accuracy</div>
            <div className="text-2xl font-bold">95%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Choose Your Learning Path</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-1">Practice</h3>
              <p className="text-sm text-muted-foreground mb-3">
                AI-powered coding practice with instant assistance
              </p>
              <Button onClick={() => navigate('/practice')}>Enter Practice</Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-1">Examination</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Secure coding exams with real-time evaluation
              </p>
              <Button onClick={() => navigate('/exam')}>Enter Examination</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Ask questions about your studies, get hints, or request topics.
            </p>
            <Link to="/practice" className="text-primary text-sm inline-flex items-center">
              Open assistant in Practice
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {student.achievements.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No achievements yet. Solve problems to unlock badges.
              </div>
            ) : (
              <ul className="text-sm space-y-2">
                {student.achievements.map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500"/>{a}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-md flex items-end gap-1 p-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/40 rounded-t" 
                  style={{ height: `${20 + (i*5)%80}%` }} 
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Monthly solved problems
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
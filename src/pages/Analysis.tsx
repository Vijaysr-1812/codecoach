import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  ArrowRight,
  Star
} from 'lucide-react';
import Particles from '@/components/Particles';

interface ExamResult {
  studentName: string;
  studentRoll: string;
  score: number;
  speed: number;
  efficiency: number;
  completedAt: string;
}

const Analysis = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult | null>(null);
  const [rank, setRank] = useState(1);

  useEffect(() => {
    const savedResults = localStorage.getItem('examResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      
      // Generate random rank based on score
      const calculatedRank = Math.max(1, Math.floor((100 - parsedResults.score) / 5) + 1);
      setRank(calculatedRank);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!results) {
    return <div>Loading...</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 75) return { level: 'Good', color: 'bg-yellow-500' };
    if (score >= 60) return { level: 'Average', color: 'bg-orange-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  const performance = getPerformanceLevel(results.score);

  return (
    <div className="min-h-screen p-4">
      <Particles />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Examination Complete!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's your detailed performance analysis
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Student Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{results.studentName}</CardTitle>
                <CardDescription>Roll Number: {results.studentRoll}</CardDescription>
              </div>
              <Badge className={`${performance.color} text-white px-4 py-2 text-lg`}>
                {performance.level}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Results Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-5xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}%
                </div>
                <Progress value={results.score} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  You scored better than {100 - rank * 5}% of students
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Speed Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Coding Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-accent">
                  {results.speed}%
                </div>
                <Progress value={results.speed} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Lines of code per minute: {Math.floor(results.speed / 10) + 5}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Rating */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Code Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-green-500">
                  {results.efficiency}%
                </div>
                <Progress value={results.efficiency} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Algorithm complexity score
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Problem Solving</span>
                    <span className="font-semibold">{results.score}%</span>
                  </div>
                  <Progress value={results.score} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Code Quality</span>
                    <span className="font-semibold">{results.efficiency}%</span>
                  </div>
                  <Progress value={results.efficiency} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Time Management</span>
                    <span className="font-semibold">{results.speed}%</span>
                  </div>
                  <Progress value={results.speed} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Syntax Accuracy</span>
                    <span className="font-semibold">{Math.min(95, results.score + 10)}%</span>
                  </div>
                  <Progress value={Math.min(95, results.score + 10)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.score >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">High Achiever</div>
                      <div className="text-sm text-muted-foreground">Scored above 80%</div>
                    </div>
                  </div>
                )}
                
                {results.speed >= 70 && (
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                    <Clock className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold">Speed Demon</div>
                      <div className="text-sm text-muted-foreground">Fast coding speed</div>
                    </div>
                  </div>
                )}
                
                {results.efficiency >= 75 && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">Code Optimizer</div>
                      <div className="text-sm text-muted-foreground">Efficient algorithms</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-semibold">Exam Warrior</div>
                    <div className="text-sm text-muted-foreground">Completed the challenge</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rank Card */}
        <Card className="glass-card">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-6 rounded-full bg-primary/10">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">
                Rank #{rank}
              </h2>
              <p className="text-lg text-muted-foreground">
                You ranked {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} out of all participants
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/leaderboard')} 
            className="neon-button"
          >
            <Trophy className="h-4 w-4 mr-2" />
            View Leaderboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-primary/20 hover:border-primary/40"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
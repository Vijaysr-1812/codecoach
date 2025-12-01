import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Clock,
  Target,
  ArrowLeft
} from 'lucide-react';
import Particles from '@/components/Particles';

interface LeaderboardEntry {
  rank: number;
  name: string;
  rollNumber: string;
  score: number;
  speed: number;
  efficiency: number;
  completedAt: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    // Generate mock leaderboard data
    const generateLeaderboard = () => {
      const names = [
        'Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis', 
        'David Wilson', 'Lisa Wang', 'James Miller', 'Anna Rodriguez',
        'Kevin Lee', 'Maya Patel', 'Ryan Taylor', 'Zoe Kim'
      ];
      
      const rollNumbers = [
        'CS001', 'CS002', 'CS003', 'CS004', 'CS005', 'CS006',
        'CS007', 'CS008', 'CS009', 'CS010', 'CS011', 'CS012'
      ];

      const mockData: LeaderboardEntry[] = [];
      
      // Add current user from exam results
      const savedResults = localStorage.getItem('examResults');
      if (savedResults) {
        const results = JSON.parse(savedResults);
        const userRank = Math.max(1, Math.floor((100 - results.score) / 5) + 1);
        
        const userEntry: LeaderboardEntry = {
          rank: userRank,
          name: results.studentName,
          rollNumber: results.studentRoll,
          score: results.score,
          speed: results.speed,
          efficiency: results.efficiency,
          completedAt: results.completedAt
        };
        
        setCurrentUser(userEntry);
      }

      // Generate other entries
      for (let i = 0; i < 12; i++) {
        const score = Math.floor(Math.random() * 30) + 70; // 70-100
        mockData.push({
          rank: i + 1,
          name: names[i],
          rollNumber: rollNumbers[i],
          score: score,
          speed: Math.floor(Math.random() * 40) + 60,
          efficiency: Math.floor(Math.random() * 35) + 65,
          completedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Sort by score
      mockData.sort((a, b) => b.score - a.score);
      
      // Update ranks
      mockData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Insert current user if they have results
      if (currentUser) {
        const userRankIndex = mockData.findIndex(entry => entry.score <= currentUser.score);
        if (userRankIndex !== -1) {
          mockData.splice(userRankIndex, 0, currentUser);
          // Re-rank
          mockData.forEach((entry, index) => {
            entry.rank = index + 1;
          });
        }
      }

      setLeaderboard(mockData.slice(0, 10)); // Top 10
    };

    generateLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="font-bold text-lg w-6 text-center">{rank}</span>;
    }
  };

  const getRankCardClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'glass-card border-yellow-500/30 bg-yellow-500/5';
      case 2:
        return 'glass-card border-gray-400/30 bg-gray-400/5';
      case 3:
        return 'glass-card border-orange-600/30 bg-orange-600/5';
      default:
        return 'glass-card';
    }
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return currentUser && entry.rollNumber === currentUser.rollNumber;
  };

  return (
    <div className="min-h-screen p-4">
      <Particles />
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 text-primary animate-pulse pulse-neon" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Top performers in the CodeLab examination
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <Card 
              key={entry.rollNumber} 
              className={`${getRankCardClass(entry.rank)} ${isCurrentUser(entry) ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  {getRankIcon(entry.rank)}
                </div>
                <CardTitle className="text-lg">{entry.name}</CardTitle>
                <CardDescription>{entry.rollNumber}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="text-3xl font-bold text-primary">
                  {entry.score}%
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{entry.speed}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{entry.efficiency}%</span>
                  </div>
                </div>
                {isCurrentUser(entry) && (
                  <Badge className="bg-primary text-primary-foreground">
                    You
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Complete Leaderboard */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Complete Rankings
            </CardTitle>
            <CardDescription>
              Full leaderboard with detailed performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rollNumber}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                    isCurrentUser(entry) 
                      ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' 
                      : 'bg-background/50 border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {entry.name}
                        {isCurrentUser(entry) && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.rollNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg text-primary">{entry.score}%</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="h-3 w-3 text-accent" />
                        {entry.speed}%
                      </div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 font-semibold">
                        <Target className="h-3 w-3 text-green-500" />
                        {entry.efficiency}%
                      </div>
                      <div className="text-xs text-muted-foreground">Efficiency</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="py-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {leaderboard.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="py-6 text-center">
              <div className="text-2xl font-bold text-accent mb-2">
                {Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="py-6 text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">
                {leaderboard[0]?.score || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center py-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-primary/20 hover:border-primary/40"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
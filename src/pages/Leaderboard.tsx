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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  rollNumber: string;
  score: number;
  speed: number;
  efficiency: number;
  completedAt: string;
}

const normalizeScore = (score: number, totalMarks: number | null, percentage?: number | null) => {
  if (typeof percentage === 'number') {
    return percentage;
  }

  return totalMarks && totalMarks > 0
    ? Math.round((score / totalMarks) * 100)
    : score;
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);

      const { data: submissions, error } = await supabase
        .from('exam_submissions')
        .select('user_id, score, total_marks, percentage, submitted_at')
        .order('submitted_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch leaderboard data:', error);
        setLeaderboard([]);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      const bestSubmissionByUser = new Map<string, { user_id: string; score: number; total_marks: number | null; percentage?: number | null; submitted_at: string | null }>();

      (submissions || []).forEach((submission) => {
        const existing = bestSubmissionByUser.get(submission.user_id);

        const submissionScore = normalizeScore(submission.score, submission.total_marks, submission.percentage);
        const existingScore = existing ? normalizeScore(existing.score, existing.total_marks, existing.percentage) : -1;

        if (!existing || submissionScore > existingScore) {
          bestSubmissionByUser.set(submission.user_id, submission);
        }
      });

      const userIds = Array.from(bestSubmissionByUser.keys());
      let profileMap = new Map<string, { username?: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Failed to fetch leaderboard profiles:', profilesError);
        } else {
          profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
        }
      }

      const rankedEntries = Array.from(bestSubmissionByUser.values())
        .sort(
          (a, b) =>
            normalizeScore(b.score, b.total_marks, b.percentage) - normalizeScore(a.score, a.total_marks, a.percentage)
        )
        .map((submission, index) => {
          const normalizedScore = normalizeScore(submission.score, submission.total_marks, submission.percentage);
          const profile = profileMap.get(submission.user_id);

          return {
            rank: index + 1,
            userId: submission.user_id,
            name: profile?.username || 'User',
            rollNumber: submission.user_id.slice(0, 8).toUpperCase(),
            score: normalizedScore,
            speed: normalizedScore,
            efficiency: normalizedScore,
            completedAt: submission.submitted_at || '',
          };
        });

      setLeaderboard(rankedEntries);
      setCurrentUser(
        rankedEntries.find((entry) => entry.userId === session?.user?.id) || null
      );
      setIsLoading(false);
    };

    void fetchLeaderboard();
  }, [session?.user?.id]);

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
    return currentUser ? entry.userId === currentUser.userId : false;
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
          {leaderboard.slice(0, 3).map((entry) => (
            <Card 
              key={entry.userId} 
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
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-sm text-muted-foreground">No leaderboard data available yet.</div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
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
            )}
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
                {leaderboard.length > 0
                  ? `${Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)}%`
                  : '0%'}
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

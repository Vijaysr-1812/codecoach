import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Flame, CheckCircle2, Code2, BookOpenCheck, Trophy, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface MonthlyData {
  month: string;
  count: number;
}

interface Achievement {
  achievement_name: string;
  earned_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchExtras = async () => {
      setLoadingExtra(true);
      const userId = session.user.id;

      // Fetch achievements
      const { data: achData } = await supabase
        .from('achievements')
        .select('achievement_name, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      // Fetch last 12 months of exam submissions for chart
      const since = new Date();
      since.setMonth(since.getMonth() - 11);
      const { data: subData } = await supabase
        .from('exam_submissions')
        .select('score, created_at')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString());

      // Build monthly counts
      const counts: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const key = d.toLocaleString('default', { month: 'short' });
        counts[key] = 0;
      }

      if (subData) {
        subData.forEach(s => {
          const key = new Date(s.created_at).toLocaleString('default', { month: 'short' });
          if (counts[key] !== undefined) counts[key]++;
        });

        // Calculate average accuracy from exam scores
        if (subData.length > 0) {
          const avg = subData.reduce((sum, s) => sum + s.score, 0) / subData.length;
          setAccuracy(Math.round(avg));
        }
      }

      setAchievements(achData || []);
      setMonthlyData(Object.entries(counts).map(([month, count]) => ({ month, count })));
      setLoadingExtra(false);
    };

    fetchExtras();
  }, [session]);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-4 min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Loading your profile…</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          If this hangs for more than a few seconds, your profile may not have been created yet.
          Try signing out and back in.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
          <Button onClick={() => navigate('/login')}>Sign in again</Button>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {profile.username}</h1>
            <p className="text-sm text-muted-foreground capitalize">{profile.current_skill_level} level</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/practice')}>
            <Code2 className="h-4 w-4 mr-2" />Enter Practice
          </Button>
          <Button onClick={() => navigate('/exam')} variant="outline">
            <BookOpenCheck className="h-4 w-4 mr-2" />Enter Examination
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Day Streak</div>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{profile.streak_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Problems Solved</div>
            <div className="text-2xl font-bold">{profile.total_problems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Achievements</div>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold">{achievements.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-muted-foreground text-sm">Avg. Score</div>
            <div className="text-2xl font-bold">{accuracy > 0 ? `${accuracy}%` : '—'}</div>
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
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingExtra ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : achievements.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No achievements yet. Solve problems to unlock badges.
              </div>
            ) : (
              <ul className="text-sm space-y-2">
                {achievements.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {a.achievement_name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingExtra ? (
              <div className="h-32 animate-pulse bg-muted rounded-md" />
            ) : (
              <>
                <div className="h-32 flex items-end gap-1 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-md">
                  {monthlyData.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/60 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${(d.count / maxCount) * 100 || 4}%` }}
                      title={`${d.month}: ${d.count} exams`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {monthlyData.map((d, i) => (
                    <span key={i}>{d.month}</span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Monthly exams taken (last 12 months)
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

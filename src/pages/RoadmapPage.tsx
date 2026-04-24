import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROADMAP_DATA } from '@/data/roadmapData';
import RoadmapTree from '@/components/RoadmapTree';

export default function RoadmapPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_skill_level')
          .eq('id', session.user.id)
          .single();

        setLevel(profile?.current_skill_level || 'Beginner');
      } catch (error) {
        console.error('Error fetching roadmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const completedTopics: string[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Select the correct roadmap data based on level, fallback to Beginner
  const roadmapData = ROADMAP_DATA[level || 'Beginner'] || ROADMAP_DATA['Beginner'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
            className="text-cyan-300 hover:text-white hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold">
              <span className="text-cyan-400">{level}</span> Learning Path
            </h1>
          </div>
          <div className="w-[88px] hidden sm:block" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-mono tracking-[0.3em] text-cyan-400/70 mb-3">
            PERSONALIZED CURRICULUM
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your {level} Roadmap
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A curated, step-by-step path to build real skills. Each milestone unlocks the next —
            complete the challenge to progress.
          </p>
        </div>

        <RoadmapTree data={roadmapData} completedIds={completedTopics} />
      </main>
    </div>
  );
}
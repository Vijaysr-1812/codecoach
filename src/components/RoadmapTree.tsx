import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Play, Clock, Sparkles, Flag } from 'lucide-react';
import { RoadmapNode } from '@/data/roadmapData';
import { Button } from '@/components/ui/button';

type Status = 'completed' | 'current' | 'locked';

const flatten = (nodes: RoadmapNode[]): RoadmapNode[] => {
  const out: RoadmapNode[] = [];
  const walk = (list: RoadmapNode[]) => {
    for (const n of list) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
};

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-green-500/15 text-green-300 border-green-500/30',
  Medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  Hard: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const StepCard = ({
  node,
  status,
  stepIndex,
  totalSteps,
}: {
  node: RoadmapNode;
  status: Status;
  stepIndex: number;
  totalSteps: number;
}) => {
  const navigate = useNavigate();

  const cardStyles =
    status === 'completed'
      ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-slate-900/60 border-green-500/40'
      : status === 'current'
      ? 'bg-gradient-to-br from-cyan-500/15 via-blue-500/5 to-slate-900/70 border-cyan-400/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/20'
      : 'bg-slate-900/40 border-slate-700/50 opacity-70';

  const titleColor = status === 'locked' ? 'text-gray-500' : 'text-white';
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="relative pl-16 pb-10 group">
      {/* Vertical spine */}
      {!isLast && (
        <div
          className={`absolute left-[1.875rem] top-12 bottom-0 w-[2px] ${
            status === 'completed'
              ? 'bg-gradient-to-b from-green-400/60 to-cyan-500/30'
              : 'bg-gradient-to-b from-cyan-500/30 to-slate-700/40'
          }`}
        />
      )}

      {/* Step marker */}
      <div className="absolute left-0 top-2 flex flex-col items-center">
        <div
          className={`relative w-[3.75rem] h-[3.75rem] rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-105
            ${
              status === 'completed'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-300/60 text-white'
                : status === 'current'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300/60 text-white'
                : 'bg-slate-800 border-slate-700 text-gray-500'
            }`}
        >
          {status === 'completed' ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : status === 'current' ? (
            <Sparkles className="w-6 h-6 animate-pulse" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
          {status === 'current' && (
            <span className="absolute inset-0 rounded-2xl animate-ping bg-cyan-400/30" />
          )}
        </div>
        <div className="mt-2 text-[11px] font-mono tracking-wider text-gray-500">
          STEP {String(stepIndex + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Card */}
      <div
        className={`rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${cardStyles}`}
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {node.problem && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                difficultyStyles[node.problem.difficulty] || ''
              }`}
            >
              {node.problem.difficulty}
            </span>
          )}
          {node.estimatedTime && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {node.estimatedTime}
            </span>
          )}
          {status === 'completed' && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
          {status === 'current' && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Flag className="w-3 h-3" /> In Progress
            </span>
          )}
        </div>

        <h3 className={`text-xl font-bold mb-1.5 ${titleColor}`}>{node.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{node.description}</p>

        {node.topics && (
          <div className="flex flex-wrap gap-2 mb-4">
            {node.topics.map((topic, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-md border ${
                  status === 'locked'
                    ? 'bg-slate-800/40 border-slate-700/50 text-gray-500'
                    : 'bg-slate-800/70 border-slate-700 text-gray-200'
                }`}
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {status === 'current' && node.problem && (
          <Button
            onClick={() => navigate(`/practice?topicId=${node.id}`)}
            className="mt-1 h-9 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 mr-2" />
            Solve Challenge
          </Button>
        )}
      </div>
    </div>
  );
};

export default function RoadmapTree({
  data,
  completedIds,
}: {
  data: RoadmapNode[];
  completedIds: string[];
}) {
  const steps = flatten(data);

  let parentCompleted = true;
  const stepsWithStatus = steps.map((node) => {
    const isCompleted = completedIds.includes(node.id);
    const status: Status = isCompleted
      ? 'completed'
      : parentCompleted
      ? 'current'
      : 'locked';
    parentCompleted = isCompleted;
    return { node, status };
  });

  return (
    <div className="max-w-3xl mx-auto py-4">
      {stepsWithStatus.map(({ node, status }, index) => (
        <StepCard
          key={node.id}
          node={node}
          status={status}
          stepIndex={index}
          totalSteps={stepsWithStatus.length}
        />
      ))}

      {/* Finish flag */}
      <div className="relative pl-16 pt-2">
        <div className="absolute left-0 top-0 w-[3.75rem] h-[3.75rem] rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-purple-300/60 flex items-center justify-center shadow-lg">
          <Flag className="w-7 h-7 text-white" />
        </div>
        <div className="rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-1">You've reached the end 🎉</h3>
          <p className="text-sm text-gray-400">
            Complete every step above to unlock the next skill level.
          </p>
        </div>
      </div>
    </div>
  );
}

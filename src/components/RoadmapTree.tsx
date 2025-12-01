import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Lock, Play } from 'lucide-react';
import { RoadmapNode } from '@/data/roadmapData';
import { Button } from '@/components/ui/button';

// Helper to determine status:
// - Completed: ID exists in the database list
// - Current: Not completed, but parent is finished (or it's a root node)
// - Locked: Not completed, parent not finished
const findStatus = (nodeId: string, completedIds: string[], parentCompleted: boolean): 'completed' | 'current' | 'locked' => {
  if (completedIds.includes(nodeId)) return 'completed';
  if (parentCompleted) return 'current'; 
  return 'locked';
};

const TreeNode = ({ 
  node, 
  depth = 0, 
  isLast = false, 
  completedIds, 
  parentCompleted 
}: { 
  node: RoadmapNode, 
  depth?: number, 
  isLast?: boolean, 
  completedIds: string[],
  parentCompleted: boolean
}) => {
  const navigate = useNavigate();
  const status = findStatus(node.id, completedIds, parentCompleted);
  
  // This node is completed, so its children are allowed to be 'current'
  const isNodeCompleted = status === 'completed';

  return (
    <div className="relative pl-8 sm:pl-12">
      {/* Visual Lines (Vertical) */}
      {depth > 0 && (
        <div className={`absolute left-0 top-0 w-px bg-cyan-500/30 ${isLast ? 'h-8' : 'h-full'}`} style={{ left: '2rem' }} />
      )}
      {/* Visual Lines (Horizontal) */}
      {depth > 0 && (
        <div className="absolute left-8 top-8 w-4 h-px bg-cyan-500/30" />
      )}

      <div className="relative mb-8 group">
        <div className={`rounded-xl p-6 border transition-all duration-300 backdrop-blur-sm shadow-lg
          ${status === 'current' ? 'bg-cyan-900/10 border-cyan-500/50 shadow-cyan-500/10' : 
            status === 'completed' ? 'bg-slate-900/80 border-green-500/30' : 
            'bg-slate-900/40 border-slate-700/50 opacity-70'}`}>
          
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`mt-1 p-2 rounded-lg border ${
              status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
              status === 'current' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse' :
              'bg-slate-800 border-slate-700 text-gray-500'}`}>
              {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
               status === 'current' ? <Circle className="w-5 h-5" /> :
               <Lock className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                {node.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3">{node.description}</p>
              
              {/* Show topics as pills */}
              {node.topics && (
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {node.topics.map((topic, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-gray-300">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Action: Solve Challenge */}
              {status === 'current' && node.problem && (
                <Button 
                  onClick={() => navigate(`/practice?topicId=${node.id}`)}
                  className="mt-2 h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Play className="w-3 h-3 mr-2" />
                  Solve Challenge
                </Button>
              )}
              
              {status === 'completed' && (
                <span className="text-xs text-green-400 flex items-center mt-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recursive Children */}
      {node.children && (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-cyan-500/30" />
          {node.children.map((child, index) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1}
              isLast={index === (node.children?.length || 0) - 1} 
              completedIds={completedIds}
              parentCompleted={isNodeCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function RoadmapTree({ data, completedIds }: { data: RoadmapNode[], completedIds: string[] }) {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      {data.map((rootNode) => (
        <div key={rootNode.id} className="mb-12 relative">
           {/* Root nodes start as 'current' (unlocked) if no parent, so parentCompleted is true */}
           <TreeNode node={rootNode} completedIds={completedIds} parentCompleted={true} />
        </div>
      ))}
    </div>
  );
}
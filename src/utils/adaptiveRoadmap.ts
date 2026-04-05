import { RoadmapNode } from "@/data/roadmapData";

export function generateAdaptiveRoadmap(nodes: RoadmapNode[], score: number): RoadmapNode[] {

  const difficulty: 'Easy' | 'Medium' | 'Hard' =
    score < 50 ? "Easy" :
    score <= 75 ? "Medium" :
    "Hard";

  function traverse(nodeList: RoadmapNode[]): RoadmapNode[] {
    return nodeList.map(node => {

      const updatedNode = { ...node };

      if (updatedNode.problem) {
        updatedNode.problem = {
          ...updatedNode.problem,
          difficulty
        };
      }

      if (updatedNode.children) {
        updatedNode.children = traverse(updatedNode.children);
      }

      return updatedNode;
    });
  }

  return traverse(nodes);
}

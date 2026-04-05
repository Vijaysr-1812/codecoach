export interface StoredExamResults {
  studentName: string;
  studentRoll: string;
  score: number;
  speed: number;
  efficiency: number;
  completedAt: string;
  level: string;
  weakTopics: string[];
  strongTopics: string[];
}

const EXAM_RESULTS_KEY = "examResults";
const LEGACY_ROADMAP_KEY = "roadmapData";

function isStoredExamResults(value: unknown): value is StoredExamResults {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.studentName === "string" &&
    typeof candidate.studentRoll === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.speed === "number" &&
    typeof candidate.efficiency === "number" &&
    typeof candidate.completedAt === "string" &&
    typeof candidate.level === "string" &&
    Array.isArray(candidate.weakTopics) &&
    Array.isArray(candidate.strongTopics)
  );
}

export function loadExamResults(): StoredExamResults | null {
  try {
    const raw = localStorage.getItem(EXAM_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isStoredExamResults(parsed)) {
        return parsed;
      }
    }

    const legacyRoadmapRaw = localStorage.getItem(LEGACY_ROADMAP_KEY);
    if (!legacyRoadmapRaw) return null;

    const legacyRoadmap = JSON.parse(legacyRoadmapRaw) as {
      weakTopics?: unknown;
      strongTopics?: unknown;
      score?: unknown;
    };

    if (
      Array.isArray(legacyRoadmap.weakTopics) &&
      Array.isArray(legacyRoadmap.strongTopics) &&
      typeof legacyRoadmap.score === "number"
    ) {
      return {
        studentName: "User",
        studentRoll: "N/A",
        score: legacyRoadmap.score,
        speed: 0,
        efficiency: legacyRoadmap.score,
        completedAt: "",
        level: "Beginner",
        weakTopics: legacyRoadmap.weakTopics.filter((item): item is string => typeof item === "string"),
        strongTopics: legacyRoadmap.strongTopics.filter((item): item is string => typeof item === "string"),
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to read exam results from localStorage:", error);
    return null;
  }
}

export function saveExamResults(results: StoredExamResults) {
  localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(results));
  localStorage.removeItem(LEGACY_ROADMAP_KEY);
}

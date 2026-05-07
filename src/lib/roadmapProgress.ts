import { supabase } from '@/lib/supabase';

const storageKey = (userId: string) => `codecoach:roadmap-progress:${userId}`;

function readLocalProgress(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocalProgress(userId: string, completedTopicIds: string[]) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(completedTopicIds));
  } catch {
    // Local persistence is only a fallback when the database table is unavailable.
  }
}

export async function fetchRoadmapProgress(userId: string): Promise<string[]> {
  const localProgress = readLocalProgress(userId);

  const { data, error } = await supabase
    .from('roadmap_progress')
    .select('completed_topic_ids')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Roadmap progress fetch failed:', error);
    return localProgress;
  }

  const remoteProgress = Array.isArray(data?.completed_topic_ids)
    ? data.completed_topic_ids.filter((id): id is string => typeof id === 'string')
    : [];

  const merged = Array.from(new Set([...localProgress, ...remoteProgress]));
  writeLocalProgress(userId, merged);
  return merged;
}

export async function updateRoadmapProgress(userId: string, topicId: string): Promise<string[]> {
  const currentProgress = await fetchRoadmapProgress(userId);
  const completedTopicIds = Array.from(new Set([...currentProgress, topicId]));

  writeLocalProgress(userId, completedTopicIds);

  const { error } = await supabase
    .from('roadmap_progress')
    .upsert(
      {
        user_id: userId,
        completed_topic_ids: completedTopicIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('Roadmap progress update failed:', error);
  }

  return completedTopicIds;
}

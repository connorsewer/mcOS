import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if env vars are available, otherwise null
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Types based on ACTUAL Supabase schema
export interface Task {
  id: string;
  title: string;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: number; // 0=low, 1=medium, 2=high, 3=urgent
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  type: string;
  payload: {
    agent?: string;
    action?: string;
    target?: string;
    squad?: string;
    [key: string]: any;
  };
  created_at: string;
}

// Priority helpers
export const priorityLabels = ['low', 'medium', 'high', 'urgent'];
export const priorityColors = ['text-muted-foreground', 'text-yellow-500', 'text-orange-500', 'text-red-500'];

// Fetch all tasks
export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch tasks needing attention (review or blocked)
export async function fetchAttentionItems(): Promise<Task[]> {
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('status', ['review', 'blocked'])
    .order('priority', { ascending: false })
    .limit(6);
  
  if (error) throw error;
  return data || [];
}

// Fetch tasks by status
export async function fetchTasksByStatus(status: Task['status']): Promise<Task[]> {
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', status)
    .order('priority', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Calculate squad stats (partitioned by keyword in title/notes)
export async function fetchSquadStats() {
  if (!supabase) {
    return {
      oceans: { name: "Ocean's 11", subtitle: "TSI Marketing", active: 0, idle: 0, blocked: 0, total: 11, tasksInFlight: 0, completedToday: 0 },
      dune: { name: "Dune", subtitle: "Personal & Job Search", active: 0, idle: 0, blocked: 0, total: 8, tasksInFlight: 0, interviewsScheduled: 0 }
    };
  }
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) throw error;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Partition tasks based on keywords (heuristic for demo)
  const oceansKeywords = ['campaign', 'launch', 'seo', 'brand', 'lead', 'fintech', 'social', 'graphics', 'dashboard'];
  const duneKeywords = ['interview', 'portfolio', 'job', 'acquisition', 'xai', 'spring health', 'dr. solomon', 'outreach'];
  
  const oceansTasks = (tasks || []).filter(t => 
    oceansKeywords.some(k => t.title.toLowerCase().includes(k) || (t.notes || '').toLowerCase().includes(k))
  );
  const duneTasks = (tasks || []).filter(t => 
    duneKeywords.some(k => t.title.toLowerCase().includes(k) || (t.notes || '').toLowerCase().includes(k))
  );
  
  // Fallback: assign remaining tasks evenly
  const assignedIds = new Set([...oceansTasks.map(t => t.id), ...duneTasks.map(t => t.id)]);
  const remaining = (tasks || []).filter(t => !assignedIds.has(t.id));
  remaining.forEach((t, i) => {
    if (i % 2 === 0) oceansTasks.push(t);
    else duneTasks.push(t);
  });
  
  return {
    oceans: {
      name: "Ocean's 11",
      subtitle: "TSI Marketing",
      active: oceansTasks.filter(t => t.status === 'in_progress').length,
      idle: oceansTasks.filter(t => t.status === 'inbox').length,
      blocked: oceansTasks.filter(t => t.status === 'blocked').length,
      total: 11, // Fixed agent count
      tasksInFlight: oceansTasks.filter(t => t.status === 'in_progress').length,
      completedToday: oceansTasks.filter(t => t.status === 'done' && t.updated_at?.startsWith(today)).length,
    },
    dune: {
      name: "Dune",
      subtitle: "Personal & Job Search",
      active: duneTasks.filter(t => t.status === 'in_progress').length,
      idle: duneTasks.filter(t => t.status === 'inbox').length,
      blocked: duneTasks.filter(t => t.status === 'blocked').length,
      total: 8, // Fixed agent count
      tasksInFlight: duneTasks.filter(t => t.status === 'in_progress').length,
      interviewsScheduled: duneTasks.filter(t => t.title?.toLowerCase().includes('interview')).length,
    }
  };
}

// Fetch recent activity from events
export async function fetchRecentActivity(limit = 10): Promise<Event[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock activity');
    return [];
  }
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'agent_action')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// Create new task
export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update task status
export async function updateTaskStatus(id: string, status: Task['status']): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export const dynamic = 'force-dynamic';

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Radio,
  Clock,
  Activity,
  Users,
  Briefcase
} from "lucide-react";
import { useActivitiesFeed, type Squad } from "@/hooks/useActivities";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/hooks/use-toast";

function relTime(ts?: number): string {
  if (!ts) return '—';
  const ms = Date.now() - ts;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

function inferModel(action: string): string {
  const s = action.toLowerCase();
  if (s.includes('sonnet')) return 'sonnet';
  if (s.includes('gpt')) return 'gpt';
  if (s.includes('opus')) return 'opus';
  if (s.includes('gemini')) return 'gemini';
  return 'system';
}

function modelColor(model: string): string {
  switch (model) {
    case 'gpt': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'sonnet': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'opus': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'gemini': return 'bg-green-500/20 text-green-400 border-green-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export default function LivePage() {
  const [selectedSquad, setSelectedSquad] = useState<Squad | undefined>(undefined);
  
  // Real-time Convex subscriptions
  const { results: activities, status, loadMore } = useActivitiesFeed({ 
    squad: selectedSquad,
    initialNumItems: 20 
  });
  const tasks = useTasks({ squad: selectedSquad });
  const agents = useAgents({ squad: selectedSquad });
  
  const isLoading = status === 'LoadingFirstPage';
  const canLoadMore = status === 'CanLoadMore';
  
  // Stats
  const activeTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const blockedTasks = tasks?.filter(t => t.status === 'blocked').length || 0;
  const activeAgents = agents?.filter(a => a.status === 'active').length || 0;
  
  // Real-time demo: create task mutation
  const { toast } = useToast();
  const createTask = useCreateTask();
  const [isCreating, setIsCreating] = useState(false);
  
  const handleQuickAddTask = async () => {
    setIsCreating(true);
    try {
      const squad = selectedSquad || 'oceans-11';
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      await createTask({
        title: `New Task ${timeStr}`,
        description: 'Created from Live Monitor',
        squad,
        status: 'inbox',
        priority: 'medium',
        assigneeIds: [],
        createdBy: 'live-monitor',
      });
      toast({ 
        title: "Task created", 
        description: `${squad === 'oceans-11' ? "Ocean's 11" : 'Dune'} task added`,
      });
    } catch (err) {
      toast({ 
        title: "Failed to create task", 
        description: String(err),
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  if (isLoading || tasks === undefined || agents === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton width="200px" height="2rem" />
          <Skeleton width="300px" height="2.5rem" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Live Monitor</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time mcOS activity stream
            </p>
          </div>
        </div>
        
        {/* Squad Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedSquad === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSquad(undefined)}
          >
            All
          </Button>
          <Button
            variant={selectedSquad === 'oceans-11' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSquad('oceans-11')}
            className="gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Ocean&apos;s 11
          </Button>
          <Button
            variant={selectedSquad === 'dune' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSquad('dune')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Dune
          </Button>
          
          {/* Quick Task Creation */}
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickAddTask}
            disabled={isCreating}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            {isCreating ? 'Creating...' : 'Quick Add Task'}
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{blockedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{activeAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">Online now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activities?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24h</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Live Activity Feed */}
      <Card className="border-red-500/20">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              <CardTitle>Live Activity Feed</CardTitle>
              <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                LIVE
              </Badge>
            </div>
            {canLoadMore && (
              <Button variant="outline" size="sm" onClick={() => loadMore(20)}>
                Load More
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {activities?.map((activity: any) => {
              const model = inferModel(activity.action);
              const timestamp = activity.createdAt || activity._creationTime;
              
              return (
                <div key={activity._id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                  {/* Timestamp */}
                  <div className="w-16 text-xs text-muted-foreground font-mono">
                    {relTime(timestamp)}
                  </div>
                  
                  {/* Model Badge */}
                  <Badge variant="outline" className={`text-xs ${modelColor(model)}`}>
                    {model}
                  </Badge>
                  
                  {/* Squad */}
                  <Badge variant="outline" className="text-xs">
                    {activity.squad || '—'}
                  </Badge>
                  
                  {/* Action */}
                  <div className="flex-1 text-sm">
                    {activity.action}
                  </div>
                  
                  {/* Agent */}
                  {activity.agentName && (
                    <div className="text-xs text-muted-foreground">
                      {activity.agentName}
                    </div>
                  )}
                </div>
              );
            })}
            
            {!activities?.length && (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

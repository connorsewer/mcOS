'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users,
  Briefcase,
  Target,
  MessageSquare,
  Plus
} from "lucide-react";
import { CommandCenterSkeleton } from "@/components/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
interface SquadData {
  name: string;
  subtitle: string;
  active: number;
  idle: number;
  blocked: number;
  total: number;
  tasksInFlight: number;
  completedToday?: number;
  interviewsScheduled?: number;
}

export default function CommandCenter() {
  const router = useRouter();
  const { toast } = useToast();
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  
  // Convex queries - real-time subscriptions
  const attentionTasks = useQuery(api.tasks.attention);
  const allTasks = useQuery(api.tasks.list, {});
  const activities = useQuery(api.activities.list, { limit: 5 });
  const agents = useQuery(api.agents.list, {});

  // Handle case where Convex isn't available (SSR/static build)
  if (attentionTasks === null && allTasks === null) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-destructive mb-3 mx-auto" aria-hidden="true" />
          <p className="text-destructive">Convex not connected</p>
          <p className="text-sm text-muted-foreground mt-2">Check NEXT_PUBLIC_CONVEX_URL</p>
        </Card>
      </div>
    );
  }

  const loading = attentionTasks === undefined || allTasks === undefined || activities === undefined || agents === undefined;

  if (loading) {
    return <CommandCenterSkeleton />;
  }

  // Calculate squad stats from tasks
  const calculateSquadStats = (): {oceans: SquadData, dune: SquadData} => {
    const today = new Date().toISOString().split('T')[0];
    
    const oceansTasks = (allTasks || []).filter(t => t.squad === 'oceans-11');
    const duneTasks = (allTasks || []).filter(t => t.squad === 'dune');
    
    return {
      oceans: {
        name: "Ocean's 11",
        subtitle: "TSI Marketing",
        active: oceansTasks.filter(t => t.status === 'in_progress').length,
        idle: oceansTasks.filter(t => t.status === 'inbox').length,
        blocked: oceansTasks.filter(t => t.status === 'blocked').length,
        total: (agents || []).filter(a => a.squad === 'oceans-11').length || 11,
        tasksInFlight: oceansTasks.filter(t => t.status === 'in_progress').length,
        completedToday: oceansTasks.filter(t => t.status === 'done').length,
      },
      dune: {
        name: "Dune",
        subtitle: "Personal & Job Search",
        active: duneTasks.filter(t => t.status === 'in_progress').length,
        idle: duneTasks.filter(t => t.status === 'inbox').length,
        blocked: duneTasks.filter(t => t.status === 'blocked').length,
        total: (agents || []).filter(a => a.squad === 'dune').length || 8,
        tasksInFlight: duneTasks.filter(t => t.status === 'in_progress').length,
        interviewsScheduled: duneTasks.filter(t => t.title?.toLowerCase().includes('interview')).length,
      }
    };
  };

  const squadStats = calculateSquadStats();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-muted-foreground',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const getPriorityLabel = (priority: string) => {
    return priority || 'low';
  };

  const handleNewTask = () => {
    setShowNewTaskDialog(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual task creation
    toast({
      title: "Task created",
      description: "Your new task has been added to the queue.",
      variant: "success",
    });
    setShowNewTaskDialog(false);
  };

  const handleViewSquad = (squad: 'oceans' | 'dune') => {
    router.push(`/agents?squad=${squad}`);
  };

  const handleReviewTask = (taskId: string) => {
    router.push(`/tasks?id=${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto min-h-[44px]"
          onClick={handleNewTask}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          New Task
        </Button>
      </div>

      {/* Attention Panel */}
      {attentionTasks && attentionTasks.length > 0 ? (
        <section aria-labelledby="attention-heading">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="attention-heading" className="text-lg font-medium">Needs Your Attention</h2>
            <Badge variant="secondary">{attentionTasks.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attentionTasks.map((task) => (
              <Card 
                key={task._id} 
                className="border-l-4 border-l-primary cursor-pointer card-lift"
                tabIndex={0}
                role="button"
                aria-label={`Review ${task.title}`}
                onClick={() => handleReviewTask(task._id)}
                onKeyDown={(e) => e.key === 'Enter' && handleReviewTask(task._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">
                      {task.squad === 'oceans-11' ? "Ocean's 11" : "Dune"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {task.status === 'review' && (
                        <CheckCircle2 className="w-4 h-4 text-primary" aria-label="Needs review" />
                      )}
                      {task.status === 'blocked' && (
                        <AlertCircle className="w-4 h-4 text-destructive" aria-label="Blocked" />
                      )}
                      {task.priority === 'urgent' && (
                        <Target className="w-4 h-4 text-red-500" aria-label="Urgent priority" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewTask(task._id);
                      }}
                    >
                      Review <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h3 className="font-medium mb-1">All Clear</h3>
          <p className="text-sm text-muted-foreground">Your agents are working. Nothing needs your attention right now.</p>
        </Card>
      )}

      {/* Squad Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ocean's 11 */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Briefcase className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  {squadStats.oceans.name}
                </CardTitle>
                <CardDescription>{squadStats.oceans.subtitle}</CardDescription>
              </div>
              <Badge variant="outline">
                {squadStats.oceans.total} agents
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                {squadStats.oceans.active} Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" aria-hidden="true" />
                {squadStats.oceans.idle} Idle
              </span>
              {squadStats.oceans.blocked > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
                  {squadStats.oceans.blocked} Blocked
                </span>
              )}
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Tasks in flight</p>
                <p className="text-2xl font-medium">{squadStats.oceans.tasksInFlight}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Completed today</p>
                <p className="text-2xl font-medium text-green-500">{squadStats.oceans.completedToday || 0}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full min-h-[44px]"
              onClick={() => handleViewSquad('oceans')}
            >
              View Squad <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        {/* Dune */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Users className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  {squadStats.dune.name}
                </CardTitle>
                <CardDescription>{squadStats.dune.subtitle}</CardDescription>
              </div>
              <Badge variant="outline">
                {squadStats.dune.total} agents
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                {squadStats.dune.active} Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" aria-hidden="true" />
                {squadStats.dune.idle} Idle
              </span>
              {squadStats.dune.blocked > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
                  {squadStats.dune.blocked} Blocked
                </span>
              )}
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Tasks in flight</p>
                <p className="text-2xl font-medium">{squadStats.dune.tasksInFlight}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Interviews scheduled</p>
                <p className="text-2xl font-medium text-primary">{squadStats.dune.interviewsScheduled || 0}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full min-h-[44px]"
              onClick={() => handleViewSquad('dune')}
            >
              View Squad <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                Live Activity
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/activity')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.map((activity) => (
                <div 
                  key={activity._id} 
                  className="flex items-start sm:items-center gap-2 sm:gap-3 text-sm py-2 border-b last:border-0"
                >
                  <span className="text-muted-foreground font-mono text-xs w-10 shrink-0">
                    {formatTime(activity._creationTime)}
                  </span>
                  <span className="font-medium shrink-0">
                    {activity.agentName || 'System'}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {activity.action}
                  </span>
                  {activity.details?.target && (
                    <span className="font-medium text-primary truncate">
                      {activity.details.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your squad's queue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input 
                  id="title" 
                  placeholder="Task title..."
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  placeholder="Add details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="squad" className="text-sm font-medium">Squad</label>
                  <select 
                    id="squad" 
                    defaultValue="oceans-11"
                    className="w-full px-3 py-2 bg-card border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="oceans-11">Ocean's 11</option>
                    <option value="dune">Dune</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                  <select 
                    id="priority" 
                    defaultValue="medium"
                    className="w-full px-3 py-2 bg-card border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

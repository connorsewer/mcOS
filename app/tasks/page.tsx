export const dynamic = 'force-dynamic';

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  Trash2,
  ArrowRight
} from "lucide-react";
import { 
  useTasks, 
  useCreateTask,
  useUpdateTaskStatus,
  useArchiveTask,
  type Task, 
  type TaskStatus,
  type Squad 
} from "@/hooks/useTasks";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const columns = [
  { id: 'inbox' as TaskStatus, title: 'Inbox', icon: Clock, description: 'New tasks' },
  { id: 'assigned' as TaskStatus, title: 'Assigned', icon: CheckCircle2, description: 'Ready to start' },
  { id: 'in_progress' as TaskStatus, title: 'In Progress', icon: AlertCircle, description: 'Active work' },
  { id: 'review' as TaskStatus, title: 'Review', icon: CheckCircle2, description: 'Pending review' },
] as const;

function TaskCard({ 
  task, 
  onStatusChange,
  onDelete 
}: { 
  task: Task; 
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}) {
  const isBlocked = task.status === 'blocked';
  const isUrgent = task.priority === 'urgent';
  const { toast } = useToast();
  
  const nextStatus = (current: TaskStatus): TaskStatus | null => {
    const flow: TaskStatus[] = ['inbox', 'assigned', 'in_progress', 'review', 'done'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };
  
  const handleAdvance = () => {
    const next = nextStatus(task.status);
    if (next && onStatusChange) {
      onStatusChange(task._id, next);
      toast({ title: "Task advanced", description: `Moved to ${next}` });
    }
  };
  
  return (
    <Card 
      className={`cursor-pointer card-lift mb-3 ${isBlocked ? 'border-l-4 border-l-destructive' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}, Status: ${task.status}${isBlocked ? ', Blocked' : ''}${isUrgent ? ', Urgent priority' : ''}`}
    >
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {isUrgent && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-500">
                Urgent
              </Badge>
            )}
            {isBlocked && (
              <Badge variant="outline" className="text-xs text-destructive border-destructive">
                Blocked
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {task.squad === 'oceans-11' ? "O11" : "Dune"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {nextStatus(task.status) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    aria-label="Advance task"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvance();
                    }}
                  >
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advance to {nextStatus(task.status)}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive"
                  aria-label="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(task._id);
                  }}
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Archive task</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumnSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width="100px" height="1.25rem" />
        <Skeleton width="24px" height="1.25rem" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'oceans' | 'dune'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskSquad, setNewTaskSquad] = useState<Squad>('oceans-11');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const { toast } = useToast();

  // Convex queries
  const squad: Squad | undefined = activeFilter === 'all' ? undefined : activeFilter === 'oceans' ? 'oceans-11' : 'dune';
  const tasks = useTasks({ squad });
  
  // Convex mutations
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const archiveTask = useArchiveTask();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        squad: newTaskSquad,
        status: 'inbox',
        priority: newTaskPriority,
        assigneeIds: [],
        createdBy: 'system',
      });
      
      toast({ title: "Task created", description: newTaskTitle });
      setShowNewTaskDialog(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err) {
      toast({ 
        title: "Failed to create task", 
        description: String(err),
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await updateStatus({ id: id as any, status: newStatus });
      toast({ title: "Status updated", description: `Moved to ${newStatus}` });
    } catch (err) {
      toast({ 
        title: "Failed to update status", 
        description: String(err),
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await archiveTask({ id: id as any });
      toast({ title: "Task archived", description: "Task moved to archive" });
    } catch (err) {
      toast({ 
        title: "Failed to archive", 
        description: String(err),
        variant: "destructive"
      });
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    if (!tasks) return [];
    return tasks.filter(task => task.status === status);
  };

  if (tasks === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width="120px" height="2rem" className="mb-2" />
            <Skeleton width="200px" height="1rem" />
          </div>
          <Skeleton width="120px" height="2.5rem" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => (
            <TaskColumnSkeleton key={col.id} />
          ))}
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalTasks} tasks across all squads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="min-h-[44px]"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            Filter
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowNewTaskDialog(true)}
            className="min-h-[44px]"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            New Task
          </Button>
        </div>
      </div>

      {/* Squad Filter */}
      <div 
        id="filter-panel"
        className={`flex items-center gap-2 pb-4 border-b transition-all duration-200 ${showFilters ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pb-0 border-0'}`}
      >
        {(['all', 'oceans', 'dune'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="min-h-[44px]"
            aria-pressed={activeFilter === filter}
          >
            {filter === 'all' ? 'All Squads' : filter === 'oceans' ? "Ocean's 11" : 'Dune'}
          </Button>
        ))}
        {activeFilter !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="min-h-[44px]"
            aria-label="Clear squad filter"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div 
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 md:overflow-visible snap-x snap-mandatory"
        role="region"
        aria-label="Task kanban board"
      >
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const Icon = column.icon;
          
          return (
            <div 
              key={column.id} 
              className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 space-y-3 snap-start"
              role="list"
              aria-label={`${column.title} column`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <h2 className="font-medium text-sm">{column.title}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 min-h-[44px] min-w-[44px]"
                      aria-label={`Add task to ${column.title}`}
                      onClick={() => setShowNewTaskDialog(true)}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add task to {column.title}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Column Content */}
              <div className="min-h-[200px] bg-card/50 rounded-lg p-3 border border-border">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm">No tasks</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to the board. Click create when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="col-span-3"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description..."
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="squad" className="text-sm font-medium">Squad</label>
                  <select 
                    id="squad" 
                    value={newTaskSquad}
                    onChange={(e) => setNewTaskSquad(e.target.value as Squad)}
                    className="w-full px-3 py-2 bg-card border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="oceans-11">Ocean&apos;s 11</option>
                    <option value="dune">Dune</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                  <select 
                    id="priority" 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
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
              <Button type="submit" disabled={!newTaskTitle.trim()}>
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

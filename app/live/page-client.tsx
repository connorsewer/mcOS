'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";
import { Skeleton } from "@/components/skeleton";

export default function LivePage() {
  const [selectedSquad, setSelectedSquad] = useState<"oceans-11" | "dune" | undefined>(undefined);
  
  const activities = useActivities({ limit: 20, squad: selectedSquad });
  const tasks = useTasks({ squad: selectedSquad });
  const agents = useAgents({ squad: selectedSquad });
  
  const isLoading = activities === undefined || tasks === undefined || agents === undefined;
  
  const activeTasks = tasks?.filter((t: any) => t.status === 'in_progress').length || 0;
  const blockedTasks = tasks?.filter((t: any) => t.status === 'blocked').length || 0;
  const activeAgents = agents?.filter((a: any) => a.status === 'active').length || 0;

  if (isLoading) {
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
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{blockedTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{activeAgents}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-red-500/20">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <CardTitle>Live Activity Feed</CardTitle>
              <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">LIVE</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {activities?.map((activity: any) => (
              <div key={activity._id} className="p-4">
                {activity.action}
              </div>
            ))}
            {!activities?.length && (
              <div className="p-8 text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

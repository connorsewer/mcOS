'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Users, Clock, AlertTriangle } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";
import { Skeleton } from "@/components/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

type Squad = "oceans-11" | "dune" | undefined;

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function LivePageContent() {
  const [selectedSquad, setSelectedSquad] = useState<Squad>(undefined);
  
  const activities = useActivities({ limit: 30, squad: selectedSquad });
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
        
        {/* Squad Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedSquad === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSquad(undefined)}
          >
            All Squads
          </Button>
          <Button
            variant={selectedSquad === "oceans-11" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSquad("oceans-11")}
            className={selectedSquad === "oceans-11" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Ocean's 11
          </Button>
          <Button
            variant={selectedSquad === "dune" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSquad("dune")}
            className={selectedSquad === "dune" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Dune
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{blockedTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Agents
            </CardTitle>
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
            <span className="text-xs text-muted-foreground">
              {activities?.length || 0} events
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border max-h-[500px] overflow-auto">
            {activities?.map((activity: any) => (
              <div key={activity._id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">
                        {activity.agentName || 'System'}
                      </span>
                      {activity.squad && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            activity.squad === 'oceans-11' 
                              ? 'border-blue-500/30 text-blue-400' 
                              : 'border-purple-500/30 text-purple-400'
                          }`}
                        >
                          {activity.squad === 'oceans-11' ? "Ocean's 11" : 'Dune'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    {activity.details?.description && (
                      <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                        {activity.details.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.createdAt || activity._creationTime)}
                  </span>
                </div>
              </div>
            ))}
            {!activities?.length && (
              <div className="p-8 text-center text-muted-foreground">
                <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Waiting for events...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LivePage() {
  return (
    <ErrorBoundary>
      <LivePageContent />
    </ErrorBoundary>
  );
}

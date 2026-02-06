'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { Skeleton, SkeletonActivityRow } from "@/components/skeleton";

function ActivityItem({ activity }: { activity: any }) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };
  
  const agent = activity.agentName || 'System';
  const action = activity.action;
  const target = activity.details?.target;
  
  return (
    <Card className="card-lift">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-medium">{agent.charAt(0)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">{formatTime(activity._creationTime)}</span>
              <span className="font-medium text-sm">{agent}</span>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">{action}</span>
              {target && (
                <>
                  <span className="text-muted-foreground"> </span>
                  <span className="font-medium text-primary">{target}</span>
                </>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <SkeletonActivityRow />
      </CardContent>
    </Card>
  );
}

export default function ActivityPage() {
  const activities = useActivities({ limit: 50 });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities?.filter(activity => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const agent = (activity.agentName || '').toLowerCase();
    const action = (activity.action || '').toLowerCase();
    const target = (activity.details?.target || '').toLowerCase();
    return agent.includes(search) || action.includes(search) || target.includes(search);
  });

  if (activities === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width="180px" height="2rem" className="mb-2" />
            <Skeleton width="240px" height="1rem" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton width="80px" height="1.25rem" />
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = filteredActivities?.reduce((groups, activity) => {
    const date = new Date(activity._creationTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, any[]>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Activity</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time updates from all squads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-card border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      {Object.entries(groupedActivities).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <section key={date}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                {date}
              </div>
              <div className="space-y-2">
                {items.map((activity) => (
                  <ActivityItem key={activity._id} activity={activity} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground">Check back later for updates from your agents</p>
        </Card>
      )}
    </div>
  );
}

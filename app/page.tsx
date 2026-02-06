'use client';

import { useState, useEffect } from "react";
import { unstable_noStore } from "next/cache";
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
  Plus,
  Activity,
  Zap,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import Link from "next/link";

// Status color mapping
const statusColors: Record<string, string> = {
  inbox: "bg-slate-500",
  in_progress: "bg-blue-500",
  blocked: "bg-red-500",
  review: "bg-amber-500",
  done: "bg-green-500",
};

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  href,
  color = "blue"
}: { 
  title: string; 
  value: number | string; 
  subtitle: string; 
  icon: React.ElementType;
  href: string;
  color?: "blue" | "amber" | "green" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    red: "from-red-500/20 to-red-600/5 border-red-500/30",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
  };

  return (
    <Link href={href} className="block group">
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <Icon className="w-12 h-12" />
        </div>
        <CardHeader className="pb-2">
          <CardDescription className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton width="100px" height="1rem" />
      </CardHeader>
      <CardContent>
        <Skeleton width="60px" height="2.5rem" className="mb-2" />
        <Skeleton width="120px" height="0.75rem" />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  // Disable static generation for this page
  unstable_noStore();
  
  // Client-only rendering to avoid Convex SSR issues
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  
  const tasks = useQuery(api.tasks.list, {});
  const agents = useQuery(api.agents.list, {});
  const activities = useQuery(api.activities.list, { limit: 10 });

  const activeTasks = tasks?.filter(t => t.status !== 'done' && !t.archivedAt).length ?? 0;
  const blockedTasks = tasks?.filter(t => t.status === 'blocked').length ?? 0;
  const activeAgents = agents?.filter(a => a.status === 'active').length ?? 0;
  const totalActivities = activities?.length ?? 0;

  const isLoading = !isClient || tasks === undefined || agents === undefined || activities === undefined;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              v1.0
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Mission Control
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Command center for Ocean's 11 and Dune squads. Manage tasks, monitor agents, and track operations in real-time.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/tasks">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 gap-2">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </Link>
            <Link href="/live">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                <Activity className="w-4 h-4" />
                Live Monitor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            Dashboard
          </h2>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Tasks"
              value={activeTasks}
              subtitle={`${blockedTasks} blocked`}
              icon={CheckCircle2}
              href="/tasks"
              color="blue"
            />
            <StatCard
              title="Blocked"
              value={blockedTasks}
              subtitle="Need attention"
              icon={AlertCircle}
              href="/tasks"
              color="red"
            />
            <StatCard
              title="Active Agents"
              value={activeAgents}
              subtitle="Online now"
              icon={Users}
              href="/agents"
              color="purple"
            />
            <StatCard
              title="Activities"
              value={totalActivities}
              subtitle="Recent updates"
              icon={Activity}
              href="/activity"
              color="green"
            />
          </div>
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/tasks">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Tasks</div>
                  <div className="text-xs text-muted-foreground">Manage squad tasks</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Agents</div>
                  <div className="text-xs text-muted-foreground">View squad members</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </Button>
            </Link>
            <Link href="/live">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Live Monitor</div>
                  <div className="text-xs text-muted-foreground">Real-time dashboard</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </Button>
            </Link>
            <Link href="/activity">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Activity</div>
                  <div className="text-xs text-muted-foreground">View history</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your squads
              </CardDescription>
            </div>
            <Link href="/activity">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activities === undefined ? (
              <div className="space-y-4">
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity: any) => (
                  <div 
                    key={activity._id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.agentName || 'System'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity._creationTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.action}
                        {activity.details?.target && (
                          <span className="text-foreground"> {activity.details.target}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Squads Overview */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-muted-foreground" />
          Squad Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
                  O11
                </div>
                <div>
                  <CardTitle>Ocean's 11</CardTitle>
                  <CardDescription>Career & Job Acquisition</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span>{tasks?.filter((t: any) => t.squad === 'oceans-11').length || 0} tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{agents?.filter((a: any) => a.squad === 'oceans-11').length || 0} agents</span>
                </div>
              </div>
              <Separator className="my-4" />
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="w-full">
                  View Tasks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/25">
                  DUNE
                </div>
                <div>
                  <CardTitle>Dune</CardTitle>
                  <CardDescription>AI & Automation Systems</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>{tasks?.filter((t: any) => t.squad === 'dune').length || 0} tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{agents?.filter((a: any) => a.squad === 'dune').length || 0} agents</span>
                </div>
              </div>
              <Separator className="my-4" />
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="w-full">
                  View Tasks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

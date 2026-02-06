'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Simple client-side data fetcher
function useClientData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading for now - will be replaced with Convex
    const timer = setTimeout(() => {
      setData({
        tasks: { active: 0, blocked: 0 },
        agents: { active: 0 },
        activities: []
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { data, loading };
}

export default function Home() {
  const { data, loading } = useClientData();

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
        
        {loading ? (
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
              value={data?.tasks?.active ?? 0}
              subtitle={`${data?.tasks?.blocked ?? 0} blocked`}
              icon={CheckCircle2}
              href="/tasks"
              color="blue"
            />
            <StatCard
              title="Blocked"
              value={data?.tasks?.blocked ?? 0}
              subtitle="Need attention"
              icon={AlertCircle}
              href="/tasks"
              color="red"
            />
            <StatCard
              title="Active Agents"
              value={data?.agents?.active ?? 0}
              subtitle="Online now"
              icon={Users}
              href="/agents"
              color="purple"
            />
            <StatCard
              title="Activities"
              value={data?.activities?.length ?? 0}
              subtitle="Recent updates"
              icon={Activity}
              href="/activity"
              color="green"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-muted-foreground" />
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/tasks">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <Briefcase className="w-8 h-8 text-blue-500 mb-3" />
                <CardTitle className="text-lg">Tasks</CardTitle>
                <CardDescription>Manage squad tasks</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/agents">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-purple-500 mb-3" />
                <CardTitle className="text-lg">Agents</CardTitle>
                <CardDescription>View squad members</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/live">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <Activity className="w-8 h-8 text-emerald-500 mb-3" />
                <CardTitle className="text-lg">Live Monitor</CardTitle>
                <CardDescription>Real-time dashboard</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/activity">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-amber-500 mb-3" />
                <CardTitle className="text-lg">Activity</CardTitle>
                <CardDescription>View history</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

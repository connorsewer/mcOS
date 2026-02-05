'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  MessageSquare,
  Search,
  Filter
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { useAgents, type Agent, type Squad } from "@/hooks/useAgents";

interface AgentCardProps {
  agent: Agent;
  taskCount?: number;
  blockedReason?: string;
}

function AgentCard({ agent, taskCount = 0, blockedReason }: AgentCardProps) {
  const isBlocked = agent.status === 'blocked';
  const initial = agent.name.charAt(0);
  
  return (
    <Card 
      className={`cursor-pointer card-lift ${isBlocked ? 'border-l-4 border-l-destructive' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Agent: ${agent.name}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{agent.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
          </div>
        </div>
        
        {blockedReason && (
          <div className="p-2 bg-destructive/10 rounded-md mb-3">
            <p className="text-xs text-destructive">{blockedReason}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              agent.status === 'active' ? 'bg-green-500' : 
              agent.status === 'blocked' ? 'bg-destructive' : 
              'bg-muted-foreground'
            }`} />
            <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {taskCount} task{taskCount !== 1 ? 's' : ''}
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MessageSquare className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton width="40px" height="40px" circle />
          <div className="flex-1">
            <Skeleton width="120px" height="1rem" className="mb-1" />
            <Skeleton width="100px" height="0.75rem" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton width="60px" height="0.75rem" />
          <Skeleton width="80px" height="1.5rem" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'oceans' | 'dune'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle' | 'blocked'>('all');
  
  // Use Convex for real-time agents
  const squad: Squad | undefined = activeTab === 'all' ? undefined : activeTab === 'oceans' ? 'oceans-11' : 'dune';
  const agents = useAgents({ squad });
  
  const filterAgents = (agentsList: Agent[] | undefined) => {
    if (!agentsList) return [];
    return agentsList.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };
  
  const allAgents = agents || [];
  const oceansAgents = filterAgents(allAgents.filter(a => a.squad === 'oceans-11'));
  const duneAgents = filterAgents(allAgents.filter(a => a.squad === 'dune'));
  
  const activeCount = allAgents.filter(a => a.status === 'active').length;
  const blockedCount = allAgents.filter(a => a.status === 'blocked').length;

  if (agents === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <AgentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount} active
            {blockedCount > 0 && (
              <span className="text-destructive"> · {blockedCount} blocked</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['all', 'active', 'idle', 'blocked'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Squad Tabs */}
      <div className="flex items-center gap-2 border-b pb-4">
        {(['all', 'oceans', 'dune'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="gap-2"
          >
            {tab === 'all' ? (
              <Users className="w-4 h-4" />
            ) : tab === 'oceans' ? (
              <Briefcase className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {tab === 'all' ? 'All' : tab === 'oceans' ? "Ocean's 11" : 'Dune'}
          </Button>
        ))}
      </div>

      {/* Agent Grid */}
      {(activeTab === 'all' || activeTab === 'oceans') && oceansAgents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-medium">Ocean&apos;s 11</h2>
            <span className="text-sm text-muted-foreground">
              {oceansAgents.filter(a => a.status === 'active').length} active
              {oceansAgents.filter(a => a.status === 'blocked').length > 0 && (
                <span className="text-destructive"> · {oceansAgents.filter(a => a.status === 'blocked').length} blocked</span>
              )}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {oceansAgents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'dune') && duneAgents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-medium">Dune</h2>
            <span className="text-sm text-muted-foreground">
              {duneAgents.filter(a => a.status === 'active').length} active
              {duneAgents.filter(a => a.status === 'blocked').length > 0 && (
                <span className="text-destructive"> · {duneAgents.filter(a => a.status === 'blocked').length} blocked</span>
              )}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {duneAgents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {oceansAgents.length === 0 && duneAgents.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No agents found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </Card>
      )}
    </div>
  );
}

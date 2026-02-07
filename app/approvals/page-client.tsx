'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { useApprovals, useApprovalStats, useDecideApproval, type Approval } from "@/hooks/useApprovals";
import { useToast } from "@/hooks/use-toast";

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

function ApprovalCard({ 
  approval, 
  onDecide,
  isDeciding 
}: { 
  approval: Approval;
  onDecide: (id: string, decision: 'approved' | 'rejected') => void;
  isDeciding: boolean;
}) {
  const statusColors = {
    pending: 'border-l-amber-500',
    approved: 'border-l-green-500',
    rejected: 'border-l-red-500',
    executed: 'border-l-blue-500',
  };

  const actionTypeColors: Record<string, string> = {
    send_message: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    send_email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    create_task: 'bg-green-500/20 text-green-400 border-green-500/30',
    external_action: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const colorClass = actionTypeColors[approval.actionType] || actionTypeColors.default;

  return (
    <Card className={`border-l-4 ${statusColors[approval.status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={`text-xs ${colorClass}`}>
                {approval.actionType.replace(/_/g, ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(approval.createdAt)}
              </span>
              {approval.status !== 'pending' && (
                <Badge 
                  variant={approval.status === 'approved' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {approval.status}
                </Badge>
              )}
            </div>
            
            <h3 className="font-medium mb-1 truncate">
              {typeof approval.payload?.title === 'string' 
                ? approval.payload.title 
                : approval.actionType.replace(/_/g, ' ')}
            </h3>
            
            {approval.payload?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {approval.payload.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>By {approval.requestedByName || 'System'}</span>
              {approval.taskTitle && (
                <span className="truncate">• Task: {approval.taskTitle}</span>
              )}
            </div>

            {approval.decisionNote && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Note: {approval.decisionNote}
              </p>
            )}
          </div>
          
          {approval.status === 'pending' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1"
                onClick={() => onDecide(approval._id, 'rejected')}
                disabled={isDeciding}
              >
                {isDeciding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </Button>
              <Button 
                size="sm" 
                className="gap-1"
                onClick={() => onDecide(approval._id, 'approved')}
                disabled={isDeciding}
              >
                {isDeciding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton width="120px" height="1.25rem" className="mb-2" />
            <Skeleton width="80%" height="1rem" className="mb-1" />
            <Skeleton width="60%" height="0.875rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton width="80px" height="32px" />
            <Skeleton width="80px" height="32px" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [decidingId, setDecidingId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const decideApproval = useDecideApproval();
  
  // Fetch approvals based on filter
  const statusFilter = filter === 'all' ? undefined : filter;
  const approvals = useApprovals({ status: statusFilter as any, limit: 50 });
  const stats = useApprovalStats();
  
  const isLoading = approvals === undefined || stats === undefined;

  const handleDecide = async (id: string, decision: 'approved' | 'rejected') => {
    setDecidingId(id);
    try {
      await decideApproval({
        id,
        decision,
        decidedBy: 'Connor', // TODO: Get from auth
      });
      toast({
        title: decision === 'approved' ? 'Approved!' : 'Rejected',
        description: `Action has been ${decision}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process decision. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-medium tracking-tight">Approvals</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve agent actions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && stats?.pending ? (
                <Badge variant="secondary" className="ml-2">{stats.pending}</Badge>
              ) : null}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton width="60px" height="2rem" />
            ) : (
              <div className="text-3xl font-bold text-amber-500">{stats?.pending || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton width="60px" height="2rem" />
            ) : (
              <div className="text-3xl font-bold text-green-500">{stats?.approved || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton width="60px" height="2rem" />
            ) : (
              <div className="text-3xl font-bold text-red-500">{stats?.rejected || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton width="60px" height="2rem" />
            ) : (
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <ApprovalCardSkeleton />
            <ApprovalCardSkeleton />
            <ApprovalCardSkeleton />
          </>
        ) : approvals && approvals.length > 0 ? (
          approvals.map((approval: Approval) => (
            <ApprovalCard 
              key={approval._id} 
              approval={approval}
              onDecide={handleDecide}
              isDeciding={decidingId === approval._id}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              {filter === 'pending' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-medium mb-1">
              {filter === 'pending' ? 'All caught up!' : `No ${filter} approvals`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'pending' 
                ? 'No pending approvals to review.'
                : `There are no ${filter} approvals to show.`}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

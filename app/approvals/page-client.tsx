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
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import Link from "next/link";

interface ApprovalItem {
  id: string;
  title: string;
  type: 'action' | 'message' | 'expense';
  requestedBy: string;
  requestedAt: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Placeholder data until we wire up Convex
const placeholderApprovals: ApprovalItem[] = [
  {
    id: '1',
    title: 'Send LinkedIn connection request',
    type: 'action',
    requestedBy: 'Agent-7',
    requestedAt: '2 hours ago',
    description: 'Request to connect with Sarah Chen (VP Sales at Spring Health)',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Publish blog post draft',
    type: 'message',
    requestedBy: 'Content-Agent',
    requestedAt: '5 hours ago',
    description: 'TSI lead-gen article: "5 Signs Your GTM Stack Needs an Audit"',
    status: 'pending',
  },
];

function ApprovalCard({ item }: { item: ApprovalItem }) {
  const typeColors = {
    action: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    message: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    expense: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-xs ${typeColors[item.type]}`}>
                {item.type}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.requestedAt}</span>
            </div>
            <h3 className="font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Requested by {item.requestedBy}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1">
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button size="sm" className="gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // TODO: Wire up to Convex approvals table
  const approvals = placeholderApprovals;
  const pendingCount = approvals.filter(a => a.status === 'pending').length;

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
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      {/* Approval List */}
      <div className="space-y-3">
        {approvals.length > 0 ? (
          approvals.map((item) => (
            <ApprovalCard key={item.id} item={item} />
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No pending approvals</h3>
            <p className="text-sm text-muted-foreground">
              All caught up! Check back later for new requests.
            </p>
          </Card>
        )}
      </div>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Approvals will be wired to the Convex database for real-time agent action requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

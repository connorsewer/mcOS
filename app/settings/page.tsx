'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Bell,
  Mail,
  Shield,
  Users,
  Database,
  Key,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function SettingsSection({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-lift">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function SettingsRow({ 
  title, 
  description, 
  children,
  action
}: { 
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action}
      </div>
    </div>
  );
}

function IntegrationItem({ 
  icon: Icon, 
  name, 
  status, 
  detail 
}: { 
  icon: React.ElementType;
  name: string;
  status: 'connected' | 'pending' | 'error';
  detail: string;
}) {
  const statusConfig = {
    connected: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    pending: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-md ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <div className="flex items-center gap-1">
            <StatusIcon className={`w-3 h-3 ${config.color}`} />
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm">Configure</Button>
    </div>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailSummary: true,
    urgentAlerts: true,
    weeklyReport: true,
  });
  
  const [security, setSecurity] = useState({
    requireApproval: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure MCOS and agent preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Notifications */}
        <SettingsSection 
          icon={Bell}
          title="Notifications"
          description="Control how and when you receive updates"
        >
          <div className="space-y-1">
            <SettingsRow 
              title="Email Summary"
              description="Daily summary of agent activity"
            >
              <Switch 
                checked={notifications.emailSummary}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, emailSummary: checked }))
                }
              />
            </SettingsRow>
            <Separator />
            <SettingsRow 
              title="Urgent Alerts"
              description="Immediate notification for blocked tasks"
            >
              <Switch 
                checked={notifications.urgentAlerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, urgentAlerts: checked }))
                }
              />
            </SettingsRow>
            <Separator />
            <SettingsRow 
              title="Weekly Report"
              description="Monday morning comprehensive summary"
            >
              <Switch 
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                }
              />
            </SettingsRow>
          </div>
        </SettingsSection>

        {/* Integrations */}
        <SettingsSection 
          icon={Database}
          title="Integrations"
          description="Connected services and data sources"
        >
          <div className="space-y-2">
            <IntegrationItem 
              icon={Mail}
              name="Gmail"
              status="connected"
              detail="Connected"
            />
            <IntegrationItem 
              icon={Database}
              name="Supabase"
              status="connected"
              detail="Live data sync"
            />
            <IntegrationItem 
              icon={Database}
              name="Convex"
              status="pending"
              detail="Migration in progress"
            />
          </div>
        </SettingsSection>

        {/* Agent Configuration */}
        <SettingsSection 
          icon={Users}
          title="Agent Configuration"
          description="Customize agent behaviors and defaults"
        >
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between">
              Ocean&apos;s 11 Squad Settings
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Dune Squad Settings
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Separator className="my-2" />
            <Button variant="outline" className="w-full justify-between">
              Default Model Routing
              <Badge variant="secondary">GPT-5.2 / Claude</Badge>
            </Button>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection 
          icon={Shield}
          title="Security"
          description="API keys and access control"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">API Keys</p>
                  <p className="text-xs text-muted-foreground">Manage external service keys</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
            <SettingsRow 
              title="Require approval for external actions"
              description="Emails, messages, calendar invites"
            >
              <Switch 
                checked={security.requireApproval}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ ...prev, requireApproval: checked }))
                }
              />
            </SettingsRow>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

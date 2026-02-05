'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Activity, 
  Settings,
  FileText,
  ShieldCheck,
  Radio
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: '/', label: 'Command', icon: LayoutDashboard, description: 'Dashboard overview' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, description: 'Kanban board' },
  { href: '/deliverables', label: 'Deliverables', icon: FileText, description: 'Documents & files' },
  { href: '/agents', label: 'Agents', icon: Users, description: 'Squad members' },
  { href: '/activity', label: 'Activity', icon: Activity, description: 'Recent updates' },
  { href: '/live', label: 'Live', icon: Radio, description: 'Real-time monitor' },
  { href: '/approvals', label: 'Approvals', icon: ShieldCheck, description: 'Review queue' },
];

// Desktop: Collapsible sidebar
function DesktopNav({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50",
        "hidden md:flex flex-col items-center py-4 gap-1",
        "transition-all duration-200 ease-out",
        expanded ? "w-[200px]" : "w-16"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            href="/"
            className={cn(
              "w-11 h-11 rounded-lg bg-primary flex items-center justify-center mb-4",
              "text-primary-foreground font-bold text-lg",
              "hover:bg-primary/90 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="MCOS Home"
          >
            M
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>MCOS Home</p>
        </TooltipContent>
      </Tooltip>

      {/* Nav Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "w-11 h-11 rounded-lg flex items-center justify-center",
                  "transition-all duration-150",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-primary/10 text-primary",
                  expanded && "w-[calc(100%-1rem)] justify-start px-3 gap-3"
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap overflow-hidden",
                  "transition-opacity duration-150",
                  expanded ? "opacity-100" : "opacity-0 w-0"
                )}>
                  {item.label}
                </span>
              </Link>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">
                <p>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}

      <div className="flex-1" />

      {/* Settings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/settings"
            className={cn(
              "w-11 h-11 rounded-lg flex items-center justify-center",
              "transition-all duration-150",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              pathname === '/settings' && "bg-primary/10 text-primary",
              expanded && "w-[calc(100%-1rem)] justify-start px-3 gap-3"
            )}
            aria-label="Settings"
            aria-current={pathname === '/settings' ? 'page' : undefined}
          >
            <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className={cn(
              "text-sm font-medium whitespace-nowrap overflow-hidden",
              "transition-opacity duration-150",
              expanded ? "opacity-100" : "opacity-0 w-0"
            )}>
              Settings
            </span>
          </Link>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        )}
      </Tooltip>
    </nav>
  );
}

// Mobile: Bottom tab bar
function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 md:hidden pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-full px-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg transition-all duration-150",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <DesktopNav pathname={pathname} />
      <MobileNav pathname={pathname} />
    </>
  );
}

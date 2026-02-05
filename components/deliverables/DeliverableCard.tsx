'use client';

import { FileText, Image, FileSpreadsheet, Presentation, Mail, BookOpen, File, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';
type DeliverableStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

interface DeliverableCardProps {
  _id: string;
  title: string;
  type: DeliverableType;
  status: DeliverableStatus;
  squad: 'oceans-11' | 'dune';
  createdByName: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  onClick?: () => void;
  view?: 'grid' | 'list';
}

const typeIcons: Record<DeliverableType, React.ReactNode> = {
  research: <BookOpen className="w-4 h-4" />,
  blog_draft: <FileText className="w-4 h-4" />,
  email_copy: <Mail className="w-4 h-4" />,
  white_paper: <BookOpen className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  spreadsheet: <FileSpreadsheet className="w-4 h-4" />,
  brief: <FileText className="w-4 h-4" />,
  other: <File className="w-4 h-4" />,
};

const typeLabels: Record<DeliverableType, string> = {
  research: 'Research',
  blog_draft: 'Blog Draft',
  email_copy: 'Email Copy',
  white_paper: 'White Paper',
  presentation: 'Presentation',
  image: 'Image',
  spreadsheet: 'Spreadsheet',
  brief: 'Brief',
  other: 'Other',
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPreviewContent(content?: string): string {
  if (!content) return 'No content preview available...';
  // Remove markdown syntax for preview
  const plainText = content
    .replace(/#+ /g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/> /g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '');
}

export function DeliverableCard({
  _id,
  title,
  type,
  status,
  squad,
  createdByName,
  version,
  createdAt,
  updatedAt,
  content,
  fileUrl,
  fileType,
  onClick,
  view = 'grid',
}: DeliverableCardProps) {
  const isGrid = view === 'grid';
  const previewContent = getPreviewContent(content);
  const hasFile = !!fileUrl;

  if (isGrid) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'group cursor-pointer rounded-xl border transition-all duration-200',
          'bg-zinc-900 border-zinc-800',
          'hover:border-zinc-700 hover:bg-zinc-800/50',
          'flex flex-col h-full'
        )}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                {typeIcons[type]}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide">
                {typeLabels[type]}
              </span>
            </div>
            <StatusBadge status={status} size="sm" />
          </div>
          
          <h3 className="font-semibold text-zinc-100 line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-zinc-500 line-clamp-2">
            {previewContent}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                squad === 'oceans-11' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
              )}>
                {squad === 'oceans-11' ? 'O11' : 'Dune'}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {createdByName}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(updatedAt)}
            </span>
          </div>
          
          {hasFile && (
            <div className="mt-2 text-xs text-amber-400/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Attachment: {fileType || 'File'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border transition-all duration-200',
        'bg-zinc-900 border-zinc-800',
        'hover:border-zinc-700 hover:bg-zinc-800/50',
        'flex items-center gap-4 p-4'
      )}
    >
      {/* Type Icon */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 text-zinc-400">
        {typeIcons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
            {title}
          </h3>
          {version > 1 && (
            <span className="text-xs text-zinc-600">v{version}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>{typeLabels[type]}</span>
          <span>•</span>
          <span>{createdByName}</span>
          {hasFile && (
            <>
              <span>•</span>
              <span className="text-amber-400/80 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Attachment
              </span>
            </>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          squad === 'oceans-11' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
        )}>
          {squad === 'oceans-11' ? "Ocean's 11" : 'Dune'}
        </span>
        <StatusBadge status={status} size="sm" />
        <span className="text-sm text-zinc-500 hidden sm:block">
          {formatDate(updatedAt)}
        </span>
      </div>
    </div>
  );
}

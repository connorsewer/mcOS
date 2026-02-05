'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  FileText, 
  Download,
  CheckCircle,
  Send,
  Archive,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { DeliverableEditor } from './DeliverableEditor';

type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';
type DeliverableStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

interface DeliverableVersion {
  _id: string;
  version: number;
  editedBy: string;
  changeSummary?: string;
  createdAt: number;
}

interface DeliverableDetailProps {
  deliverable: {
    _id: string;
    title: string;
    type: DeliverableType;
    status: DeliverableStatus;
    squad: 'oceans-11' | 'dune';
    content?: string;
    contentFormat?: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    createdByName: string;
    createdByRole: string;
    version: number;
    createdAt: number;
    updatedAt: number;
    versions?: DeliverableVersion[];
  };
  onBack: () => void;
  onStatusChange: (status: DeliverableStatus, summary?: string) => void;
  onUpdate: (data: {
    title: string;
    content: string;
    contentFormat: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    changeSummary: string;
  }) => void;
  isUpdating?: boolean;
}

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

const statusWorkflow: { from: DeliverableStatus; to: DeliverableStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { from: 'draft', to: 'review', label: 'Submit for Review', icon: <Send className="w-4 h-4" />, color: 'text-amber-400 hover:bg-amber-500/10' },
  { from: 'review', to: 'approved', label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400 hover:bg-emerald-500/10' },
  { from: 'review', to: 'draft', label: 'Send Back to Draft', icon: <RotateCcw className="w-4 h-4" />, color: 'text-zinc-400 hover:bg-zinc-800' },
  { from: 'approved', to: 'published', label: 'Publish', icon: <ExternalLink className="w-4 h-4" />, color: 'text-blue-400 hover:bg-blue-500/10' },
  { from: 'approved', to: 'review', label: 'Revoke Approval', icon: <RotateCcw className="w-4 h-4" />, color: 'text-zinc-400 hover:bg-zinc-800' },
  { from: 'published', to: 'archived', label: 'Archive', icon: <Archive className="w-4 h-4" />, color: 'text-zinc-400 hover:bg-zinc-800' },
  { from: 'archived', to: 'draft', label: 'Restore to Draft', icon: <RotateCcw className="w-4 h-4" />, color: 'text-zinc-400 hover:bg-zinc-800' },
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Simple markdown renderer (same as in editor)
function renderMarkdown(content: string): string {
  if (!content) return '<p class="text-zinc-500 italic">No content available</p>';
  
  const html = content
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-zinc-200 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-zinc-100 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-zinc-100 mt-6 mb-4">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-zinc-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-800 rounded text-amber-400 text-sm">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-sm text-zinc-300 my-4 border border-zinc-800"><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 hover:underline" target="_blank" rel="noopener">$1</a>')
    .replace(/^> (.*$)/gim, '<blockquote class="pl-4 border-l-2 border-amber-500/50 text-zinc-400 italic my-3">$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-zinc-300">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-zinc-300 list-decimal">$1</li>')
    .replace(/\n/g, '<br />')
    .replace(/^---$/gim, '<hr class="my-4 border-zinc-800" />');
  
  return html;
}

export function DeliverableDetail({
  deliverable,
  onBack,
  onStatusChange,
  onUpdate,
  isUpdating = false,
}: DeliverableDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get available status transitions
  const availableTransitions = statusWorkflow.filter(t => t.from === deliverable.status);

  // Determine if file is an image
  const isImage = deliverable.fileType?.startsWith('image/');
  const isPDF = deliverable.fileType === 'application/pdf';

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-zinc-100">Edit Deliverable</h2>
        </div>

        <DeliverableEditor
          initialTitle={deliverable.title}
          initialContent={deliverable.content || ''}
          initialFormat={deliverable.contentFormat || 'markdown'}
          onSave={(data) => {
            onUpdate({ ...data, changeSummary: 'Content updated' });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isSaving={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <StatusBadge status={deliverable.status} size="md" />
              <span className={cn(
                'text-sm font-medium',
                deliverable.squad === 'oceans-11' ? 'text-blue-400' : 'text-purple-400'
              )}>
                {deliverable.squad === 'oceans-11' ? "Ocean's 11" : 'Dune'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">{deliverable.title}</h1>
          </div>
        </div>

        {/* Status Workflow Actions */}
        <div className="flex items-center gap-2">
          {availableTransitions.map((transition) => (
            <button
              key={transition.to}
              onClick={() => onStatusChange(transition.to, transition.label)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                transition.color,
                'border border-transparent',
                transition.to === 'approved' && 'bg-emerald-500/10 border-emerald-500/30',
                transition.to === 'published' && 'bg-blue-500/10 border-blue-500/30',
                transition.to === 'review' && 'bg-amber-500/10 border-amber-500/30'
              )}
            >
              {transition.icon}
              {transition.label}
            </button>
          ))}
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'text-zinc-300 hover:text-zinc-100',
              'hover:bg-zinc-800',
              'transition-colors'
            )}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 py-4 border-y border-zinc-800">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Created by <span className="text-zinc-300">{deliverable.createdByName}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span>{typeLabels[deliverable.type]}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Version {deliverable.version}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Updated {formatDate(deliverable.updatedAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {deliverable.content && (
            <div className="prose prose-invert prose-zinc max-w-none">
              <div 
                className="text-zinc-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(deliverable.content) }}
              />
            </div>
          )}

          {/* File Attachment */}
          {deliverable.fileUrl && (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-zinc-200">Attachment</span>
                  {deliverable.fileSize && (
                    <span className="text-sm text-zinc-500">({formatFileSize(deliverable.fileSize)})</span>
                  )}
                </div>
                <a
                  href={deliverable.fileUrl}
                  download
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
              
              {isImage && (
                <div className="p-4">
                  <img 
                    src={deliverable.fileUrl} 
                    alt="Attachment" 
                    className="max-w-full rounded-lg"
                  />
                </div>
              )}
              
              {isPDF && (
                <div className="p-4">
                  <iframe
                    src={deliverable.fileUrl}
                    className="w-full h-[500px] rounded-lg border border-zinc-800"
                    title="PDF Preview"
                  />
                </div>
              )}
              
              {!isImage && !isPDF && (
                <div className="p-8 text-center text-zinc-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                  <p>Preview not available for this file type</p>
                  <p className="text-sm mt-1">Download to view</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Version History */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                <span className="font-medium text-zinc-200">Version History</span>
              </div>
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            
            {showHistory && (
              <div className="p-2 space-y-1 max-h-[300px] overflow-auto">
                {deliverable.versions?.map((version) => (
                  <div
                    key={version._id}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm',
                      version.version === deliverable.version
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'hover:bg-zinc-800/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-zinc-300">v{version.version}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-400">{version.editedBy}</p>
                    {version.changeSummary && (
                      <p className="text-xs text-zinc-500 mt-1">{version.changeSummary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Eye, Edit3, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliverableEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialFormat?: 'markdown' | 'plain' | 'html';
  onSave: (data: {
    title: string;
    content: string;
    contentFormat: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
  }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

// Simple markdown preview renderer
function renderMarkdown(content: string): string {
  if (!content) return '<p class="text-zinc-500 italic">Preview will appear here...</p>';
  
  const html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-zinc-200 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-zinc-100 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-zinc-100 mt-6 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-zinc-300">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-800 rounded text-amber-400 text-sm">$1</code>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-sm text-zinc-300 my-4 border border-zinc-800"><code>$1</code></pre>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="pl-4 border-l-2 border-amber-500/50 text-zinc-400 italic my-3">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-zinc-300">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-zinc-300 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />')
    // Tables (simple)
    .replace(/\|(.+)\|/g, '<tr><td class="px-3 py-2 border border-zinc-700">$1</td></tr>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-4 border-zinc-800" />');
  
  return html;
}

export function DeliverableEditor({
  initialTitle = '',
  initialContent = '',
  initialFormat = 'markdown',
  onSave,
  onCancel,
  isSaving = false,
}: DeliverableEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [contentFormat, setContentFormat] = useState(initialFormat);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [attachments, setAttachments] = useState<Array<{ url: string; type: string; name: string; size: number }>>([]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a local URL (in production, this would upload to R2)
    const url = URL.createObjectURL(file);
    setAttachments([...attachments, {
      url,
      type: file.type,
      name: file.name,
      size: file.size,
    }]);
  }, [attachments]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  }, [attachments]);

  const handleSave = useCallback(() => {
    const mainAttachment = attachments[0];
    onSave({
      title,
      content,
      contentFormat,
      fileUrl: mainAttachment?.url,
      fileType: mainAttachment?.type,
      fileSize: mainAttachment?.size,
    });
  }, [title, content, contentFormat, attachments, onSave]);

  const isValid = title.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter deliverable title..."
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-zinc-900 border border-zinc-800',
            'text-zinc-100 placeholder:text-zinc-600',
            'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50',
            'transition-colors text-lg font-medium'
          )}
        />
      </div>

      {/* Format Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-zinc-400">Format:</label>
        <div className="flex items-center gap-2">
          {(['markdown', 'plain', 'html'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setContentFormat(format)}
              className={cn(
                'px-3 py-1 rounded-full text-sm capitalize transition-colors',
                contentFormat === format
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              )}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('edit')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'edit'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] max-h-[600px] overflow-auto">
          {activeTab === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here... (Markdown supported)"
              className={cn(
                'w-full h-full min-h-[400px] p-4 resize-none',
                'bg-zinc-950 text-zinc-300 placeholder:text-zinc-600',
                'focus:outline-none',
                'font-mono text-sm leading-relaxed'
              )}
            />
          ) : (
            <div
              className="p-6 prose prose-invert prose-zinc max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Attachments</label>
        
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-zinc-900 border border-zinc-800',
                  'group'
                )}
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                ) : (
                  <FileText className="w-4 h-4 text-zinc-400" />
                )}
                <span className="text-sm text-zinc-300 truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg',
          'bg-zinc-900 border border-zinc-800 border-dashed',
          'text-zinc-500 hover:text-zinc-300 hover:border-zinc-700',
          'cursor-pointer transition-colors',
          'w-fit'
        )}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload file</span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-xs text-zinc-600">
          Supports images, PDFs, documents. Max 10MB.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
        {onCancel && (
          <button
            onClick={onCancel}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'text-zinc-400 hover:text-zinc-200',
              'hover:bg-zinc-800',
              'transition-colors'
            )}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium',
            'bg-amber-500 text-zinc-950',
            'hover:bg-amber-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors flex items-center gap-2'
          )}
        >
          {isSaving ? 'Saving...' : 'Save Deliverable'}
        </button>
      </div>
    </div>
  );
}

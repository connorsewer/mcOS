'use client'

import { useMemo } from 'react'
import { useActivitiesFeed } from '@/hooks/useActivities'
import type { Activity } from '@/hooks/useActivities'

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function relTime(ts?: number): string {
  if (!ts) return '—'
  const ms = Date.now() - ts
  if (!Number.isFinite(ms)) return '—'
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 48) return `${hr}h ago`
  const days = Math.round(hr / 24)
  return `${days}d ago`
}

function inferModel(action: string): string {
  const s = action.toLowerCase()
  if (s.includes('(sonnet)') || s.includes('sonnet')) return 'sonnet'
  if (s.includes('(gpt)') || s.includes('gpt')) return 'gpt'
  if (s.includes('(opus)') || s.includes('opus')) return 'opus'
  if (s.includes('(gemini)') || s.includes('gemini')) return 'gemini'
  return '—'
}

function modelBadgeClass(model: string): string {
  switch (model) {
    case 'gpt':
      return 'bg-blue-900/30 text-blue-300'
    case 'sonnet':
      return 'bg-purple-900/30 text-purple-300'
    case 'opus':
      return 'bg-amber-900/30 text-amber-300'
    case 'gemini':
      return 'bg-green-900/30 text-green-300'
    default:
      return 'bg-console-border/60 text-console-textMuted'
  }
}

type LivePanelProps = {
  squad?: 'oceans-11' | 'dune'
}

export default function LivePanelConvex({ squad }: LivePanelProps = {}) {
  const { results, status, loadMore } = useActivitiesFeed({
    squad,
    initialNumItems: 20,
  })

  const activities = useMemo(() => {
    if (!results) return undefined
    return results as Activity[]
  }, [results])

  const isLoading = status === 'LoadingFirstPage'
  const isLoadingMore = status === 'LoadingMore'
  const canLoadMore = status === 'CanLoadMore'

  // Derive status indicator from connection state
  const connectionStatus = useMemo(() => {
    if (isLoading) return 'loading'
    return 'live'
  }, [isLoading])

  return (
    <section className="rounded-lg border border-console-border bg-console-card">
      <div className="px-4 py-3 border-b border-console-border flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[12px] font-semibold text-console-text">Live</div>
            <span
              className={cx(
                'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold',
                connectionStatus === 'live'
                  ? 'bg-green-900/35 text-green-400'
                  : connectionStatus === 'loading'
                    ? 'bg-amber-900/30 text-amber-300'
                    : 'bg-red-900/30 text-red-400'
              )}
            >
              {connectionStatus === 'live' ? 'live' : connectionStatus}
            </span>
            {squad && (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold bg-console-border/60 text-console-textMuted">
                {squad}
              </span>
            )}
          </div>
          <div className="text-[11px] text-console-textDim">
            Convex real-time • {activities?.length ?? 0} activities
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canLoadMore && (
            <button
              className="text-[11px] px-3 py-1.5 rounded border border-console-border bg-console-bg/40 hover:bg-console-cardHover text-console-textMuted disabled:opacity-50"
              onClick={() => loadMore(20)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-4 text-[12px] text-console-textDim">Loading…</div>
      ) : null}

      <div className="border-t border-console-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-console-text">Recent activity</div>
            <div className="text-[11px] text-console-textDim">Real-time feed from mcOS</div>
          </div>
        </div>

        <div className="divide-y divide-console-border">
          {activities?.slice(0, 20).map((activity) => {
            const model = inferModel(activity.action)
            const timestamp = activity.createdAt ?? activity._creationTime

            return (
              <div key={activity._id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] text-console-textDim font-mono">{relTime(timestamp)}</div>
                  <span
                    className={cx(
                      'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold',
                      modelBadgeClass(model)
                    )}
                  >
                    {model}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-console-text">{activity.action}</div>
                {activity.agentName && (
                  <div className="mt-0.5 text-[11px] text-console-textDim">
                    by {activity.agentName}
                    {activity.agentRole ? ` • ${activity.agentRole}` : ''}
                  </div>
                )}
              </div>
            )
          })}

          {!activities?.length && !isLoading ? (
            <div className="px-4 py-6 text-[12px] text-console-textDim">No recent activity found.</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

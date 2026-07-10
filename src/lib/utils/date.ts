import { format, formatDistanceToNow, parseISO, isValid, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, fmt)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'hh:mm a')
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function todayRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: startOfDay(now).toISOString(),
    to:   endOfDay(now).toISOString(),
  }
}

export function thisMonthRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: startOfMonth(now).toISOString(),
    to:   endOfMonth(now).toISOString(),
  }
}

export function formatDateForDB(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(format(d, 'yyyy-MM-dd'))
  }
  return days
}

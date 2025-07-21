import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export function getDaysUntilExpiry(expiryDate: string) {
  return differenceInDays(parseISO(expiryDate), new Date())
}

export function getExpiryStatus(expiryDate: string) {
  const days = getDaysUntilExpiry(expiryDate)
  
  if (days < 0) {
    return { status: 'expired', color: 'red', message: `Expired ${Math.abs(days)} days ago` }
  } else if (days <= 30) {
    return { status: 'warning', color: 'yellow', message: `Expires in ${days} days` }
  } else if (days <= 90) {
    return { status: 'caution', color: 'orange', message: `Expires in ${days} days` }
  } else {
    return { status: 'safe', color: 'green', message: `Expires in ${days} days` }
  }
}
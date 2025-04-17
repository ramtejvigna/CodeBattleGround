import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "text-green-500 bg-green-500/10"
    case "MEDIUM":
      return "text-yellow-500 bg-yellow-500/10"
    case "HARD":
      return "text-orange-500 bg-orange-500/10"
    case "EXPERT":
      return "text-red-500 bg-red-500/10"
    default:
      return "text-blue-500 bg-blue-500/10"
  }
}

export function getChallengeTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case "ALGORITHM":
      return "Code"
    case "DATA_STRUCTURE":
      return "Database"
    case "SYSTEM_DESIGN":
      return "LayoutGrid"
    default:
      return "Code"
  }
}
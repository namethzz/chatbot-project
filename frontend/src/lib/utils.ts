import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// รวม className แบบ shadcn: ตัวหลังทับตัวหน้าเมื่อเป็น utility เดียวกัน
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

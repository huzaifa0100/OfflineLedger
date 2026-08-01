// OfflineLedger — Helper formatters & validators
import { palette } from '../theme/colors';

/** Extracts up to 2 initials from a full name */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Deterministic avatar background color based on name hash */
const AVATAR_COLORS = [
  '#2E4F70', // navy
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#3B82F6', // blue
  '#EC4899', // pink
  '#14B8A6', // teal
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(name.length - 1 - i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Format a currency amount as a readable string */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Format a Date as "Jan 15, 2025" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a Date as "02:45 PM" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Auto-format Pakistani phone number (e.g. 03190540450 -> 0319-0540450) */
export function formatPhoneInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
}

/** Validate Pakistani phone number format */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Valid Pakistani phone numbers: 11 digits starting with 03 (e.g. 03190540450) or 12 digits starting with 923
  return /^03\d{9}$/.test(digits) || /^923\d{9}$/.test(digits);
}

/** Auto-format CNIC number (e.g. 3330333333333 -> 33303-3333333-3) */
export function formatCnicInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

/** Validate CNIC number format (13 digits / 55555-7777777-1) */
export function isValidCnic(cnic: string): boolean {
  if (!cnic.trim()) return true; // CNIC is optional
  const digits = cnic.replace(/\D/g, '');
  return digits.length === 13;
}

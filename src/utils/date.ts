import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'd MMM yyyy', { locale: fr });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, "d MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return dateString;
  }
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

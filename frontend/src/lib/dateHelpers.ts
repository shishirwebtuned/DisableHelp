/**
 * Format a date to YYYY-MM-DD string in LOCAL timezone (not UTC)
 * This prevents the timezone offset issue where selected date shows as next/previous day
 */
export function formatDateToInputValue(
  date: Date | string | undefined,
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Use local timezone, not UTC
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD input value or Date to ISO string for API
 * Assumes the input date is in LOCAL timezone
 */
export function inputValueToISO(dateValue: string | Date | undefined): string {
  if (!dateValue) return "";

  if (typeof dateValue === "object") {
    // It's a Date object, convert to local date format first
    return formatDateToISO(dateValue);
  }

  // It's a string (YYYY-MM-DD)
  const [year, month, day] = dateValue.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return date.toISOString();
}

/**
 * Convert a Date object to ISO string using LOCAL timezone
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const [yr, m, d] = dateStr.split("-");
  const localDate = new Date(parseInt(yr), parseInt(m) - 1, parseInt(d));

  return localDate.toISOString();
}

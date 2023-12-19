import { format, getYear } from "date-fns";

export function getStartEndYear(startDate: Date, endDate?: null | Date): string {
  if (!startDate) throw new Error("Post does not have start date");
  const startYear = getYear(startDate);

  const endYear = endDate ? getYear(endDate) : "Current";

  if (startYear === endYear) return `${startYear}`;

  return `${startYear}-${endYear}`;
}

export function getStartEndDateString(startDate: Date, endDate?: null | Date) {
  let dateString = `${formatDateMonthYear(new Date(startDate))} - ${
    endDate ? formatDateMonthYear(new Date(endDate)) : "Current"
  }`;

  if (endDate && formatDateMonthYear(startDate) === formatDateMonthYear(endDate))
    dateString = `${formatDateMonthYear(new Date(startDate))}`;

  return dateString;
}

export function formatDate(date: Date) {
  return format(date, "MMM dd, yy");
}

export function formatDateFull(date: Date) {
  return format(date, "MMMM d, yyyy");
}

export function formatDateMonthYear(date: Date) {
  return format(date, "MMMM yyyy");
}

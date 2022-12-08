import { format } from "date-fns";

export const formatDate = (date: Date) => {
  return format(date, "MMM dd, yy");
};
export const formatDateFull = (date: Date) => {
  return format(date, "MMMM d, yyyy");
};
export const formatDateMonthYear = (date: Date) => {
  return format(date, "MMMM, yyyy");
};

interface StartEndYearParams {
  start: Date;
  end?: Date;
}
export const startEndYear = ({ start, end }: StartEndYearParams): string => {
  const startDate = new Date(start);
  if (!!end) {
    const endDate = new Date(end);
    return startDate.getFullYear() == endDate.getFullYear()
      ? startDate.getFullYear().toString()
      : `${startDate.getFullYear()}-${endDate
          .getFullYear()
          .toString()
          .substring(2)}`;
  } else {
    return `${startDate.getFullYear().toString()}-Present`;
  }
};

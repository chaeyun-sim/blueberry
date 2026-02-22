import { Dayjs } from 'dayjs';

export const formatDate = (date: Dayjs) => {
  return `${date.month() + 1}월 ${date.date()}일`;
}

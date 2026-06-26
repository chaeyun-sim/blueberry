import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

function useLiveClock() {
  const [time, setTime] = useState<Dayjs>(dayjs());
  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export default useLiveClock;

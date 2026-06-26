import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RollingNumberProps {
	prefix?: string;
	value: number;
}

function RollingNumber({ prefix = '₩', value }: RollingNumberProps) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: v => {
        setDisplay(Math.round(v).toLocaleString('ko-KR'));
      },
    });
    return controls.stop;
  }, [motionVal, value]);

  return (
    <>
      {prefix}
      {display}
    </>
  );
}

export default RollingNumber;

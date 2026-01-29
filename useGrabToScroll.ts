
import { useRef, useState } from 'react';

export function useGrabToScroll(direction: 'horizontal' | 'vertical' = 'horizontal') {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    if (direction === 'horizontal') {
      const x = e.pageX - scrollRef.current.offsetLeft;
      scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    } else {
      const y = e.pageY - scrollRef.current.offsetTop;
      scrollRef.current.scrollTop = scrollTop - (y - startY) * 1.5;
    }
  };

  return { 
    ref: scrollRef, 
    onMouseDown, 
    onMouseUp, 
    onMouseLeave, 
    onMouseMove, 
    onClickCapture: (e: React.MouseEvent) => { if (hasMoved) e.stopPropagation(); }, 
    isDragging 
  };
}

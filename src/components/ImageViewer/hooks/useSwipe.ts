interface UseSwipeProps {
  onSwipeLeft: () => void;

  onSwipeRight: () => void;

  threshold?: number;
}
import { useRef } from "react";

interface UseSwipeProps {
  onSwipeLeft: () => void;

  onSwipeRight: () => void;

  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseSwipeProps) {
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  function onPointerDown(event: React.PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);

    startX.current = event.clientX;

    currentX.current = event.clientX;
  }

  function onPointerMove(event: React.PointerEvent) {
    currentX.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent) {
    if (startX.current === null || currentX.current === null) {
      return;
    }

    const distance = currentX.current - startX.current;
    console.log("distance", distance);

    if (Math.abs(distance) < threshold) {
      return;
    }

    if (distance < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }

    startX.current = null;
    currentX.current = null;
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerMove,
  };
}

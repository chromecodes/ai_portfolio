import { useState } from "react";
import { ImageViewerItem } from "../types";

interface UseViewerProps {
  images: ImageViewerItem[];

  focusIndex?: number;
  direction: "left" | "right";
}

export function useViewer({ images, focusIndex = 0 }: UseViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(focusIndex);

  const currentImage = images[currentIndex];

  const [direction, setDirection] = useState<"left" | "right">("left");
  function next() {
    setDirection("left");
    setCurrentIndex((index) => {
      if (index >= images.length - 1) {
        return index;
      }
      return index + 1;
    });
  }

  function previous() {
    setDirection("right");
    setCurrentIndex((index) => {
      if (index <= 0) {
        return index;
      }
      return index - 1;
    });
  }

  const canPrevious = currentIndex > 0;

  const canNext = currentIndex < images.length - 1;

  function goTo(index: number) {
    if (index < 0 || index >= images.length) {
      return;
    }

    setCurrentIndex(index);
  }

  return {
    currentIndex,

    currentImage,

    canPrevious,
    direction,
    canNext,

    next,

    previous,

    goTo,

    hasNext: currentIndex < images.length - 1,

    hasPrevious: currentIndex > 0,
  };
}

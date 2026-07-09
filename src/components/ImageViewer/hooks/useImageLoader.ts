import { useEffect, useState } from "react";

import { ImageViewerItem } from "../types";

interface UseImageLoaderProps {
  images: ImageViewerItem[];

  currentIndex: number;

  preloadRadius?: number;

  useBlur?: boolean;
}

export function useImageLoader({
  images,

  currentIndex,

  useBlur = true,
}: UseImageLoaderProps) {
  console.log("useImageLoader mounted", {
    currentIndex,
    images,
  });
  const [loadedBlur, setLoadedBlur] = useState(new Set<number>());

  const [loadedFull, setLoadedFull] = useState(new Set<number>());

  function preload(src: string) {
    return new Promise<boolean>((resolve) => {
      const img = new window.Image();

      img.onload = () => {
        resolve(true);
      };

      img.onerror = () => {
        resolve(false);
      };

      img.src = src;
    });
  }

  async function loadBlur(index: number) {
    const image = images[index];

    if (!image) return;

    if (loadedBlur.has(index)) return;

    await preload(image.blurSrc);

    setLoadedBlur((prev) => {
      const next = new Set(prev);

      next.add(index);

      return next;
    });
  }

  async function loadFull(index: number) {
    const image = images[index];

    console.log("loading");

    const success = await preload(image.src);

    if (!success) {
      return;
    }

    setLoadedFull((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function getNeighbors(index: number) {
    return [index - 1, index + 1].filter((i) => i >= 0 && i < images.length);
  }

  useEffect(() => {
    async function load() {
      if (useBlur) {
        await loadBlur(currentIndex);
      }

      await loadFull(currentIndex);

      getNeighbors(currentIndex).forEach((index) => {
        if (useBlur) {
          loadBlur(index);
        }
      });
    }

    load();
  }, [currentIndex]);

  return {
    loadedBlur,

    loadedFull,
  };
}

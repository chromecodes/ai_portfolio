import { useEffect, useState } from "react";

import { ImageViewerItem } from "../types";

interface UseImageLoaderProps {
  images: ImageViewerItem[];

  currentIndex: number;

  preloadRadius?: number;
  enabled?: boolean;

  useBlur?: boolean;
}

export function useImageLoader({
  images,

  currentIndex,
  enabled = true,
  useBlur = true,
}: UseImageLoaderProps) {
  const [loadedBlur, setLoadedBlur] = useState(new Set<number>());

  const [loadedFull, setLoadedFull] = useState(new Set<number>());

  function preload(src: string, type: "video" | "image" = "image") {
    return new Promise<boolean>((resolve) => {
      if (type === "video") {
        const video = document.createElement("video");
        video.src = src;
        video.preload = "auto";
        video.oncanplaythrough = () => resolve(true);
        video.onerror = () => resolve(false);
        video.load();
      } else {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      }
    });
  }

  async function loadBlur(index: number) {
    const image = images[index];

    if (!image || !image.blurSrc) return;

    if (loadedBlur.has(index)) return;

    await preload(image.blurSrc, "image");

    setLoadedBlur((prev) => {
      const next = new Set(prev);

      next.add(index);

      return next;
    });
  }

  async function loadFull(index: number) {
    const image = images[index];

    const success = await preload(image.src, image.type);

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
      if (!enabled) {
        return;
      }

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
  }, [currentIndex, enabled, useBlur]);

  return {
    loadedBlur,

    loadedFull,
  };
}

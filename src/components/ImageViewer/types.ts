export interface ImageViewerItem {
  id: string;

  src: string;

  blurSrc: string;

  alt: string;

  displayMode?: "contain" | "cover";

  width: number;

  height: number;

  caption?: string;
}

export interface ImageViewerLoadingOptions {
  preloadRadius?: number;

  useBlur?: boolean;
}

export interface ImageViewerProps {
  images: ImageViewerItem[];

  /**
   * Which image should be shown first
   * Default: 0
   */
  focusIndex?: number;

  loading?: ImageViewerLoadingOptions;

  aspectRatio?: ImageViewerAspectRatio;

  curvedEdge?: boolean;
}

export type ImageViewerAspectRatio = "square" | "landscape" | "portrait";

export type ImageLoadState = "idle" | "loading" | "loaded" | "error";

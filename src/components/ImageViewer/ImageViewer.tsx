import ImageSlide from "./ImageSlide";
import DotNavigation from "./DotNavigation";

import type { ImageViewerProps } from "./types";

import { useViewer } from "./hooks/useViewer";
import { useImageLoader } from "./hooks/useImageLoader";


export default function ImageViewer({
    images,
    focusIndex = 0,
    loading: { preloadRadius, useBlur } = {},
    aspectRatio = "square",
    curvedEdge = true,
}: ImageViewerProps) {
    const aspectRatioMap = {
        square: "1 / 1",
        landscape: "16 / 9",
        portrait: "3 / 4",
    } as const;

    const viewer = useViewer({
        images,
        focusIndex,
    });

    const loader = useImageLoader({
        images,
        currentIndex: viewer.currentIndex,
    });

    const isFullLoaded =
        loader.loadedFull.has(viewer.currentIndex);

    return (
        <div className={"relative w-full border " + (curvedEdge ? "rounded-2xl" : "")}
            style={{
                aspectRatio: aspectRatioMap[aspectRatio],
            }}>
            <ImageSlide
                image={viewer.currentImage}
                isFullLoaded={isFullLoaded}
                curvedEdge={curvedEdge}
            />

            <div className="absolute bottom-4  left-1/2 transform -translate-x-1/2">
                <DotNavigation
                    total={images.length}
                    currentIndex={viewer.currentIndex}
                    onChange={viewer.goTo}
                />
            </div>

        </div>
    );
}
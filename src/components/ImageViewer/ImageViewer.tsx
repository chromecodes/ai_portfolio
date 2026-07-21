import ImageSlide from "./ImageSlide";
import DotNavigation from "./DotNavigation";

import type { ImageViewerProps } from "./types";

import { useViewer } from "./hooks/useViewer";
import { useImageLoader } from "./hooks/useImageLoader";
import ArrowButton from "./ArrowButton";
import { useSwipe } from "./hooks/useSwipe";
import { useInView } from "./hooks/useInView";
export default function ImageViewer({
    images,
    focusIndex = 0,
    loading: { preloadRadius, useBlur } = {},
    aspectRatio = "square",
    curvedEdge = true,
}: ImageViewerProps) {

    console.log(images);

    const {
        ref,
        isVisible
    } = useInView();

    const aspectRatioMap = {
        square: "1 / 1",
        landscape: "16 / 9",
        portrait: "3 / 4",
    } as const;

    const viewer = useViewer({
        images,
        focusIndex,
        direction: "right",
    });


    const swipe = useSwipe({

        onSwipeLeft: viewer.next,

        onSwipeRight: viewer.previous,

    });

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLDivElement>
    ) {

        switch (event.key) {

            case "ArrowLeft":
                viewer.previous();
                break;

            case "ArrowRight":
                viewer.next();
                break;

        }

    }

    const loader = useImageLoader({

        images,

        currentIndex: viewer.currentIndex,

        enabled: isVisible,

    });

    const isFullLoaded =
        loader.loadedFull.has(viewer.currentIndex);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div ref={ref} className={"relative w-full border touch-none " + (curvedEdge ? "rounded-2xl" : "")}
            style={{
                aspectRatio: aspectRatioMap[aspectRatio],
            }}

            onPointerDown={swipe.onPointerDown}
            onPointerMove={swipe.onPointerMove}
            onPointerUp={swipe.onPointerUp}
            onPointerCancel={swipe.onPointerUp}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <ImageSlide
                image={viewer.currentImage}
                direction={viewer.direction}
                isFullLoaded={isFullLoaded}
                isVisible={isVisible}
                curvedEdge={curvedEdge}
            />

            {images.length > 1 && (
                <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="
                    absolute
                     bottom-4 flex 
                     w-full
                     px-4
                     gap-4 items-center justify-between left-1/2 transform -translate-x-1/2">

                    <ArrowButton
                        direction="left"
                        onClick={viewer.previous}
                        disabled={!viewer.canPrevious}

                    />
                    <DotNavigation
                        total={images.length}
                        currentIndex={viewer.currentIndex}
                        onChange={viewer.goTo}
                    />

                    <ArrowButton
                        direction="right"
                        onClick={viewer.next}
                        disabled={!viewer.canNext}
                    />
                </div>

            )}
        </div >
    );
}
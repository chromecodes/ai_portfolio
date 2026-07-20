import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageViewerItem } from "./types";
import { motion } from "framer-motion";

interface ImageSlideProps {
    image: ImageViewerItem;

    isFullLoaded: boolean;

    isVisible?: boolean;

    curvedEdge?: boolean;

    direction?: "left" | "right";

}

export default function ImageSlide({ image, isFullLoaded, isVisible = false, curvedEdge, direction }: ImageSlideProps) {
    const [hasError, setHasError] = useState(false);
    const [videoPlayable, setVideoPlayable] = useState(false);

    useEffect(() => {
        setHasError(false);
        setVideoPlayable(false);
    }, [image.id]);

    if (hasError) {
        return (
            <motion.div
                className={"aspect-video w-full flex items-center justify-center text-neutral-400" + (curvedEdge ? " rounded-2xl" : "")}
                key={image.id}

                initial={{
                    x: direction === "left" ? 80 : -80,
                    opacity: 0,
                }}

                animate={{
                    x: 0,
                    opacity: 1,
                }}

                transition={{
                    duration: 0.3,
                    ease: "easeOut",
                }}

            >
                <div className="text-center">
                    <p className="text-4xl">🖼️</p>

                    <p>Image unavailable</p>

                    <p className="text-sm">{image.alt}</p>
                </div>
            </motion.div>
        );
    }

    console.log(image);

    return (
        <motion.div
            key={image.id}

            initial={{
                x: direction === "left"
                    ? 100
                    : -100,
                opacity: 0
            }}

            animate={{
                x: 0,
                opacity: 1
            }}

            transition={{
                duration: 0.3
            }}
            className="relative w-full h-full">
            {image.type === "video" ? (
                isVisible ? (
                    <div className="relative w-full h-full">
                        {image.blurSrc && !videoPlayable && (
                            <Image
                                src={image.blurSrc}
                                alt={image.alt}
                                fill
                                style={{ objectFit: image.displayMode }}
                                className={`blur-sm scale-105 transition-opacity duration-500 ${curvedEdge ? "rounded-2xl" : ""}`}
                            />
                        )}
                        <motion.video
                            src={image.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onPlaying={() => setVideoPlayable(true)}
                            onError={() => {
                                setHasError(true);
                            }}
                            style={{ objectFit: image.displayMode }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: videoPlayable ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                            className={`w-full h-full ${curvedEdge ? "rounded-2xl" : ""}`}
                        />
                    </div>
                ) : (
                    image.blurSrc ? (
                        <Image
                            src={image.blurSrc}
                            alt={image.alt}
                            fill
                            style={{ objectFit: image.displayMode }}
                            className={`blur-sm scale-105 ${curvedEdge ? "rounded-2xl" : ""}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-900 animate-pulse" />
                    )
                )
            ) : (
                <Image
                    src={(isFullLoaded || !image.blurSrc) ? image.src : image.blurSrc}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => {
                        setHasError(true);
                    }}
                    style={{ objectFit: image.displayMode }}
                    className={` object-cover  transition-all duration-500 ${(isFullLoaded || !image.blurSrc) ? "blur-0 scale-100" : "blur-sm scale-105"} ${curvedEdge ? "rounded-2xl" : ""}`}
                />
            )}
        </motion.div>
    );
}

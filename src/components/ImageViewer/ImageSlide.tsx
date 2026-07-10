import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageViewerItem } from "./types";
import { motion } from "framer-motion";

interface ImageSlideProps {
    image: ImageViewerItem;

    isFullLoaded: boolean;

    curvedEdge?: boolean;

    direction?: "left" | "right";

}

export default function ImageSlide({ image, isFullLoaded, curvedEdge, direction }: ImageSlideProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
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
            <Image
                src={isFullLoaded ? image.src : image.blurSrc}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                    setHasError(true);
                }}
                style={{ objectFit: image.displayMode }}
                className={` object-cover  transition-all duration-500 ${isFullLoaded ? "blur-0 scale-100" : "blur-sm scale-105"} ${curvedEdge ? "rounded-2xl" : ""}`}
            />
        </motion.div>
    );
}


"use client";
import { ImageViewerItem } from "@/components/ImageViewer/types";
import { motion } from "framer-motion";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

export default function PlaygroundPage() {
    const images: ImageViewerItem[] = [
        {
            id: "image-1",
            src: "/images/p1.webp",
            blurSrc: "/images/p1_blur.webp",
            alt: "test image 1",
            displayMode: "cover",
            width: 16,
            height: 9
        },
        {
            id: "image-2",
            src: "/images/p2.webp",
            blurSrc: "/images/p2_blur.webp",
            alt: "test image 2",
            displayMode: "contain",
            width: 1200,
            height: 800
        },
        {
            id: "image-3",
            src: "/test-3.webp",
            blurSrc: "/test-3-blur.webp",
            alt: "test image 3",
            displayMode: "cover",
            width: 1200,
            height: 800
        }
    ];


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 w-full h-full"
        >

            <div className="test flex items-center justify-center gap-4">
                <h1 className="text-4xl font-bold grow">test</h1>

                <div className="cnt w-1/2">
                    <ImageViewer images={images} aspectRatio="landscape" curvedEdge={true} />
                </div>
            </div>
        </motion.div>
    );
}
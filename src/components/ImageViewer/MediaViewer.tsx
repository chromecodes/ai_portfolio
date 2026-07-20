"use client";

import ImageViewer from "./ImageViewer";
import careerTypes from "@/types/career";

interface IMediaViewerProps {
    media: careerTypes["projects"][number]["key_features"][number]["media"];
}
;
export default function MediaViewer(props: IMediaViewerProps) {
    const { media } = props;
    return (
        <div className="lg:col-span-5 space-y-4">
            {/* Image slider render */}
            <div className="relative rounded-xl overflow-hidden border shadow-sm">
                <ImageViewer images={media} aspectRatio="landscape" curvedEdge={true} />
            </div>
        </div>
    );
}

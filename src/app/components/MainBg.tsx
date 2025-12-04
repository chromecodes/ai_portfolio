import React from "react";
import Image from "next/image";

interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

export default function MainBg(props: IconProps) {
    return (
        <div style={{ width: "50%", height: "50%" }}> {/* container with percentage */}
            <Image
                src="/bgsvg/bglight.svg"
                alt="Main Bg"
                fill  // fill the parent div
                style={{ objectFit: "contain" }} // keeps aspect ratio
                {...props}
            />
        </div>
    );
}

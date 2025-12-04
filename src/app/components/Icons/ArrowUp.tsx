// src/app/components/Icons/ArrowUp.tsx
import React from "react";
import Image from "next/image";

interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

export default function ArrowUp(props: IconProps) {
    return <Image src="/icons/arrowup.svg" alt="Arrow Up" width={20} height={20} {...props} />;
}

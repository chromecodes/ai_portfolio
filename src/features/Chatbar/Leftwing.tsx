"use client";

import useLanguageStore from "@/utils/i18n/useLanguageStore";

export interface ILeftwingProps {
    className?: string;
}

export default function Leftwing(props: ILeftwingProps) {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    return (
        <div className='w-1/4 text-sm text-fontColor'>
            {strings.footerLeftWingText}
        </div>
    );
}

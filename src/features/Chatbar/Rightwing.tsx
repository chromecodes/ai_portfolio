"use client";

import useLanguageStore from "@/utils/i18n/useLanguageStore";

export interface IRightwingProps {
    className?: string;
}

export default function Rightwing(props: IRightwingProps) {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    return (
        <div className='w-1/4 text-sm text-right text-fontColor'>
            {strings.footerRightWingText}
        </div>
    );
}

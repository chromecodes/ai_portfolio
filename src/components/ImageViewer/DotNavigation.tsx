interface DotNavigationProps {
    total: number;

    currentIndex: number;

    onChange: (index: number) => void;
}

export default function DotNavigation({
    total,
    currentIndex,
    onChange,
}: DotNavigationProps) {
    return (
        <>
            <div className="flex justify-center gap-2">
                {Array.from({ length: total }).map((_, index) => (

                    <div key={index} className="test flex items-center justify-center">
                        {currentIndex === index ?
                            <span className="w-1.5 h-1.5 absolute rounded-full bg-white"></span>
                            : <></>}
                        <button
                            key={index}
                            onClick={() => onChange(index)}
                            aria-label={`Go to image ${index + 1}`}
                            className={" image-viewer-dot-icon w-2 h-2 rounded-full"}
                        // className={` w-2 h-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-gray-400"} `}
                        />
                    </div>

                ))}
            </div>

        </>
    );
}

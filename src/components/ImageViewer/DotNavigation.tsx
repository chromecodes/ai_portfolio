interface DotNavigationProps {

    total: number;

    currentIndex: number;

    onChange: (index: number) => void;

}



export default function DotNavigation({
    total,
    currentIndex,
    onChange
}: DotNavigationProps) {
    return (
        <div className="flex justify-center gap-2">
            {
                Array.from({ length: total })
                    .map((_, index) => (


                        <button

                            key={index}

                            onClick={() => onChange(index)}

                            aria-label={`Go to image ${index + 1}`}

                            className={`
 w-2
 h-2
 rounded-full
 ${currentIndex === index
                                    ? "bg-white"
                                    : "bg-gray-400"
                                }
 `}

                        />


                    ))

            }


        </div>

    );


}
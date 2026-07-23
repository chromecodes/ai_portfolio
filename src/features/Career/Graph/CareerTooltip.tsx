import { CareerNode } from "./types"
import useLanguageStore from "@/utils/i18n/useLanguageStore"

function CareerTooltip({ node }: { node: CareerNode }) {
    const { data } = node

    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    return (
        <div className="
      w-64 rounded-xl
      bg-primary-background/80 backdrop-blur-md
      border border-white/10
      shadow-xl p-4 
    ">
            <div className="flex items-center gap-3">
                <img
                    src={data.tooltip_icon}
                    alt={data.company_name}
                    className="w-10 h-10 rounded-md"
                />
                <div>
                    <div className="font-semibold">{data.company_name}</div>
                    <div className="text-xs ">
                        {data.time_period + " " + strings.months}
                    </div>
                </div>
            </div>

            <p className="mt-3 text-sm line-clamp-3">
                {data.description}
            </p>
        </div>
    )
}

export default CareerTooltip

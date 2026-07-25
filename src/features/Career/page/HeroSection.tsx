import { FC } from "react";
import careerTypes from "@/types/career";
import Image from "next/image";
import QuotationBox from "@/components/UI/QuotationBox";
import Tags from "@/components/UI/tags/Tags";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import { PlaceholderTerminal } from "./PlaceholderTerminal";
import MediaViewer from "@/components/ImageViewer/MediaViewer";
interface IHeroSectionProps {
    data: careerTypes["company"];
}

export const HeroSection: FC<IHeroSectionProps> = ({ data }) => {
    return (
        <div>
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-3">
                    {data.logo ? (
                        <div className="relative 
                                        w-20 
                                        h-20 
                                        overflow-hidden 
                                        rounded-2xl 
                                        bg-white 
                                        shadow-md 
                                        flex 
                                        items-center 
                                        justify-center 
                                        p-3 border 
                                        border-gray-100 
                                        transition-all 
                                        duration-300 
                                        hover:scale-105">
                            <Image
                                src={data.logo}
                                alt={data.name}
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="relative 
                                        w-20 
                                        h-20 
                                        overflow-hidden 
                                        rounded-2xl 
                                        bg-linear-to-tr 
                                        from-blue-600 to-indigo-600 
                                        shadow-md 
                                        flex items-center 
                                        justify-center 
                                        text-white 
                                        font-extrabold 
                                        text-2xl 
                                        transition-all 
                                        duration-300 
                                        hover:scale-105">
                            {data.name.charAt(0)}
                        </div>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-4xl 
                                       font-extrabold 
                                       tracking-tight 
                                       bg-linear-to-r 
                                       from-accent-color
                                       to-secondary-accent-color 
                                       bg-clip-text 
                                       text-transparent">
                            {data.name}
                        </h1>
                        <p className="text-xl 
                                      font-medium 
                                      text-font-color-primary">
                            {data.role}
                        </p>
                        <p className="text-sm 
                                      font-semibold 
                                      text-font-color-muted">
                            {data.duration}
                        </p>
                    </div>
                    <QuotationBox quote={data.headline} />
                    {data.tags.length > 0 && <TagsCapsule tags={data.tags} />}
                </div>

                {data.media.length > 0 ? (
                    <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-gray-150/50 dark:border-gray-800">
                        <MediaViewer media={data.media} />
                    </div>
                ) : (
                    /* simulated IDE/terminal mockup */
                    <PlaceholderTerminal />
                )}
            </section>
        </div>
    );
};

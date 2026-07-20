"use client";
import MediaViewer from "@/components/ImageViewer/MediaViewer";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import careerTypes from "@/types/career";
import { Icons } from "@/Icon";
import ProjectLinks from "./ProjectLinks";

interface IFeaturesTileProps {
    features: careerTypes["projects"][number]["key_features"][number];
    index: number;
};
export default function FeaturesTile(props: IFeaturesTileProps) {
    const features = props.features;
    const hasMedia = features.media && features.media.length > 0;



    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start border-b dark:border-gray-850 pb-12 last:border-0 last:pb-0">
            {/* Description Content */}
            <div className={(hasMedia ? "lg:col-span-7" : "lg:col-span-12") + " space-y-6"}>
                <div className="space-y-3">
                    <h4 className="text-xl font-bold 
                                   text-primary-foreground">{features?.title}</h4>
                    <TagsCapsule tags={features?.tags || []} />
                </div>

                <div className="space-y-3 text-sm leading-relaxed">
                    {features?.problem && (
                        <p className="text-primary-foreground">
                            <strong className="font-semibold">{features.problem.title}:</strong>  <span className="text-muted-foreground">{features.problem.description}</span>
                        </p>
                    )}
                    {features?.solution && (
                        <p className="text-primary-foreground">
                            <strong className="font-semibold">{features.solution.title}:</strong> <span className="text-muted-foreground">{features.solution.description}</span>
                        </p>
                    )}
                </div>

                {features?.technical_details && (
                    <div className="space-y-2 bg-secondary-background p-5 rounded-xl border">
                        <span className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider">{features.technical_details.title}</span>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            {features.technical_details.items?.map((detail, idx) => (
                                <li key={idx} className="leading-relaxed">{detail}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {features?.outcome?.items?.length ? (
                    <div className="text-success-color
                                   bg-success-color/10
                                   p-4 rounded-xl border 
                                   text-xs
                                    flex items-start justify-start gap-2">
                        <p className="font-bold text-nowrap">✨ {features.outcome.title}:</p>
                        <ul className="leading-relaxed ml-2">{features.outcome.items.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                        ))}</ul>
                    </div>
                ) : null}

            </div>

            {hasMedia && (
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <MediaViewer media={features.media} />
                    <ProjectLinks links={features.links} />
                </div>
            )}
        </div>
    );
}


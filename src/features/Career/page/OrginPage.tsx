"use client";
import { HeroSection } from "./HeroSecrion";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import FeaturesTile from "./FeaturesTile";
import careerTypes from "@/types/career";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import CareerFooter from "./CareerFooter";


export default function OrginPage(props: any) {

    const strings = useLanguageStore((state) => state.strings as Record<string, string>);


    console.log(props);


    const data = props.data as careerTypes

    return (
        <div>
            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="space-y-20">

                    {/* HERO */}
                    <HeroSection data={data.company} />


                    {/* INTRODUCTION / FOUNDATION */}
                    <section className="grid md:grid-cols-12 
                                        gap-8 items-start
                                        bg-linear-to-br
                                        from-accent-color/15
                                        to-primary-background/10
                                        p-8 md:p-12 rounded-3xl
                                        border
                                        shadow-sm">
                        <div className="md:col-span-8 space-y-6">
                            <span className="text-xs 
                                             uppercase 
                                             tracking-widest 
                                             font-extrabold 
                                             text-accent-color">
                                {strings.foundation}</span>
                            <h2 className="text-3xl font-bold tracking-tight">
                                {data.introduction.title}</h2>
                            <div className="space-y-4 text-base
                             text-muted-foreground leading-relaxed">
                                {data.introduction.description.map((desc, index) => (
                                    <p key={index}>{desc}</p>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-4
                                        bg-secondary-background
                                        p-6 rounded-2xl 
                                        border 
                                        space-y-4">
                            <h3 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                                <span>🛠️</span> {strings.coreTechnologies}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <TagsCapsule tags={data.introduction.modules} />
                            </div>
                        </div>
                    </section>

                    {/* LEARNING JOURNEY */}
                    <section className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs uppercase tracking-widest 
                                font-extrabold text-accent-color">{strings.curriculumPath}</span>
                                <span className="h-px bg-secondary-foreground/20 flex-grow" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">{data.learningJourney.title}</h2>
                        </div>

                        <div className="grid md:grid-cols-12 gap-8">
                            {/* Journey Paragraphs */}
                            <div className="md:col-span-6 
                            space-y-4 text-muted-foreground leading-relaxed">
                                {(data.learningJourney.description as any[]).map((desc, index) => {
                                    if (!Array.isArray(desc)) {
                                        return <p key={index}>{desc}</p>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Explored Topics Card */}
                            <div className="md:col-span-6 bg-linear-to-br
                             from-accent-color/15 to-primary-background/10 
                             p-6 md:p-8 rounded-2xl border 
                               shadow-sm space-y-6">
                                <h3 className="text-lg font-bold tracking-tight border-b pb-3 flex items-center gap-2">
                                    <span>🚀</span> {strings.exploredEngineeringConcepts}
                                </h3>
                                <ul className="grid sm:grid-cols-2 gap-3 text-xs md:text-sm">
                                    {(data.learningJourney.description as any[]).map((desc) => {
                                        if (Array.isArray(desc)) {
                                            return desc.map((d: string) => (
                                                <li key={d} className="flex gap-2 items-start">
                                                    <span className="text-emerald-500 font-bold">✓</span>
                                                    <span className="leading-tight">{d}</span>
                                                </li>
                                            ));
                                        }
                                        return null;
                                    })}
                                </ul>
                            </div>
                        </div>
                    </section>
                    {/* PROJECTS */}
                    {
                        data.projects.map((project, index) => {
                            return (
                                <FeaturesTile key={project.id + index} features={project as any} index={index} />
                            )
                        })
                    }
                    {/* PROJECTS */}


                </div>

                {/* NAV */}
                <CareerFooter />
            </main>

        </div>
    );
}



"use client";
import { useParams } from "next/navigation";


export interface IOrginPageProps {
    data: object;
}

import type { IOrginData } from "@/types/originData";
import Image from "next/image";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { Icons } from "@/Icon";


export default function OrginPage(props: IOrginPageProps) {


    const data = props.data as IOrginData;

    // const params = useParams();

    return (
        <div>

            <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">

                {/* HERO */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <Image
                            src={data.company.logo}
                            alt={data.company.name}
                            width={80}
                            height={80}
                        />
                        <h1 className="text-3xl font-bold">{data.company.name}</h1>
                        <p className="text-lg ">{data.company.role}</p>
                        <p className="text-sm ">{data.company.duration}</p>
                    </div>
                    {data.company.heroMedia && (
                        <video
                            src={data.company.heroMedia}
                            autoPlay
                            loop
                            muted
                            className="rounded-xl shadow-lg"
                        />
                    )}

                </section>

                {/* INTRODUCTION */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold">{data.introduction.title}</h2>

                    <div className="context flex flex-wrap gap-2">
                        {
                            data.introduction.description.map((desc, index) => (
                                <div key={index} >{desc}</div>
                            ))
                        }
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {data.introduction.modules.map((m) => (
                            <span
                                key={m}
                                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-blue-700"
                            >
                                {m}
                            </span>
                        ))}
                    </div>

                    {/* learningJourney CONTEXT */}
                    <h2 className="text-xl font-bold">{data.learningJourney.title}</h2>
                    <div className="context flex flex-col gap-2">

                        {
                            data.learningJourney.description.map((desc, index) => (
                                Array.isArray(desc)
                                    ? <div key={index}> <ul className="space-y-2 pl-6 " key={index} >{desc.map((d: string) => <li className="list-disc" key={d}>{d}</li>)}</ul></div>
                                    : <p key={index} >{desc}</p>
                            ))
                        }
                    </div>
                </section>

                {/* PROJECTS */}
                {data.projects.map((project) => (
                    <section key={project.title} className="space-y-8">
                        <h2 className="section-title">{project.title}</h2>

                        <div className="flex flex-wrap gap-3">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <p><strong>{project.goal.title} - </strong> {project.goal.description}</p>
                                <p><strong>{project.solution.title} - </strong> {project.solution.description}</p>

                                <ul className="list-disc pl-6 text-gray-600">
                                    {project.concepts.items.map((t) => (
                                        <li key={t}>{t}</li>
                                    ))}
                                </ul>

                                <ul className="list-disc pl-6 text-green-700">
                                    {project.outcome.items.map((o) => (
                                        <li key={o}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="righr relative">

                                <div className="preview ">
                                    {project.images.length > 0 && <ImageViewer images={project.images} aspectRatio="landscape" curvedEdge={true} />}
                                </div>

                                <div className="links absolute top-4 right-4 flex gap-3">

                                    {Object.entries(project.links).map(([key, url]) => {
                                        const IconComponent = key === "github" ? Icons.github : Icons.externalLink;
                                        console.log(IconComponent);

                                        return IconComponent ? (
                                            <a
                                                key={`${key}-icon`}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="image-viewer-icon"
                                            >
                                                <IconComponent className="h-5 w-5" />
                                            </a>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}


                {/* NAV */}
                <footer className="flex justify-between text-sm text-gray-500 pt-10 border-t">
                    <button>← Back to Career Map</button>
                    <button>Next Company →</button>
                </footer>
            </main>

        </div>
    );
}


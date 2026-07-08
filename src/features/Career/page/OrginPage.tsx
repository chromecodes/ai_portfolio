"use client";
import { useParams } from "next/navigation";


export interface IOrginPageProps {
    data: object;
}

import type { IOrginData } from "@/types/originData";
import Image from "next/image";


export default function OrginPage(props: IOrginPageProps) {


    const data = props.data as IOrginData;

    console.log(data);
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

                {/* PRODUCT CONTEXT */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold">{data.productContext.title}</h2>

                    <div className="context flex flex-wrap gap-2">
                        {
                            data.productContext.description.map((desc, index) => (
                                <div key={index} >{desc}</div>
                            ))
                        }
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {data.productContext.modules.map((m) => (
                            <span
                                key={m}
                                className="px-3 py-1 text-sm rounded-full bg-gray-100"
                            >
                                {m}
                            </span>
                        ))}
                    </div>

                    {/* About CONTEXT */}
                    <h2 className="text-xl font-bold">{data.aboutContext.title}</h2>
                    <div className="context flex flex-col gap-2">

                        {
                            data.aboutContext.description.map((desc, index) => (
                                Array.isArray(desc)
                                    ? <div key={index}> <ul className="space-y-2 pl-6 " key={index} >{desc.map((d: string) => <li className="list-disc text-gray-600" key={d}>{d}</li>)}</ul></div>
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
                                <p><strong>Problem:</strong> {project.problem}</p>
                                <p><strong>Solution:</strong> {project.solution}</p>

                                <ul className="list-disc pl-6 text-gray-600">
                                    {project.tech.map((t) => (
                                        <li key={t}>{t}</li>
                                    ))}
                                </ul>

                                <ul className="list-disc pl-6 text-green-700">
                                    {project.outcome.map((o) => (
                                        <li key={o}>{o}</li>
                                    ))}
                                </ul>
                            </div>

                            <video
                                src={project.media}
                                autoPlay
                                loop
                                muted
                                className="rounded-xl border"
                            />
                        </div>
                    </section>
                ))}

                {/* TECH STACK */}
                <section className="space-y-6">
                    <h2 className="section-title">Tech Stack</h2>
                    <ul className="grid md:grid-cols-2 gap-4 text-gray-600">
                        {Object.entries(data.techStack).map(([k, v]) => (
                            <li key={k}>
                                <strong className="capitalize">{k}:</strong> {v}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* IMPACT */}
                <section className="space-y-6">
                    <h2 className="section-title">Impact</h2>
                    <ul className="list-disc pl-6 text-gray-600">
                        {data.impact.map((i) => (
                            <li key={i}>{i}</li>
                        ))}
                    </ul>
                </section>

                {/* LEARNINGS */}
                <section className="space-y-6">
                    <h2 className="section-title">Engineering Learnings</h2>
                    <ul className="list-disc pl-6 text-gray-600">
                        {data.learnings.map((l) => (
                            <li key={l}>{l}</li>
                        ))}
                    </ul>
                </section>

                {/* NAV */}
                <footer className="flex justify-between text-sm text-gray-500 pt-10 border-t">
                    <button>← Back to Career Map</button>
                    <button>Next Company →</button>
                </footer>
            </main>

        </div>
    );
}


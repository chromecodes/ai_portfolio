"use client";

import { FC } from "react";
import Link from "next/link";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import QuotationBox from "@/components/UI/QuotationBox";
import { MediaItem } from "@/types/projectDetail";
import { ProjectTerminalUI } from "./ProjectTerminalUI";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import ProjectLinks from "@/features/Career/page/ProjectLinks";

interface IProjectHeroSectionProps {
  projectName: string;
  projectContext: string;
  corePillars: string[];
  media?: MediaItem[] | { video?: string; images?: string[] };
  projectDemoUrl?: string;
  projectRepoUrl?: string;
}

export const ProjectHeroSection: FC<IProjectHeroSectionProps> = ({
  projectName,
  projectContext,
  corePillars,
  media,
  projectDemoUrl,
  projectRepoUrl,
}) => {
  // Check media availability
  let hasVideo = false;
  let videoSrc = "";
  let mediaArray: MediaItem[] = [];

  if (Array.isArray(media) && media.length > 0) {
    mediaArray = media;
    const videoItem = media.find((m) => m.type === "video");
    if (videoItem) {
      hasVideo = true;
      videoSrc = videoItem.src;
    }
  } else if (media && !Array.isArray(media)) {
    if (media.video) {
      hasVideo = true;
      videoSrc = media.video;
    }
  }

  const hasMedia = hasVideo || mediaArray.length > 0;
  const hasLinks = Boolean(projectDemoUrl || projectRepoUrl);

  return (
    <>
      {/* Main Hero Grid Layout */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm grid lg:grid-cols-12 gap-8 items-center" >
        {/* Left Column: Context & Metadata */}
        < div className="lg:col-span-7 space-y-6" >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-wider font-extrabold uppercase text-accent-color px-3 py-1 rounded-full bg-accent-color/10 border border-accent-color/20">
                Fullstack & Software
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-accent-color to-secondary-accent-color bg-clip-text text-transparent">
              {projectName}
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {projectContext}
            </p>
          </div>

          {/* Quotation / Highlight */}
          <QuotationBox
            quote={`Modular architecture built around core pillars: ${corePillars.join(", ")}.`}
          />

          {/* Core Pillars Tags */}
          <div className="pt-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color block mb-1">
              Core Pillars
            </span>
            <TagsCapsule tags={corePillars} />
          </div>
        </div >

        {/* Right Column: Media Overview or Terminal UI + Action Links */}
        < div className="lg:col-span-5 flex flex-col gap-4 w-full" >
          {
            hasVideo ? (
              <div className="relative group overflow-hidden rounded-2xl shadow-md border border-borderColor bg-secondary-background" >
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[300px] object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : mediaArray.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden border border-borderColor shadow-md bg-secondary-background">
                <ImageViewer images={mediaArray as any} aspectRatio="landscape" curvedEdge={true} />
              </div>
            ) : (
              <ProjectTerminalUI projectName={projectName} corePillars={corePillars} />
            )}

          {/* Demo & Repository Action Links */}
          {
            hasLinks && (
              <ProjectLinks
                links={{
                  live: projectDemoUrl,
                  github: projectRepoUrl,
                }}
              />
            )
          }
        </div >
      </section >
    </>
  );
};

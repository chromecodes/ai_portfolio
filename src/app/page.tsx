import type { Metadata } from "next";
import WelcomeUI from "@/features/Welcome/WelcomeUI";

export const metadata: Metadata = {
    title: "Hameed Hussain — Full-Stack Software Engineer",
    description:
        "A guided tour of my work: interactive career map, project case studies, technical expertise and the future roadmap. Pick a destination and dive into the details.",
};

export default function WelcomePage() {
    return <WelcomeUI />;
}

"use client";
import PulseBackground from "@/features/Home/PulseBackground";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export default function HomePage() {
    const strings = useLanguageStore((state) => state.strings);
    return (
        <main className="flex flex-1 justify-center">
            <section className="relative w-full flex items-center justify-center p-6">
                {/* Pulse Background */}
                <PulseBackground />

                {/* Content */}
                <div className="relative z-10 text-center bg-background/95 rounded-full">
                    <p className="mb-2">{strings.homePageGreeting}</p>
                    <h1 className="text-6xl text-foreground font-bold mb-2"> {strings.homePageName}</h1>
                    <p className="text-xl  text-foreground my-4">{strings.homePageTitle}</p>
                    <p className="max-w-xl leading-relaxed">
                        {strings.homePageIntro}
                    </p>
                </div>
            </section>
        </main>

    );
}

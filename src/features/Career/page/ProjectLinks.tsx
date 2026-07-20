import { Icons } from "@/Icon";
import careerTypes from "@/types/career";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { Button } from "@/components/ui/button";

export default function ProjectLinks({ links }: { links: careerTypes["projects"][number]["key_features"][number]["links"] }) {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    return (
        <div className="w-full flex flex-wrap items-center gap-3 pt-2">
            {links?.github && (
                <Button
                    asChild
                    variant="outline"
                    className="grow transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 font-semibold"
                >
                    <a
                        href={links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icons.github className="w-4 h-4" />
                        <span>{strings.github}</span>
                    </a>
                </Button>
            )}
            {links?.live && (
                <Button
                    asChild
                    variant="default"
                    className="grow bg-primary-foreground text-primary-background hover:bg-primary-foreground/90 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 font-semibold"
                >
                    <a
                        href={links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icons.externalLink className="w-3.5 h-3.5" />
                        <span>{strings.liveDemo}</span>
                    </a>
                </Button>
            )}
        </div>
    );
}
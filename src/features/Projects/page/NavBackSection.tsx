import useLanguageStore from "@/utils/i18n/useLanguageStore";
import Link from "next/link";

export default function NavBackSection() {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    return (
        <div>
            <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-color transition-colors duration-200"
            >
                <span>←</span>
                <span>{strings.backToProjects}</span>
            </Link>
        </div>
    );
}
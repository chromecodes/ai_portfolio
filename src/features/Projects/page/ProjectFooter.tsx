import useLanguageStore from "@/utils/i18n/useLanguageStore";
import Link from "next/link";

export default function ProjectFooter() {
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);

  return (
    <div className="w-full flex items-center justify-center mt-12">
      <Link
        href="/projects"
        className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full bg-accent-color text-primary-background shadow-xs hover:opacity-90 transition-opacity"
      >
        {strings.backToProjects}
      </Link>
    </div>
  );
}
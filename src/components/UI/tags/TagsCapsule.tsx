import Tags from './Tags';

export default function TagsCapsule({
    tags,
    className = "",
    theme = "accent",
}: {
    tags: string[];
    className?: string;
    theme?: "accent" | "light" | "dark";
}) {

    return (
        <div className={className + "flex flex-wrap gap-2 pt-2"
        }>
            {tags.map((tag, idx) => (
                <Tags key={idx} tag={tag} index={idx} theme={theme} />
            ))}
        </div>
    )
}
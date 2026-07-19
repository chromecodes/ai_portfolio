import Tags from './Tags';

export default function TagsCapsule({
    tags,
    className = "",
}: {
    tags: string[];
    className?: string;
}) {
    return (
        <div className={className + "flex flex-wrap gap-2 pt-2"}>
            {tags.map((tag, idx) => (
                <Tags key={idx} tag={tag} index={idx} />
            ))}
        </div>
    )
}
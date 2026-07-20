import { FC } from "react";
interface IPlaceholderTerminalProps { };

export const PlaceholderTerminal: FC<IPlaceholderTerminalProps> = (props) => {
    return (
        <div className="relative 
                        grow 
                        rounded-2xl 
                        border 
                        bg-secondary-background
                        text-font-color-muted
                        font-mono 
                        text-[11px] 
                        md:text-xs 
                        shadow-l 
                        p-4 
                        h-[280px] 
                        flex 
                        flex-col 
                        justify-between">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-gray-500 text-[10px]">bash - learning-journey.sh</span>
            </div>
            <div className="grow space-y-1 text-blue-400 leading-normal">
                <p className="text-gray-550"># Initializing software engineering fundamentals...</p>
                <p className="text-emerald-400">$ odin --start-journey</p>
                <p className="">🚀 Journey started at Dec 2021</p>
                <p className="text-purple-400">
                    [Odin Project] <span className="text-yellow-400">Learning HTML, CSS, & Javascript...</span>
                </p>
                <p className="text-blue-300">
                    [Concepts] <span className="text-gray-305">DOM, Algorithms, OOP, Component Architectures</span>
                </p>
                <p className="text-emerald-400">$ build --projects --interactive</p>
                <p className="">✓ Recipes Website (Semantic HTML)</p>
                <p className="">✓ Portfolio & Calculator (CSS Layouts & JS)</p>
            </div>
            <div className="flex items-center justify-between border-t pt-3 mt-3 text-gray-550 text-[10px]">
                <span>Status: Learning active</span>
                <span>Branch: main</span>
            </div>
        </div>
    );
}

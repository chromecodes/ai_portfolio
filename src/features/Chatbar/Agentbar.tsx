"use client";
import { Icons } from "@/Icon";
import useThemeStore from "@/lib/useThemeStore";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { useState } from "react";
// import { Icons } from "./Icons";

const BACKEND_URL = 'http://localhost:8000/api/chat';

export default function Agentbar() {
    //   const [messages, setMessages] = useState<{ user: string, bot: string }[]>([]);
    const [input, setInput] = useState('');
    const { theme } = useThemeStore(); // subscribe to theme
    const strings = useLanguageStore((state) => state.strings);



    const sendMessage = async () => {
        // const res = await fetch(BACKEND_URL, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ prompt: input }),
        // });
        // const data = await res.json();
        // setMessages([...messages, { user: input, bot: data.response }]);

        setInput('');
    };

    return (
        <div className="agentbar-cnt flex-1 flex justify-center">

            <div className="agentbar grow flex items-center gap-3 p-2 rounded-full border border-borderColorVariant bg-transparent shadow-md">
                <input
                    className="agentbar-input pl-2 ml-3 bg-transparent flex-1 outline-none"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={strings.agentbarPlaceholder}
                />

                <button className=" flex items-center justify-center agentbar-button bg-buttonColor rounded-full p-1" onClick={sendMessage}>
                    <Icons.arrowUp className={"w-6 h-6 text-buttonTextColor"} />
                    {/* <Icons.arrowUp className={"w-6 h-6" + "text-" + (theme == 'dark' ? 'black' : 'white')} /> */}
                </button>
            </div>
        </div>
    );
}

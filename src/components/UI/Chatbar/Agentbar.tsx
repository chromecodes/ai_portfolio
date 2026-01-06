
"use client";
import * as React from 'react';

export interface IAgentbarProps {
    className?: string;
}

export default function Agentbar(props: IAgentbarProps) {
    return (
        <div className='chat-bar-cnt w-full'>
            <div className="chat-bar flex items-center gap-3">
                <input type="text" className="chat" />
                <button className="send-btn">Send</button>
            </div>
        </div>
    );
}
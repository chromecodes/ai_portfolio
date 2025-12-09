"use client";
import { useRouter } from "next/navigation";

export default function LogoViewer() {
    const router = useRouter();

    return (
        <div
            className="w-10 h-10 rounded-full bg-white cursor-pointer flex-shrink-0"
            onClick={() => router.push("/home")}
        />
    );
}

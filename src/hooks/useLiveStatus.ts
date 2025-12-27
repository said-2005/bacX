import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveStatus {
    isLive: boolean;
    youtubeId: string;
    title: string;
    startedAt?: any;
}

export function useLiveStatus() {
    const [status, setStatus] = useState<LiveStatus>({
        isLive: false,
        youtubeId: "",
        title: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "config", "live_stream"), (doc) => {
            if (doc.exists()) {
                setStatus(doc.data() as LiveStatus);
            } else {
                setStatus({ isLive: false, youtubeId: "", title: "" });
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { ...status, loading };
}

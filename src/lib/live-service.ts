import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc, writeBatch } from "firebase/firestore";

interface LiveConfig {
    isLive: boolean;
    youtubeId?: string;
    title?: string;
    subject?: string;
}

export const toggleLiveStream = async ({ isLive, youtubeId, title, subject }: LiveConfig) => {
    const liveRef = doc(db, "config", "live_stream");

    await setDoc(liveRef, {
        isLive,
        youtubeId: youtubeId || "",
        title: title || "",
        subject: subject || "General",
        updatedAt: serverTimestamp(),
        ...(isLive && { startedAt: serverTimestamp() })
    }, { merge: true });
};

export const archiveStream = async (youtubeId: string, title: string, subject: string) => {
    const batch = writeBatch(db);

    // 1. Turn off Live
    const liveRef = doc(db, "config", "live_stream");
    batch.update(liveRef, {
        isLive: false,
        endedAt: serverTimestamp()
    });

    // 2. Create Lesson Document
    const lessonsRef = doc(collection(db, "lessons")); // Auto ID
    batch.set(lessonsRef, {
        title: title,
        subject: subject,
        videoUrl: youtubeId, // Storing ID as URL reference for consistency with player logic
        description: `تسجيل البث المباشر: ${title}`,
        createdAt: serverTimestamp(),
        type: 'video',
        isLocked: true, // Default to locked/premium
        duration: 'Live Replay'
    });

    await batch.commit();
    return lessonsRef.id;
};

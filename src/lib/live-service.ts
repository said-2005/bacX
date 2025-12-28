import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc, writeBatch } from "firebase/firestore";

interface LiveConfig {
    isLive: boolean;
    youtubeId?: string;
    title?: string;
    subject?: string;
}

export const toggleLiveStream = async ({ isLive, youtubeId, title, subject }: LiveConfig) => {
    const batch = writeBatch(db);

    // 1. PUBLIC CONFIG (SAFE): Only Status
    const publicRef = doc(db, "config", "live_stream");
    batch.set(publicRef, {
        isLive,
        title: title || "", // Title is public
        subject: subject || "General",
        updatedAt: serverTimestamp(),
        ...(isLive && { startedAt: serverTimestamp() })
    }, { merge: true });

    // 2. SECRET STREAM (PROTECTED): Youtube ID
    const secretRef = doc(db, "secret_stream", "current");
    batch.set(secretRef, {
        youtubeId: youtubeId || "",
        updatedAt: serverTimestamp()
    }, { merge: true });

    await batch.commit();
};

export const archiveStream = async (youtubeId: string, title: string, subject: string) => {
    const batch = writeBatch(db);

    // 1. Turn off Live
    // 1. Turn off Live (Public & Private)
    const liveRef = doc(db, "config", "live_stream");
    batch.update(liveRef, {
        isLive: false,
        endedAt: serverTimestamp()
    });

    const secretRef = doc(db, "secret_stream", "current");
    batch.update(secretRef, {
        youtubeId: "" // Clear secret ID
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

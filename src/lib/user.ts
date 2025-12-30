import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StudentData {
    uid: string;
    fullName: string;
    wilaya: string;
    major: string;
    email: string;
}

export async function saveStudentData(data: StudentData) {
    const userRef = doc(db, "users", data.uid);
    await setDoc(userRef, {
        uid: data.uid,
        fullName: data.fullName,
        email: data.email,
        wilaya: data.wilaya,
        major: data.major,
        role: "student",
        isSubscribed: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
    });
}

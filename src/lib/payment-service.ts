import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";

export interface PaymentRequest {
    userId: string;
    userName: string;
    receiptUrl: string;
    amount: string;
    plan: string; // 'monthly' | 'yearly'
    status: 'pending' | 'approved' | 'rejected';
}

export const submitPayment = async (data: PaymentRequest) => {
    // Create a new document in 'payments' collection
    const paymentRef = doc(collection(db, "payments"));

    // Also update user status to 'pending' to show UI feedback
    const batch = writeBatch(db);

    batch.set(paymentRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    const userRef = doc(db, "users", data.userId);
    batch.update(userRef, {
        subscriptionStatus: 'pending'
    });

    await batch.commit();
    return paymentRef.id;
};

export const approvePayment = async (paymentId: string, userId: string) => {
    const batch = writeBatch(db);

    // 1. Update Payment Status
    const paymentRef = doc(db, "payments", paymentId);
    batch.update(paymentRef, {
        status: 'approved',
        processedAt: serverTimestamp()
    });

    // 2. Update User Profile (Unlock content)
    const userRef = doc(db, "users", userId);

    // Calculate Expiry (e.g., 1 Year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    batch.update(userRef, {
        subscriptionStatus: 'premium',
        isSubscribed: true,
        subscriptionExpiry: expiryDate
    });

    await batch.commit();
};

export const rejectPayment = async (paymentId: string, userId: string) => {
    const batch = writeBatch(db);

    const paymentRef = doc(db, "payments", paymentId);
    batch.update(paymentRef, {
        status: 'rejected',
        processedAt: serverTimestamp()
    });

    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
        subscriptionStatus: 'free' // Revert to free
    });

    await batch.commit();
};

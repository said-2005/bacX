"use client";

import { useEffect, useState } from "react";
import { getPendingPayments, PaymentRequest } from "@/actions/admin-payment-actions";
import { PaymentReviewCard } from "@/components/admin/payments/PaymentReviewCard";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]); // Assuming type export or sticking to 'any' if interface not exported
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            setLoading(true);
            try {
                // Mimic student app lazy load
                const res = await getPendingPayments();
                setPayments(res.payments);
            } catch (e) {
                console.error("Failed to fetch payments", e);
            } finally {
                setLoading(false);
            }
        }
        fetchPayments();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-white/50 animate-pulse font-tajawal">جاري تحميل طلبات الدفع...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-tajawal">المالية (Finance)</h1>
                    <p className="text-gray-400 font-tajawal">مراجعة والتحقق من وصولات الدفع</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-mono">{payments.length}</span> طلبات معلقة
                </div>
            </div>

            {payments.length === 0 ? (
                <AdminEmptyState
                    title="لا توجد طلبات جديدة"
                    description="جميع طلبات الدفع تمت معالجتها."
                    icon="layout" // Using generic icon or pass specific if component supports it
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
                    {payments.map((payment) => (
                        <PaymentReviewCard key={payment.id} payment={payment} />
                    ))}
                </div>
            )}
        </div>
    );
}

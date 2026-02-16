"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chrome, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/play");
        } catch (err: any) {
            console.error(err);
            setError("Failed to register with Google. Check console or API config.");
            if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                alert("Firebase not configured. Redirecting to play anyway.");
                router.push("/play");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            <GlassCard className="w-full max-w-md p-8 relative z-10 border-secondary/20 bg-secondary/5">
                <Link href="/" className="absolute top-4 left-4 text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <div className="text-center mb-8 mt-4">
                    <h1 className="text-3xl font-arcade text-secondary mb-2">INITIATE UPLINK</h1>
                    <p className="text-muted-foreground">Register to save high scores globally.</p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full py-6 text-lg relative group overflow-hidden border-secondary text-secondary hover:bg-secondary hover:text-black"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Chrome className="w-5 h-5" />
                            {loading ? "CONNECTING..." : "LINK GOOGLE ACCOUNT"}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-muted-foreground">Existing User?</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full text-secondary hover:text-white"
                        onClick={() => router.push("/login")}
                    >
                        LOGIN INSTEAD
                    </Button>

                    {error && <p className="text-destructive text-sm text-center mt-4 bg-destructive/10 p-2 rounded">{error}</p>}
                </div>
            </GlassCard>
        </div>
    );
}

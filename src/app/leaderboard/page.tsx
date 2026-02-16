"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase"; // Assumes initialized
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Copy, Share2, Medal } from "lucide-react";

interface ScoreEntry {
    id: string;
    name: string;
    score: number;
    date: string;
}

export default function LeaderboardPage() {
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScores() {
            try {
                if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                    // Mock Data
                    setScores([
                        { id: '1', name: 'AI_MASTER_99', score: 2500, date: '2026-02-15' },
                        { id: '2', name: 'Snake_Eater', score: 1850, date: '2026-02-14' },
                        { id: '3', name: 'Gemini_V2', score: 1200, date: '2026-02-16' },
                        { id: '4', name: 'PlayerOne', score: 950, date: '2026-02-16' },
                        { id: '5', name: 'NoobSlayer', score: 420, date: '2026-02-16' },
                    ]);
                    setLoading(false);
                    return;
                }

                const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
                const querySnapshot = await getDocs(q);
                const fetched: ScoreEntry[] = [];
                querySnapshot.forEach((doc) => {
                    fetched.push({ id: doc.id, ...doc.data() } as any);
                });
                setScores(fetched);
            } catch (e) {
                console.error("Error fetching scores: ", e);
            } finally {
                setLoading(false);
            }
        }
        fetchScores();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-16 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        GLOBAL ELITE
                    </h1>
                    <Button variant="outline" asChild>
                        <Link href="/">BACK TO HOME</Link>
                    </Button>
                </div>

                <GlassCard className="p-0 overflow-hidden border-yellow-500/20">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 font-mono text-sm text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-7">Player</div>
                        <div className="col-span-4 text-right">Score</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center animate-pulse">Scanning Global Database...</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {scores.map((entry, index) => (
                                <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                                    <div className="col-span-1 text-center font-bold text-lg">
                                        {index === 0 && <Medal className="inline text-yellow-500" />}
                                        {index === 1 && <Medal className="inline text-gray-400" />}
                                        {index === 2 && <Medal className="inline text-amber-700" />}
                                        {index > 2 && index + 1}
                                    </div>
                                    <div className="col-span-7 font-mono flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-50 flex items-center justify-center text-[10px]">
                                            {entry.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={index === 0 ? "text-yellow-400 glow-text" : "text-white"}>{entry.name}</span>
                                    </div>
                                    <div className="col-span-4 text-right font-arcade text-primary">
                                        {entry.score.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="neon" className="gap-2">
                        <Share2 className="w-4 h-4" /> SHARE RANKING
                    </Button>
                </div>
            </div>
        </div>
    );
}

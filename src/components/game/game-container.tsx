"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnakeGame } from "@/hooks/use-snake-game";
import { GameCanvas } from "./game-canvas";
import { GameHUD } from "./hud";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Play, Pause, RotateCcw, MonitorPlay, Skull, Layers, User as UserIcon, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function GameContainer() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (auth && auth.onAuthStateChanged) {
            const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
            return () => unsubscribe();
        }
    }, []);

    const { gameState, startGame, pauseGame, changeDirection, setGameMode, setSpeed } = useSnakeGame({
        initialMode: "CLASSIC",
        initialSpeed: 100,
        onGameOver: (score) => {
            // Trigger Game Over Sequence
            if (score > 50) confetti(); // Celebration
        }
    });

    const [narratorText, setNarratorText] = useState("System Initialized. Awaiting Input.");

    // Speak AI Logic
    // Speak AI Logic
    const speak = useCallback(async (event: string) => {
        try {
            const res = await fetch('/api/ai/narrator', {
                method: 'POST',
                body: JSON.stringify({ event, score: gameState.score })
            });
            const data = await res.json();
            setNarratorText(data.message);

            // Ultra-futuristic TTS
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(data.message);
                const voices = window.speechSynthesis.getVoices();
                // Prefer robotic or 'Google' voices
                const roboticVoice = voices.find(v =>
                    v.name.includes('Google US English') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Samantha')
                );
                if (roboticVoice) utterance.voice = roboticVoice;
                utterance.pitch = 0.8; // Lower pitch
                utterance.rate = 1.1; // Faster rate
                window.speechSynthesis.speak(utterance);
            }
        } catch (e) {
            console.error("AI Narrator Error:", e);
        }
    }, [gameState.score]);

    useEffect(() => {
        if (gameState.status === "GAME_OVER") speak("game_over");
        if (gameState.score > 0 && gameState.score % 50 === 0) speak("score_milestone");
    }, [gameState.status, gameState.score, speak]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowUp", "w", "W"].includes(e.key)) changeDirection("UP");
            if (["ArrowDown", "s", "S"].includes(e.key)) changeDirection("DOWN");
            if (["ArrowLeft", "a", "A"].includes(e.key)) changeDirection("LEFT");
            if (["ArrowRight", "d", "D"].includes(e.key)) changeDirection("RIGHT");
            if (e.key === " " && gameState.status === "PLAYING") pauseGame();
            if (e.key === " " && gameState.status === "PAUSED") pauseGame(); // Resume
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [changeDirection, gameState.status, pauseGame]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-black via-slate-900 to-black overflow-hidden relative">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

            <h1 className="text-4xl md:text-6xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                SNAKE.AI <span className="text-xs align-top bg-primary text-black px-1 rounded">2026</span>
            </h1>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                {/* Main Game Area */}
                <div className="flex flex-col gap-4">
                    <GlassCard className="p-4 relative min-h-[400px] flex items-center justify-center border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                        <GameHUD gameState={gameState} user={user} />

                        {gameState.status === "IDLE" && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                                <Button onClick={() => { startGame(); speak("start"); }} size="lg" variant="neon" className="text-xl px-12 py-6 animate-pulse">
                                    START GAME
                                </Button>
                                <p className="mt-4 text-muted-foreground font-arcade text-xs">PRESS SPACE OR TAP TO START</p>
                            </div>
                        )}

                        {gameState.status === "GAME_OVER" && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl border border-destructive/50">
                                <Skull className="w-16 h-16 text-destructive mb-4 animate-bounce" />
                                <h2 className="text-3xl font-arcade text-destructive mb-2">GAME OVER</h2>
                                <p className="font-arcade text-white mb-6">FINAL SCORE: {gameState.score}</p>
                                <Button onClick={() => { startGame(); speak("start"); }} variant="default" size="lg">
                                    <RotateCcw className="mr-2 h-4 w-4" /> RETRY
                                </Button>
                            </div>
                        )}

                        <GameCanvas gameState={gameState} onDirectionChange={changeDirection} />

                        {/* Narrator Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                            <p className="font-mono text-xs text-primary/80 animate-pulse">
                                &gt; AI_NARRATOR: {narratorText}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Mobile Controls (Visible on small screens only) */}
                    <div className="lg:hidden grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                        <div />
                        <Button variant="outline" size="icon" onPointerDown={() => changeDirection("UP")}><Play className="-rotate-90 fill-current" /></Button>
                        <div />
                        <Button variant="outline" size="icon" onPointerDown={() => changeDirection("LEFT")}><Play className="rotate-180 fill-current" /></Button>
                        <Button variant="outline" size="icon" onPointerDown={() => changeDirection("DOWN")}><Play className="rotate-90 fill-current" /></Button>
                        <Button variant="outline" size="icon" onPointerDown={() => changeDirection("RIGHT")}><Play className="fill-current" /></Button>
                    </div>
                </div>

                {/* Sidebar / Settings */}
                <div className="flex flex-col gap-4">
                    {/* User Profile Panel */}
                    <GlassCard className="p-3 flex items-center justify-between gap-2 bg-secondary/10 border-secondary/20">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
                                <UserIcon className="w-4 h-4 text-secondary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-arcade text-secondary truncate max-w-[100px] uppercase">
                                    {user ? (user.displayName || "AGENT") : "GUEST MODE"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${user ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
                                    {user ? "ONLINE" : "OFFLINE"}
                                </span>
                            </div>
                        </div>

                        {user ? (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => auth.signOut()}
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                                onClick={() => router.push('/login')}
                                title="Login"
                            >
                                <LogIn className="w-4 h-4" />
                            </Button>
                        )}
                    </GlassCard>

                    <GlassCard className="flex flex-col gap-4 h-full">
                        <h3 className="font-arcade text-lg border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> MODES
                        </h3>

                        <div className="space-y-2">
                            <Button
                                variant={gameState.mode === "CLASSIC" ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setGameMode("CLASSIC")}
                            >
                                CLASSIC
                            </Button>
                            <Button
                                variant={gameState.mode === "AI_OBSTACLES" ? "default" : "outline"}
                                className="w-full justify-start relative overflow-hidden"
                                onClick={() => setGameMode("AI_OBSTACLES")}
                            >
                                <span className="relative z-10">AI MAZE GENERATOR</span>
                                {gameState.mode !== "AI_OBSTACLES" && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                                )}
                            </Button>
                            <Button
                                variant={gameState.mode === "AI_RIVAL" ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setGameMode("AI_RIVAL")}
                            >
                                <span className="flex items-center gap-2">VS AI RIVAL <span className="bg-destructive text-[10px] px-1 rounded text-white">BETA</span></span>
                            </Button>
                        </div>

                        <div className="mt-auto border-t border-white/10 pt-4">
                            <p className="text-xs text-muted-foreground mb-2 font-mono">DIFFICULTY</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant={gameState.level === 1 ? "secondary" : "ghost"} onClick={() => setSpeed(150)} className="flex-1">EASY</Button>
                                <Button size="sm" variant={gameState.level === 2 ? "secondary" : "ghost"} onClick={() => setSpeed(100)} className="flex-1">MED</Button>
                                <Button size="sm" variant={gameState.level === 3 ? "secondary" : "ghost"} onClick={() => setSpeed(60)} className="flex-1">HARD</Button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* AI Status Panel */}
                    <GlassCard className="p-4 bg-primary/5 border-primary/20">
                        <div className="flex items-center gap-2 mb-2 text-primary font-mono text-xs uppercase tracking-widest">
                            <MonitorPlay className="w-3 h-3 animate-pulse" /> AI Core Active
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-full origin-left scale-x-[0.8]" />
                        </div>
                        <div className="mt-2 text-[10px] text-primary/60 font-mono">
                            System load: 42% <br />
                            Map Gen: {gameState.mode === "AI_OBSTACLES" ? "ONLINE" : "STANDBY"} <br />
                            Neural Net: {gameState.mode === "AI_RIVAL" ? "ADAPTIVE" : "IDLE"}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

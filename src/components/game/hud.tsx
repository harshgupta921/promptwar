import { GlassCard } from "@/components/ui/glass-card";
import { GameState } from "@/types/game";
import { Trophy, Zap, User } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface GameHUDProps {
    gameState: GameState;
    user: FirebaseUser | null;
}

export function GameHUD({ gameState, user }: GameHUDProps) {
    return (
        <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto mb-4 px-4 font-arcade text-xs sm:text-sm">
            {/* User Row */}
            <GlassCard className="flex items-center justify-between px-4 py-2 bg-secondary/10 border-secondary/20 text-secondary w-full min-h-[40px]">
                <div className="flex items-center gap-2 truncate">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="truncate">PLAYER: {user ? (user.displayName?.toUpperCase() || "AGENT_UNKNOWN") : "GUEST_USER"}</span>
                </div>
                {user && <span className="text-[10px] opacity-60 hidden sm:inline-block font-mono">ID: {user.uid.slice(-4)}</span>}
            </GlassCard>

            {/* Stats Row */}
            <div className="flex justify-between items-center w-full gap-2">
                <GlassCard className="flex items-center gap-2 px-4 py-2 bg-black/50 border-primary/50 text-primary glow-text flex-1 justify-center min-h-[40px]">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>SCORE: {gameState.score.toString().padStart(4, '0')}</span>
                </GlassCard>

                <GlassCard className="flex items-center gap-2 px-4 py-2 bg-black/50 border-yellow-500/50 text-yellow-500 glow-text flex-1 justify-center min-h-[40px]">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>HIGH: {gameState.highScore.toString().padStart(4, '0')}</span>
                </GlassCard>
            </div>
        </div>
    );
}

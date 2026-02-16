import { useEffect, useRef, useState } from "react";
import { GameState } from "@/types/game";
import { GRID_SIZE } from "@/lib/game-engine";
import { useTheme } from "next-themes";

interface GameCanvasProps {
    gameState: GameState;
    onDirectionChange: (dir: "UP" | "DOWN" | "LEFT" | "RIGHT") => void;
}

export function GameCanvas({ gameState, onDirectionChange }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [dimensions, setDimensions] = useState({ w: 400, h: 400 });

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const size = Math.min(containerRef.current.clientWidth, 600); // Max width 600px
                setDimensions({ w: size, h: size });
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cellSize = dimensions.w / 20; // 20x20 grid

        // Clear
        ctx.clearRect(0, 0, dimensions.w, dimensions.h);

        // Background Grid (Subtle)
        ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, dimensions.h);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(dimensions.w, i * cellSize);
            ctx.stroke();
        }

        // Colors
        const snakeColor = theme === "dark" ? "#00FFFF" : "#00AAAA"; // Cyan
        const foodColor = theme === "dark" ? "#FF00FF" : "#AA00AA"; // Magenta
        const obstacleColor = theme === "dark" ? "#FFFF00" : "#AAAA00"; // Electric Yellow
        const rivalColor = "#FF5555"; // Red

        // Draw Obstacles
        ctx.fillStyle = obstacleColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = obstacleColor;
        gameState.obstacles.forEach(obs => {
            ctx.fillRect(obs.x * cellSize + 2, obs.y * cellSize + 2, cellSize - 4, cellSize - 4);
        });

        // Draw Rival Snake
        if (gameState.rivalSnake) {
            ctx.fillStyle = rivalColor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = rivalColor;
            gameState.rivalSnake.forEach(segment => {
                ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            });
        }

        // Draw Food
        ctx.fillStyle = foodColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = foodColor;
        ctx.beginPath();
        const foodX = gameState.food.x * cellSize + cellSize / 2;
        const foodY = gameState.food.y * cellSize + cellSize / 2;
        ctx.arc(foodX, foodY, cellSize / 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Player Snake
        ctx.shadowBlur = 10;
        ctx.shadowColor = snakeColor;
        gameState.snake.forEach((segment, index) => {
            const isHead = index === 0;
            ctx.fillStyle = isHead ? "#FFFFFF" : snakeColor; // White head

            // Smooth scaling effect if implemented, but just solid blocks for now
            ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);

            // Eyes for head
            if (isHead) {
                ctx.fillStyle = "black";
                // ... simple eyes
            }
        });

    }, [gameState, dimensions, theme]);

    // Touch Controls
    const touchStart = useRef({ x: 0, y: 0 });
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) onDirectionChange("RIGHT");
            if (dx < -50) onDirectionChange("LEFT");
        } else {
            if (dy > 50) onDirectionChange("DOWN");
            if (dy < -50) onDirectionChange("UP");
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            <canvas
                ref={canvasRef}
                width={dimensions.w}
                height={dimensions.h}
                className="border-2 border-primary rounded-lg shadow-[0_0_20px_hsl(var(--primary))] bg-black/80"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            />
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { GameState, Direction } from "@/types/game";
import { GRID_SIZE } from "@/lib/game-engine";
import { useTheme } from "next-themes";

interface GameCanvasProps {
    gameState: GameState;
    onDirectionChange: (dir: Direction) => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export function GameCanvas({ gameState, onDirectionChange }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [dimensions, setDimensions] = useState({ w: 400, h: 400 });
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>(0);
    const lastPositionRef = useRef<{ x: number; y: number }[]>([]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const size = Math.min(containerRef.current.clientWidth, 600);
                setDimensions({ w: size, h: size });
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Polyfill for roundRect if not available
    const drawRoundRect = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };

    // Particle system
    const addParticles = (x: number, y: number, color: string, count: number = 5) => {
        for (let i = 0; i < count; i++) {
            particlesRef.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1.0,
                color,
                size: Math.random() * 3 + 2,
            });
        }
    };

    const updateParticles = () => {
        particlesRef.current = particlesRef.current.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vx *= 0.98;
            p.vy *= 0.98;
            return p.life > 0;
        });
    };

    // Enhanced drawing with smooth animations
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const cellSize = dimensions.w / GRID_SIZE;
        let animationTime = 0;

        const animate = () => {
            animationTime += 0.016; // ~60fps

            // Clear with dark background
            ctx.fillStyle = "#0a0a0f";
            ctx.fillRect(0, 0, dimensions.w, dimensions.h);

            // Animated grid
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 + Math.sin(animationTime) * 0.01})`;
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, dimensions.h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(dimensions.w, i * cellSize);
                ctx.stroke();
            }

            // Colors based on theme
            const snakeGradient = theme === "dark"
                ? ["#00ffff", "#00ccff", "#0099ff"]
                : ["#00aaaa", "#008888", "#006666"];
            const foodColor = theme === "dark" ? "#ff00ff" : "#aa00aa";
            const obstacleColor = theme === "dark" ? "#ffff00" : "#aaaa00";
            const rivalColor = "#ff5555";

            // Draw Obstacles with glow
            gameState.obstacles.forEach(obs => {
                const x = obs.x * cellSize;
                const y = obs.y * cellSize;

                ctx.shadowBlur = 15;
                ctx.shadowColor = obstacleColor;

                // Hexagon shape for obstacles
                ctx.fillStyle = obstacleColor;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const px = x + cellSize / 2 + Math.cos(angle) * (cellSize / 3);
                    const py = y + cellSize / 2 + Math.sin(angle) * (cellSize / 3);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            });

            // Draw Rival Snake with aggressive styling
            if (gameState.rivalSnake && gameState.rivalSnake.length > 0) {
                gameState.rivalSnake.forEach((segment, index) => {
                    const isHead = index === 0;
                    const x = segment.x * cellSize;
                    const y = segment.y * cellSize;

                    ctx.shadowBlur = isHead ? 20 : 10;
                    ctx.shadowColor = rivalColor;

                    // Gradient fill
                    const gradient = ctx.createRadialGradient(
                        x + cellSize / 2, y + cellSize / 2, 0,
                        x + cellSize / 2, y + cellSize / 2, cellSize / 2
                    );
                    gradient.addColorStop(0, isHead ? "#ff8888" : rivalColor);
                    gradient.addColorStop(1, isHead ? rivalColor : "#aa0000");
                    ctx.fillStyle = gradient;

                    // Rounded rectangle
                    const radius = isHead ? cellSize / 3 : cellSize / 4;
                    ctx.beginPath();
                    ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, radius);
                    ctx.fill();

                    // Eyes for head
                    if (isHead) {
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(x + cellSize * 0.35, y + cellSize * 0.35, 2, 0, Math.PI * 2);
                        ctx.arc(x + cellSize * 0.65, y + cellSize * 0.35, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            // Draw Food with pulsing animation
            const foodX = gameState.food.x * cellSize + cellSize / 2;
            const foodY = gameState.food.y * cellSize + cellSize / 2;
            const pulse = Math.sin(animationTime * 3) * 0.2 + 1;

            ctx.shadowBlur = 20 * pulse;
            ctx.shadowColor = foodColor;

            const foodGradient = ctx.createRadialGradient(
                foodX, foodY, 0,
                foodX, foodY, (cellSize / 2.5) * pulse
            );
            foodGradient.addColorStop(0, "#ffffff");
            foodGradient.addColorStop(0.5, foodColor);
            foodGradient.addColorStop(1, "transparent");

            ctx.fillStyle = foodGradient;
            ctx.beginPath();
            ctx.arc(foodX, foodY, (cellSize / 2.5) * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Draw Player Snake with premium styling
            gameState.snake.forEach((segment, index) => {
                const isHead = index === 0;
                const isTail = index === gameState.snake.length - 1;
                const x = segment.x * cellSize;
                const y = segment.y * cellSize;

                // Smooth interpolation for movement
                const progress = (animationTime % 1);
                const smoothX = x;
                const smoothY = y;

                // Glow effect
                ctx.shadowBlur = isHead ? 25 : 15;
                ctx.shadowColor = snakeGradient[0];

                // Gradient based on position
                const gradient = ctx.createLinearGradient(
                    smoothX, smoothY,
                    smoothX + cellSize, smoothY + cellSize
                );

                if (isHead) {
                    gradient.addColorStop(0, "#ffffff");
                    gradient.addColorStop(0.5, snakeGradient[0]);
                    gradient.addColorStop(1, snakeGradient[1]);
                } else {
                    const colorIndex = Math.min(Math.floor(index / 3), snakeGradient.length - 1);
                    gradient.addColorStop(0, snakeGradient[colorIndex]);
                    gradient.addColorStop(1, snakeGradient[Math.min(colorIndex + 1, snakeGradient.length - 1)]);
                }

                ctx.fillStyle = gradient;

                // Rounded segments
                const radius = isHead ? cellSize / 2.5 : cellSize / 3;
                const size = isTail ? cellSize - 6 : cellSize - 2;
                const offset = isTail ? 3 : 1;

                ctx.beginPath();
                ctx.roundRect(smoothX + offset, smoothY + offset, size, size, radius);
                ctx.fill();

                // Head details
                if (isHead) {
                    ctx.shadowBlur = 0;

                    // Eyes based on direction
                    const eyeOffsetX = gameState.direction === "LEFT" ? 0.25 : gameState.direction === "RIGHT" ? 0.75 : 0.5;
                    const eyeOffsetY = gameState.direction === "UP" ? 0.25 : gameState.direction === "DOWN" ? 0.75 : 0.5;

                    ctx.fillStyle = "#000000";
                    if (gameState.direction === "UP" || gameState.direction === "DOWN") {
                        ctx.beginPath();
                        ctx.arc(smoothX + cellSize * 0.35, smoothY + cellSize * eyeOffsetY, 2.5, 0, Math.PI * 2);
                        ctx.arc(smoothX + cellSize * 0.65, smoothY + cellSize * eyeOffsetY, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.arc(smoothX + cellSize * eyeOffsetX, smoothY + cellSize * 0.35, 2.5, 0, Math.PI * 2);
                        ctx.arc(smoothX + cellSize * eyeOffsetX, smoothY + cellSize * 0.65, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Trail particles for head
                if (isHead && gameState.status === "PLAYING" && Math.random() > 0.7) {
                    addParticles(smoothX + cellSize / 2, smoothY + cellSize / 2, snakeGradient[0], 2);
                }
            });

            // Update and draw particles
            updateParticles();
            particlesRef.current.forEach(p => {
                ctx.shadowBlur = 5;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // Score combo effect
            if (gameState.score > 0 && gameState.score % 50 === 0) {
                const centerX = dimensions.w / 2;
                const centerY = dimensions.h / 2;
                addParticles(centerX, centerY, "#ffff00", 10);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
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
                className="border-2 border-primary rounded-lg shadow-[0_0_30px_hsl(var(--primary))] bg-gradient-to-br from-black via-slate-950 to-black"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            />
        </div>
    );
}

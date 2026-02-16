import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameStatus, Direction, Coordinate, GameMode } from "@/types/game";
import {
    moveSnake,
    checkCollision,
    generateFood,
    GRID_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION,
    getNextRivalMove,
} from "@/lib/game-engine";

interface UseSnakeGameProps {
    initialMode?: GameMode;
    initialSpeed?: number;
    onGameOver?: (score: number) => void;
}

export function useSnakeGame({ initialMode = "CLASSIC", initialSpeed = 150, onGameOver }: UseSnakeGameProps) {
    const [gameState, setGameState] = useState<GameState>({
        snake: INITIAL_SNAKE,
        food: { x: 5, y: 5 }, // Initial placeholder
        direction: INITIAL_DIRECTION,
        score: 0,
        highScore: 0,
        status: "IDLE",
        level: 1,
        obstacles: [],
        rivalSnake: [], // Initially empty
        mode: initialMode,
    });

    const [speed, setSpeed] = useState(initialSpeed);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<Direction>(INITIAL_DIRECTION); // Ref for immediate updates to prevent multiple turns in one tick

    // Load High Score
    useEffect(() => {
        const stored = localStorage.getItem("snake-highscore");
        if (stored) setGameState((prev) => ({ ...prev, highScore: parseInt(stored) }));
    }, []);

    const startGame = useCallback(async () => {
        // Reset State
        let obstacles: Coordinate[] = [];

        if (gameState.mode === "AI_OBSTACLES") {
            try {
                const res = await fetch('/api/ai/generate-map', {
                    method: 'POST',
                    body: JSON.stringify({ skillLevel: Math.min(Math.floor(gameState.highScore / 50) + 1, 10) }),
                });
                const data = await res.json();
                if (data.obstacles) obstacles = data.obstacles;
            } catch (e) {
                console.error("Failed to load map", e);
            }
        }

        setGameState((prev) => ({
            ...prev,
            snake: INITIAL_SNAKE,
            status: "PLAYING",
            score: 0,
            direction: INITIAL_DIRECTION,
            obstacles,
            food: generateFood(INITIAL_SNAKE, obstacles),
            rivalSnake: gameState.mode === "AI_RIVAL" ? [{ x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 }] : undefined
        }));
        directionRef.current = INITIAL_DIRECTION;
        setSpeed(initialSpeed);
    }, [gameState.mode, gameState.highScore, initialSpeed]);

    const pauseGame = useCallback(() => {
        setGameState((prev) => ({ ...prev, status: prev.status === "PLAYING" ? "PAUSED" : "PLAYING" }));
    }, []);

    const changeDirection = useCallback((newDirection: Direction) => {
        const current = directionRef.current;
        // Prevent 180 turns
        if (newDirection === "UP" && current === "DOWN") return;
        if (newDirection === "DOWN" && current === "UP") return;
        if (newDirection === "LEFT" && current === "RIGHT") return;
        if (newDirection === "RIGHT" && current === "LEFT") return;

        // Also update state for UI reactivity, but rely on ref for logic
        setGameState(prev => ({ ...prev, direction: newDirection }));
        directionRef.current = newDirection;
    }, []);

    const [tick, setTick] = useState(0);

    // Game Loop
    useEffect(() => {
        if (gameState.status !== "PLAYING") {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        const move = () => {
            setTick(prevTick => {
                const currentTick = prevTick + 1;

                setGameState((prev) => {
                    // Move User Snake
                    const newHead = { ...prev.snake[0] };
                    switch (directionRef.current) {
                        case "UP": newHead.y -= 1; break;
                        case "DOWN": newHead.y += 1; break;
                        case "LEFT": newHead.x -= 1; break;
                        case "RIGHT": newHead.x += 1; break;
                    }

                    // Check Collision logic
                    // 1. Wall or Self or Obstacle
                    if (checkCollision(newHead, prev.snake, prev.obstacles, GRID_SIZE)) {
                        // Game Over
                        if (onGameOver) onGameOver(prev.score);
                        if (prev.score > prev.highScore) {
                            localStorage.setItem("snake-highscore", prev.score.toString());
                        }
                        return { ...prev, status: "GAME_OVER", highScore: Math.max(prev.score, prev.highScore) };
                    }

                    const newSnake = [newHead, ...prev.snake];
                    let ateFood = false;

                    // Check Food
                    if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
                        ateFood = true;
                        // Score + Speed logic
                        // Don't pop tail
                    } else {
                        newSnake.pop();
                    }

                    // Rival Snake Logic
                    let newRivalSnake = prev.rivalSnake ? [...prev.rivalSnake] : undefined;
                    let rivalStatus = prev.status;

                    // Slow down rival: Only move every 2 ticks
                    // We use currentTick from the setTick closure to ensure it's up to date
                    const shouldRivalMove = currentTick % 3 !== 0; // Skip every 3rd tick? No, let's make it simpler.
                    // The user said "too fast". Let's make it move only on EVEN ticks.
                    const moveRival = currentTick % 2 === 0;

                    if (prev.mode === "AI_RIVAL" && newRivalSnake && moveRival) {
                        const rivalHead = newRivalSnake[0];
                        const moveDir = getNextRivalMove(rivalHead, prev.food, [...prev.obstacles, ...prev.snake], newRivalSnake); // AI avoids player too
                        // Move rival
                        const newRivalHead = { ...rivalHead };
                        // Apply move
                        if (moveDir === "UP") newRivalHead.y--;
                        else if (moveDir === "DOWN") newRivalHead.y++;
                        else if (moveDir === "LEFT") newRivalHead.x--;
                        else if (moveDir === "RIGHT") newRivalHead.x++;

                        // Collision for rival
                        if (newRivalHead.x === newHead.x && newRivalHead.y === newHead.y) {
                            // Head-on collision -> Game Over
                            rivalStatus = "GAME_OVER";
                        }

                        newRivalSnake = [newRivalHead, ...newRivalSnake];
                        // Rival needs food too? Or just chases?
                        // If rival eats food -> Score decreases or rival grows?
                        if (newRivalHead.x === prev.food.x && newRivalHead.y === prev.food.y) {
                            // Rival ate food
                            ateFood = true; // Food effectively gone
                            // Regenerate food immediately next tick (handled below)
                        } else {
                            newRivalSnake.pop();
                        }
                    }

                    let newFood = prev.food;
                    if (ateFood) {
                        newFood = generateFood(newSnake, prev.obstacles);
                        // If rival ate it, we still generate new food elsewhere
                    }

                    return {
                        ...prev,
                        snake: newSnake,
                        food: newFood,
                        rivalSnake: newRivalSnake,
                        status: rivalStatus,
                        score: ateFood && (newHead.x === prev.food.x && newHead.y === prev.food.y) ? prev.score + 10 : prev.score,
                    };
                });
                return currentTick;
            });
        };

        gameLoopRef.current = setInterval(move, speed);
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState.status, speed, onGameOver]);

    return { gameState, startGame, pauseGame, changeDirection, setSpeed, setGameMode: (m: GameMode) => setGameState(p => ({ ...p, mode: m })) };
}

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

export function useSnakeGame({ initialMode = "CLASSIC", initialSpeed = 200, onGameOver }: UseSnakeGameProps) {
    const [gameState, setGameState] = useState<GameState>({
        snake: INITIAL_SNAKE,
        food: { x: 5, y: 5 },
        direction: INITIAL_DIRECTION,
        score: 0,
        highScore: 0,
        status: "IDLE",
        level: 1,
        obstacles: [],
        rivalSnake: [],
        mode: initialMode,
        timeRemaining: initialMode === "TIME_ATTACK" ? 60 : undefined,
    });

    const [speed, setSpeed] = useState(initialSpeed);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<Direction>(INITIAL_DIRECTION);

    // Load High Score
    useEffect(() => {
        const stored = localStorage.getItem("snake-highscore");
        if (stored) setGameState((prev) => ({ ...prev, highScore: parseInt(stored) }));
    }, []);

    // Time Attack Timer
    useEffect(() => {
        if (gameState.mode === "TIME_ATTACK" && gameState.status === "PLAYING") {
            timerRef.current = setInterval(() => {
                setGameState((prev) => {
                    if (prev.timeRemaining !== undefined && prev.timeRemaining > 0) {
                        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
                    } else if (prev.timeRemaining === 0) {
                        // Time's up!
                        if (onGameOver) onGameOver(prev.score);
                        if (prev.score > prev.highScore) {
                            localStorage.setItem("snake-highscore", prev.score.toString());
                        }
                        return { ...prev, status: "GAME_OVER", highScore: Math.max(prev.score, prev.highScore) };
                    }
                    return prev;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [gameState.mode, gameState.status, onGameOver]);

    const startGame = useCallback(async () => {
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
            rivalSnake: gameState.mode === "AI_RIVAL" ? [{ x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 }] : undefined,
            timeRemaining: gameState.mode === "TIME_ATTACK" ? 60 : undefined,
        }));
        directionRef.current = INITIAL_DIRECTION;
        setSpeed(initialSpeed);
    }, [gameState.mode, gameState.highScore, initialSpeed]);

    const pauseGame = useCallback(() => {
        setGameState((prev) => ({ ...prev, status: prev.status === "PLAYING" ? "PAUSED" : "PLAYING" }));
    }, []);

    const changeDirection = useCallback((newDirection: Direction) => {
        const current = directionRef.current;
        if (newDirection === "UP" && current === "DOWN") return;
        if (newDirection === "DOWN" && current === "UP") return;
        if (newDirection === "LEFT" && current === "RIGHT") return;
        if (newDirection === "RIGHT" && current === "LEFT") return;

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
                    const newHead = { ...prev.snake[0] };
                    switch (directionRef.current) {
                        case "UP": newHead.y -= 1; break;
                        case "DOWN": newHead.y += 1; break;
                        case "LEFT": newHead.x -= 1; break;
                        case "RIGHT": newHead.x += 1; break;
                    }

                    if (checkCollision(newHead, prev.snake, prev.obstacles, GRID_SIZE)) {
                        if (onGameOver) onGameOver(prev.score);
                        if (prev.score > prev.highScore) {
                            localStorage.setItem("snake-highscore", prev.score.toString());
                        }
                        return { ...prev, status: "GAME_OVER", highScore: Math.max(prev.score, prev.highScore) };
                    }

                    const newSnake = [newHead, ...prev.snake];
                    let ateFood = false;

                    if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
                        ateFood = true;
                    } else {
                        newSnake.pop();
                    }

                    // Rival Snake Logic
                    let newRivalSnake = prev.rivalSnake ? [...prev.rivalSnake] : undefined;
                    let rivalStatus = prev.status;
                    let rivalAteFood = false;

                    const moveRival = currentTick % 3 === 0;

                    if (prev.mode === "AI_RIVAL" && newRivalSnake && moveRival) {
                        const rivalHead = newRivalSnake[0];
                        const moveDir = getNextRivalMove(rivalHead, prev.food, [...prev.obstacles, ...prev.snake], newRivalSnake);

                        const newRivalHead = { ...rivalHead };
                        if (moveDir === "UP") newRivalHead.y--;
                        else if (moveDir === "DOWN") newRivalHead.y++;
                        else if (moveDir === "LEFT") newRivalHead.x--;
                        else if (moveDir === "RIGHT") newRivalHead.x++;

                        if (checkCollision(newRivalHead, newRivalSnake, prev.obstacles, GRID_SIZE)) {
                            rivalStatus = "GAME_OVER";
                        }

                        if (newRivalHead.x === newHead.x && newRivalHead.y === newHead.y) {
                            rivalStatus = "GAME_OVER";
                        }

                        newRivalSnake = [newRivalHead, ...newRivalSnake];

                        if (newRivalHead.x === prev.food.x && newRivalHead.y === prev.food.y) {
                            rivalAteFood = true;
                            ateFood = true;
                        } else {
                            newRivalSnake.pop();
                        }
                    }

                    let newFood = prev.food;
                    let scoreIncrement = 0;

                    if (ateFood) {
                        newFood = generateFood(newSnake, prev.obstacles);

                        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
                            scoreIncrement = prev.mode === "SPEED_RUN" ? 20 : 10;
                        }
                    }

                    if (prev.mode === "SPEED_RUN" && prev.score > 0 && prev.score % 50 === 0 && scoreIncrement > 0) {
                        setSpeed(s => Math.max(50, s - 10));
                    }

                    let newObstacles = prev.obstacles;
                    if (prev.mode === "SURVIVAL" && prev.score > 0 && prev.score % 30 === 0 && scoreIncrement > 0) {
                        const randomObstacle = {
                            x: Math.floor(Math.random() * GRID_SIZE),
                            y: Math.floor(Math.random() * GRID_SIZE)
                        };
                        newObstacles = [...prev.obstacles, randomObstacle];
                    }

                    return {
                        ...prev,
                        snake: newSnake,
                        food: newFood,
                        rivalSnake: newRivalSnake,
                        status: rivalStatus,
                        obstacles: newObstacles,
                        score: prev.score + scoreIncrement,
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

    return { gameState, startGame, pauseGame, changeDirection, setSpeed, setGameMode: (m: GameMode) => setGameState(p => ({ ...p, mode: m, timeRemaining: m === "TIME_ATTACK" ? 60 : undefined })) };
}

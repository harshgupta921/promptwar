import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameStatus, Direction, Coordinate, GameMode, DifficultyLevel } from "@/types/game";
import {
    moveSnake,
    checkCollision,
    generateFood,
    GRID_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION,
    getNextRivalMove,
    getAIPersonality,
} from "@/lib/game-engine";
import {
    calculateGameSpeed,
    calculateLevel,
    DEFAULT_DIFFICULTY,
} from "@/constants/game-speed";

interface UseSnakeGameProps {
    initialMode?: GameMode;
    initialDifficulty?: DifficultyLevel;
    onGameOver?: (score: number) => void;
}

export function useSnakeGame({
    initialMode = "CLASSIC",
    initialDifficulty = DEFAULT_DIFFICULTY,
    onGameOver
}: UseSnakeGameProps) {
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
        difficulty: initialDifficulty,
        timeRemaining: initialMode === "TIME_ATTACK" ? 60 : undefined,
    });

    // Dynamic speed calculation based on difficulty, mode, and level
    const currentSpeed = calculateGameSpeed(
        gameState.difficulty,
        gameState.mode,
        gameState.level
    );

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const directionRef = useRef<Direction>(INITIAL_DIRECTION);
    const lastUpdateRef = useRef<number>(Date.now());

    // Load High Score
    useEffect(() => {
        const stored = localStorage.getItem("snake-highscore");
        if (stored) setGameState((prev) => ({ ...prev, highScore: parseInt(stored) }));
    }, []);

    // Time Attack Timer (1 second intervals)
    useEffect(() => {
        if (gameState.mode === "TIME_ATTACK" && gameState.status === "PLAYING") {
            timerRef.current = setInterval(() => {
                setGameState((prev) => {
                    if (prev.timeRemaining !== undefined && prev.timeRemaining > 0) {
                        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
                    } else if (prev.timeRemaining === 0) {
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
            level: 1,
            direction: INITIAL_DIRECTION,
            obstacles,
            food: generateFood(INITIAL_SNAKE, obstacles),
            rivalSnake: gameState.mode === "AI_RIVAL" ? [{ x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 }] : undefined,
            timeRemaining: gameState.mode === "TIME_ATTACK" ? 60 : undefined,
        }));
        directionRef.current = INITIAL_DIRECTION;
        lastUpdateRef.current = Date.now();
    }, [gameState.mode, gameState.highScore]);

    const pauseGame = useCallback(() => {
        setGameState((prev) => ({ ...prev, status: prev.status === "PLAYING" ? "PAUSED" : "PLAYING" }));
    }, []);

    const changeDirection = useCallback((newDirection: Direction) => {
        const current = directionRef.current;
        // Prevent 180-degree turns
        if (newDirection === "UP" && current === "DOWN") return;
        if (newDirection === "DOWN" && current === "UP") return;
        if (newDirection === "LEFT" && current === "RIGHT") return;
        if (newDirection === "RIGHT" && current === "LEFT") return;

        setGameState(prev => ({ ...prev, direction: newDirection }));
        directionRef.current = newDirection;
    }, []);

    const [tick, setTick] = useState(0);

    // Fixed Tick Rate Game Loop - Device Independent
    useEffect(() => {
        if (gameState.status !== "PLAYING") {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        const move = () => {
            const now = Date.now();
            const deltaTime = now - lastUpdateRef.current;

            // Ensure consistent timing across devices
            if (deltaTime < currentSpeed * 0.9) {
                return; // Skip this frame if called too early
            }

            lastUpdateRef.current = now;

            setTick(prevTick => {
                const currentTick = prevTick + 1;

                setGameState((prev) => {
                    // Calculate new level based on score
                    const newLevel = calculateLevel(prev.score);

                    // Move User Snake
                    const newHead = { ...prev.snake[0] };
                    switch (directionRef.current) {
                        case "UP": newHead.y -= 1; break;
                        case "DOWN": newHead.y += 1; break;
                        case "LEFT": newHead.x -= 1; break;
                        case "RIGHT": newHead.x += 1; break;
                    }

                    // Check Collision
                    if (checkCollision(newHead, prev.snake, prev.obstacles, GRID_SIZE)) {
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
                    } else {
                        newSnake.pop();
                    }

                    // Rival Snake Logic
                    let newRivalSnake = prev.rivalSnake ? [...prev.rivalSnake] : undefined;
                    let rivalStatus = prev.status;
                    let rivalAteFood = false;

                    // Rival moves every 3 ticks (slower than player)
                    const moveRival = currentTick % 3 === 0;

                    if (prev.mode === "AI_RIVAL" && newRivalSnake && moveRival) {
                        const rivalHead = newRivalSnake[0];

                        // Get AI personality based on difficulty and scores
                        const personality = getAIPersonality(
                            prev.difficulty,
                            prev.score,
                            newRivalSnake.length * 10 // Estimate rival score
                        );

                        // Enhanced AI with personality and player awareness
                        const moveDir = getNextRivalMove(
                            rivalHead,
                            prev.food,
                            [...prev.obstacles, ...prev.snake],
                            newRivalSnake,
                            GRID_SIZE,
                            personality,
                            prev.snake // Pass player snake for awareness
                        );

                        const newRivalHead = { ...rivalHead };
                        if (moveDir === "UP") newRivalHead.y--;
                        else if (moveDir === "DOWN") newRivalHead.y++;
                        else if (moveDir === "LEFT") newRivalHead.x--;
                        else if (moveDir === "RIGHT") newRivalHead.x++;

                        // Check rival collision with walls or self
                        if (checkCollision(newRivalHead, newRivalSnake, prev.obstacles, GRID_SIZE)) {
                            rivalStatus = "GAME_OVER";
                        }

                        // Check head-on collision with player
                        if (newRivalHead.x === newHead.x && newRivalHead.y === newHead.y) {
                            rivalStatus = "GAME_OVER";
                        }

                        newRivalSnake = [newRivalHead, ...newRivalSnake];

                        // Check if rival ate food
                        if (newRivalHead.x === prev.food.x && newRivalHead.y === prev.food.y) {
                            rivalAteFood = true;
                            ateFood = true;
                        } else {
                            newRivalSnake.pop();
                        }
                    }

                    // Game mode specific logic
                    let newFood = prev.food;
                    let scoreIncrement = 0;

                    if (ateFood) {
                        newFood = generateFood(newSnake, prev.obstacles);

                        // Only player gets points if they ate the food
                        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
                            scoreIncrement = prev.mode === "SPEED_RUN" ? 20 : 10;
                        }
                    }

                    // Survival mode: Add random obstacles every 30 points
                    let newObstacles = prev.obstacles;
                    if (prev.mode === "SURVIVAL" && prev.score > 0 && prev.score % 30 === 0 && scoreIncrement > 0) {
                        const randomObstacle = {
                            x: Math.floor(Math.random() * GRID_SIZE),
                            y: Math.floor(Math.random() * GRID_SIZE)
                        };
                        // Ensure obstacle doesn't spawn on snake or food
                        const isValidPosition = !newSnake.some(s => s.x === randomObstacle.x && s.y === randomObstacle.y) &&
                            !(newFood.x === randomObstacle.x && newFood.y === randomObstacle.y);
                        if (isValidPosition) {
                            newObstacles = [...prev.obstacles, randomObstacle];
                        }
                    }

                    return {
                        ...prev,
                        snake: newSnake,
                        food: newFood,
                        rivalSnake: newRivalSnake,
                        status: rivalStatus,
                        obstacles: newObstacles,
                        score: prev.score + scoreIncrement,
                        level: newLevel,
                    };
                });
                return currentTick;
            });
        };

        // Use setInterval with current calculated speed
        gameLoopRef.current = setInterval(move, currentSpeed);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState.status, currentSpeed, onGameOver]);

    return {
        gameState,
        startGame,
        pauseGame,
        changeDirection,
        currentSpeed,
        setGameMode: (m: GameMode) => setGameState(p => ({
            ...p,
            mode: m,
            timeRemaining: m === "TIME_ATTACK" ? 60 : undefined
        })),
        setDifficulty: (d: DifficultyLevel) => setGameState(p => ({ ...p, difficulty: d })),
    };
}

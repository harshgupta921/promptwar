export type Coordinate = {
    x: number;
    y: number;
};

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameStatus = "IDLE" | "PLAYING" | "PAUSED" | "GAME_OVER";

export type GameMode = "CLASSIC" | "AI_OBSTACLES" | "AI_RIVAL" | "ENDLESS" | "SPEED_RUN" | "SURVIVAL" | "TIME_ATTACK";

export interface GameState {
    snake: Coordinate[];
    food: Coordinate;
    direction: Direction;
    score: number;
    highScore: number;
    status: GameStatus;
    level: number; // Speed multiplier
    obstacles: Coordinate[];
    rivalSnake?: Coordinate[];
    mode: GameMode;
    timeRemaining?: number; // For TIME_ATTACK mode
}

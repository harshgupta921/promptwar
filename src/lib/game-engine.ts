import { Coordinate, Direction } from "@/types/game";

export const GRID_SIZE = 20;
export const INITIAL_SNAKE: Coordinate[] = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];
export const INITIAL_DIRECTION: Direction = "UP";

export function moveSnake(snake: Coordinate[], direction: Direction): Coordinate[] {
    const head = { ...snake[0] };

    switch (direction) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
    }

    return [head, ...snake.slice(0, -1)];
}

export function growSnake(snake: Coordinate[], direction: Direction): Coordinate[] {
    const head = { ...snake[0] };
    switch (direction) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
    }
    return [head, ...snake];
}

export function checkCollision(head: Coordinate, snakeBody: Coordinate[], obstacles: Coordinate[] = [], gridSize: number = GRID_SIZE): boolean {
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return true;
    }

    for (let i = 1; i < snakeBody.length; i++) {
        if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
            return true;
        }
    }

    for (const obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            return true;
        }
    }

    return false;
}

export function generateFood(snake: Coordinate[], obstacles: Coordinate[], gridSize: number = GRID_SIZE): Coordinate {
    let newFood: Coordinate;
    let isValid = false;

    while (!isValid) {
        newFood = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
        };

        isValid = true;
        for (const segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isValid = false;
                break;
            }
        }
        if (isValid) {
            for (const obs of obstacles) {
                if (obs.x === newFood.x && obs.y === newFood.y) {
                    isValid = false;
                    break;
                }
            }
        }
    }
    return newFood!;
}

/**
 * AI Personality Types
 */
export type AIPersonality = "AGGRESSIVE" | "DEFENSIVE" | "ADAPTIVE" | "BALANCED";

/**
 * Enhanced AI with human-like behavior and personality
 */
export function getNextRivalMove(
    rivalHead: Coordinate,
    target: Coordinate,
    obstacles: Coordinate[],
    rivalBody: Coordinate[],
    gridSize: number = GRID_SIZE,
    personality: AIPersonality = "BALANCED",
    playerSnake?: Coordinate[]
): Direction {
    const possibleMoves: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

    // Calculate safe moves
    const safeMoves = possibleMoves.filter(move => {
        let next: Coordinate = { ...rivalHead };
        if (move === "UP") next.y--;
        if (move === "DOWN") next.y++;
        if (move === "LEFT") next.x--;
        if (move === "RIGHT") next.x++;

        // Bounds check
        if (next.x < 0 || next.x >= gridSize || next.y < 0 || next.y >= gridSize) return false;

        // Self collision
        if (rivalBody.some(s => s.x === next.x && s.y === next.y)) return false;

        // Obstacle collision
        if (obstacles.some(o => o.x === next.x && o.y === next.y)) return false;

        return true;
    });

    if (safeMoves.length === 0) {
        // Trapped - make random move (will die)
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // Human-like mistakes: 5% chance of suboptimal move
    if (Math.random() < 0.05) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // Personality-based decision making
    const scoredMoves = safeMoves.map(move => {
        let next: Coordinate = { ...rivalHead };
        if (move === "UP") next.y--;
        if (move === "DOWN") next.y++;
        if (move === "LEFT") next.x--;
        if (move === "RIGHT") next.x++;

        let score = 0;

        // Distance to food
        const distToFood = Math.abs(next.x - target.x) + Math.abs(next.y - target.y);
        score -= distToFood * 10; // Lower distance = higher score

        // Personality modifiers
        switch (personality) {
            case "AGGRESSIVE":
                // Prioritize food aggressively
                score -= distToFood * 5;
                // Avoid player less
                if (playerSnake) {
                    const distToPlayer = Math.min(...playerSnake.map(p =>
                        Math.abs(next.x - p.x) + Math.abs(next.y - p.y)
                    ));
                    score += distToPlayer * 2; // Slight avoidance
                }
                break;

            case "DEFENSIVE":
                // Prioritize safety
                if (playerSnake) {
                    const distToPlayer = Math.min(...playerSnake.map(p =>
                        Math.abs(next.x - p.x) + Math.abs(next.y - p.y)
                    ));
                    score += distToPlayer * 10; // Strong avoidance
                }
                // Less aggressive toward food
                score -= distToFood * 3;
                break;

            case "ADAPTIVE":
                // Adapt based on rival length vs player length
                const rivalLength = rivalBody.length;
                const playerLength = playerSnake?.length || 3;

                if (rivalLength < playerLength) {
                    // Defensive when smaller
                    if (playerSnake) {
                        const distToPlayer = Math.min(...playerSnake.map(p =>
                            Math.abs(next.x - p.x) + Math.abs(next.y - p.y)
                        ));
                        score += distToPlayer * 8;
                    }
                } else {
                    // Aggressive when larger
                    score -= distToFood * 7;
                }
                break;

            case "BALANCED":
            default:
                // Balanced approach
                if (playerSnake) {
                    const distToPlayer = Math.min(...playerSnake.map(p =>
                        Math.abs(next.x - p.x) + Math.abs(next.y - p.y)
                    ));
                    score += distToPlayer * 5; // Moderate avoidance
                }
                break;
        }

        // Avoid corners and edges (human-like spatial awareness)
        const edgeDistance = Math.min(next.x, next.y, gridSize - 1 - next.x, gridSize - 1 - next.y);
        score += edgeDistance * 2;

        // Look ahead: avoid moves that lead to dead ends
        const nextSafeMoves = possibleMoves.filter(nextMove => {
            let lookahead: Coordinate = { ...next };
            if (nextMove === "UP") lookahead.y--;
            if (nextMove === "DOWN") lookahead.y++;
            if (nextMove === "LEFT") lookahead.x--;
            if (nextMove === "RIGHT") lookahead.x++;

            if (lookahead.x < 0 || lookahead.x >= gridSize || lookahead.y < 0 || lookahead.y >= gridSize) return false;
            if (obstacles.some(o => o.x === lookahead.x && o.y === lookahead.y)) return false;
            return true;
        });
        score += nextSafeMoves.length * 15; // Prefer moves with more options

        return { move, score };
    });

    // Sort by score and pick best
    scoredMoves.sort((a, b) => b.score - a.score);

    // Add slight randomness to top 2 moves (human-like decision variance)
    const topMoves = scoredMoves.slice(0, Math.min(2, scoredMoves.length));
    const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];

    return selectedMove.move;
}

/**
 * Get AI personality based on difficulty and game state
 */
export function getAIPersonality(difficulty: string, playerScore: number, rivalScore: number): AIPersonality {
    if (difficulty === "EASY") return "DEFENSIVE";
    if (difficulty === "HARD" || difficulty === "HARDCORE") return "AGGRESSIVE";

    // MEDIUM uses adaptive
    if (rivalScore < playerScore - 20) return "AGGRESSIVE";
    if (rivalScore > playerScore + 20) return "DEFENSIVE";
    return "BALANCED";
}

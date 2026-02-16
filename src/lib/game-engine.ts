import { Coordinate, Direction } from "@/types/game";

export const GRID_SIZE = 20; // 20x20 grid (standard responsive)
export const INITIAL_SNAKE: Coordinate[] = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];
export const INITIAL_DIRECTION: Direction = "UP";

export function moveSnake(snake: Coordinate[], direction: Direction): Coordinate[] {
    const head = { ...snake[0] };

    switch (direction) {
        case "UP":
            head.y -= 1;
            break;
        case "DOWN":
            head.y += 1;
            break;
        case "LEFT":
            head.x -= 1;
            break;
        case "RIGHT":
            head.x += 1;
            break;
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
    // Walls
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return true;
    }

    // Self
    for (let i = 1; i < snakeBody.length; i++) {
        if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
            return true;
        }
    }

    // Obstacles
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
        // Check if on snake
        for (const segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isValid = false;
                break;
            }
        }
        // Check if on obstacles
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

// Simple A* Heuristic for Rival Snake (Manhattan Distance)
export function getNextRivalMove(rivalHead: Coordinate, target: Coordinate, obstacles: Coordinate[], rivalBody: Coordinate[], gridSize: number = GRID_SIZE): Direction {
    // This is a simplified "dumb" AI for MVP. Can upgrade to A* later.
    // It tries to reduce distance to target (food) while avoiding immediate collision.

    const possibleMoves: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
    const safeMoves = possibleMoves.filter(move => {
        let next: Coordinate = { ...rivalHead };
        if (move === "UP") next.y--;
        if (move === "DOWN") next.y++;
        if (move === "LEFT") next.x--;
        if (move === "RIGHT") next.x++;

        // Check bounds
        if (next.x < 0 || next.x >= gridSize || next.y < 0 || next.y >= gridSize) return false;
        // Check self collision (rival body)
        if (rivalBody.some(s => s.x === next.x && s.y === next.y)) return false;
        // Check obstacles
        if (obstacles.some(o => o.x === next.x && o.y === next.y)) return false;

        return true;
    });

    if (safeMoves.length === 0) return "UP"; // Suicide logic if trapped (or random valid)

    // Prioritize move that gets closest to target
    return safeMoves.sort((a, b) => {
        let posA = { ...rivalHead };
        if (a === "UP") posA.y--; if (a === "DOWN") posA.y++; if (a === "LEFT") posA.x--; if (a === "RIGHT") posA.x++;

        let posB = { ...rivalHead };
        if (b === "UP") posB.y--; if (b === "DOWN") posB.y++; if (b === "LEFT") posB.x--; if (b === "RIGHT") posB.x++;

        const distA = Math.abs(posA.x - target.x) + Math.abs(posA.y - target.y);
        const distB = Math.abs(posB.x - target.x) + Math.abs(posB.y - target.y);
        return distA - distB;
    })[0];
}

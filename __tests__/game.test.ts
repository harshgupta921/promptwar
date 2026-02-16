import {
    moveSnake,
    checkCollision,
    generateFood,
    GRID_SIZE,
    INITIAL_SNAKE,
    getNextRivalMove
} from '@/lib/game-engine';
import type { Coordinate, Direction } from '@/types/game';

describe('Game Engine - Snake Movement', () => {
    it('should move snake up correctly', () => {
        const snake: Coordinate[] = [{ x: 10, y: 10 }];
        const newSnake = moveSnake(snake, 'UP');
        expect(newSnake[0].y).toBe(9);
    });

    it('should move snake down correctly', () => {
        const snake: Coordinate[] = [{ x: 10, y: 10 }];
        const newSnake = moveSnake(snake, 'DOWN');
        expect(newSnake[0].y).toBe(11);
    });

    it('should move snake left correctly', () => {
        const snake: Coordinate[] = [{ x: 10, y: 10 }];
        const newSnake = moveSnake(snake, 'LEFT');
        expect(newSnake[0].x).toBe(9);
    });

    it('should move snake right correctly', () => {
        const snake: Coordinate[] = [{ x: 10, y: 10 }];
        const newSnake = moveSnake(snake, 'RIGHT');
        expect(newSnake[0].x).toBe(11);
    });
});

describe('Game Engine - Collision Detection', () => {
    it('should detect wall collision at top boundary', () => {
        const head: Coordinate = { x: 10, y: -1 };
        const snake: Coordinate[] = [head];
        const obstacles: Coordinate[] = [];
        expect(checkCollision(head, snake, obstacles, GRID_SIZE)).toBe(true);
    });

    it('should detect wall collision at bottom boundary', () => {
        const head: Coordinate = { x: 10, y: GRID_SIZE };
        const snake: Coordinate[] = [head];
        const obstacles: Coordinate[] = [];
        expect(checkCollision(head, snake, obstacles, GRID_SIZE)).toBe(true);
    });

    it('should detect self collision', () => {
        const head: Coordinate = { x: 10, y: 10 };
        const snake: Coordinate[] = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 10 } // Collision with head
        ];
        const obstacles: Coordinate[] = [];
        expect(checkCollision(head, snake, obstacles, GRID_SIZE)).toBe(true);
    });

    it('should detect obstacle collision', () => {
        const head: Coordinate = { x: 5, y: 5 };
        const snake: Coordinate[] = [head];
        const obstacles: Coordinate[] = [{ x: 5, y: 5 }];
        expect(checkCollision(head, snake, obstacles, GRID_SIZE)).toBe(true);
    });

    it('should not detect collision in valid position', () => {
        const head: Coordinate = { x: 10, y: 10 };
        const snake: Coordinate[] = [head, { x: 10, y: 11 }];
        const obstacles: Coordinate[] = [];
        expect(checkCollision(head, snake, obstacles, GRID_SIZE)).toBe(false);
    });
});

describe('Game Engine - Food Generation', () => {
    it('should generate food within grid bounds', () => {
        const snake: Coordinate[] = INITIAL_SNAKE;
        const obstacles: Coordinate[] = [];
        const food = generateFood(snake, obstacles);

        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(GRID_SIZE);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(GRID_SIZE);
    });

    it('should not generate food on snake position', () => {
        const snake: Coordinate[] = [{ x: 10, y: 10 }];
        const obstacles: Coordinate[] = [];
        const food = generateFood(snake, obstacles);

        expect(food.x !== 10 || food.y !== 10).toBe(true);
    });

    it('should not generate food on obstacles', () => {
        const snake: Coordinate[] = [];
        const obstacles: Coordinate[] = [{ x: 5, y: 5 }];
        const food = generateFood(snake, obstacles);

        expect(food.x !== 5 || food.y !== 5).toBe(true);
    });
});

describe('Game Engine - AI Rival Movement', () => {
    it('should return valid direction', () => {
        const rivalHead: Coordinate = { x: 10, y: 10 };
        const food: Coordinate = { x: 15, y: 15 };
        const obstacles: Coordinate[] = [];
        const rivalSnake: Coordinate[] = [rivalHead];

        const direction = getNextRivalMove(rivalHead, food, obstacles, rivalSnake);
        const validDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

        expect(validDirections).toContain(direction);
    });

    it('should move towards food when possible', () => {
        const rivalHead: Coordinate = { x: 10, y: 10 };
        const food: Coordinate = { x: 15, y: 10 };
        const obstacles: Coordinate[] = [];
        const rivalSnake: Coordinate[] = [rivalHead];

        const direction = getNextRivalMove(rivalHead, food, obstacles, rivalSnake);

        // Should prefer moving right towards food
        expect(['RIGHT', 'UP', 'DOWN']).toContain(direction);
    });
});

describe('Game Engine - Constants', () => {
    it('should have valid grid size', () => {
        expect(GRID_SIZE).toBeGreaterThan(0);
        expect(typeof GRID_SIZE).toBe('number');
    });

    it('should have valid initial snake', () => {
        expect(INITIAL_SNAKE).toBeDefined();
        expect(Array.isArray(INITIAL_SNAKE)).toBe(true);
        expect(INITIAL_SNAKE.length).toBeGreaterThan(0);
    });
});

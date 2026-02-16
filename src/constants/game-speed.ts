/**
 * Centralized Game Speed Configuration
 * All speed values in milliseconds (ms) per game tick
 */

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'HARDCORE';

export interface SpeedConfig {
    baseSpeed: number;
    minSpeed: number;
    maxSpeed: number;
    speedIncrement: number;
}

/**
 * Speed Configuration Map
 * Lower values = faster gameplay
 */
export const DIFFICULTY_SPEED_MAP: Record<DifficultyLevel, SpeedConfig> = {
    EASY: {
        baseSpeed: 200,        // Starting speed (slow & comfortable)
        minSpeed: 150,         // Fastest it can get
        maxSpeed: 250,         // Slowest it can be
        speedIncrement: 5,     // Speed increase per level
    },
    MEDIUM: {
        baseSpeed: 140,        // Moderate starting speed
        minSpeed: 90,          // Gets challenging
        maxSpeed: 180,
        speedIncrement: 7,
    },
    HARD: {
        baseSpeed: 90,         // Fast from the start
        minSpeed: 50,          // Very fast endgame
        maxSpeed: 120,
        speedIncrement: 10,
    },
    HARDCORE: {
        baseSpeed: 60,         // Extremely fast
        minSpeed: 30,          // Nearly impossible
        maxSpeed: 80,
        speedIncrement: 5,
    },
};

/**
 * Game Mode Speed Modifiers
 * Applied as multipliers to base difficulty speed
 */
export const MODE_SPEED_MODIFIERS: Record<string, number> = {
    CLASSIC: 1.0,           // Standard speed
    AI_OBSTACLES: 1.1,      // Slightly slower (more obstacles)
    AI_RIVAL: 1.15,         // Slower (competing with AI)
    ENDLESS: 0.95,          // Slightly faster (no obstacles)
    SPEED_RUN: 0.8,         // Faster base speed (challenge mode)
    SURVIVAL: 1.2,          // Slower (obstacles spawn)
    TIME_ATTACK: 1.0,       // Standard (time pressure is enough)
};

/**
 * Calculate game speed based on difficulty and mode
 */
export function calculateGameSpeed(
    difficulty: DifficultyLevel,
    mode: string,
    level: number = 1
): number {
    const config = DIFFICULTY_SPEED_MAP[difficulty];
    const modeModifier = MODE_SPEED_MODIFIERS[mode] || 1.0;

    // Calculate speed with level progression
    const levelAdjustedSpeed = config.baseSpeed - (level - 1) * config.speedIncrement;

    // Apply mode modifier
    const finalSpeed = Math.round(levelAdjustedSpeed * modeModifier);

    // Clamp to min/max bounds
    return Math.max(config.minSpeed, Math.min(config.maxSpeed, finalSpeed));
}

/**
 * Get speed description for UI
 */
export function getSpeedDescription(speed: number): string {
    if (speed >= 200) return 'SLOW';
    if (speed >= 140) return 'MODERATE';
    if (speed >= 90) return 'FAST';
    if (speed >= 50) return 'VERY FAST';
    return 'EXTREME';
}

/**
 * Default difficulty for new players
 */
export const DEFAULT_DIFFICULTY: DifficultyLevel = 'EASY';

/**
 * Score thresholds for automatic level progression
 */
export const LEVEL_SCORE_THRESHOLDS = [0, 50, 100, 200, 350, 500, 700, 1000];

/**
 * Calculate level based on score
 */
export function calculateLevel(score: number): number {
    for (let i = LEVEL_SCORE_THRESHOLDS.length - 1; i >= 0; i--) {
        if (score >= LEVEL_SCORE_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

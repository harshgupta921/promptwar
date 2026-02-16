/**
 * Background customization system types
 */

export interface BackgroundConfig {
    type: 'default' | 'upload' | 'ai-generated' | 'preset';
    url?: string;
    prompt?: string;
    overlay: {
        darkness: number; // 0-1
        blur: number; // 0-20
    };
    timestamp?: number;
}

export interface AIBackgroundPrompt {
    id: string;
    label: string;
    prompt: string;
    category: 'cyberpunk' | 'retro' | 'space' | 'nature' | 'abstract';
}

export const PRESET_PROMPTS: AIBackgroundPrompt[] = [
    {
        id: 'neon-cyber',
        label: '🌃 Neon Cyberpunk',
        prompt: 'A futuristic neon cyberpunk cityscape with glowing grid lines, purple and cyan colors, digital rain effect, dark background perfect for gaming',
        category: 'cyberpunk'
    },
    {
        id: 'retro-arcade',
        label: '🕹️ Retro Arcade',
        prompt: 'Retro 80s arcade background with pixel art style, geometric patterns, vibrant pink and blue gradients, scanline effects',
        category: 'retro'
    },
    {
        id: 'space-battle',
        label: '🚀 Space Battlefield',
        prompt: 'Deep space battlefield with distant stars, nebula clouds in purple and blue, asteroid field, cosmic energy, dark space background',
        category: 'space'
    },
    {
        id: 'pixel-forest',
        label: '🌲 Pixel Forest',
        prompt: 'Pixel art enchanted forest with glowing mushrooms, fireflies, dark trees, mystical atmosphere, 8-bit style gaming background',
        category: 'nature'
    },
    {
        id: 'synthwave',
        label: '🌅 Synthwave Sunset',
        prompt: 'Synthwave sunset with retro grid floor, palm trees silhouettes, pink and purple gradient sky, 80s aesthetic, vaporwave style',
        category: 'retro'
    },
    {
        id: 'matrix',
        label: '💚 Matrix Code',
        prompt: 'Matrix-style falling green code on black background, digital rain, cyberpunk hacker aesthetic, minimal and clean',
        category: 'cyberpunk'
    },
    {
        id: 'tron',
        label: '⚡ Tron Grid',
        prompt: 'Tron-inspired glowing blue grid on black background, geometric patterns, electric blue lines, futuristic gaming arena',
        category: 'cyberpunk'
    },
    {
        id: 'cosmic',
        label: '🌌 Cosmic Nebula',
        prompt: 'Colorful cosmic nebula with swirling purple, blue, and pink gases, distant stars, deep space, ethereal and mystical',
        category: 'space'
    }
];

export const DEFAULT_BACKGROUND: BackgroundConfig = {
    type: 'default',
    overlay: {
        darkness: 0.3,
        blur: 0
    }
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const BACKGROUND_STORAGE_KEY = 'snake-game-background';

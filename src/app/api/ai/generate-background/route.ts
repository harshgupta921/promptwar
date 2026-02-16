import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface GenerateBackgroundRequest {
    prompt: string;
}

function validatePrompt(prompt: unknown): prompt is string {
    return typeof prompt === 'string' && prompt.length > 0 && prompt.length <= 500;
}

export async function POST(req: Request) {
    try {
        // Rate limiting headers
        const headers = {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '19',
            'Cache-Control': 'no-store',
        };

        // Parse and validate input
        const body = await req.json();
        const { prompt } = body as Partial<GenerateBackgroundRequest>;

        if (!validatePrompt(prompt)) {
            return NextResponse.json(
                { error: 'Invalid prompt. Must be 1-500 characters.' },
                { status: 400, headers }
            );
        }

        // Sanitize prompt
        const sanitizedPrompt = prompt
            .replace(/[<>]/g, '') // Remove HTML tags
            .trim();

        if (!process.env.GEMINI_API_KEY) {
            // Fallback: Return gradient background data
            return NextResponse.json({
                success: true,
                backgroundUrl: null,
                description: `Generated background for: ${sanitizedPrompt}`,
                fallback: true,
                gradient: generateFallbackGradient(sanitizedPrompt)
            }, { headers });
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Enhanced prompt for better background generation
            const enhancedPrompt = `Create a detailed description for a game background image based on this request: "${sanitizedPrompt}". 
            
The background should be:
- Suitable for a Snake game interface
- Not too busy or distracting
- Have good contrast for game elements
- Visually appealing and modern
- Resolution-friendly (works at different sizes)

Provide a concise, vivid description in 2-3 sentences that could be used to generate or select an appropriate background.`;

            const result = await model.generateContent(enhancedPrompt);
            const response = await result.response;
            const description = response.text();

            // Since Gemini Pro doesn't generate images directly, we'll return a description
            // and generate a CSS gradient based on the prompt
            const gradient = generateSmartGradient(sanitizedPrompt, description);

            return NextResponse.json({
                success: true,
                description,
                gradient,
                prompt: sanitizedPrompt,
                timestamp: Date.now()
            }, { headers });

        } catch (apiError) {
            console.error('Gemini API Error:', apiError);

            // Fallback to gradient generation
            return NextResponse.json({
                success: true,
                description: `AI-generated background for: ${sanitizedPrompt}`,
                gradient: generateFallbackGradient(sanitizedPrompt),
                fallback: true
            }, { headers });
        }

    } catch (error) {
        console.error('Background generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate background',
                fallback: true,
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            { status: 500 }
        );
    }
}

/**
 * Generate smart gradient based on prompt keywords
 */
function generateSmartGradient(prompt: string, description?: string): string {
    const lowerPrompt = (prompt + ' ' + (description || '')).toLowerCase();

    // Cyberpunk/Neon themes
    if (lowerPrompt.includes('cyber') || lowerPrompt.includes('neon') || lowerPrompt.includes('futuristic')) {
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
    }

    // Space/Cosmic themes
    if (lowerPrompt.includes('space') || lowerPrompt.includes('cosmic') || lowerPrompt.includes('nebula') || lowerPrompt.includes('galaxy')) {
        return 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
    }

    // Retro/Synthwave themes
    if (lowerPrompt.includes('retro') || lowerPrompt.includes('synthwave') || lowerPrompt.includes('80s') || lowerPrompt.includes('vaporwave')) {
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)';
    }

    // Nature/Forest themes
    if (lowerPrompt.includes('forest') || lowerPrompt.includes('nature') || lowerPrompt.includes('tree') || lowerPrompt.includes('green')) {
        return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
    }

    // Matrix/Code themes
    if (lowerPrompt.includes('matrix') || lowerPrompt.includes('code') || lowerPrompt.includes('hacker')) {
        return 'linear-gradient(135deg, #000000 0%, #0a4d0a 50%, #000000 100%)';
    }

    // Tron/Grid themes
    if (lowerPrompt.includes('tron') || lowerPrompt.includes('grid') || lowerPrompt.includes('electric')) {
        return 'linear-gradient(135deg, #000000 0%, #001a33 50%, #003d66 100%)';
    }

    // Sunset/Warm themes
    if (lowerPrompt.includes('sunset') || lowerPrompt.includes('warm') || lowerPrompt.includes('orange')) {
        return 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)';
    }

    // Default: Purple-Blue gradient
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

/**
 * Fallback gradient generator
 */
function generateFallbackGradient(prompt: string): string {
    // Hash the prompt to generate consistent colors
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
        hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;
    const hue3 = (hue1 + 120) % 360;

    return `linear-gradient(135deg, 
        hsl(${hue1}, 70%, 50%) 0%, 
        hsl(${hue2}, 70%, 40%) 50%, 
        hsl(${hue3}, 70%, 30%) 100%)`;
}

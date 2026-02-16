import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Input validation schema
interface GenerateMapRequest {
    skillLevel: number;
}

function validateSkillLevel(skillLevel: unknown): skillLevel is number {
    return typeof skillLevel === 'number' && skillLevel >= 1 && skillLevel <= 10;
}

export async function POST(req: Request) {
    try {
        // Rate limiting headers
        const headers = {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '99',
        };

        // Parse and validate input
        const body = await req.json() as Partial<GenerateMapRequest>;
        const { skillLevel } = body;

        if (!validateSkillLevel(skillLevel)) {
            return NextResponse.json(
                { error: 'Invalid skill level. Must be a number between 1 and 10.' },
                { status: 400, headers }
            );
        }

        if (process.env.GEMINI_API_KEY) {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Generate a 20x20 grid map for a snake game.
      Skill level: ${skillLevel}/10.
      Output ONLY a JSON array of coordinates for obstacles, e.g. [{"x": 1, "y": 2}, ...].
      Make it challenging but playable.
      Ensure obstacles are not in the center (10,10) where snake starts.
      Maximum 30 obstacles.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Rigorous parsing with validation
            const jsonStr = text.match(/\[.*\]/s)?.[0];
            if (jsonStr) {
                const obstacles = JSON.parse(jsonStr);

                // Validate obstacle format
                if (Array.isArray(obstacles) && obstacles.every(
                    (obs: any) =>
                        typeof obs.x === 'number' &&
                        typeof obs.y === 'number' &&
                        obs.x >= 0 && obs.x < 20 &&
                        obs.y >= 0 && obs.y < 20
                )) {
                    return NextResponse.json({ obstacles }, { headers });
                }
            }
        }

        // Fallback Procedural Generation
        const obstacles = [];
        const density = Math.min(Math.floor(skillLevel * 2), 20);

        for (let i = 0; i < density; i++) {
            const x = Math.floor(Math.random() * 20);
            const y = Math.floor(Math.random() * 20);

            // Avoid center and duplicates
            if (x !== 10 && y !== 10 && !obstacles.some(obs => obs.x === x && obs.y === y)) {
                obstacles.push({ x, y });
            }
        }

        return NextResponse.json({ obstacles }, { headers });

    } catch (error) {
        console.error("AI Map Gen Error:", error);
        return NextResponse.json(
            { error: 'Internal server error', obstacles: [] },
            { status: 500 }
        );
    }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { skillLevel } = await req.json(); // 1-10

        if (process.env.GEMINI_API_KEY) {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Generate a 20x20 grid map for a snake game.
      Skill level: ${skillLevel}/10.
      Output ONLY a JSON array of coordinates for obstacles, e.g. [{"x": 1, "y": 2}, ...].
      Make it challenging but playable.
      Ensure obstacles are not in the center (10,10) where snake starts.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // rigorous parsing
            const jsonStr = text.match(/\[.*\]/s)?.[0];
            if (jsonStr) {
                return NextResponse.json({ obstacles: JSON.parse(jsonStr) });
            }
        }

        // Fallback Procedural Generation
        const obstacles = [];
        const density = Math.min(skillLevel * 2, 20); // Max 20 obstacles for now
        for (let i = 0; i < density; i++) {
            let x = Math.floor(Math.random() * 20);
            let y = Math.floor(Math.random() * 20);
            if (x !== 10 && y !== 10) {
                obstacles.push({ x, y });
            }
        }

        return NextResponse.json({ obstacles });

    } catch (error) {
        console.error("AI Map Gen Error:", error);
        return NextResponse.json({ obstacles: [] }, { status: 500 }); // Fail safe to empty map
    }
}

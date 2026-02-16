import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { event, score } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            // Mock responses
            const mocks: Record<string, string[]> = {
                "start": ["Prove your worth, human.", "Let's see if you can handle this.", "Initiating Snake Protocol v2026."],
                "game_over": ["Pathetic.", "Is that all you've got?", "Better luck next timeline."],
                "score_milestone": ["Impressive... for a biological lifeform.", "Wait, you're actually good?", "Systems destabilizing... play slower!"],
            };
            const key = event as keyof typeof mocks; // Force key
            const options = mocks[key] || ["..."];
            return NextResponse.json({ message: options[Math.floor(Math.random() * options.length)] });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are a sarcastic, futuristic AI narrator for a Snake game.
    The player just triggered event: "${event}". Current score: ${score}.
    Generate a SHORT, witty, one-sentence comment. Be slightly mocking but encouraging if they do well.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json({ message: text });

    } catch (error) {
        return NextResponse.json({ message: "..." }, { status: 500 });
    }
}

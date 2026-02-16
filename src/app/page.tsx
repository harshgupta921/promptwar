import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Globe, Zap, Shield, Play } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <nav className="flex justify-between items-center mb-16">
                    <div className="font-arcade text-2xl text-primary animate-pulse">SNAKE.AI</div>
                    <div className="flex gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/login">LOGIN</Link>
                        </Button>
                        <Button variant="neon" asChild>
                            <Link href="/play">PLAY NOW</Link>
                        </Button>
                    </div>
                </nav>

                <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        SYSTEM UPDATE 2.0.26 LIVE
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 drop-shadow-sm">
                        CLASSIC REBORN <br />
                        <span className="text-primary glow-text">INTELLIGENTLY.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
                        Experience the nostalgic Snake game evolved with Gemini AI.
                        Adaptive difficulty, procedural maps, and an AI rival that learns from you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button size="lg" className="text-lg px-8 py-6 h-auto group bg-primary hover:bg-primary/90 text-black font-bold" asChild>
                            <Link href="/play">
                                ENTER ARENA
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto group border-white/20 hover:bg-white/5" asChild>
                            <Link href="#features">
                                VIEW LEADERBOARD
                            </Link>
                        </Button>
                    </div>
                </section>

                <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <FeatureCard
                        icon={<Cpu className="w-8 h-8 text-primary" />}
                        title="Gemini Powered"
                        description="Maps generated in real-time based on your skill level using advanced LLMs."
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-yellow-400" />}
                        title="Adaptive AI Rival"
                        description="Face off against a neural-network simulated opponent that predicts your moves."
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-blue-400" />}
                        title="Global Rankings"
                        description="Compete daily for the top spot on the secure, verified Firebase leaderboard."
                    />
                </section>

                <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-12 mb-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Evolve?</h2>
                            <p className="text-muted-foreground">Join 10,000+ players in the future of arcade gaming.</p>
                        </div>
                        <Button size="lg" variant="default" className="w-full md:w-auto px-8" asChild>
                            <Link href="/register">CREATE ACCOUNT</Link>
                        </Button>
                    </div>
                </section>

                <footer className="border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <div className="font-arcade text-white mb-4 md:mb-0">SNAKE.AI 2026</div>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
            <div className="mb-4 bg-white/5 w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}

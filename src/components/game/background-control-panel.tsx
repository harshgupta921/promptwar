"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
    Upload,
    Wand2,
    RotateCcw,
    Image as ImageIcon,
    Loader2,
    Sparkles,
    X
} from "lucide-react";
import { BackgroundConfig, PRESET_PROMPTS, MAX_FILE_SIZE, ALLOWED_FORMATS } from "@/types/background";
import { cn } from "@/lib/utils";

interface BackgroundControlPanelProps {
    currentBackground: BackgroundConfig;
    onBackgroundChange: (config: BackgroundConfig) => void;
    onClose?: () => void;
}

export function BackgroundControlPanel({
    currentBackground,
    onBackgroundChange,
    onClose
}: BackgroundControlPanelProps) {
    const [customPrompt, setCustomPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file upload
    const handleFileUpload = useCallback((file: File) => {
        setError(null);

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return;
        }

        // Validate file type
        if (!ALLOWED_FORMATS.includes(file.type)) {
            setError('Invalid format. Use JPG, PNG, or WebP');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setPreview(dataUrl);

            // Apply immediately
            onBackgroundChange({
                type: 'upload',
                url: dataUrl,
                overlay: currentBackground.overlay,
                timestamp: Date.now()
            });
        };
        reader.readAsDataURL(file);
    }, [currentBackground.overlay, onBackgroundChange]);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    // Handle AI generation
    const handleAIGenerate = useCallback(async (prompt: string) => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/generate-background', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate background');
            }

            // Apply gradient background
            onBackgroundChange({
                type: 'ai-generated',
                url: data.gradient,
                prompt: prompt.trim(),
                overlay: currentBackground.overlay,
                timestamp: Date.now()
            });

            setCustomPrompt("");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [currentBackground.overlay, onBackgroundChange]);

    // Handle preset selection
    const handlePresetSelect = useCallback((prompt: string) => {
        handleAIGenerate(prompt);
    }, [handleAIGenerate]);

    // Handle overlay changes
    const handleOverlayChange = useCallback((key: 'darkness' | 'blur', value: number) => {
        onBackgroundChange({
            ...currentBackground,
            overlay: {
                ...currentBackground.overlay,
                [key]: value
            }
        });
    }, [currentBackground, onBackgroundChange]);

    // Reset to default
    const handleReset = useCallback(() => {
        onBackgroundChange({
            type: 'default',
            overlay: { darkness: 0.3, blur: 0 }
        });
        setPreview(null);
        setCustomPrompt("");
        setError(null);
    }, [onBackgroundChange]);

    return (
        <GlassCard className="p-6 space-y-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Background Customization
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Upload your own or generate with AI
                    </p>
                </div>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-500">
                    {error}
                </div>
            )}

            {/* Upload Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Custom Background
                </h3>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-primary/50" />
                    <p className="text-sm text-muted-foreground mb-1">
                        Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP (max 2MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                    />
                </div>
            </div>

            {/* AI Generation Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI Generate Background
                </h3>

                {/* Custom Prompt */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isGenerating) {
                                handleAIGenerate(customPrompt);
                            }
                        }}
                        placeholder="Describe your ideal background..."
                        className="flex-1 px-4 py-2 bg-black/30 border border-primary/30 rounded-lg text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        disabled={isGenerating}
                    />
                    <Button
                        onClick={() => handleAIGenerate(customPrompt)}
                        disabled={isGenerating || !customPrompt.trim()}
                        className="shrink-0"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Wand2 className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Preset Prompts */}
                <div className="grid grid-cols-2 gap-2">
                    {PRESET_PROMPTS.map((preset) => (
                        <Button
                            key={preset.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetSelect(preset.prompt)}
                            disabled={isGenerating}
                            className="justify-start text-xs"
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Overlay Controls */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                    Overlay Settings
                </h3>

                {/* Darkness Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Darkness</span>
                        <span>{Math.round(currentBackground.overlay.darkness * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentBackground.overlay.darkness * 100}
                        onChange={(e) => handleOverlayChange('darkness', parseInt(e.target.value) / 100)}
                        className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>

                {/* Blur Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Blur</span>
                        <span>{currentBackground.overlay.blur}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        value={currentBackground.overlay.blur}
                        onChange={(e) => handleOverlayChange('blur', parseInt(e.target.value))}
                        className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                </Button>
            </div>
        </GlassCard>
    );
}

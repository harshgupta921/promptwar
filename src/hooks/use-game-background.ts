import { useState, useEffect, useCallback } from "react";
import { BackgroundConfig, DEFAULT_BACKGROUND, BACKGROUND_STORAGE_KEY } from "@/types/background";

export function useGameBackground() {
    const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
    const [isLoading, setIsLoading] = useState(true);

    // Load background from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(BACKGROUND_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as BackgroundConfig;
                setBackground(parsed);
            }
        } catch (error) {
            console.error('Failed to load background:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save background to localStorage whenever it changes
    const updateBackground = useCallback((config: BackgroundConfig) => {
        setBackground(config);
        try {
            localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save background:', error);
        }
    }, []);

    // Get CSS styles for the background
    const getBackgroundStyle = useCallback((): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: 'relative',
            overflow: 'hidden',
        };

        if (background.type === 'default') {
            return {
                ...baseStyle,
                background: 'linear-gradient(to bottom, #0a0a0f, #1a1a2e)',
            };
        }

        if (background.type === 'upload' && background.url) {
            return {
                ...baseStyle,
                backgroundImage: `url(${background.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            };
        }

        if (background.type === 'ai-generated' && background.url) {
            return {
                ...baseStyle,
                background: background.url, // This will be a gradient
            };
        }

        return baseStyle;
    }, [background]);

    // Get overlay style
    const getOverlayStyle = useCallback((): React.CSSProperties => {
        return {
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${background.overlay.darkness})`,
            backdropFilter: background.overlay.blur > 0 ? `blur(${background.overlay.blur}px)` : undefined,
            pointerEvents: 'none',
        };
    }, [background.overlay]);

    return {
        background,
        updateBackground,
        getBackgroundStyle,
        getOverlayStyle,
        isLoading,
    };
}

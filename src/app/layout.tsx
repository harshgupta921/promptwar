import type { Metadata } from 'next';
import { Inter, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import { ThemeProvider } from '@/components/theme-provider'; // We will create this

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const pressStart2P = Press_Start_2P({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-arcade', // Custom CSS variable for arcade font
});

export const metadata: Metadata = {
    title: 'AI Snake 2026',
    description: 'Futuristic evolution of Snake with AI features.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={clsx(inter.variable, pressStart2P.variable, 'bg-background text-foreground antialiased overflow-hidden text-sm sm:text-base')}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

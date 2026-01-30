import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeColors {
    obsidian: string;
    bone: string;
    amber_chrome: string;
}

interface ThemeContextType {
    colors: ThemeColors;
    updateColors: (newColors: Partial<ThemeColors>) => void;
    resetColors: () => void;
}

const defaultColors: ThemeColors = {
    obsidian: '#020617',
    bone: '#f8fafc',
    amber_chrome: '#f59e0b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colors, setColors] = useState<ThemeColors>(() => {
        const saved = localStorage.getItem('theme_colors');
        return saved ? JSON.parse(saved) : defaultColors;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--obsidian', colors.obsidian);
        root.style.setProperty('--bone', colors.bone);
        root.style.setProperty('--amber-chrome', colors.amber_chrome);
        localStorage.setItem('theme_colors', JSON.stringify(colors));
    }, [colors]);

    const updateColors = (newColors: Partial<ThemeColors>) => {
        setColors(prev => ({ ...prev, ...newColors }));
    };

    const resetColors = () => {
        setColors(defaultColors);
    };

    return (
        <ThemeContext.Provider value={{ colors, updateColors, resetColors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (undefined === context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

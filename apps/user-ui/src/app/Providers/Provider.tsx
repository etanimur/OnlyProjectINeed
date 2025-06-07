'use client';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React, { useState } from 'react';

const queryClient = new QueryClient();
// const [queryClient] = useState(() => new QueryClient());
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </QueryClientProvider>
        // <ThemeProvider attribute={'class'} defaultTheme="system" enableSystem>
        // </ThemeProvider>
    );
}

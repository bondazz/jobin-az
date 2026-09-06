"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { I18nProvider } from "@/components/I18nProvider";
import { Locale } from "@/lib/i18n/config";

interface ProvidersProps {
    children: React.ReactNode;
    locale?: Locale;
}

export function Providers({ children, locale }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <I18nProvider initialLocale={locale}>
                    {children}
                </I18nProvider>
                <Toaster />
                <Sonner />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

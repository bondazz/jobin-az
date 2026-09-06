"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCcw, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MobileHeader from "@/components/MobileHeader";

const PaymentErrorClient = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <MobileHeader />
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
                {/* Desktop */}
                <div className="hidden xl:flex h-screen overflow-y-auto items-center justify-center">
                    <ErrorContent mounted={mounted} />
                </div>
                {/* Mobile */}
                <div className="xl:hidden pt-16 pb-20 px-4 h-screen overflow-auto flex items-center justify-center">
                    <ErrorContent mounted={mounted} />
                </div>
            </div>
        </>
    );
};

const ErrorContent = ({ mounted }: { mounted: boolean }) => (
    <div className="w-full max-w-lg mx-auto px-4">
        <Card className={`shadow-xl border-0 bg-card/95 backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardContent className="p-8 text-center space-y-6">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-destructive" />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Ödəniş Uğursuz Oldu
                    </h1>
                    <p className="text-muted-foreground">
                        Ödəniş zamanı xəta baş verdi. Kartınızdan heç bir məbləğ tutulmayıb.
                    </p>
                </div>

                {/* Possible Reasons */}
                <div className="text-left p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-sm font-medium text-foreground mb-2">Mümkün səbəblər:</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                        <li>Kartda kifayət qədər balans yoxdur</li>
                        <li>Kart məlumatları səhv daxil edilib</li>
                        <li>Bank tərəfindən əməliyyat rədd edilib</li>
                        <li>İnternet bağlantısında problem yaranıb</li>
                        <li>3D Secure təsdiqləmə tamamlanmayıb</li>
                    </ul>
                </div>

                {/* Contact Support */}
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-foreground">Dəstək üçün əlaqə:</p>
                    <div className="flex flex-col gap-2">
                        <a href="mailto:info@jooble.az" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                            <Mail className="w-4 h-4" />
                            info@jooble.az
                        </a>
                        <a href="https://wa.me/994553411011" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                            <Phone className="w-4 h-4" />
                            055 341 10 11
                        </a>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <Link href="/add_job">
                        <Button className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-semibold">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Yenidən Cəhd Et
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ana Səhifəyə Qayıt
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default PaymentErrorClient;

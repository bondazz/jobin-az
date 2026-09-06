"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, FileText, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MobileHeader from "@/components/MobileHeader";

const PaymentSuccessClient = () => {
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
                    <SuccessContent mounted={mounted} />
                </div>
                {/* Mobile */}
                <div className="xl:hidden pt-16 pb-20 px-4 h-screen overflow-auto flex items-center justify-center">
                    <SuccessContent mounted={mounted} />
                </div>
            </div>
        </>
    );
};

const SuccessContent = ({ mounted }: { mounted: boolean }) => (
    <div className="w-full max-w-lg mx-auto px-4">
        <Card className={`shadow-xl border-0 bg-card/95 backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardContent className="p-8 text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Ödəniş Uğurla Tamamlandı!
                    </h1>
                    <p className="text-muted-foreground">
                        Müraciətiniz qəbul edildi və komandamız tərəfindən yoxlanılacaq.
                    </p>
                </div>

                {/* Info Steps */}
                <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Elan yoxlanılır</p>
                            <p className="text-xs text-muted-foreground">İş elanınız komandamız tərəfindən nəzərdən keçirilir.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">24 saat ərzində</p>
                            <p className="text-xs text-muted-foreground">Elanınız yoxlanıldıqdan sonra 24 saat ərzində yayımlanacaq.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Bildiriş alacaqsınız</p>
                            <p className="text-xs text-muted-foreground">Elanınız yayımlandıqda sizinlə əlaqə saxlanılacaq.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <Link href="/">
                        <Button className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-semibold">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ana Səhifəyə Qayıt
                        </Button>
                    </Link>
                    <Link href="/add_job">
                        <Button variant="outline" className="w-full">
                            Yeni Elan Yerləşdir
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default PaymentSuccessClient;

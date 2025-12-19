"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import MainSidebar from "@/components/MainSidebar";
import MobileHeader from "@/components/MobileHeader";
import BottomNavigation from "@/components/BottomNavigation";

interface Region {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  h1_title: string | null;
  icon: string | null;
}

interface RegionDetailClientProps {
  regionSlug: string;
}

export default function RegionDetailClient({ regionSlug }: RegionDetailClientProps) {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchRegion();
  }, [regionSlug]);

  const fetchRegion = async () => {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("slug", regionSlug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setRegion(data);
    } catch (error) {
      console.error("Error fetching region:", error);
      toast({
        title: "Xəta",
        description: "Region məlumatları yüklənərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Region tapılmadı</h1>
          <p className="text-muted-foreground mb-4">Bu region mövcud deyil və ya deaktiv edilib.</p>
          <Button onClick={() => router.push("/regions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Regionlara qayıt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <MainSidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Region Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  {region.icon ? (
                    <DynamicIcon name={region.icon} className="h-8 w-8 text-primary" />
                  ) : (
                    <MapPin className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {region.h1_title || `${region.name} İş Elanları`}
                  </h1>
                  <p className="text-muted-foreground">
                    {region.name} regionunda aktual vakansiyalar
                  </p>
                </div>
              </div>

              {region.description && (
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: region.description }}
                />
              )}
            </div>

            {/* Info about searching by location */}
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                {region.name} regionunda iş tapmaq üçün axtarış sahəsində "{region.name}" yazın
              </p>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}

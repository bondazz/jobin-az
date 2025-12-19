"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Search,
  ArrowLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import MainSidebar from "@/components/MainSidebar";
import MobileHeader from "@/components/MobileHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { useReferralCode } from "@/hooks/useReferralCode";

interface Region {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  h1_title: string | null;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
}

export default function RegionsClient() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { getUrlWithReferral } = useReferralCode();

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast({
        title: "Xəta",
        description: "Regionları yükləyərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      <MainSidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Regionlar üzrə Vakansiyalar
              </h1>
              <p className="text-muted-foreground">
                Azərbaycanın müxtəlif regionlarında iş elanları tapın
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Region axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Regions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRegions.map((region) => (
                    <Link
                      key={region.id}
                      href={getUrlWithReferral(`/regions/${region.slug}`)}
                      prefetch={true}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              {region.icon ? (
                                <DynamicIcon
                                  name={region.icon}
                                  className="h-6 w-6 text-primary"
                                />
                              ) : (
                                <MapPin className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {region.name}
                              </h3>
                              {region.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {region.description.replace(/<[^>]*>/g, '').substring(0, 80)}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Empty State */}
                {filteredRegions.length === 0 && (
                  <div className="text-center py-16">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Region tapılmadı
                    </h3>
                    <p className="text-muted-foreground">
                      Axtarış sorğunuza uyğun region tapılmadı.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import AdBanner from "@/components/AdBanner";
import { AnimatedStatsCard } from "@/components/ui/animated-stats-card";
import {
  Briefcase,
  Tag,
  Building,
  MapPin,
  Bookmark,
  Bell,
  TrendingUp,
  Info,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Share2,
  Rss,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useReferralCode } from "@/hooks/useReferralCode";

const MainSidebar = () => {
  const pathname = usePathname();
  const { getUrlWithReferral } = useReferralCode();

  // Get saved jobs count
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateSavedJobsCount = () => {
      try {
        const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setSavedJobsCount(savedJobs.length);
      } catch (error) {
        console.error("Error reading saved jobs:", error);
      }
    };

    updateSavedJobsCount();

    // Listen for storage changes
    window.addEventListener("storage", updateSavedJobsCount);
    return () => window.removeEventListener("storage", updateSavedJobsCount);
  }, [isClient]);

  const menuItems = [
    {
      icon: Briefcase,
      label: "Vakansiyalar",
      path: "/vacancies",
      count: null,
    },
    {
      icon: Tag,
      label: "Kateqoriyalar",
      path: "/categories",
      count: null,
    },
    {
      icon: MapPin,
      label: "Regionlar",
      path: "/regions",
      count: null,
    },
    {
      icon: Building,
      label: "Şirkətlər",
      path: "/companies",
      count: null,
    },
    {
      icon: Bookmark,
      label: "Seçilmiş elanlar",
      path: "/favorites",
      count: savedJobsCount,
    },
    {
      icon: Rss,
      label: "Abunə ol",
      path: "/subscribe",
      count: null,
    },
    {
      icon: DollarSign,
      label: "Qiymətlər",
      path: "/services",
      count: null,
    },
    {
      icon: Share2,
      label: "Referral",
      path: "/referral",
      count: null,
    },
    {
      icon: FileText,
      label: "Elan yerləşdir",
      path: "/add_job",
      count: null,
    },
    {
      icon: Info,
      label: "Haqqında",
      path: "/about",
      count: null,
    },
  ];

  const isActivePath = (path: string) => {
    if (path === "/vacancies") return pathname === "/" || pathname === "/vacancies";
    return pathname?.startsWith(path) || false;
  };

  // Statistics data - fetch from database
  const [dailyJobCount, setDailyJobCount] = useState(0);
  const [monthlyJobCount, setMonthlyJobCount] = useState(0);

  // Fetch statistics from database
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Get today's date
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Get first day of current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch daily count
      const { count: dailyCount } = await supabase
        .from("jobs")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("is_active", true)
        .gte("created_at", startOfDay.toISOString());

      // Fetch monthly count
      const { count: monthlyCount } = await supabase
        .from("jobs")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("is_active", true)
        .gte("created_at", startOfMonth.toISOString());

      setDailyJobCount(dailyCount || 0);
      setMonthlyJobCount(monthlyCount || 0);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Fallback values
      setDailyJobCount(127);
      setMonthlyJobCount(3420);
    }
  };

  return (
    <aside className="hidden lg:flex w-64 bg-gradient-to-b from-job-sidebar to-job-sidebar/80 border-r border-border/60 flex-col h-full backdrop-blur-sm">
      {/* Logo & Branding */}
      <div className="p-4 border-b border-border/40 bg-gradient-to-r from-job-sidebar/90 to-primary/5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <img
              src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png"
              alt="Jooble"
              width={143}
              height={40}
              className="object-contain dark:brightness-0 dark:invert"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Ana menyu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          return (
          <Link
              key={item.path}
              href={getUrlWithReferral(item.path)}
              prefetch={true}
              className={`
                flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-300 group relative overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-lg shadow-primary/25"
                    : "hover:bg-gradient-to-r hover:from-primary/15 hover:via-accent/10 hover:to-transparent hover:shadow-sm text-foreground/80 hover:text-foreground"
                }
              `}
            >
              {/* Aktiv element üçün parıltı effekti */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none" />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-white/25 shadow-inner" 
                      : "bg-gradient-to-br from-primary/15 to-accent/10 group-hover:from-primary/25 group-hover:to-accent/20 group-hover:scale-105"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? "text-white" : "text-primary group-hover:scale-110"}`} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {item.path === "/add_job" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
              </div>
              {item.count !== null && item.count > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`ml-auto text-xs px-1.5 py-0.5 relative z-10 ${
                    isActive ? "bg-white/25 text-white border-white/40" : "bg-gradient-to-r from-primary/15 to-accent/10 text-primary border-primary/25"
                  }`}
                >
                  {item.count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-border/40" />

      {/* Statistics Section */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <AnimatedStatsCard variant="primary">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Günlük</span>
            </div>
            <div className="text-lg font-bold text-primary leading-none">{dailyJobCount}</div>
          </AnimatedStatsCard>

          <AnimatedStatsCard variant="accent">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Aylıq</span>
            </div>
            <div className="text-lg font-bold text-accent leading-none">{monthlyJobCount}</div>
          </AnimatedStatsCard>
        </div>

        {/* Sidebar Advertisements */}
        <AdBanner position="sidebar" className="mt-0" />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/40 bg-gradient-to-r from-job-sidebar/90 to-transparent">
        {/* Social Media Links */}
        <nav
          className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-border/40"
          aria-label="Sosial media bağlantıları"
        >
          {/* WhatsApp */}
          <a
            href="https://wa.me/994553411011"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-8 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/jooble.az"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-lg bg-[#E1306C]/10 text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#bc1888] hover:to-[#cc2366] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <Instagram className="w-4 h-4" />
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/joobleaz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="w-8 h-8 rounded-lg bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <Send className="w-4 h-4" />
          </a>

          {/* Threads */}
          <a
            href="https://threads.net/@jooble.az"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads"
            className="w-8 h-8 rounded-lg bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillOpacity=".1" d="m98.4 59.2-2.9 3.3 3.3-2.9c1.7-1.7 3.2-3.1 3.2-3.3 0-.8-.8-.1-3.6 2.9m29.5 35.5-2.4 2.8 2.8-2.4c2.5-2.3 3.2-3.1 2.4-3.1-.2 0-1.4 1.2-2.8 2.7M394.5 96c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-183.6 86.7c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3M374 232.9c0 .6.4 1.3 1 1.6s.7-.1.4-.9c-.7-1.8-1.4-2.1-1.4-.7m-161 97.5c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-35 29.9c0 .2 1.5 1.6 3.3 3.3l3.2 2.9-2.9-3.3c-2.8-3-3.6-3.7-3.6-2.9M130.5 420c2.1 2.2 4.1 4 4.4 4s-1.3-1.8-3.4-4-4.1-4-4.4-4 1.3 1.8 3.4 4M96 450.3c0 .2 1.5 1.6 3.3 3.3l3.2 2.9-2.9-3.3c-2.8-3-3.6-3.7-3.6-2.9"/>
              <path fillOpacity=".2" d="M257.8 45.7c1.8.2 4.5.2 6 0s0-.4-3.3-.4-4.5.2-2.7.4m-44.4 236.5-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2M413.2 355c0 1.9.2 2.7.5 1.7.2-.9.2-2.5 0-3.5-.3-.9-.5-.1-.5 1.8m3.3 99.2-4 4.3 4.3-4c2.3-2.1 4.2-4 4.2-4.2 0-.8-.9 0-4.5 3.9m-157.7 12.5c1.2.2 3 .2 4 0 .9-.3-.1-.5-2.3-.4-2.2 0-3 .2-1.7.4"/>
              <path fillOpacity=".3" d="M252.8 45.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m14 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6M31.2 244.5c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m391.8 22c1.3 1.4 2.6 2.5 2.8 2.5.3 0-.5-1.1-1.8-2.5s-2.6-2.5-2.8-2.5c-.3 0 .5 1.1 1.8 2.5m-391.8 1c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m172 39.5c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m209.9 43.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m-76.2 11.1-2.4 2.8 2.8-2.4c2.5-2.3 3.2-3.1 2.4-3.1-.2 0-1.4 1.2-2.8 2.7m-82.1 105c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m10 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"/>
              <path fillOpacity=".4" d="M248.8 45.7c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m22 172c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m20 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5M31.2 249c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m0 14c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m225.6 83.7c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m-6.5 120c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5m17.5 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5"/>
              <path fillOpacity=".5" d="M253.8 119.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m9 45c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m12 53c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m13 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6M31.3 256c0 3 .2 4.3.4 2.7.2-1.5.2-3.9 0-5.5-.2-1.5-.4-.2-.4 2.8m44.9 0c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3M388 295.4c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-127.2 51.3c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"/>
              <path fillOpacity=".6" d="M245.8.7c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m12.5 119c1.5.2 3.9.2 5.5 0 1.5-.2.2-.4-2.8-.4s-4.3.2-2.7.4m-2.5 45c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m24.5 53c1.5.2 3.7.2 5 0 1.2-.2 0-.4-2.8-.4-2.7 0-3.8.2-2.2.4M76.2 251.5c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m0 8.5c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m200.6 2.7c2.3.2 6.1.2 8.5 0 2.3-.2.4-.4-4.3-.4s-6.6.2-4.2.4m-21.5 129c1.5.2 3.9.2 5.5 0 1.5-.2.2-.4-2.8-.4s-4.3.2-2.7.4m128.6 31-2.4 2.8 2.8-2.4c2.5-2.3 3.2-3.1 2.4-3.1-.2 0-1.4 1.2-2.8 2.7m-138.1 89c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5"/>
              <path fillOpacity=".7" d="M249.8.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6M423.5 61c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2M76.2 247c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m105.7 2.7c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3M76.2 264.5c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m81.9 38.1c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m0 8c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M93 446.4c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m156.8 65.3c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m20 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"/>
              <path fillOpacity=".8" d="M252.8.7c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m13.5 0c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5M99 59.5C96.6 62 94.8 64 95.1 64s2.5-2 4.9-4.5 4.2-4.5 3.9-4.5-2.5 2-4.9 4.5m30.9 32.2-3.4 3.8 3.8-3.4c2-1.9 3.7-3.6 3.7-3.8 0-.8-.8 0-4.1 3.4m262.1.8c1.9 1.9 3.6 3.5 3.9 3.5s-1-1.6-2.9-3.5-3.6-3.5-3.9-3.5 1 1.6 2.9 3.5m-214.1 59.2-2.4 2.8 2.8-2.4c2.5-2.3 3.2-3.1 2.4-3.1-.2 0-1.4 1.2-2.8 2.7m31.5 31.5-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2M76.1 243.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m215.7 19.1c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m-215.7 5.9c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m82.1 37.9c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m54.3 24.5c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m245.7 20c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m-.1 8.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M182 363.4c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3M130.5 421c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-31 32c2.1 2.2 4.1 4 4.4 4s-1.3-1.8-3.4-4-4.1-4-4.4-4 1.3 1.8 3.4 4m310.4 6.7c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3m-157.1 52c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m12.5 0c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5"/>
              <path fillOpacity=".9" d="M256.8.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m5 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5M414 52.4c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3M135.4 86.2l-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2m251.1.8c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-261.6 9.7c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3M397.5 98c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-184.6 81.7c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3m95.1-.3c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-102.1 7.3c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3M32.1 235.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M422 266.5c3 3 5.7 5.5 5.9 5.5.3 0-1.9-2.5-4.9-5.5s-5.7-5.5-5.9-5.5c-.3 0 1.9 2.5 4.9 5.5M32.1 276.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m180.8 5.1-2.4 2.8 2.8-2.4c2.5-2.3 3.2-3.1 2.4-3.1-.2 0-1.4 1.2-2.8 2.7m245.3 73.8c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8m-121.7 5.7-5 5.3 5.3-5c2.8-2.7 5.2-5.1 5.2-5.2 0-.8-.9.1-5.5 4.9M126 416.5c1.3 1.4 2.6 2.5 2.8 2.5.3 0-.5-1.1-1.8-2.5s-2.6-2.5-2.8-2.5c-.3 0 .5 1.1 1.8 2.5m8.5 8.5c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2M416 453.5c-2.4 2.5-4.2 4.5-3.9 4.5s2.5-2 4.9-4.5 4.2-4.5 3.9-4.5-2.5 2-4.9 4.5m-159.2 58.2c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m4 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5"/>
              <path d="M245 1.1c-60.7 2.8-112.1 24-147.5 61C61.8 99.3 40.8 150.5 33.8 217c-1.6 15.8-1.6 62.7 0 78 10.4 96.5 50.1 161.6 118.4 193.9 32.6 15.5 65.5 22.2 108.7 22.1 65.5 0 113.3-17.1 151.9-54.4 22.4-21.6 35.1-43.1 42.4-72.1 2.9-11.6 3.6-37.8 1.4-50.9-4.7-27.3-14.9-47.2-34.5-66.7-11.4-11.5-24-20.5-39.3-28l-8.7-4.3-.6-4.6c-3-25.1-6.4-38.1-14-53.5-19-38.5-54.5-57.8-103.5-56.2-28.7 1-51.1 9.1-70.7 25.6-5.9 4.9-19.3 19.7-19.3 21.1.1.4 12.5 8.9 34.5 23.5 1.1.7 2.7-.5 7-5.2 13.6-15.1 34.5-22.4 59.4-21 30.3 1.8 48.3 14.7 57.1 40.9 1.5 4.6 3.1 10.1 3.5 12.2l.6 3.9-5.3-.7c-26.3-3.2-61-3.3-77.7-.2-26.8 4.9-46.9 14.5-62.2 29.6-15.7 15.5-23.9 34.8-23.9 56.5.1 26 10.9 47.8 31.9 63.7 35.9 27.2 96.4 27.8 133.6 1.3 8.3-5.9 20.3-18.5 25.9-27.3 8.8-13.5 15.1-30 19.1-49.6 1.5-7.2 2.7-11 3.5-10.8 5.7 1.3 23.7 18.2 29.8 27.8 8 12.6 11.7 29 10.9 47.5-1.1 26.1-10.9 46.4-32 66.5C351.6 454.2 314.3 467 261 467c-92.2 0-150.7-41.9-173.8-124.5-7.5-26.5-10.6-52-10.6-86 0-51.9 7.3-88.4 24.9-124 20.9-42.1 53.3-68.3 99.6-80.5 20.2-5.3 30.8-6.4 58.9-6.5 28 0 38.4 1.1 59.4 6.4 55.9 14.1 95.4 51.8 114.2 109 2.2 6.4 3.9 11.7 3.9 11.8 0 .2 41.6-11.5 42-11.9 1.1-1-9.4-28.9-15.9-42.3-27.5-56.9-73-93.8-134.7-109.4-18.5-4.7-33.7-7-50.8-7.7-6.9-.2-13.9-.6-15.6-.7-1.6-.2-9.5 0-17.5.4m70.5 263.4c14.7 2.3 13.8 1.6 13 8.8-5.6 51-30.8 75.7-74.5 73.4-18.2-1-31.4-6-40.8-15.4-7.7-7.7-9.7-12.6-9.7-24.3 0-7.7.4-10.4 2.2-14.3 7.5-16.1 26.3-26.6 53.3-29.6 11.6-1.3 44.3-.5 56.5 1.4"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/people/joobleaz/61582558110105"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-8 h-8 rounded-lg bg-[#1877f2]/10 text-[#1877f2] hover:bg-[#1877f2] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.42H7.078V12h3.047V9.357c0-3.007 1.802-4.665 4.524-4.665 1.314 0 2.438.232 2.768.336v3.018h-1.792c-1.401 0-1.675.668-1.675 1.64v2.13h3.327l-.54 3.435h-2.787v6.435C19.612 22.954 24 17.99 24 12 24 5.373 18.627 0 12 0z" />
            </svg>
          </a>
        </nav>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <span className="font-medium text-sm text-foreground">Mövzu</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="font-medium">
              © 2024-2026{" "}
              <a href="https://jooble.az" target="_blank" className="text-primary hover:underline">
                Jooble.az
              </a>
              . İş elanları və vakansiyalar
            </span>
          </div>
          <a
            href="https://storage.jooble.az/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-all duration-200 border border-primary/20"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sitemap
          </a>
        </div>
      </div>
    </aside>
  );
};

export default MainSidebar;

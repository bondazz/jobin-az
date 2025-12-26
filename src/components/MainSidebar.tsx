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
                flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gradient-primary text-white shadow-md"
                    : "hover:bg-accent/60 hover:shadow-sm text-foreground/80 hover:text-foreground"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {item.path === "/add_job" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </div>
              {item.count !== null && item.count > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`ml-auto text-xs px-1.5 py-0.5 ${
                    isActive ? "bg-white/20 text-white border-white/30" : "bg-primary/10 text-primary border-primary/30"
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
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-xl p-2 text-center hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Günlük</span>
            </div>
            <div className="text-lg font-bold text-primary leading-none">{dailyJobCount}</div>
          </div>

          <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/10 rounded-xl p-2 text-center hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Aylıq</span>
            </div>
            <div className="text-lg font-bold text-accent leading-none">{monthlyJobCount}</div>
          </div>
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
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.186 3.65c-.533.008-1.068.036-1.597.082-1.731.152-3.291.673-4.543 1.926C4.793 6.911 4.271 8.471 4.119 10.202c-.045.53-.073 1.065-.082 1.598-.008.533-.008 1.067 0 1.6.009.533.037 1.068.082 1.597.152 1.731.674 3.291 1.927 4.543 1.252 1.253 2.812 1.775 4.543 1.927.53.045 1.064.073 1.597.082.533.008 1.067.008 1.6 0 .533-.009 1.068-.037 1.597-.082 1.731-.152 3.291-.674 4.543-1.927 1.253-1.252 1.775-2.812 1.927-4.543.045-.53.073-1.064.082-1.597.008-.533.008-1.067 0-1.6-.009-.533-.037-1.068-.082-1.598-.152-1.731-.674-3.291-1.927-4.543-1.252-1.253-2.812-1.774-4.543-1.926-.529-.046-1.064-.074-1.597-.082-.533-.009-1.067-.009-1.6 0zm-.386 1.5c.462-.007.933-.007 1.4 0 .467.007.938.032 1.4.07 1.447.127 2.549.531 3.413 1.396.864.864 1.269 1.966 1.396 3.413.038.462.063.933.07 1.4.007.467.007.938 0 1.4-.007.462-.032.938-.07 1.4-.127 1.447-.532 2.549-1.396 3.413-.864-.864-1.269-1.966-1.396-3.413-.038-.462-.063-.938-.07-1.4-.007-.462-.007-.933 0-1.4.007-.467.032-.938.07-1.4.127-1.447.532-2.549 1.396-3.413.864-.864 1.966-1.269 3.413-1.396.462-.038.933-.063 1.4-.07z" />
              <path d="M15.883 8.917c-.776-.464-1.694-.667-2.683-.667-2.3 0-3.95 1.383-4.1 3.467h1.533c.1-1.217.95-2.05 2.567-2.05.733 0 1.35.167 1.783.467.417.283.667.7.667 1.183 0 .517-.25.917-.7 1.15-.3.15-.717.25-1.283.317l-.917.1c-1.3.15-2.183.5-2.783 1.05-.683.633-1.033 1.5-1.033 2.517 0 1.05.383 1.883 1.1 2.5.717.6 1.667.9 2.817.9 1.283 0 2.333-.383 3.067-1.117.283-.283.5-.6.667-.95.033.65.15 1.15.35 1.5h1.7c-.283-.433-.45-1.117-.45-2.05V11.4c0-1.1-.417-1.983-1.2-2.483zm-.717 5.05c0 .783-.283 1.433-.817 1.917-.55.5-1.283.75-2.2.75-.667 0-1.183-.15-1.55-.45-.367-.3-.55-.7-.55-1.2 0-.55.183-.983.55-1.267.367-.3.933-.5 1.667-.6l1.333-.15c.567-.067 1.017-.183 1.35-.35.15-.067.217-.15.217-.25v1.6z" />
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
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="font-medium">
              © 2024-2026{" "}
              <a href="https://jooble.az" target="_blank" className="text-primary hover:underline">
                Jooble.az
              </a>
              . İş elanları və vakansiyalar
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MainSidebar;

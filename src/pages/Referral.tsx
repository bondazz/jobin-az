import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/components/ui/use-toast";
import { updatePageMeta } from "@/utils/seo";
import { Trash2, ChevronDown, CreditCard, Banknote, Smartphone } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import MobileHeader from "@/components/MobileHeader";
import { useReferralCode } from "@/hooks/useReferralCode";
import ReferralProfile from "@/components/ReferralProfile";

interface ReferralRequestForm {
  company_name: string;
  contact_name: string;
  contact_email: string;
  phone: string;
  job_title: string;
  message: string;
}

const maskCardForUser = (digits: string) => {
  const clean = digits.replace(/\D/g, "");
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
};

const formatCardInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const parts = digits.match(/.{1,4}/g) || [];
  return parts.join(" ");
};

const formatM10Input = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 8);
  const p4 = digits.slice(8, 10);
  return [p1, p2, p3, p4].filter(Boolean).join(" ");
};

const Referral = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const { referralCode: storedReferralCode } = useReferralCode();

  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [referralCode, setReferralCode] = useState<string>("");
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  const [walletCard, setWalletCard] = useState("");
  const [walletM10, setWalletM10] = useState("");
  const [wallets, setWallets] = useState<{ id: string; card_number: string | null; m10_number: string | null }[]>([]);

  const [withdrawMethod, setWithdrawMethod] = useState<"card" | "m10">("card");
  const [withdrawDest, setWithdrawDest] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawals, setWithdrawals] = useState<{ id: string; status: string; amount: number; method: string; destination: string; created_at: string; admin_comment?: string }[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Collapsible states
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const [reqForm, setReqForm] = useState<ReferralRequestForm>({
    company_name: "",
    contact_name: "",
    contact_email: "",
    phone: "",
    job_title: "",
    message: "",
  });

  // SEO
  useEffect(() => {
    updatePageMeta({
      title: "Referral proqramı – Qazanc əldə edin | Jooble.az",
      description: "Referral ilə qazanc: linkinizi paylaşın, hər təsdiqlənən elana görə 5 AZN qazanın.",
      keywords: "referral, qazanc, əməkdaşlıq, elan, Jooble",
      url: "/referral",
    });
  }, []);

  // Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handle incoming referral click
  useEffect(() => {
    if (!refCode) return;
    const key = `ref_seen_${refCode}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    (async () => {
      try {
        await supabase.rpc("log_referral_click" as any, { code: refCode, ua: navigator.userAgent } as any);
      } catch (e) {
        // ignore
      }
    })();
  }, [refCode]);

  // Ensure user has a referral code and load stats
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      
      // Get existing referral and stats (should only be one now due to unique constraint)
      const { data: existing } = await supabase
        .from("referrals")
        .select("code, earnings_azn")
        .eq("user_id", user.id)
        .single();

      if (existing?.code) {
        setReferralCode(existing.code);
        setBalance(Number(existing.earnings_azn || 0));
      } else {
        // If no referral exists (shouldn't happen with trigger), create one
        const base = (user.id || "").replace(/-/g, "").slice(0, 6);
        const rand = Math.random().toString(36).slice(2, 6);
        const newCode = `${base}${rand}`;
        
        const { data: created, error } = await supabase
          .from("referrals")
          .insert({ user_id: user.id, code: newCode })
          .select("code, earnings_azn")
          .single();
          
        if (error) {
          console.error("Error creating referral:", error);
          toast({ title: "Xəta", description: "Referral kodu yaradılmadı." });
        } else if (created) {
          setReferralCode(created.code);
          setBalance(Number(created.earnings_azn || 0));
        }
      }

      // approved job submissions count
      const { count: appCount } = await supabase
        .from("referral_job_submissions")
        .select("*", { count: "exact", head: true })
        .eq("referral_user_id", user.id)
        .eq("status", "published");
      setApprovedCount(appCount || 0);

      // wallets
      const { data: ws } = await supabase
        .from("wallets")
        .select("id, card_number, m10_number")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWallets(ws || []);

      // withdrawals
      const { data: wd } = await supabase
        .from("withdrawals")
        .select("id, status, amount, method, destination, created_at, admin_comment")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWithdrawals((wd || []) as any);

      // profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name, full_name, avatar_url, background_image")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Set the profile data, with fallbacks for display
      const displayFirstName = prof?.first_name || "";
      const displayLastName = prof?.last_name || "";
      const displayFullName = prof?.full_name || (displayFirstName || displayLastName ? `${displayFirstName} ${displayLastName}`.trim() : "");
      
      setFirstName(displayFirstName);
      setLastName(displayLastName);
      setFullName(displayFullName);
      setAvatarUrl(prof?.avatar_url || null);
      setBackgroundImageUrl(prof?.background_image || null);
    };
    init();
  }, [user]);

  // Auto-fill withdrawal destination based on method and saved wallets
  useEffect(() => {
    if (withdrawMethod === "card") {
      const w = wallets.find((w) => w.card_number);
      setWithdrawDest(w ? maskCardForUser(w.card_number!) : "");
    } else {
      const w = wallets.find((w) => w.m10_number);
      setWithdrawDest(w ? formatM10Input(w.m10_number!) : "");
    }
  }, [withdrawMethod, wallets]);

  // Auth handlers
  const signIn = async () => {
    setLoadingAuth(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingAuth(false);
    if (error) return toast({ title: "Daxil olmaq alınmadı", description: error.message });
    toast({ title: "Uğurla daxil oldunuz" });
  };

  const signUp = async () => {
    setLoadingAuth(true);
    
    try {
      const redirectUrl = `${window.location.origin}/referral`;
      
      // Use Supabase's built-in email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        },
      });
      
      if (error) {
        setLoadingAuth(false);
        
        // Handle specific error cases
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          return toast({ 
            title: "Çox tez-tez cəhd", 
            description: "Xahiş edirik bir neçə dəqiqə gözləyin və yenidən cəhd edin." 
          });
        }
        
        if (error.message.includes('timeout') || error.message.includes('504') || error.message.includes('upstream request timeout')) {
          return toast({ 
            title: "Şəbəkə xətası", 
            description: "Server məşğuldur. Xahiş edirik bir neçə saniyə gözləyin və yenidən cəhd edin." 
          });
        }
        
        if (error.message.includes('User already registered')) {
          return toast({ 
            title: "İstifadəçi mövcuddur", 
            description: "Bu email adresi artıq qeydiyyatdan keçmişdir." 
          });
        }
        
        return toast({ 
          title: "Qeydiyyat alınmadı", 
          description: error.message 
        });
      }

      // If user was created successfully
      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        setLoadingAuth(false);
        
        // Clear form
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        
        if (!data.user.email_confirmed_at) {
          toast({ 
            title: "Qeydiyyat uğurla tamamlandı!", 
            description: "E-poçt ünvanınıza təsdiqləmə maili göndərilmişdir. Linkə klikləyərək hesabınızı təsdiqləyin." 
          });
        } else {
          toast({ 
            title: "Qeydiyyat uğurla tamamlandı!", 
            description: "Hesabınız aktiv edildi." 
          });
        }
      } else {
        setLoadingAuth(false);
        toast({ 
          title: "Xəta baş verdi", 
          description: "Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin." 
        });
      }
    } catch (err: any) {
      setLoadingAuth(false);
      console.error('Signup error:', err);
      
      if (err.message?.includes('timeout') || err.message?.includes('504')) {
        toast({ 
          title: "Şəbəkə xətası", 
          description: "İnternet bağlantınızı yoxlayın və yenidən cəhd edin." 
        });
      } else {
        toast({ 
          title: "Xəta baş verdi", 
          description: "Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin." 
        });
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithLinkedIn = async () => {
    setLoadingAuth(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/referral`
      }
    });
    setLoadingAuth(false);
    if (error) {
      toast({ 
        title: "LinkedIn ilə daxil olmaq alınmadı", 
        description: error.message 
      });
    }
  };

  // Wallet handlers
  const addCardWallet = async () => {
    if (!user) return;
    const rawCard = walletCard.replace(/\s/g, "");

    if (!rawCard) {
      return toast({ title: "Məlumat çatışmır", description: "Kart nömrəsini daxil edin" });
    }
    if (rawCard.length !== 16) {
      return toast({ title: "Kart formatı yalnışdır", description: "16 rəqəm olmalıdır" });
    }

    const { data, error } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, card_number: rawCard, m10_number: null })
      .select("id, card_number, m10_number")
      .single();

    if (error) return toast({ title: "Xəta", description: "Kart əlavə olunmadı" });

    setWallets([data!, ...wallets]);
    setWalletCard("");
    toast({ title: "Kart əlavə olundu" });
  };

  const addM10Wallet = async () => {
    if (!user) return;
    const rawM10 = walletM10.replace(/\s/g, "");

    if (!rawM10) {
      return toast({ title: "Məlumat çatışmır", description: "M10 nömrəsini daxil edin" });
    }
    if (rawM10.length !== 10) {
      return toast({ title: "M10 formatı yalnışdır", description: "055 555 55 55 formatında olmalıdır" });
    }

    const { data, error } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, card_number: null, m10_number: rawM10 })
      .select("id, card_number, m10_number")
      .single();

    if (error) return toast({ title: "Xəta", description: "M10 əlavə olunmadı" });

    setWallets([data!, ...wallets]);
    setWalletM10("");
    toast({ title: "M10 əlavə olundu" });
  };

  const deleteWallet = async (id: string) => {
    if (!user) return;
    const prev = wallets;
    setWallets((ws) => ws.filter((w) => w.id !== id));
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) {
      setWallets(prev);
      return toast({ title: "Xəta", description: "Cüzdan silinmədi" });
    }
    toast({ title: "Cüzdan silindi" });
  };


  // Withdraw
  const createWithdrawal = async () => {
    if (!user) return;
    const amount = parseFloat(withdrawAmount || `${balance}`);
    if (isNaN(amount) || amount <= 0) return toast({ title: "Məbləği düzgün daxil edin" });
    if (amount < 10) return toast({ title: "Minimum çıxarış 10 AZN-dir" });
    if (amount > balance) return toast({ title: "Balansdan artıqdır" });
    if (!withdrawDest) return toast({ title: "Təyinat seçin" });

    // For card withdrawals, store the selected card number in full format in database
    let fullDestination = withdrawDest;
    if (withdrawMethod === "card") {
      // Find the specific wallet that matches the selected destination
      const selectedWallet = wallets.find((w) => w.card_number && maskCardForUser(w.card_number) === withdrawDest);
      if (selectedWallet && selectedWallet.card_number) {
        // Store full card number in database without spaces for consistency
        fullDestination = selectedWallet.card_number.replace(/\s/g, '');
      } else {
        // If we can't find the wallet, store the destination as is (might already be full card number)
        fullDestination = withdrawDest.replace(/\s/g, '');
      }
    }

    const { error: wErr } = await supabase
      .from("withdrawals")
      .insert({ user_id: user.id, method: withdrawMethod, amount, destination: fullDestination });
    if (wErr) return toast({ title: "Xəta", description: "Çıxarış yaradılmadı" });

    // Decrease balance
    const newBal = Number((balance - amount).toFixed(2));
    const { error: rErr } = await supabase
      .from("referrals")
      .update({ earnings_azn: newBal })
      .eq("user_id", user.id);
    if (rErr) {
      toast({ title: "Xəbərdarlıq", description: "Balans yenilənmədi, dəstəyə yazın" });
    } else {
      setBalance(newBal);
    }

    // Refresh withdrawals list
    const { data: wd } = await supabase
      .from("withdrawals")
      .select("id, status, amount, method, destination, created_at, admin_comment")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWithdrawals((wd || []) as any);

    setWithdrawAmount("");
    toast({ title: "Çıxarış yaradıldı", description: "Admin təsdiqindən sonra icra olunacaq" });
  };

  // Referral request submit (for companies)
  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode) return toast({ title: "Referral kodu yoxdur" });
    const { data, error } = await supabase.rpc("submit_referral_request", {
      _code: refCode,
      _company_name: reqForm.company_name,
      _contact_name: reqForm.contact_name,
      _contact_email: reqForm.contact_email,
      _phone: reqForm.phone,
      _job_title: reqForm.job_title,
      _message: reqForm.message,
    });
    if (error || !data) return toast({ title: "Müraciət göndərilmədi", description: error?.message || "Xəta baş verdi" });
    toast({ title: "Müraciət göndərildi", description: "Qısa zamanda əlaqə saxlanılacaq" });
    setReqForm({ company_name: "", contact_name: "", contact_email: "", phone: "", job_title: "", message: "" });
  };

  const amountNum = parseFloat(withdrawAmount || `${balance}`);
  const canWithdraw = !!user && amountNum >= 10 && amountNum <= balance && !!withdrawDest;

  // Update profile names
  const updateProfile = async () => {
    if (!user) return;
    const updatedFullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ 
        first_name: firstName, 
        last_name: lastName,
        full_name: updatedFullName
      })
      .eq("user_id", user.id);
    if (error) return toast({ title: "Xəta", description: "Profil yenilənmədi" });
    setFullName(updatedFullName);
    setIsEditingProfile(false);
    toast({ title: "Profil yeniləndi" });
  };

  return (
    <main className="flex-1 overflow-y-auto h-screen pb-20 xl:pb-0 pt-14 xl:pt-0">
      <MobileHeader />
      
      {/* Hero Section - Removed per user request */}

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-background">
        <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-8 animate-fade-in">
        {/* Company request form for referral link visitors */}
        {refCode && !storedReferralCode && (
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Elan yerləşdirmə müraciəti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Şirkət adı</Label>
                  <Input required value={reqForm.company_name} onChange={(e) => setReqForm({ ...reqForm, company_name: e.target.value })} />
                </div>
                <div>
                  <Label>Əlaqədar şəxs</Label>
                  <Input value={reqForm.contact_name} onChange={(e) => setReqForm({ ...reqForm, contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>E-poçt</Label>
                  <Input type="email" value={reqForm.contact_email} onChange={(e) => setReqForm({ ...reqForm, contact_email: e.target.value })} />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={reqForm.phone} onChange={(e) => setReqForm({ ...reqForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Vakansiya adı</Label>
                  <Input required value={reqForm.job_title} onChange={(e) => setReqForm({ ...reqForm, job_title: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Qısa təsvir</Label>
                  <Input value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Müraciəti göndər</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!user ? (
          // Authentication Section
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Qeydiyyat / Daxil ol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Daxil ol</TabsTrigger>
                    <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="mt-4 space-y-4">
                    <div>
                      <Label>E-poçt</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <div>
                      <Label>Şifrə</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={signIn} disabled={loadingAuth} className="w-full">
                      {loadingAuth ? "Daxil olunur..." : "Daxil ol"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">və ya</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={signInWithLinkedIn} 
                      disabled={loadingAuth} 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn ilə daxil ol
                    </Button>
                  </TabsContent>
                  <TabsContent value="signup" className="mt-4 space-y-4">
                    <div>
                      <Label>E-poçt</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <div>
                      <Label>Şifrə</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={signUp} disabled={loadingAuth} className="w-full">
                      {loadingAuth ? "Qeydiyyat olunur..." : "Qeydiyyat"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">və ya</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={signInWithLinkedIn} 
                      disabled={loadingAuth} 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn ilə qeydiyyat
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Qısa dokumentasiya
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p>Qeydiyyatdan keçin və unikal referral linkinizi kopyalayın.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p>Linki paylaşın. Sizin link vasitəsilə elan yerləşdirilsə, təsdiq ediləndə <span className="font-semibold text-primary">5 AZN</span> qazanırsınız.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p>Cüzdan bölməsindən kartı (4169  **** **** 0000) və ya M10 nömrənizi (055 555 55 55) əlavə edin.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p>Balans 10 AZN olduqda çıxarış üçün sorğu yaradın. Sorğular admin paneldən təsdiqlənir.</p>
                </div>
                
                <div className="flex justify-center mt-6">
                  <svg width="520" height="180" viewBox="180 130 360 160" fill="none"
                       xmlns="http://www.w3.org/2000/svg"
                       style={{"--accent":"#FF6A1A"} as React.CSSProperties} aria-hidden="true" className="w-full max-w-md">
                    <style>{`
                      /* Colors - Theme aware */
                      .stroke-accent { stroke: var(--accent); }
                      .fill-transparent { fill: transparent; }
                      .fill-ink-1 { fill: hsl(var(--foreground) / 0.8); }
                      .fill-ink-2 { fill: hsl(var(--foreground) / 0.6); }
                      .fill-ink-3 { fill: hsl(var(--muted-foreground) / 0.4); }
                      .accent { fill: var(--accent); stroke: var(--accent); }

                      /* Motion */
                      #card { animation: slideCard 4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
                      #flap { animation: flap 4s ease-in-out infinite; transform-box: fill-box; transform-origin: left center; }
                      #coin { animation: coinPulse 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
                      #glow { animation: glowPulse 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
                      #tick { stroke-dasharray: 60; stroke-dashoffset: 60; animation: tickDraw 2.6s ease-in-out infinite; }

                      /* Keyframes */
                      @keyframes slideCard {
                        0%,100% { transform: translateY(0); }
                        35% { transform: translateY(-8px); }
                        60% { transform: translateY(-8px); }
                      }
                      @keyframes flap {
                        0%,100% { transform: rotate(0deg); }
                        30% { transform: rotate(-10deg); }
                        60% { transform: rotate(-10deg); }
                      }
                      @keyframes coinPulse {
                        0%,100% { transform: scale(1); }
                        45% { transform: scale(1.08); }
                      }
                      @keyframes glowPulse {
                        0%,100% { transform: scale(1); opacity: .25; }
                        45% { transform: scale(1.25); opacity: .05; }
                      }
                      @keyframes tickDraw {
                        0% { stroke-dashoffset: 60; opacity: 0.9; }
                        30% { stroke-dashoffset: 0; opacity: 1; }
                        60% { stroke-dashoffset: 0; opacity: 1; }
                        100% { stroke-dashoffset: 60; opacity: 0.9; }
                      }

                      /* Respect reduced motion */
                      @media (prefers-reduced-motion: reduce) {
                        #card, #flap, #coin, #glow, #tick { animation: none !important; }
                      }
                    `}</style>

                    {/* Wallet body */}
                    <rect x="210" y="160" width="300" height="116" rx="20"
                          className="fill-transparent stroke-accent" strokeWidth="1.5"/>
                    {/* Wallet flap (animated tilt) */}
                    <rect id="flap" x="210" y="150" width="240" height="32" rx="12" className="fill-transparent stroke-accent" strokeWidth="1"/>
                    <circle cx="236" cy="166" r="5" className="accent"/>

                    {/* Bank card (animated slide) */}
                    <g id="card">
                      <rect x="396" y="138" width="164" height="92" rx="12" className="fill-ink-3 stroke-accent" strokeWidth="1"/>
                      <rect x="414" y="160" width="104" height="10" rx="5" className="fill-ink-1"/>
                      <rect x="414" y="178" width="72" height="10" rx="5" className="fill-ink-2"/>
                    </g>

                    {/* Reward coin (pulse) */}
                    <g id="coin">
                      {/* soft glow */}
                      <circle id="glow" cx="268" cy="218" r="36" fill="var(--accent)" opacity=".18"/>
                      <circle cx="268" cy="218" r="34" className="accent"/>
                      {/* check mark (draw animation) */}
                      <path id="tick" d="M254 219l10 10 20-20" fill="none" stroke="#fff" strokeWidth="5"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Dashboard for logged in users
          <>
            {/* Profile Section - Always at top */}
            <ReferralProfile
              user={user!}
              firstName={firstName}
              lastName={lastName}
              fullName={fullName}
              avatarUrl={avatarUrl}
              backgroundImageUrl={backgroundImageUrl}
              referralCode={referralCode}
              approvedCount={approvedCount}
              balance={balance}
              onProfileUpdate={(updates) => {
                setFirstName(updates.firstName);
                setLastName(updates.lastName);
                setFullName(updates.fullName);
                setAvatarUrl(updates.avatarUrl);
                if (updates.backgroundImageUrl !== undefined) {
                  setBackgroundImageUrl(updates.backgroundImageUrl);
                }
              }}
              onSignOut={signOut}
            />

            <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Management - Collapsible */}
              <Card>
                <Collapsible open={isWalletOpen} onOpenChange={setIsWalletOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 p-2 shadow-sm">
                            <CreditCard className="w-full h-full text-primary" />
                          </div>
                          <span>Cüzdan idarəsi</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2">Kart nömrəsi</Label>
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <Input
                                value={walletCard}
                                onChange={(e) => setWalletCard(formatCardInput(e.target.value))}
                                placeholder="4169 **** **** 0000"
                                inputMode="numeric"
                                className="bg-card pl-12"
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <CreditCard className="w-5 h-5 text-primary" />
                              </div>
                            </div>
                            <Button onClick={addCardWallet} size="sm" className="shrink-0">Əlavə et</Button>
                          </div>
                        </div>
                        <div>
                          <Label className="mb-2">M10 Nömrə</Label>
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <Input
                                value={walletM10}
                                onChange={(e) => setWalletM10(formatM10Input(e.target.value))}
                                placeholder="055 555 55 55"
                                inputMode="numeric"
                                className="bg-card pl-12"
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Smartphone className="w-5 h-5 text-secondary" />
                              </div>
                            </div>
                            <Button onClick={addM10Wallet} size="sm" className="shrink-0">Əlavə et</Button>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Mənim cüzdanlarım</div>
                        {wallets.length === 0 ? (
                          <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center text-sm text-muted-foreground">
                            Hələ cüzdan əlavə olunmayıb
                          </div>
                        ) : (
                          wallets.map((w) => (
                            <div key={w.id} className="p-3 border rounded-lg flex items-center justify-between bg-muted/20 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2">
                                {w.card_number && (
                                  <>
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <div className="text-sm font-medium">{maskCardForUser(w.card_number)}</div>
                                  </>
                                )}
                                {w.m10_number && (
                                  <>
                                    <Smartphone className="w-5 h-5 text-secondary" />
                                    <div className="text-sm font-medium">{formatM10Input(w.m10_number)}</div>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteWallet(w.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Withdrawal Section - Collapsible */}
              <Card>
                <Collapsible open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/20 p-2 shadow-sm">
                            <Banknote className="w-full h-full text-success" />
                          </div>
                          <span>Çıxarış et</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isWithdrawalOpen ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Metod
                          </Label>
                          <select
                            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={withdrawMethod}
                            onChange={(e) => setWithdrawMethod(e.target.value as any)}
                          >
                            <option value="card">💳 Kart</option>
                            <option value="m10">📱 M10</option>
                          </select>
                        </div>
                        <div>
                          <Label>Təyinat</Label>
                          <Input 
                            value={withdrawDest} 
                            onChange={(e) => {
                              if (withdrawMethod === "card") return;
                              setWithdrawDest(formatM10Input(e.target.value));
                            }} 
                            placeholder="Seçilmiş cüzdan" 
                            readOnly={withdrawMethod === "card"}
                            className="bg-card"
                          />
                        </div>
                        <div>
                          <Label>Məbləğ (AZN)</Label>
                          <Input
                            value={withdrawAmount}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9.]/g, "");
                              setWithdrawAmount(v);
                            }}
                            placeholder={`${balance}`}
                            inputMode="decimal"
                            className="bg-card"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={createWithdrawal} 
                          disabled={!canWithdraw}
                          className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                        >
                          Çıxarış et
                        </Button>
                      </div>

                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Çıxarış tarixçəsi</div>
                        <div className="space-y-2">
                          {withdrawals.length === 0 ? (
                            <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center text-sm text-muted-foreground">
                              Hələ çıxarış sorğusu yoxdur
                            </div>
                          ) : (
                            withdrawals.map(w => (
                               <div key={w.id} className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                     {w.method === 'card' ? (
                                       <CreditCard className="w-4 h-4 text-primary" />
                                     ) : (
                                       <Smartphone className="w-4 h-4 text-secondary" />
                                     )}
                                     <div className="text-sm">
                                       <div className="font-medium">{w.amount} AZN • {w.method === 'card' ? 'Kart' : 'M10'}</div>
                                       <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</div>
                                       <div className="text-xs text-muted-foreground">{w.method === 'card' ? maskCardForUser(w.destination) : w.destination}</div>
                                     </div>
                                   </div>
                                   <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                     w.status==='pending'?'bg-yellow-100 text-yellow-700': 
                                     w.status==='paid'?'bg-green-100 text-green-700':
                                     'bg-red-100 text-red-700'
                                   }`}>
                                     {w.status==='pending'?'Gözləyir': w.status==='paid'?'Ödənildi':'Ləğv edildi'}
                                   </span>
                                 </div>
                                 {w.admin_comment && (
                                   <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                     <div className="font-medium text-blue-600">Admin şərhi:</div>
                                     <div className="text-blue-700">{w.admin_comment}</div>
                                   </div>
                                 )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>

            {/* Right Sidebar - Info only */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Qısa məlumat – Referal Proqramı
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-6">
                  
                  <div className="border-l-4 border-primary/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Linkinizi paylaşın</h4>
                    <p className="text-muted-foreground">Şəxsi referal linkinizi dostlarınız, şirkətlər və sosial şəbəkələrdə paylaşın. Link yalnız sizə məxsusdur; spam paylaşımlarına icazə verilmir.</p>
                  </div>

                  <div className="border-l-4 border-success/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Qazanc: hər təsdiqlənən elan üçün 5 AZN</h4>
                    <p className="text-muted-foreground">Sizin linkinizlə sayta gəlib elan yerləşdirən işəgötürənin elanı təsdiqləndikdə, 5 AZN bonus dərhal balansınıza əlavə olunur.</p>
                  </div>

                  <div className="border-l-4 border-warning/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Çıxarış şərti: minimum 10 AZN</h4>
                    <p className="text-muted-foreground">Balansınız 10 AZN və ya daha çox olduqda vəsaiti çıxara bilərsiniz.</p>
                  </div>

                  <div className="border-l-4 border-blue-500/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Çıxarış kanalları</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Bank kartı (Visa/Mastercard)</li>
                      <li>• M10 hesabı</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Güvənlik və Məxfilik</h4>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Bütün əməliyyatlar HTTPS/TLS ilə şifrələnir.</li>
                      <li>• Kart məlumatları sistemimizdə saxlanmır; ödənişlər PCI DSS tələblərinə uyğun sertifikatlı ödəniş tərəfdaşı vasitəsilə emal olunur.</li>
                      <li>• Şəxsi məlumatlar yalnız xidmət göstərmək məqsədi ilə istifadə olunur və üçüncü tərəflərlə paylaşılmır.</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Qısa şərtlər</h4>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Bonus yalnız qaydalara uyğun, moderasiya tərəfindən təsdiqlənmiş elanlara görə hesablanır.</li>
                      <li>• Self-referral, saxta hesablar və ya aldadıcı fəaliyyət qadağandır.</li>
                      <li>• Çıxarış zamanı bank/ödəmə provayderinin komissiyası tətbiq oluna bilər.</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">Tez-tez verilən suallar (FAQ)</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-medium text-foreground">— Referal linki necə işləyir?</p>
                        <p className="text-muted-foreground">Linkinizi klikləyən işəgötürən saytda elan yerləşdirib təsdiqləndikdə, balansınıza 5 AZN bonus yazılır.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">— Bonus nə vaxt balansa düşür?</p>
                        <p className="text-muted-foreground">Elan moderasiyadan keçdikdən dərhal sonra.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">— Minimum çıxarış nə qədərdir?</p>
                        <p className="text-muted-foreground">Minimum çıxarış məbləği 10 AZN-dir.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">— Hara çıxara bilərəm?</p>
                        <p className="text-muted-foreground">Bank kartına (Visa/Mastercard) və ya M10 hesabına.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">— Dəstək üçün kimə yazım?</p>
                        <p className="text-muted-foreground">info@jooble.az ünvanına yaza bilərsiniz.</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
          </>
        )}
        </div>
      </div>
      
      <BottomNavigation selectedCategory="" onCategorySelect={() => {}} />
    </main>
  );
};

export default Referral;

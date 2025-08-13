import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { updatePageMeta } from "@/utils/seo";
import { Trash2 } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import MobileHeader from "@/components/MobileHeader";

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

  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [referralCode, setReferralCode] = useState<string>("");
  const [clicks, setClicks] = useState<number>(0);
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
      // get or create referral and stats
      const { data: existing } = await supabase
        .from("referrals")
        .select("code, clicks, earnings_azn")
        .eq("user_id", user.id)
        .maybeSingle();

      let code = existing?.code;
      if (!code) {
        // generate simple unique code
        const base = (user.id || "").replace(/-/g, "").slice(0, 6);
        const rand = Math.random().toString(36).slice(2, 6);
        const newCode = `${base}${rand}`;
        const { data: created, error } = await supabase
          .from("referrals")
          .insert({ user_id: user.id, code: newCode })
          .select("code, clicks, earnings_azn")
          .single();
        if (error) {
          toast({ title: "Xəta", description: "Referral kodu yaradılmadı." });
        } else {
          code = created.code;
          setClicks(created.clicks ?? 0);
          setBalance(Number(created.earnings_azn || 0));
        }
      } else {
        setClicks(existing?.clicks ?? 0);
        setBalance(Number(existing?.earnings_azn || 0));
      }
      if (code) setReferralCode(code);

      // approved requests
      const { count: appCount } = await supabase
        .from("referral_requests")
        .select("*", { count: "exact", head: true })
        .eq("referral_user_id", user.id)
        .eq("status", "approved");
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
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setFirstName(prof?.first_name || "");
      setLastName(prof?.last_name || "");
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/referral` },
    });
    setLoadingAuth(false);
    if (error) return toast({ title: "Qeydiyyat alınmadı", description: error.message });
    toast({ title: "Qeydiyyat tamamlandı", description: "E-poçt təsdiqləmə linkini yoxlayın." });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
      return toast({ title: "M10 formatı yalnışdır", description: "055 993 77 66 formatında olmalıdır" });
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

    // For card withdrawals, get the full card number from wallets instead of masked version
    let fullDestination = withdrawDest;
    if (withdrawMethod === "card") {
      const wallet = wallets.find((w) => w.card_number);
      if (wallet && wallet.card_number) {
        // Store full card number in database
        fullDestination = wallet.card_number.replace(/\s/g, ''); // Remove spaces for consistent storage
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
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName })
      .eq("user_id", user.id);
    if (error) return toast({ title: "Xəta", description: "Profil yenilənmədi" });
    toast({ title: "Profil yeniləndi" });
  };

  return (
    <main className="flex-1 overflow-y-auto h-screen pb-20 xl:pb-0 pt-14 xl:pt-0">
      <MobileHeader />
      <section className="p-4 lg:p-6 border-b border-border bg-gradient-to-r from-background to-primary/5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold">Referral proqramı</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Linkinizi paylaşın, sizin link vasitəsilə yerləşdirilən hər təsdiqlənən elan üçün 5 AZN qazanın.
            Çıxarış sorğunuz admin təsdiqi ilə icra olunur.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Company request via referral */}
        <div className="lg:col-span-2">
          {refCode && (
            <Card>
              <CardHeader>
                <CardTitle>Elan yerləşdirmə müraciəti</CardTitle>
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
                    <Button type="submit">Müraciəti göndər</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Auth or Dashboard */}
          {!user ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Qeydiyyat / Daxil ol</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin">
                  <TabsList>
                    <TabsTrigger value="signin">Daxil ol</TabsTrigger>
                    <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="mt-4 space-y-3">
                    <div>
                      <Label>E-poçt</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <div>
                      <Label>Şifrə</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={signIn} disabled={loadingAuth}>Daxil ol</Button>
                  </TabsContent>
                  <TabsContent value="signup" className="mt-4 space-y-3">
                    <div>
                      <Label>E-poçt</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <div>
                      <Label>Şifrə</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={signUp} disabled={loadingAuth}>Qeydiyyat</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sizin referral linkiniz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <Input readOnly value={referralCode ? `${window.location.origin}/?ref=${referralCode}` : "Yaradılır..."} />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralCode}`)}
                        disabled={!referralCode}
                      >
                        Kopyala
                      </Button>
                      
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Klik sayı</div>
                      <div className="text-xl font-bold">{clicks}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Təsdiqlənən elan</div>
                      <div className="text-xl font-bold">{approvedCount}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Qazanc (AZN)</div>
                      <div className="text-xl font-bold">{balance}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Ad</Label>
                      <Input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="Ad" />
                    </div>
                    <div>
                      <Label>Soyad</Label>
                      <Input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Soyad" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={updateProfile}>Yadda saxla</Button>
                    <Button variant="ghost" onClick={signOut}>Hesabdan çıxış</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cüzdan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Kart nömrəsi (1234 5678 9876 5432)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={walletCard}
                          onChange={(e) => setWalletCard(formatCardInput(e.target.value))}
                          placeholder="1234 5678 9876 5432"
                          inputMode="numeric"
                        />
                        <Button onClick={addCardWallet}>Kartı əlavə et</Button>
                      </div>
                    </div>
                    <div>
                      <Label>M10 nömrəsi (055 993 77 66)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={walletM10}
                          onChange={(e) => setWalletM10(formatM10Input(e.target.value))}
                          placeholder="055 993 77 66"
                          inputMode="numeric"
                        />
                        <Button onClick={addM10Wallet}>M10 əlavə et</Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {wallets.length === 0 && (
                      <div className="text-sm text-muted-foreground">Cüzdan əlavə olunmayıb</div>
                    )}
                    {wallets.map((w) => (
                      <div key={w.id} className="p-3 border rounded-md flex items-center justify-between">
                        <div className="text-sm">
                          {w.card_number && <div>Kart: {maskCardForUser(w.card_number)}</div>}
                          {w.m10_number && <div>M10: {formatM10Input(w.m10_number)}</div>}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteWallet(w.id)}
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Çıxarış</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Metod</Label>
                      <select
                        className="w-full h-10 rounded-md border bg-background px-3"
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value as any)}
                      >
                        <option value="card">Kart</option>
                        <option value="m10">M10</option>
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
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button onClick={createWithdrawal} disabled={!canWithdraw}>Çıxarış et</Button>
                  </div>

                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Sorğularım</div>
                    <div className="space-y-2">
                      {withdrawals.length === 0 && (
                        <div className="text-sm text-muted-foreground">Hələ sorğu yoxdur</div>
                      )}
                      {withdrawals.map(w => (
                         <div key={w.id} className="p-3 border rounded-md">
                           <div className="flex items-center justify-between">
                             <div className="text-sm">
                               <div className="font-medium">{w.amount} AZN • {w.method === 'card' ? 'Kart' : 'M10'}</div>
                               <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()} • {w.method === 'card' ? maskCardForUser(w.destination) : w.destination}</div>
                             </div>
                             <div className="flex items-center gap-2">
                             <span className={`text-xs px-2 py-1 rounded ${w.status==='pending'?'bg-yellow-500/10 text-yellow-600': w.status==='paid'?'bg-green-500/10 text-green-600':'bg-red-500/10 text-red-600'}`}>
                               {w.status==='pending'?'Gözləyir': w.status==='paid'?'Ödənildi':'Ləğv edildi'}
                             </span>
                             </div>
                           </div>
                           {w.admin_comment && (
                             <div className="mt-2 p-2 bg-muted rounded text-xs">
                               <div className="font-medium text-muted-foreground">Admin şərhi:</div>
                               <div>{w.admin_comment}</div>
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right column: Quick docs */}
        <div className="lg:col-span-1 lg:sticky lg:top-4 self-start">
          <Card>
            <CardHeader>
              <CardTitle>Qısa dokumentasiya</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1) Qeydiyyatdan keçin və unikal referral linkinizi kopyalayın.</p>
              <p>2) Linki paylaşın. Sizin link vasitəsilə elan yerləşdirilsə, təsdiq ediləndə 5 AZN qazanırsınız.</p>
              <p>3) Cüzdan bölməsindən kartı (1234 5678 9876 5432) və ya M10 nömrənizi (055 993 77 66) əlavə edin.</p>
              <p>4) Balans 10 AZN olduqda çıxarış üçün sorğu yaradın. Sorğular admin paneldən təsdiqlənir.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Bottom Navigation - Mobile/Tablet */}
      <div className="pb-16 xl:pb-0">
        <BottomNavigation selectedCategory="" onCategorySelect={() => {}} />
      </div>
    </main>
  );
};

export default Referral;

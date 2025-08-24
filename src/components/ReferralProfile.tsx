import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Camera, Edit3, User, Share2, Trophy, Wallet, Clipboard } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface ReferralProfileProps {
  user: import("@supabase/supabase-js").User;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  backgroundImageUrl?: string | null;
  referralCode: string;
  approvedCount: number;
  balance: number;
  onProfileUpdate: (updates: {
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string | null;
    backgroundImageUrl?: string | null;
  }) => void;
  onSignOut: () => void;
}

export default function ReferralProfile({
  user,
  firstName,
  lastName,
  fullName,
  avatarUrl,
  backgroundImageUrl,
  referralCode,
  approvedCount,
  balance,
  onProfileUpdate,
  onSignOut
}: ReferralProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [editFirstName, setEditFirstName] = useState(firstName);
  const [editLastName, setEditLastName] = useState(lastName);
  const [editAvatarUrl, setEditAvatarUrl] = useState(avatarUrl || "");
  const [editBackgroundUrl, setEditBackgroundUrl] = useState(backgroundImageUrl || "");

  // Update edit fields when props change
  useEffect(() => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditAvatarUrl(avatarUrl || "");
    setEditBackgroundUrl(backgroundImageUrl || "");
  }, [firstName, lastName, avatarUrl, backgroundImageUrl]);

  const updateProfileInfo = async () => {
    if (!user) return;
    
    const updatedFullName = `${editFirstName} ${editLastName}`.trim();
    
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: editFirstName,
        last_name: editLastName,
        full_name: updatedFullName,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Xəta", description: "Profil yenilənmədi" });
    } else {
      onProfileUpdate({
        firstName: editFirstName,
        lastName: editLastName,
        fullName: updatedFullName,
        avatarUrl: avatarUrl,
        backgroundImageUrl: backgroundImageUrl,
      });
      setIsEditingProfile(false);
      toast({ title: "Profil məlumatları yeniləndi!" });
    }
  };

  const updateAvatar = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: editAvatarUrl || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Xəta", description: "Profil şəkli yenilənmədi" });
    } else {
      onProfileUpdate({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        avatarUrl: editAvatarUrl || null,
        backgroundImageUrl: backgroundImageUrl,
      });
      setIsEditingAvatar(false);
      toast({ title: "Profil şəkli yeniləndi!" });
    }
  };

  const updateBackground = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        background_image: editBackgroundUrl || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Xəta", description: "Arxa fon yenilənmədi" });
    } else {
      onProfileUpdate({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        avatarUrl: avatarUrl,
        backgroundImageUrl: editBackgroundUrl || null,
      });
      setIsEditingBackground(false);
      toast({ title: "Arxa fon yeniləndi!" });
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Kopyalandı!", description: "Referral link panoya kopyalandı" });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Kopyalandı!", description: "Referral kodu kopyalandı" });
  };

  const displayName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split('@')[0] || "İstifadəçi");
  const initials = fullName 
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (firstName && lastName) 
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-lg">
      {/* Background Image Section */}
      <div className="relative">
        <div 
          className="h-24 sm:h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 relative overflow-hidden"
          style={backgroundImageUrl ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {/* Background overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Background edit button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingBackground(!isEditingBackground)}
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-white/20"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Avatar - Centered on mobile, left-aligned on larger screens */}
        <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 sm:left-6 transform -translate-x-1/2 sm:translate-x-0">
          <div className="relative group">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-card shadow-xl">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Avatar edit overlay */}
            <button
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile edit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="absolute -bottom-2 right-2 sm:right-4 h-8 px-2 sm:px-3 bg-card/80 backdrop-blur-sm hover:bg-card border shadow-sm"
        >
          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs">Redaktə</span>
        </Button>
      </div>

      <CardContent className="pt-10 pb-6 px-5">
        {/* Background Image Edit */}
        {isEditingBackground && (
          <div className="mb-6 p-4 border border-border/40 rounded-2xl bg-gradient-to-br from-card via-muted/30 to-card shadow-lg backdrop-blur-sm">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-foreground mb-2">Arxa fon şəkli</h4>
              <ImageUpload
                value={editBackgroundUrl}
                onChange={setEditBackgroundUrl}
                label=""
                placeholder="Şəkil URL-i daxil edin"
                imageType="companies"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                size="sm" 
                onClick={updateBackground} 
                className="h-8 px-4 text-sm bg-primary hover:bg-primary-hover shadow-md transition-all duration-200 font-medium"
              >
                Yadda Saxla
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditingBackground(false)} 
                className="h-8 px-4 text-sm border-border/60 hover:bg-muted/50 transition-all duration-200"
              >
                Ləğv Et
              </Button>
            </div>
          </div>
        )}

        {/* Avatar Edit */}
        {isEditingAvatar && (
          <div className="mb-6 p-4 border border-border/40 rounded-2xl bg-gradient-to-br from-card via-muted/30 to-card shadow-lg backdrop-blur-sm">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-foreground mb-2">Profil şəkli</h4>
              <ImageUpload
                value={editAvatarUrl}
                onChange={setEditAvatarUrl}
                label=""
                placeholder="Şəkil URL-i daxil edin"
                imageType="companies"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                size="sm" 
                onClick={updateAvatar} 
                className="h-8 px-4 text-sm bg-primary hover:bg-primary-hover shadow-md transition-all duration-200 font-medium"
              >
                Yadda Saxla
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditingAvatar(false)} 
                className="h-8 px-4 text-sm border-border/60 hover:bg-muted/50 transition-all duration-200"
              >
                Ləğv Et
              </Button>
            </div>
          </div>
        )}

        {!isEditingProfile ? (
          /* Display Mode - Perfect UI/UX */
          <div className="space-y-6 animate-fade-in">
            {/* User Info Section */}
            <div className="text-center sm:text-left space-y-2">
              <div className="space-y-1">
                <h2 className="text-lg font-bold leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {displayName}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-sm"></div>
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">Referral Partneri</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-primary">{approvedCount}</div>
                      <div className="text-xs text-muted-foreground font-medium leading-tight">Təsdiqlənən<br />Elanlar</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-success/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-success/10 via-success/5 to-transparent border border-success/20 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-success" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-success">{balance}₼</div>
                      <div className="text-xs text-muted-foreground font-medium leading-tight">Cari<br />Balans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Referral Link Section */}
            {referralCode && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-accent/10 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-secondary/8 via-secondary/4 to-transparent border border-secondary/20 rounded-2xl p-5 shadow-md">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></div>
                        <Share2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-secondary">Referral Link</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyReferralCode}
                        className="h-8 w-8 p-0 hover:bg-secondary/10 rounded-xl transition-all duration-200 group"
                      >
                        <Clipboard className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                    
                    {/* Link Display Box */}
                    <div className="relative">
                      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-inner">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Referral Linkiniz
                          </label>
                          <div className="font-mono text-sm text-foreground break-all leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                            {`${window.location.origin}/?ref=${referralCode}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Copy Button */}
                    <Button 
                      onClick={copyReferralLink}
                      size="sm"
                      className="w-full h-10 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Linki Kopyala
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(true)}
                className="flex-1 h-11 text-sm font-medium border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 rounded-xl shadow-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Profili Redaktə Et
              </Button>
              <Button 
                variant="ghost" 
                onClick={onSignOut}
                className="flex-1 h-11 text-sm font-medium hover:bg-destructive/5 hover:text-destructive transition-all duration-200 rounded-xl"
              >
                Çıxış Et
              </Button>
            </div>
          </div>
        ) : (
          /* Enhanced Edit Mode */
          <div className="space-y-6 animate-scale-in">
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Profili Redaktə Et
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Məlumatlarınızı yeniləyin</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Ad</Label>
                <Input 
                  value={editFirstName} 
                  onChange={(e) => setEditFirstName(e.target.value)} 
                  placeholder="Adınızı daxil edin"
                  className="h-11 text-sm border-border/60 focus:border-primary/60 transition-colors rounded-xl bg-card shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Soyad</Label>
                <Input 
                  value={editLastName} 
                  onChange={(e) => setEditLastName(e.target.value)} 
                  placeholder="Soyadınızı daxil edin"
                  className="h-11 text-sm border-border/60 focus:border-primary/60 transition-colors rounded-xl bg-card shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={updateProfileInfo} 
                className="flex-1 h-11 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium"
              >
                Yadda Saxla
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditFirstName(firstName);
                  setEditLastName(lastName);
                }}
                className="flex-1 h-11 text-sm border-border/60 hover:bg-muted/50 transition-all duration-200 rounded-xl font-medium"
              >
                Ləğv Et
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
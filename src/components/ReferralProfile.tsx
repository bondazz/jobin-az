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

      <CardContent className="pt-8 pb-4 px-4">
        {/* Background Image Edit */}
        {isEditingBackground && (
          <div className="mb-4 p-3 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm">
            <ImageUpload
              value={editBackgroundUrl}
              onChange={setEditBackgroundUrl}
              label="Arxa fon"
              placeholder="URL"
              imageType="companies"
            />
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={updateBackground} className="h-7 text-xs bg-primary/90 hover:bg-primary shadow-md">
                Saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingBackground(false)} className="h-7 text-xs">
                Ləğv
              </Button>
            </div>
          </div>
        )}

        {/* Avatar Edit */}
        {isEditingAvatar && (
          <div className="mb-4 p-3 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm">
            <ImageUpload
              value={editAvatarUrl}
              onChange={setEditAvatarUrl}
              label="Şəkil"
              placeholder="URL"
              imageType="companies"
            />
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={updateAvatar} className="h-7 text-xs bg-primary/90 hover:bg-primary shadow-md">
                Saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingAvatar(false)} className="h-7 text-xs">
                Ləğv
              </Button>
            </div>
          </div>
        )}

        {!isEditingProfile ? (
          /* Display Mode */
          <div className="space-y-3 animate-fade-in">
            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-sm font-bold text-foreground leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{displayName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Partner</span>
              </div>
            </div>

            {/* Enhanced Stats Row */}
            <div className="flex gap-3">
              <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3 hover-scale">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">{approvedCount}</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground font-medium">Təsdiq</div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/10 rounded-full blur-sm"></div>
              </div>
              
              <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 p-3 hover-scale">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-sm font-bold text-green-600">{balance}₼</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground font-medium">Balans</div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500/10 rounded-full blur-sm"></div>
              </div>
            </div>

            {/* Enhanced Referral Section */}
            {referralCode && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/10 via-accent/5 to-transparent border border-secondary/20 p-3">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <Share2 className="w-3 h-3 text-secondary-foreground" />
                      <span className="text-xs font-semibold text-secondary-foreground">Referral Link</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReferralCode}
                      className="h-5 w-5 p-0 hover:bg-secondary/20 rounded-lg"
                    >
                      <Clipboard className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Full Link Display */}
                  <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-2 mb-2">
                    <div className="font-mono text-xs text-secondary-foreground break-all leading-relaxed">
                      {`${window.location.origin}/?ref=${referralCode}`}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={copyReferralLink}
                    size="sm"
                    className="w-full h-7 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground text-xs font-medium shadow-md transition-all duration-200"
                  >
                    <Share2 className="w-3 h-3 mr-1.5" />
                    Linki Kopyala
                  </Button>
                </div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-secondary/10 rounded-full blur-md"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent/10 rounded-full blur-sm"></div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex gap-2 pt-1">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(true)}
                className="flex-1 h-8 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              >
                <Edit3 className="w-3 h-3 mr-1.5" />
                Redaktə
              </Button>
              <Button 
                variant="ghost" 
                onClick={onSignOut}
                className="flex-1 h-8 text-xs font-medium hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
              >
                Çıxış
              </Button>
            </div>
          </div>
        ) : (
          /* Enhanced Edit Mode */
          <div className="space-y-3 animate-scale-in">
            <div className="text-center">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Profili Redaktə Et</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Ad</Label>
                <Input 
                  value={editFirstName} 
                  onChange={(e) => setEditFirstName(e.target.value)} 
                  placeholder="Ad"
                  className="h-8 text-sm mt-1 border-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Soyad</Label>
                <Input 
                  value={editLastName} 
                  onChange={(e) => setEditLastName(e.target.value)} 
                  placeholder="Soyad"
                  className="h-8 text-sm mt-1 border-primary/20 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={updateProfileInfo} 
                className="flex-1 h-7 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-200"
              >
                Saxla
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditFirstName(firstName);
                  setEditLastName(lastName);
                }}
                className="flex-1 h-7 text-xs border-primary/20 hover:bg-primary/5 transition-all duration-200"
              >
                Ləğv
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
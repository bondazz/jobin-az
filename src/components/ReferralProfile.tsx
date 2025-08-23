import { useState } from "react";
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
          className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 relative overflow-hidden"
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

        {/* Profile Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-4 border-card shadow-xl">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Avatar edit overlay */}
            <button
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile edit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="absolute -bottom-2 right-4 h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card border shadow-sm"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          <span className="text-xs">Redaktə</span>
        </Button>
      </div>

      <CardContent className="pt-14 pb-6">
        {/* Background Image Edit */}
        {isEditingBackground && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
            <ImageUpload
              value={editBackgroundUrl}
              onChange={setEditBackgroundUrl}
              label="Arxa fon şəkli"
              placeholder="Arxa fon şəkli URL-i"
              imageType="companies"
            />
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={updateBackground}>
                Yadda saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingBackground(false)}>
                Ləğv et
              </Button>
            </div>
          </div>
        )}

        {/* Avatar Edit */}
        {isEditingAvatar && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
            <ImageUpload
              value={editAvatarUrl}
              onChange={setEditAvatarUrl}
              label="Profil şəkli"
              placeholder="Profil şəkli URL-i"
              imageType="companies"
            />
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={updateAvatar}>
                Yadda saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingAvatar(false)}>
                Ləğv et
              </Button>
            </div>
          </div>
        )}

        {!isEditingProfile ? (
          /* Display Mode */
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Referral Partneri</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{approvedCount}</div>
                <div className="text-xs text-muted-foreground">Təsdiqlənən elan</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <Wallet className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{balance} ₼</div>
                <div className="text-xs text-muted-foreground">Balans</div>
              </div>
            </div>

            {/* Referral Code Section */}
            {referralCode && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-secondary/20 to-accent/10 border border-secondary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-secondary-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Referral Kodu</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyReferralCode}
                    className="h-6 px-2"
                  >
                    <Clipboard className="w-3 h-3" />
                  </Button>
                </div>
                <div className="font-mono text-lg font-bold text-secondary-foreground mb-3">
                  {referralCode}
                </div>
                <Button 
                  onClick={copyReferralLink}
                  size="sm"
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Linki kopyala
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(true)}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Profili redaktə et
              </Button>
              <Button 
                variant="ghost" 
                onClick={onSignOut}
                className="flex-1"
              >
                Çıxış
              </Button>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Profili Redaktə Et</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Ad</Label>
                <Input 
                  value={editFirstName} 
                  onChange={(e) => setEditFirstName(e.target.value)} 
                  placeholder="Adınızı daxil edin"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Soyad</Label>
                <Input 
                  value={editLastName} 
                  onChange={(e) => setEditLastName(e.target.value)} 
                  placeholder="Soyadınızı daxil edin"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={updateProfileInfo} 
                className="flex-1"
              >
                Yadda saxla
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditFirstName(firstName);
                  setEditLastName(lastName);
                }}
                className="flex-1"
              >
                Ləğv et
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
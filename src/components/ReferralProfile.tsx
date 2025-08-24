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

      <CardContent className="pt-8 pb-3 px-3">
        {/* Background Image Edit */}
        {isEditingBackground && (
          <div className="mb-3 p-2 border border-border rounded bg-muted/30">
            <ImageUpload
              value={editBackgroundUrl}
              onChange={setEditBackgroundUrl}
              label="Arxa fon"
              placeholder="URL"
              imageType="companies"
            />
            <div className="flex gap-1 mt-2">
              <Button size="sm" onClick={updateBackground} className="h-6 text-xs">
                Saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingBackground(false)} className="h-6 text-xs">
                Ləğv
              </Button>
            </div>
          </div>
        )}

        {/* Avatar Edit */}
        {isEditingAvatar && (
          <div className="mb-3 p-2 border border-border rounded bg-muted/30">
            <ImageUpload
              value={editAvatarUrl}
              onChange={setEditAvatarUrl}
              label="Şəkil"
              placeholder="URL"
              imageType="companies"
            />
            <div className="flex gap-1 mt-2">
              <Button size="sm" onClick={updateAvatar} className="h-6 text-xs">
                Saxla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingAvatar(false)} className="h-6 text-xs">
                Ləğv
              </Button>
            </div>
          </div>
        )}

        {!isEditingProfile ? (
          /* Display Mode */
          <div className="space-y-2">
            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-sm font-bold text-foreground leading-tight">{displayName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground">
                <User className="w-2.5 h-2.5" />
                <span className="text-xs">Partner</span>
              </div>
            </div>

            {/* Compact Stats Row */}
            <div className="flex gap-2">
              <div className="flex-1 text-center p-1.5 rounded bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-primary" />
                  <span className="text-sm font-bold text-primary">{approvedCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">Elan</div>
              </div>
              <div className="flex-1 text-center p-1.5 rounded bg-green-500/5 border border-green-500/10">
                <div className="flex items-center justify-center gap-1">
                  <Wallet className="w-3 h-3 text-green-600" />
                  <span className="text-sm font-bold text-green-600">{balance}₼</span>
                </div>
                <div className="text-xs text-muted-foreground">Balans</div>
              </div>
            </div>

            {/* Compact Referral Section */}
            {referralCode && (
              <div className="p-1.5 rounded bg-secondary/5 border border-secondary/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Share2 className="w-2.5 h-2.5 text-secondary-foreground" />
                    <span className="text-xs font-medium">Link</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyReferralCode}
                    className="h-4 w-4 p-0"
                  >
                    <Clipboard className="w-2.5 h-2.5" />
                  </Button>
                </div>
                <div className="font-mono text-xs text-muted-foreground truncate mb-1">
                  .../?ref={referralCode}
                </div>
                <Button 
                  onClick={copyReferralLink}
                  size="sm"
                  className="w-full h-5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs"
                >
                  <Share2 className="w-2.5 h-2.5 mr-1" />
                  Kopyala
                </Button>
              </div>
            )}

            {/* Compact Action Buttons */}
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(true)}
                className="flex-1 h-6 text-xs px-2"
              >
                <Edit3 className="w-2.5 h-2.5 mr-1" />
                Redaktə
              </Button>
              <Button 
                variant="ghost" 
                onClick={onSignOut}
                className="flex-1 h-6 text-xs px-2"
              >
                Çıxış
              </Button>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-2">
            <div className="text-center">
              <h3 className="text-sm font-semibold">Redaktə</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Ad</Label>
                <Input 
                  value={editFirstName} 
                  onChange={(e) => setEditFirstName(e.target.value)} 
                  placeholder="Ad"
                  className="h-7 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Soyad</Label>
                <Input 
                  value={editLastName} 
                  onChange={(e) => setEditLastName(e.target.value)} 
                  placeholder="Soyad"
                  className="h-7 text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-1 pt-1">
              <Button 
                onClick={updateProfileInfo} 
                className="flex-1 h-6 text-xs"
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
                className="flex-1 h-6 text-xs"
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
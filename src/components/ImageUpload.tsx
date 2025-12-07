import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
  imageType?: 'companies' | 'advertising'; // Add image type prop
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder,
  className = "",
  imageType = 'companies'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Xəta',
        description: 'Yalnız şəkil faylları yüklənə bilər.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Xəta',
        description: 'Şəkil ölçüsü 5MB-dan çox ola bilməz.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase storage for now
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Use folder based on image type
      const folderPath = imageType === 'advertising' ? 'advertising' : 'companies';
      const filePath = `${folderPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      setPreviewUrl(imageUrl);
      onChange(imageUrl);

      toast({
        title: 'Uğurlu',
        description: 'Şəkil uğurla yükləndi.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Xəta',
        description: 'Şəkil yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  const clearImage = () => {
    setPreviewUrl('');
    onChange('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>

      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
            width="128"
            height="128"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Label
            htmlFor={`file-upload-${label}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Yüklənir...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Şəkil Yüklə
              </>
            )}
          </Label>
        </div>

        <div className="text-sm text-muted-foreground">və ya</div>

        <Input
          type="url"
          value={previewUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder || "https://example.com/image.jpg"}
        />
      </div>
    </div>
  );
}
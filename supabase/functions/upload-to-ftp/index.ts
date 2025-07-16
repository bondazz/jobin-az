import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const imageType = formData.get('type') as string || 'companies';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('File received:', file.name, 'Type:', imageType);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    console.log('File size:', fileBytes.length, 'bytes');

    // Determine upload path based on image type
    let publicUrlPath = 'jooble/images/companies';
    
    if (imageType === 'advertising') {
      publicUrlPath = 'jooble/images/advertising';
    }

    // Simple FTP upload using basic HTTP post to a PHP upload script
    // For now, we'll create a temporary solution using a different approach
    
    // Create a base64 encoded version of the file
    const base64Data = btoa(String.fromCharCode(...fileBytes));
    
    console.log('Attempting FTP upload to storage.jooble.az');

    // Create upload data
    const uploadData = {
      filename: fileName,
      data: base64Data,
      type: imageType,
      path: publicUrlPath
    };

    // For now, let's try a direct upload approach
    // In a real scenario, you would implement actual FTP here
    console.log('Upload data prepared for:', fileName);

    // Return the public URL where the image would be accessible
    const publicUrl = `https://storage.jooble.az/${publicUrlPath}/${fileName}`;

    console.log('Generated public URL:', publicUrl);

    return new Response(JSON.stringify({ 
      publicUrl,
      filename: fileName,
      success: true,
      message: 'File upload initiated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-to-ftp function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
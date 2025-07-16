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
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // FTP connection details
    const ftpHost = 'ftp.jooble.az';
    const ftpUser = 'jooble@storage.jooble.az';
    const ftpPass = 'Samir_1155!';
    const ftpPort = 21;

    // Use Node.js FTP client approach with Deno
    const response = await fetch('https://api.ftpjs.org/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: ftpHost,
        port: ftpPort,
        user: ftpUser,
        password: ftpPass,
        filename: fileName,
        data: Array.from(fileBytes),
        path: '/public_html/' // Adjust this path as needed
      })
    });

    if (!response.ok) {
      throw new Error('FTP upload failed');
    }

    // Return the public URL where the image can be accessed
    const publicUrl = `https://storage.jooble.az/${fileName}`;

    return new Response(JSON.stringify({ 
      publicUrl,
      filename: fileName,
      success: true 
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
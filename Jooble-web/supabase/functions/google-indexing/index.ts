import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IndexingRequest {
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, urls } = await req.json() as { action: 'index' | 'batch', urls?: IndexingRequest[] };

    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');

    if (!serviceAccountEmail || !privateKey) {
      return new Response(JSON.stringify({ error: 'Google credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate JWT for Google API
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Import crypto key
    const encoder = new TextEncoder();
    
    // Handle both escaped and actual newlines
    let privateKeyData = privateKey;
    if (privateKeyData.includes('\\n')) {
      privateKeyData = privateKeyData.replace(/\\n/g, '\n');
    }
    
    // Remove PEM header/footer and whitespace
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = privateKeyData
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .trim()
      .replace(/\s+/g, '');
    
    console.log('PEM contents length:', pemContents.length);
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Create JWT
    const base64UrlEncode = (data: string) => {
      return btoa(data)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const claimEncoded = base64UrlEncode(JSON.stringify(claim));
    const signatureInput = `${headerEncoded}.${claimEncoded}`;
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(signatureInput)
    );

    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = base64UrlEncode(
      String.fromCharCode.apply(null, signatureArray as any)
    );

    const jwt = `${signatureInput}.${signatureBase64}`;

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return new Response(JSON.stringify({ error: 'Failed to get access token', details: tokenData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = tokenData.access_token;

    if (action === 'batch' && urls) {
      // Batch indexing
      const results = [];
      
      for (const item of urls) {
        try {
          const response = await fetch(
            'https://indexing.googleapis.com/v3/urlNotifications:publish',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: item.url,
                type: item.type,
              }),
            }
          );

          const result = await response.json();
          results.push({
            url: item.url,
            success: response.ok,
            result: result,
          });

          console.log(`Indexed ${item.url}:`, result);
          
          // Rate limiting - wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          results.push({
            url: item.url,
            success: false,
            error: error.message,
          });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-indexing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

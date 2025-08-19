import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  token: string;
  type: 'signup' | 'recovery';
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, type, redirectTo }: VerificationEmailRequest = await req.json();

    console.log('Verification email request:', { email, type, redirectTo });

    const isSignup = type === 'signup';
    const subject = isSignup ? "Hesabınızı təsdiqləyin" : "Parolunuzu yeniləyin";
    const actionText = isSignup ? "Hesabı təsdiqləyin" : "Parolu yeniləyin";
    
    // Create custom verification URL that doesn't use Supabase auth verify
    const baseUrl = redirectTo || 'https://6598636d-17d6-4c97-943b-bc05bdcd0ce0.lovableproject.com';
    const verificationUrl = `${baseUrl}?verified=true&user_id=${token}&email_confirmed=true`;

    const emailResponse = await resend.emails.send({
      from: "İş Axtarış Platforması <noreply@yourdomain.com>", // Sizin domain-inizi əlavə edin
      to: [email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              padding: 20px 0; 
              border-bottom: 2px solid #f0f0f0; 
            }
            .content { 
              padding: 30px 0; 
            }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background: #3b82f6; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .footer { 
              text-align: center; 
              padding: 20px 0; 
              border-top: 1px solid #f0f0f0; 
              color: #666; 
              font-size: 14px; 
            }
            .code { 
              background: #f8f9fa; 
              border: 1px solid #e9ecef; 
              border-radius: 4px; 
              padding: 10px; 
              font-family: monospace; 
              text-align: center; 
              margin: 15px 0; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>İş Axtarış Platforması</h1>
          </div>
          
          <div class="content">
            <h2>Salam!</h2>
            
            ${isSignup ? 
              '<p>Hesabınızı yaratdığınız üçün təşəkkür edirik! Hesabınızı aktiv etmək üçün aşağıdakı düyməyə klikləyin:</p>' : 
              '<p>Parolunuzu yeniləmək üçün aşağıdakı düyməyə klikləyin:</p>'
            }
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">${actionText}</a>
            </div>
            
            <p>Əgər düymə işləmirsə, aşağıdakı linki kopyalayıb brauzerinizə yapışdırın:</p>
            <div class="code">${verificationUrl}</div>
            
            <p><strong>Təhlükəsizlik qeydi:</strong> Əgər bu email sizə aid deyilsə, bu mesajı nəzərə almayın.</p>
          </div>
          
          <div class="footer">
            <p>Bu email avtomatik göndərilmişdir. Cavab verməyin.</p>
            <p>&copy; 2024 İş Axtarış Platforması. Bütün hüquqlar qorunur.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
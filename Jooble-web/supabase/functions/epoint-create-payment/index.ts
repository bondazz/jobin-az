import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Create SHA-1 signature
async function createSignature(
  privateKey: string,
  data: string
): Promise<string> {
  const sgnString = privateKey + data + privateKey;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-1",
    encoder.encode(sgnString)
  );
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const publicKey = Deno.env.get("EPOINT_PUBLIC_KEY");
    const privateKey = Deno.env.get("EPOINT_PRIVATE_KEY");

    if (!publicKey || !privateKey) {
      console.error("EPOINT keys not configured");
      return new Response(
        JSON.stringify({ error: "Payment system not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { submission_id, amount, description, language } = body;

    if (!submission_id || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique order_id
    const order_id = `JBL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      submission_id,
      order_id,
      amount,
      currency: "AZN",
      status: "new",
    });

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update submission status
    await supabase
      .from("referral_job_submissions")
      .update({
        payment_status: "awaiting_payment",
        payment_order_id: order_id,
        payment_amount: amount,
      })
      .eq("id", submission_id);

    // Build Epoint request
    const callbackUrl = `${supabaseUrl}/functions/v1/epoint-callback`;

    const requestData = {
      public_key: publicKey,
      amount: String(amount),
      currency: "AZN",
      language: language || "az",
      order_id,
      description: description || "Jooble.az - İş elanı yerləşdirmə",
      success_redirect_url: "https://jooble.az/add_job/success",
      error_redirect_url: "https://jooble.az/add_job/error",
      result_url: callbackUrl,
    };

    const paymentType = body.payment_type || body.payment_method;
    const isTokenPayment = paymentType === "gpay" || paymentType === "applepay" || paymentType === "widget" || paymentType === "token";

    if (paymentType) {
      (requestData as Record<string, any>).card_type = paymentType;
      (requestData as Record<string, any>).payment_type = paymentType;
    }

    const dataBase64 = btoa(
      new TextEncoder()
        .encode(JSON.stringify(requestData))
        .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
    );
    const signature = await createSignature(privateKey, dataBase64);

    // Try token/widget endpoint for token payments, fallback to /request if needed
    let apiEndpoint = isTokenPayment
      ? "https://epoint.az/api/1/token/widget"
      : "https://epoint.az/api/1/request";

    // Call Epoint API
    let epointResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(dataBase64)}&signature=${encodeURIComponent(signature)}`,
    });

    let epointResult = await epointResponse.json();
    console.log(`Epoint response from ${apiEndpoint}:`, JSON.stringify(epointResult));

    // If token widget returned access error (merchant account token payment not yet activated by Epoint support), fallback to standard request endpoint without card_type
    if ((!epointResult.status || epointResult.status === "error") && isTokenPayment && (epointResult.error || epointResult.message)) {
      console.log("Token payment returned access error, falling back to standard card payment...");
      delete (requestData as Record<string, any>).card_type;
      delete (requestData as Record<string, any>).payment_type;

      const fallbackDataBase64 = btoa(
        new TextEncoder()
          .encode(JSON.stringify(requestData))
          .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
      );
      const fallbackSignature = await createSignature(privateKey, fallbackDataBase64);

      apiEndpoint = "https://epoint.az/api/1/request";
      epointResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(fallbackDataBase64)}&signature=${encodeURIComponent(fallbackSignature)}`,
      });
      epointResult = await epointResponse.json();
      console.log(`Epoint fallback response from ${apiEndpoint}:`, JSON.stringify(epointResult));
    }

    const redirectUrl = epointResult.redirect_url || epointResult.widget_url;

    if ((epointResult.status === "success" || epointResult.status === true) && redirectUrl) {
      return new Response(
        JSON.stringify({
          success: true,
          redirect_url: redirectUrl,
          order_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Update payment as failed
      await supabase
        .from("payments")
        .update({ status: "failed", epoint_message: epointResult.message })
        .eq("order_id", order_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: epointResult.message || "Payment request failed",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Create payment error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Decode base64 string
function base64Decode(str: string): string {
  return new TextDecoder().decode(
    Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
  );
}

// Create SHA-1 signature for verification
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const privateKey = Deno.env.get("EPOINT_PRIVATE_KEY");
    if (!privateKey) {
      console.error("EPOINT_PRIVATE_KEY not configured");
      return new Response("Server configuration error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Parse the POST body (Epoint sends form-urlencoded or JSON)
    let data: string;
    let signature: string;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = formData.get("data") as string;
      signature = formData.get("signature") as string;
    } else {
      const body = await req.json();
      data = body.data;
      signature = body.signature;
    }

    if (!data || !signature) {
      console.error("Missing data or signature");
      return new Response("Bad request: missing data or signature", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verify signature
    const expectedSignature = await createSignature(privateKey, data);

    if (signature !== expectedSignature) {
      console.error("Invalid signature", {
        received: signature,
        expected: expectedSignature,
      });
      return new Response("Invalid signature", {
        status: 403,
        headers: corsHeaders,
      });
    }

    // Decode the data
    const decodedData = JSON.parse(base64Decode(data));
    console.log("Epoint callback data:", JSON.stringify(decodedData));

    const {
      order_id,
      status,
      transaction,
      bank_transaction,
      card_mask,
      rrn,
      code: epointCode,
      message: epointMessage,
      amount,
    } = decodedData;

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isSuccess = status === "success";

    // Update payments table
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: isSuccess ? "success" : "failed",
        transaction: transaction || null,
        bank_transaction: bank_transaction || null,
        card_mask: card_mask || null,
        rrn: rrn || null,
        epoint_code: epointCode || null,
        epoint_message: epointMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
    }

    // Update submission status
    if (isSuccess) {
      // Get the submission_id from payment
      const { data: paymentData } = await supabase
        .from("payments")
        .select("submission_id")
        .eq("order_id", order_id)
        .single();

      if (paymentData?.submission_id) {
        const { error: submissionError } = await supabase
          .from("referral_job_submissions")
          .update({
            payment_status: "paid",
            payment_amount: amount,
            payment_transaction: transaction,
            payment_order_id: order_id,
            payment_date: new Date().toISOString(),
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentData.submission_id);

        if (submissionError) {
          console.error("Error updating submission:", submissionError);
        }
      }
    } else {
      // Payment failed
      const { data: paymentData } = await supabase
        .from("payments")
        .select("submission_id")
        .eq("order_id", order_id)
        .single();

      if (paymentData?.submission_id) {
        const { error: submissionError } = await supabase
          .from("referral_job_submissions")
          .update({
            payment_status: "payment_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentData.submission_id);

        if (submissionError) {
          console.error("Error updating submission:", submissionError);
        }
      }
    }

    // Epoint expects "OK" response
    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Epoint callback error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

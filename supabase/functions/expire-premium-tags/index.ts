import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting premium tag expiration check...');

    // Baku timezone is UTC+4
    const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    // Get current time in Baku timezone
    const now = new Date();
    const nowBaku = new Date(now.getTime() + BAKU_OFFSET_MS);
    
    // Get start of today (midnight) in Baku timezone
    const todayBakuMidnight = new Date(
      nowBaku.getFullYear(),
      nowBaku.getMonth(),
      nowBaku.getDate(),
      0, 0, 0, 0
    );
    
    // Convert back to UTC for database comparison
    const todayMidnightUTC = new Date(todayBakuMidnight.getTime() - BAKU_OFFSET_MS);
    
    console.log(`Checking for premium jobs created before: ${todayMidnightUTC.toISOString()} (${todayBakuMidnight.toLocaleString('az-AZ', { timeZone: 'Asia/Baku' })} Baku time)`);

    // Find all active jobs with premium tag that were created before today (Baku time)
    const { data: premiumJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, tags, created_at')
      .eq('is_active', true)
      .contains('tags', ['premium'])
      .lt('created_at', todayMidnightUTC.toISOString());

    if (fetchError) {
      console.error('Error fetching premium jobs:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${premiumJobs?.length || 0} premium jobs older than 1 day`);

    if (premiumJobs && premiumJobs.length > 0) {
      // Update each job to remove the premium tag
      for (const job of premiumJobs) {
        const updatedTags = job.tags.filter((tag: string) => tag !== 'premium');
        
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ tags: updatedTags })
          .eq('id', job.id);

        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError);
        } else {
          console.log(`Removed premium tag from job: ${job.title} (ID: ${job.id})`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: premiumJobs?.length || 0,
        message: `Processed ${premiumJobs?.length || 0} premium jobs`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in expire-premium-tags function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

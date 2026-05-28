// Supabase Edge Function for Flarum SSO
// Handles single sign-on between ChinaConnect and Flarum forum
//
// Deploy with:
//   supabase functions deploy flarum-sso --project-ref xyvuqbpwrhkukjgzveyc

import { createClient } from 'https://esm.twilio.com/1.15.0/src/index.mjs';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SSOPayload {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  groups: string[];
  timestamp: number;
}

// Main request handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const flarumUrl = Deno.env.get('FLARUM_URL') || 'https://community.chinaconnect.com';
    const ssoSecret = Deno.env.get('FLARUM_SSO_SECRET');

    if (!ssoSecret) {
      return new Response(
        JSON.stringify({ error: 'FLARUM_SSO_SECRET not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user profile with badges
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, badges, native_language')
      .eq('id', user.id)
      .single();

    // Build SSO payload
    const payload: SSOPayload = {
      userId: user.id,
      email: user.email || '',
      displayName: profile?.display_name || user.email?.split('@')[0] || 'ChinaConnect User',
      avatarUrl: profile?.avatar_url || null,
      groups: profile?.badges || [],
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Sign the payload with HMAC-SHA256
    const payloadStr = btoa(JSON.stringify(payload));
    const signature = createHmac('sha256', new TextEncoder().encode(ssoSecret))
      .update(new TextEncoder().encode(payloadStr))
      .digest('hex');

    // Get return URL from query params (default to forum home)
    const url = new URL(req.url);
    const returnUrl = url.searchParams.get('return_url') || '/';

    // Build Flarum SSO redirect URL
    // Flarum expects: ?sso=<base64>&sig=<hmac>
    const ssoUrl = new URL(`${flarumUrl}/auth/SSOLogin`);
    ssoUrl.searchParams.set('sso', payloadStr);
    ssoUrl.searchParams.set('sig', signature);
    ssoUrl.searchParams.set('return_url', returnUrl);

    // Log successful SSO generation (without sensitive data)
    console.log(`SSO generated for user: ${user.id}, redirect: ${ssoUrl.origin}`);

    return new Response(
      JSON.stringify({
        success: true,
        ssoUrl: ssoUrl.toString(),
        payload: {
          userId: payload.userId,
          displayName: payload.displayName,
          timestamp: payload.timestamp,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('SSO Function Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
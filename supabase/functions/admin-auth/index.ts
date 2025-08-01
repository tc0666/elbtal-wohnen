import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, username, password } = await req.json()

    if (action === 'login') {
      // Simple password hashing for demo (in production, use proper bcrypt)
      const passwordHash = btoa(password)
      
      // First, hash the stored temp password if it hasn't been hashed yet
      const { data: tempUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', 'admin65415')
        .eq('password_hash', 'temp_password_to_be_hashed')
        .single()

      if (tempUser) {
        // Update with properly hashed password
        const correctHash = btoa('EO,A4q^8y2_£4h')
        await supabase
          .from('admin_users')
          .update({ password_hash: correctHash })
          .eq('id', tempUser.id)
      }

      // Verify login credentials
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 401 
          }
        )
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // Generate a simple session token (in production, use JWT)
      const sessionToken = btoa(`${user.id}-${Date.now()}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: user.id, username: user.username },
          token: sessionToken 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      const { token } = await req.json()
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'No token provided' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 401 
          }
        )
      }

      // Simple token verification (in production, use JWT)
      try {
        const decoded = atob(token)
        const [userId] = decoded.split('-')
        
        const { data: user, error } = await supabase
          .from('admin_users')
          .select('id, username')
          .eq('id', userId)
          .single()

        if (error || !user) {
          throw new Error('Invalid token')
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: { id: user.id, username: user.username }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 401 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
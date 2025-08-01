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
    console.log('Starting admin auth function...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Read request body once and store it
    const requestBody = await req.json()
    const { action, username, password, token } = requestBody

    console.log('Admin auth request:', { 
      action, 
      username: username ? 'provided' : 'missing',
      hasToken: !!token,
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'set' : 'missing',
      serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'set' : 'missing'
    })

    if (action === 'login') {
      console.log('Processing login for username:', username)
      
      // Simple password hashing for demo (in production, use proper bcrypt)
      const passwordHash = btoa(password)
      console.log('Generated password hash:', passwordHash)
      
      // First, check if we need to update the temp password
      const { data: tempUser, error: tempError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', 'admin65415')
        .eq('password_hash', 'temp_password_to_be_hashed')
        .maybeSingle()

      console.log('Temp user check:', { tempUser: !!tempUser, tempError })

      if (tempUser) {
        console.log('Updating temp password...')
        // Update with properly hashed password
        const correctHash = btoa('EO,A4q^8y2_£4h')
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ password_hash: correctHash })
          .eq('id', tempUser.id)
        
        console.log('Password update result:', { updateError })
      }

      // Verify login credentials
      console.log('Verifying credentials for:', username)
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle()

      console.log('User verification result:', { 
        userFound: !!user, 
        error: error?.message,
        expectedHash: passwordHash 
      })

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
      console.log('Verifying token:', token ? 'provided' : 'missing')
      
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
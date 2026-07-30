import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAnon } from '@/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const { data, error } = await supabaseAnon.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Upsert user profile - handle both trigger-created and new inserts
    if (data.user) {
      const { error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert({ id: data.user.id, email }, { onConflict: 'id' })
        .select('id, email, plan, app_id')
        .single();

      if (upsertError) {
        console.error('User upsert error:', upsertError);
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session
    }, { status: 201 });

  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

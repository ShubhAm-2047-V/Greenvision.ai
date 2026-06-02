import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { email, password, name, role = 'farmer' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Email, password, and name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (createError) {
      if (createError.message?.includes('already registered')) {
        return NextResponse.json({ message: 'An account with this email already exists. Please login instead.' }, { status: 409 });
      }
      return NextResponse.json({ message: createError.message || 'Registration failed.' }, { status: 400 });
    }

    const user = userData.user;

    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        role,
        email
      }, { onConflict: 'id' });

    return NextResponse.json({
      message: 'Registration successful! You can now log in.',
      user: { id: user.id, email: user.email, name, role }
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Server error during registration.', error: err.message }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Admin client uses SERVICE ROLE KEY — bypasses RLS and email confirmation
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/auth/register
 * Registers a new user and auto-confirms their email using the Admin API.
 * This eliminates the "Email not confirmed" error permanently.
 */
export const registerUser = async (req, res) => {
  const { email, password, name, role = 'farmer' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    // Step 1: Create user with email_confirm: true (bypasses confirmation email)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // <-- This is the key fix
      user_metadata: { name, role }
    });

    if (createError) {
      console.error('Admin user creation error:', createError);
      
      // Handle "already registered" gracefully
      if (createError.message?.includes('already registered') || createError.message?.includes('already been registered')) {
        return res.status(409).json({ message: 'An account with this email already exists. Please login instead.' });
      }
      
      return res.status(400).json({ message: createError.message || 'Registration failed.' });
    }

    const user = userData.user;

    // Step 2: Insert profile row into public.profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        role,
        email
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile insert error (non-fatal):', profileError.message);
      // Non-fatal — user is created, profile will be created by trigger if set up
    }

    return res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name,
        role
      }
    });

  } catch (err) {
    console.error('Registration controller exception:', err);
    return res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

/**
 * POST /api/auth/confirm-existing
 * One-time fix: confirms all existing unconfirmed users.
 * Call this once to fix existing accounts that are stuck unconfirmed.
 */
export const confirmExistingUsers = async (req, res) => {
  try {
    // List all unconfirmed users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const unconfirmed = users.filter(u => !u.email_confirmed_at);
    let confirmed = 0;

    for (const u of unconfirmed) {
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(u.id, {
        email_confirm: true
      });
      if (!updateErr) confirmed++;
    }

    return res.status(200).json({
      message: `Confirmed ${confirmed} previously unconfirmed accounts.`,
      total_unconfirmed: unconfirmed.length,
      confirmed
    });
  } catch (err) {
    console.error('Confirm existing users error:', err);
    return res.status(500).json({ message: 'Failed to confirm users.', error: err.message });
  }
};

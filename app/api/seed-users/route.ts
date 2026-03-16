import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const demoUsers = [
    { email: 'student@demo.com', password: 'password123', full_name: 'Demo Student', role: 'student' },
    { email: 'teacher@demo.com', password: 'password123', full_name: 'Demo Teacher', role: 'teacher' },
    { email: 'admin@demo.com', password: 'password123', full_name: 'Demo Admin', role: 'admin' },
  ];

  const results = [];

  for (const user of demoUsers) {
    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { full_name: user.full_name, role: user.role },
      },
    });

    if (authError) {
      results.push({ email: user.email, error: authError.message });
      continue;
    }

    // 2. Insert into profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id,
          full_name: user.full_name,
          role: user.role,
          email: user.email,
        },
      ]);

    if (profileError) {
      results.push({ email: user.email, error: 'Profile creation failed: ' + profileError.message });
    } else {
      results.push({ email: user.email, status: 'Created' });
    }
  }

  return NextResponse.json({ results });
}

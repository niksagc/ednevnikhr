import { createClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, full_name, role } = await request.json();

  const supabase = createClient();

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      },
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // 2. Optionally insert into a profiles table if needed
  // This is a common pattern in Supabase.
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user?.id,
        full_name,
        role,
        email,
      },
    ]);

  if (profileError) {
    // If profile creation fails, we might want to delete the user or handle it
    console.error('Profile creation error:', profileError);
    return NextResponse.json({ error: 'User created but profile failed' }, { status: 500 });
  }

  return NextResponse.json({ user: authData.user });
}

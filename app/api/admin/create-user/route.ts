import { createClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json();
    console.log('API: Creating user', { email, full_name, role });

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
      console.error('API: Auth error', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insert into a profiles table
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
      console.error('API: Profile error', profileError);
      return NextResponse.json({ error: 'User created but profile failed: ' + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: authData.user });
  } catch (error) {
    console.error('API: Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

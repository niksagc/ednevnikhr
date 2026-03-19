'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session);
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log("Profile:", profile, "Error:", profileError);

        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError);
          // Ako ne nađe profil, pokušaj preusmjeriti na login
          router.push('/');
          return;
        }

        const role = profile.role;
        console.log("Redirecting to:", `/${role}`);
        router.push(`/${role}`);
      } else {
        console.log("No session, redirecting to login");
        router.push('/');
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <div className="p-8">Učitavanje...</div>;
  }

  return <div className="p-8">Preusmjeravanje...</div>;
}

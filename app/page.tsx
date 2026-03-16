'use client';
import { useState } from 'react';

export default function CreateUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: 'Korisnik', role }),
    });
    if (res.ok) alert('Korisnik kreiran!');
    else alert('Greška!');
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-4">
      <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
      <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Lozinka" className="border p-2" />
      <select onChange={e => setRole(e.target.value)} className="border p-2">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white p-2">Kreiraj korisnika</button>
    </form>
  );
}

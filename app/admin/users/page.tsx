'use client';
import { useState } from 'react';

export default function CreateUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Korisnik kreiran!');
    } else {
      alert('Greška: ' + (data.error || 'Nepoznata greška'));
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kreiraj novog korisnika</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" onChange={e => setFullName(e.target.value)} placeholder="Puno ime" className="border p-2 w-full" required />
        <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 w-full" required />
        <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Lozinka" className="border p-2 w-full" required />
        <select onChange={e => setRole(e.target.value)} className="border p-2 w-full">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Kreiraj korisnika</button>
      </form>
    </div>
  );
}

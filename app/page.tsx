// app/page.tsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Dobrodošli
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Korisničko ime
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lozinka
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-800 py-2 text-white hover:bg-blue-900"
          >
            PRIJAVA
          </button>
        </form>
      </div>
    </div>
  );
}

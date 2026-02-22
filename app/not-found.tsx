import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-slate-100">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-slate-400 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all"
      >
        Return Home
      </Link>
    </div>
  );
}

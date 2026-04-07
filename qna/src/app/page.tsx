import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-4 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Q&A Tool</h1>
      <p className="mb-6">Ask questions, get answers, and help others.</p>
      <Link href="/channels" className="bg-blue-500 text-white px-4 py-2 rounded">
        Browse Channels →
      </Link>
    </div>
  );
}
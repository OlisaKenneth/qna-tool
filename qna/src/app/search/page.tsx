"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type SearchResult = {
  type: string;
  id: string;
  title?: string;
  content?: string;
  author?: string;
  createdAt?: string;
  netScore?: number;
  replyCount?: number;
  postId?: string;
  postTitle?: string;
  name?: string;
  postCount?: number;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('substring');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');

  const performSearch = async (newPage = 1) => {
    if (!query && searchType !== 'mostPosts' && searchType !== 'leastPosts' && searchType !== 'highestRanked') {
      setError('Please enter a search term');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search?type=${searchType}&q=${encodeURIComponent(query)}&page=${newPage}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For types that don't need query, auto-search on mount
    if (searchType === 'mostPosts' || searchType === 'leastPosts' || searchType === 'highestRanked') {
      performSearch(1);
    }
  }, [searchType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 rounded flex-grow"
            disabled={searchType === 'mostPosts' || searchType === 'leastPosts' || searchType === 'highestRanked'}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border p-2 rounded w-48"
        >
          <option value="substring">Substring search (posts+replies)</option>
          <option value="byAuthor">Posts by author</option>
          <option value="mostPosts">User with most posts</option>
          <option value="leastPosts">User with least posts</option>
          <option value="highestRanked">Highest ranked content</option>
        </select>
      </form>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && results.length === 0 && (
        <div className="text-gray-500">No results found.</div>
      )}

      <ul className="space-y-4">
        {results.map((result, idx) => (
          <li key={idx} className="border p-4 rounded">
            {result.type === 'post' && (
              <>
                <Link href={`/posts/${result.id}`} className="text-xl font-semibold text-blue-600">
                  {result.title}
                </Link>
                <div className="text-sm text-gray-600">by {result.author} · {new Date(result.createdAt!).toLocaleDateString()}</div>
                <p className="mt-2">{result.content}</p>
                <div className="mt-2 text-sm">👍 {result.netScore} · 💬 {result.replyCount} replies</div>
              </>
            )}
            {result.type === 'reply' && (
              <>
                <Link href={`/posts/${result.postId}`} className="text-md font-medium text-blue-600">
                  Reply in: {result.postTitle}
                </Link>
                <div className="text-sm text-gray-600">by {result.author} · {new Date(result.createdAt!).toLocaleString()}</div>
                <p className="mt-2">{result.content}</p>
                <div className="mt-2 text-sm">👍 {result.netScore}</div>
              </>
            )}
            {result.type === 'user' && (
              <div>
                <span className="font-semibold">{result.name}</span>
                <div className="text-sm text-gray-600">Posts: {result.postCount}</div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => performSearch(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            onClick={() => performSearch(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

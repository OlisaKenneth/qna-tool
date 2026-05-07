"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  netScore: number;
  author: { name: string };
  _count: { replies: number };
};

export default function ChannelPage() {
  const { id: channelId } = useParams();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch(`/api/posts?channelId=${channelId}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => {
    if (channelId) fetchPosts();
  }, [channelId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("You must be logged in to post");
      return;
    }
    setError("");
    setUploading(true);

    let screenshotUrl = null;
    if (screenshotFile) {
      const formData = new FormData();
      formData.append('file', screenshotFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        screenshotUrl = data.url;
      } else {
        const err = await uploadRes.json();
        setError(err.error || 'Upload failed');
        setUploading(false);
        return;
      }
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, channelId, screenshot: screenshotUrl }),
    });
    setUploading(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      setScreenshotFile(null);
      fetchPosts();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create post");
    }
  };

  if (loading) return <div className="p-4">Loading posts...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Posts in this channel</h1>

      {/* Create post form */}
      {session && (
        <form onSubmit={handleCreatePost} className="mb-6 border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Create a new post</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-2"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded mb-2"
            rows={3}
            required
          />
          <div className="mb-2 flex items-center gap-2">
            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-300 transition">
              Choose File
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {screenshotFile && <span className="text-sm text-gray-600">{screenshotFile.name}</span>}
          </div>
          <button type="submit" disabled={uploading} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
            {uploading ? "Uploading..." : "Create Post"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="text-gray-500">No posts yet. Be the first to ask!</div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded">
              <Link href={`/posts/${post.id}`} className="text-xl font-semibold text-blue-600">
                {post.title}
              </Link>
              <div className="text-sm text-gray-600 mt-1">
                by {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <p className="mt-2">{post.content.substring(0, 150)}...</p>
              <div className="mt-2 text-sm">
                👍 {post.netScore} · 💬 {post._count.replies} replies
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

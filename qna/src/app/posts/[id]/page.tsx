"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Post = {
  id: string;
  title: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  author: { name: string };
  netScore: number;
};

type Reply = {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  author: { name: string };
  parentId: string | null;
  netScore: number;
  children?: Reply[];
};

export default function PostPage() {
  const { id: postId } = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyScreenshot, setReplyScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!postId) return;
    setLoading(true);
    setError('');

    try {
      const postRes = await fetch(`/api/posts/${postId}`);
      if (!postRes.ok) throw new Error('Failed to fetch post');
      const postData = await postRes.json();
      setPost(postData);

      const repliesRes = await fetch(`/api/replies?postId=${postId}`);
      if (!repliesRes.ok) throw new Error('Failed to fetch replies');
      const repliesData = await repliesRes.json();

      // Build reply tree
      const map = new Map();
      repliesData.forEach((r: any) => {
        map.set(r.id, {
          ...r,
          netScore: r.votes?.reduce((s: number, v: any) => s + v.value, 0) || 0,
          children: [],
        });
      });
      const roots: Reply[] = [];
      repliesData.forEach((r: any) => {
        const node = map.get(r.id);
        if (r.parentId && map.has(r.parentId)) {
          map.get(r.parentId).children.push(node);
        } else {
          roots.push(node);
        }
      });
      setReplies(roots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleVote = async (targetType: 'post' | 'reply', targetId: string, currentScore: number, setScore: (score: number) => void) => {
    if (!session) {
      setError('Please sign in to vote');
      return;
    }
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, value: 1 }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.action === 'removed') setScore(0);
      else if (data.action === 'updated') setScore(currentScore + 1);
      else setScore(currentScore + 1);
    } else {
      const err = await res.json();
      setError(err.error);
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!session) {
      setError('Please sign in to reply');
      return;
    }
    if (!replyContent.trim()) return;
    setUploading(true);
    setError('');

    let screenshotUrl = null;
    if (replyScreenshot) {
      const formData = new FormData();
      formData.append('file', replyScreenshot);
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

    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent, postId, parentId, screenshot: screenshotUrl }),
    });
    setUploading(false);
    if (res.ok) {
      setReplyContent('');
      setReplyScreenshot(null);
      setReplyingTo(null);
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  if (loading) return <div className="p-4">Loading post...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!post) return <div className="p-4">Post not found</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Post */}
      <div className="border p-4 rounded mb-6">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="text-sm text-gray-600 mt-1">
          by {post.author.name} · {new Date(post.createdAt).toLocaleString()}
        </div>
        <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
        {post.screenshot && (
          <img src={post.screenshot} alt="screenshot" className="mt-3 max-w-full rounded" />
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => handleVote('post', post.id, post.netScore, (newScore) => setPost({ ...post, netScore: newScore }))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            👍 {post.netScore}
          </button>
        </div>
      </div>

      {/* Reply Form */}
      {session && (
        <form onSubmit={(e) => handleReply(e, null)} className="mb-6 border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Add a reply</h2>
          <textarea
            rows={3}
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full border p-2 rounded mb-2"
            required
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setReplyScreenshot(e.target.files?.[0] || null)}
            className="mb-2"
          />
          <button type="submit" disabled={uploading} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
            {uploading ? "Uploading..." : "Post Reply"}
          </button>
        </form>
      )}

      {/* Replies Tree */}
      <h2 className="text-xl font-semibold mb-4">Replies</h2>
      {replies.length === 0 && <div className="text-gray-500">No replies yet.</div>}
      <div className="space-y-4">
        {replies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} session={session} onVote={handleVote} onReplyClick={(id) => setReplyingTo(id)} />
        ))}
      </div>

      {/* Inline reply form */}
      {replyingTo && (
        <div className="mt-4 border-l-4 border-blue-300 pl-4">
          <form onSubmit={(e) => handleReply(e, replyingTo)} className="mt-2">
            <textarea
              rows={2}
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              required
            />
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setReplyScreenshot(e.target.files?.[0] || null)}
              className="mb-2 text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={uploading} className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-gray-400">
                {uploading ? "Uploading..." : "Reply"}
              </button>
              <button type="button" onClick={() => setReplyingTo(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}

function ReplyItem({ reply, session, onVote, onReplyClick }: { reply: Reply; session: any; onVote: any; onReplyClick: (id: string) => void }) {
  const [score, setScore] = useState(reply.netScore);
  return (
    <div className="border-l-2 border-gray-200 pl-3 ml-2">
      <div className="bg-gray-50 p-3 rounded">
        <div className="text-sm font-medium">{reply.author.name}</div>
        <div className="text-sm text-gray-600">{new Date(reply.createdAt).toLocaleString()}</div>
        <p className="mt-1">{reply.content}</p>
        {reply.screenshot && (
          <img src={reply.screenshot} alt="screenshot" className="mt-2 max-w-full rounded max-h-48" />
        )}
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => onVote('reply', reply.id, score, setScore)}
            className="text-sm bg-gray-200 px-2 py-1 rounded"
          >
            👍 {score}
          </button>
          {session && (
            <button onClick={() => onReplyClick(reply.id)} className="text-sm text-blue-600">
              Reply
            </button>
          )}
        </div>
      </div>
      {reply.children && reply.children.length > 0 && (
        <div className="ml-4 mt-2 space-y-2">
          {reply.children.map((child) => (
            <ReplyItem key={child.id} reply={child} session={session} onVote={onVote} onReplyClick={onReplyClick} />
          ))}
        </div>
      )}
    </div>
  );
}

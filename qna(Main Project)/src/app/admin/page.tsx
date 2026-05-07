"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type User = { id: string; email: string; name: string; role: string };
type Channel = { id: string; name: string };
type Post = { id: string; title: string; author: { name: string } };
type Reply = { id: string; content: string; author: { name: string } };

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

const fetchData = async () => {
  setLoading(true);
  try {
    const [usersRes, channelsRes, postsRes, repliesRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/channels'),
      fetch('/api/admin/posts?limit=100'),
      fetch('/api/replies?limit=100'),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (channelsRes.ok) setChannels(await channelsRes.json());
    if (postsRes.ok) setPosts(await postsRes.json());
    if (repliesRes.ok) setReplies(await repliesRes.json());
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') fetchData();
  }, [session]);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Delete this ${type}? This action cannot be undone.`)) return;
    const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData(); // refresh
    } else {
      alert('Failed to delete');
    }
  };

  if (status === 'loading' || loading) return <div className="p-4">Loading admin dashboard...</div>;
  if (!session || session.user?.role !== 'ADMIN') return null;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 mb-4 border-b">
        {['users', 'channels', 'posts', 'replies'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <table className="w-full border">
          <thead><tr className="bg-gray-100"><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDelete('users', user.id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'channels' && (
        <table className="w-full border">
          <thead><tr className="bg-gray-100"><th>Name</th><th>Actions</th></tr></thead>
          <tbody>
            {channels.map(ch => (
              <tr key={ch.id} className="border-t">
                <td className="p-2">{ch.name}</td>
                <td><button onClick={() => handleDelete('channels', ch.id)} className="text-red-500">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'posts' && (
        <table className="w-full border">
          <thead><tr className="bg-gray-100"><th>Title</th><th>Author</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-t">
                <td className="p-2">{post.title}</td>
                <td>{post.author?.name || '?'}</td>
                <td><button onClick={() => handleDelete('posts', post.id)} className="text-red-500">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'replies' && (
        <table className="w-full border">
          <thead><tr className="bg-gray-100"><th>Content</th><th>Author</th><th>Actions</th></tr></thead>
          <tbody>
            {replies.map(reply => (
              <tr key={reply.id} className="border-t">
                <td className="p-2">{reply.content.substring(0, 50)}...</td>
                <td>{reply.author?.name || '?'}</td>
                <td><button onClick={() => handleDelete('replies', reply.id)} className="text-red-500">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

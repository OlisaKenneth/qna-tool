'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Channel = {
  id: string;
  name: string;
  createdAt: string;
};

export default function ChannelsPage() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChannelName, setNewChannelName] = useState('');
  const [error, setError] = useState('');

  // Fetch channels on page load
  useEffect(() => {
    fetch('/api/channels')
      .then((res) => res.json())
      .then((data) => {
        setChannels(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    setError('');
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create channel');
      }
      const newChannel = await res.json();
      setChannels([newChannel, ...channels]);
      setNewChannelName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading channels...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Channels</h1>

      {/* Create channel form - admin only */}
      {session?.user?.role === 'ADMIN' && (
        <form onSubmit={handleCreateChannel} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="New channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="border p-2 rounded flex-grow"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Channel
          </button>
        </form>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Channel list */}
      {channels.length === 0 ? (
        <div className="text-gray-500">No channels yet. Create one!</div>
      ) : (
        <ul className="space-y-2">
          {channels.map((channel) => (
            <li key={channel.id} className="border p-3 rounded hover:bg-gray-50">
              <a href={`/channels/${channel.id}`} className="text-blue-600 font-medium">
                #{channel.name}
              </a>
              <div className="text-sm text-gray-500">
                Created: {new Date(channel.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
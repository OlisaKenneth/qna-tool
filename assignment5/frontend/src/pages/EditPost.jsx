import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  async function load() {
    try {
      setError("");
      const res = await fetch(`/api/posts/${id}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load post");
      }

      const post = await res.json();
      setTopic(post.topic || "");
      setData(post.data || "");
    } catch (e) {
      setError(e.message);
    }
  }
  load();
}, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic, data })
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message);
      return;
    }

    navigate(`/posts/${id}`);
  };

  return (
    <div>
      <h2>Edit Post</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <input value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        <div>
          <textarea value={data} onChange={e => setData(e.target.value)} />
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
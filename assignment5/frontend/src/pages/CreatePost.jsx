import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [topic, setTopic] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic, data })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      navigate("/posts");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Create Post</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Topic:</label><br />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label>Data:</label><br />
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
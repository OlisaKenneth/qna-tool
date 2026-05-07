import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        setError("");
        setPost(null);

        // ✅ relative URL (works in Docker at http://localhost)
        const res = await fetch(`/api/posts/${id}`);

        if (!res.ok) {
          let msg = "Failed to fetch post";
          try {
            const err = await res.json();
            msg = err.message || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchPost();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });

      // ✅ your backend returns 204 on success
      if (res.status === 204) {
        navigate("/posts");
        return;
      }

      let msg = "Failed to delete post";
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <h2>{post.topic}</h2>
      <p>{post.data}</p>

      <p>
        <small>Created: {new Date(post.created_at).toLocaleString()}</small>
      </p>

      <hr />

      {/* ✅ correct assignment route */}
      <Link to={`/edit/${post.id}`}>
        <button>Edit</button>
      </Link>

      <button
        onClick={handleDelete}
        style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
      >
        Delete
      </button>

      <br />
      <br />

      <Link to="/posts">Back to Posts</Link>
    </div>
  );
}

export default PostDetails;
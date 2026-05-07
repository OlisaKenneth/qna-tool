import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({
    limit: 20,
    offset: 0,
    count: 0,
    total: 0,
    sort: "created_desc",
    q: "",
  });

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("created_desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchPosts() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      params.set("sort", sort);
      params.set("q", q);

      // ✅ relative URL (works at http://localhost in Docker)
      const res = await fetch(`/api/posts?${params.toString()}`);

      if (!res.ok) {
        let msg = "Failed to load posts";
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setMeta(data.meta || {});
    } catch (e) {
      setError(e.message);
      setPosts([]);
      setMeta((m) => ({ ...m, count: 0 }));
    } finally {
      setLoading(false);
    }
  }

  // Fetch whenever controls change
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, q, sort]);

  function onSearchChange(e) {
    setOffset(0); // reset to first page when searching
    setQ(e.target.value);
  }

  function onSortChange(e) {
    setOffset(0); // reset to first page on sort change
    setSort(e.target.value);
  }

  function onLimitChange(e) {
    setOffset(0); // reset to first page when changing page size
    setLimit(Number(e.target.value));
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < (meta.total || 0);

  return (
    <div>
      <h2>Posts</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search topic or data..."
          value={q}
          onChange={onSearchChange}
          style={{ padding: 6, minWidth: 240 }}
        />

        {/* Sort */}
        <select value={sort} onChange={onSortChange} style={{ padding: 6 }}>
          <option value="created_desc">Newest First</option>
          <option value="created_asc">Oldest First</option>
        </select>

        {/* Limit */}
        <select value={limit} onChange={onLimitChange} style={{ padding: 6 }}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>

        <Link to="/create">
          <button style={{ padding: "6px 10px" }}>Create New Post</button>
        </Link>
      </div>

      <hr />

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {!loading && !error && posts.length === 0 && <div>No posts found.</div>}

      {!loading &&
        !error &&
        posts.map((post) => (
          <div key={post.id} style={{ marginBottom: 16 }}>
            <Link to={`/posts/${post.id}`}>
              <h3 style={{ marginBottom: 4 }}>{post.topic}</h3>
            </Link>
            <p style={{ marginTop: 0 }}>{post.data}</p>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Created: {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}

      <hr />

      {/* Pagination */}
      <div style={{ display: "flex", gap: 10 }}>
        <button disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
          Previous
        </button>

        <button disabled={!canNext} onClick={() => setOffset(offset + limit)}>
          Next
        </button>
      </div>

      <hr />

      {/* Meta */}
      <div style={{ fontSize: 13, background: "#f6f6f6", padding: 10 }}>
        <div><b>Total:</b> {meta.total ?? 0}</div>
        <div><b>Showing:</b> {meta.count ?? 0}</div>
        <div><b>Offset:</b> {meta.offset ?? offset}</div>
        <div><b>Limit:</b> {meta.limit ?? limit}</div>
        <div><b>Sort:</b> {meta.sort ?? sort}</div>
        <div><b>Search:</b> {meta.q ?? q}</div>
      </div>
    </div>
  );
}
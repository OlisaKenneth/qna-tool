// backend/server.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

// If you run everything through http://localhost (nginx proxy), you can remove cors.
// Keeping it won't hurt.
app.use(cors());
app.use(express.json());

let db;

/* ------------------- DATABASE INIT (retry until MySQL ready) ------------------- */
async function initDB(retries = 10) {
  while (retries) {
    try {
      db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      // Ensure table exists (matches assignment schema)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          topic VARCHAR(255) NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      console.log("Connected to MySQL");
      return;
    } catch (err) {
      console.log("Waiting for MySQL...");
      retries--;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  throw new Error("Could not connect to MySQL");
}

/* ------------------- ERROR HELPER ------------------- */
function errorResponse(res, status, message) {
  return res.status(status).json({
    error: status === 400 ? "BadRequest" : status === 404 ? "NotFound" : "ServerError",
    message,
  });
}

function toIsoPost(p) {
  // MySQL DATETIME comes back as Date (often) or string depending on config.
  const created = new Date(p.created_at);
  const updated = new Date(p.updated_at);
  return {
    ...p,
    created_at: created.toISOString(),
    updated_at: updated.toISOString(),
  };
}

function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

/* ------------------- ROUTES ------------------- */

// Optional health check (recommended)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- GET /api/posts (pagination + search + sort + meta) ---------- */
/*
Query params:
- limit (default 20, max 100)
- offset (default 0)
- q (search string)
- sort (created_desc default or created_asc)
*/
app.get("/api/posts", async (req, res) => {
  try {
    let { limit = "20", offset = "0", q = "", sort = "created_desc" } = req.query;

    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);

    if (!Number.isInteger(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    if (!Number.isInteger(offset) || offset < 0) offset = 0;

    if (sort !== "created_desc" && sort !== "created_asc") {
      return errorResponse(res, 400, "sort must be created_desc or created_asc");
    }

    const order =
      sort === "created_asc"
        ? "ORDER BY created_at ASC, id ASC"
        : "ORDER BY created_at DESC, id DESC";

    let whereClause = "";
    const params = [];

    const qStr = String(q || "").trim();
    if (qStr !== "") {
      whereClause = "WHERE topic LIKE ? OR data LIKE ?";
      const like = `%${qStr}%`;
      params.push(like, like);
    }

    // IMPORTANT FIX:
    // With mysql2 + execute(), binding LIMIT/OFFSET can sometimes throw
    // "Incorrect arguments to mysqld_stmt_execute".
    // We safely inject limit/offset after validating they are integers.
    const listSql = `
      SELECT id, topic, data, created_at, updated_at
      FROM posts
      ${whereClause}
      ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await db.execute(listSql, params);

    const countSql = `
      SELECT COUNT(*) as total
      FROM posts
      ${whereClause}
    `;
    const [countRows] = await db.execute(countSql, params);
    const total = Number(countRows[0].total);

    const posts = rows.map(toIsoPost);

    res.json({
      meta: {
        limit,
        offset,
        count: posts.length,
        total,
        sort,
        q: qStr,
      },
      posts,
    });
  } catch (err) {
    console.error("GET /api/posts ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- GET /api/posts/:id ---------- */
app.get("/api/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return errorResponse(res, 400, "id must be a positive integer");

    const [rows] = await db.execute(
      "SELECT id, topic, data, created_at, updated_at FROM posts WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return errorResponse(res, 404, "post not found");

    res.json(toIsoPost(rows[0]));
  } catch (err) {
    console.error("GET /api/posts/:id ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- POST /api/posts ---------- */
app.post("/api/posts", async (req, res) => {
  try {
    const topic = req.body?.topic ? String(req.body.topic).trim() : "";
    const data = req.body?.data ? String(req.body.data).trim() : "";

    if (!topic) return errorResponse(res, 400, "topic is required");
    if (!data) return errorResponse(res, 400, "data is required");

    const [result] = await db.execute(
      "INSERT INTO posts (topic, data) VALUES (?, ?)",
      [topic, data]
    );

    const [rows] = await db.execute(
      "SELECT id, topic, data, created_at, updated_at FROM posts WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(toIsoPost(rows[0]));
  } catch (err) {
    console.error("POST /api/posts ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- PUT /api/posts/:id (replace) ---------- */
app.put("/api/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return errorResponse(res, 400, "id must be a positive integer");

    const topic = req.body?.topic ? String(req.body.topic).trim() : "";
    const data = req.body?.data ? String(req.body.data).trim() : "";

    if (!topic) return errorResponse(res, 400, "topic is required");
    if (!data) return errorResponse(res, 400, "data is required");

    const [result] = await db.execute(
      "UPDATE posts SET topic = ?, data = ? WHERE id = ?",
      [topic, data, id]
    );

    if (result.affectedRows === 0) return errorResponse(res, 404, "post not found");

    const [rows] = await db.execute(
      "SELECT id, topic, data, created_at, updated_at FROM posts WHERE id = ?",
      [id]
    );

    res.json(toIsoPost(rows[0]));
  } catch (err) {
    console.error("PUT /api/posts/:id ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- PATCH /api/posts/:id (partial) ---------- */
app.patch("/api/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return errorResponse(res, 400, "id must be a positive integer");

    const hasTopic = Object.prototype.hasOwnProperty.call(req.body || {}, "topic");
    const hasData = Object.prototype.hasOwnProperty.call(req.body || {}, "data");

    if (!hasTopic && !hasData) {
      return errorResponse(res, 400, "At least one field (topic or data) is required");
    }

    const updates = [];
    const values = [];

    if (hasTopic) {
      const topic = req.body?.topic ? String(req.body.topic).trim() : "";
      if (!topic) return errorResponse(res, 400, "topic cannot be empty");
      updates.push("topic = ?");
      values.push(topic);
    }

    if (hasData) {
      const data = req.body?.data ? String(req.body.data).trim() : "";
      if (!data) return errorResponse(res, 400, "data cannot be empty");
      updates.push("data = ?");
      values.push(data);
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return errorResponse(res, 404, "post not found");

    const [rows] = await db.execute(
      "SELECT id, topic, data, created_at, updated_at FROM posts WHERE id = ?",
      [id]
    );

    res.json(toIsoPost(rows[0]));
  } catch (err) {
    console.error("PATCH /api/posts/:id ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- DELETE /api/posts/:id ---------- */
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!isPositiveInt(id)) return errorResponse(res, 400, "id must be a positive integer");

    const [result] = await db.execute("DELETE FROM posts WHERE id = ?", [id]);

    if (result.affectedRows === 0) return errorResponse(res, 404, "post not found");

    // Required: 204 No Content with no JSON body
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/posts/:id ERROR:", err);
    return errorResponse(res, 500, "Server error");
  }
});

/* ---------- JSON 404 fallback ---------- */
app.use((req, res) => {
  res.status(404).json({ error: "NotFound", message: "route not found" });
});

/* ------------------- START SERVER ------------------- */
initDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});
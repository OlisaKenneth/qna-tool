# Posts API (Assignment 5)

Base URL: http://localhost

All responses are JSON unless otherwise noted.

---

## Error Format

On errors, the API returns:

```json
{
  "error": "BadRequest|NotFound|ServerError",
  "message": "Description of the error"
}
```

---

## GET /api/health

Checks if the backend server is running.

### Success

**200 OK**

```json
{
  "status": "ok"
}
```

---

## GET /api/posts

Returns a list of posts with pagination, search, and sorting.

### Query Parameters

- `limit` (integer, optional, default 20, max 100)
- `offset` (integer, optional, default 0)
- `q` (string, optional, search in topic or data)
- `sort` (`created_desc` or `created_asc`, default `created_desc`)

### Success

**200 OK**

```json
{
  "meta": {
    "limit": 20,
    "offset": 0,
    "count": 2,
    "total": 57,
    "sort": "created_desc",
    "q": ""
  },
  "posts": [
    {
      "id": 14,
      "topic": "Hello",
      "data": "World",
      "created_at": "2026-02-05T18:10:00.000Z",
      "updated_at": "2026-02-05T18:10:00.000Z"
    }
  ]
}
```

### Errors

- **400 Bad Request** if `sort` value is invalid
- **500 Server Error**

---

## GET /api/posts/:id

Returns a single post by ID.

### Success

**200 OK**

```json
{
  "id": 14,
  "topic": "Hello",
  "data": "World",
  "created_at": "2026-02-05T18:10:00.000Z",
  "updated_at": "2026-02-05T18:10:00.000Z"
}
```

### Errors

- **400 Bad Request** if ID is not a positive integer
- **404 Not Found** if post does not exist

---

## POST /api/posts

Creates a new post.

### Example Request

```json
{
  "topic": "Test",
  "data": "This is a post."
}
```

- `topic` (string, required)
- `data` (string, required)

### Success

**201 Created**

```json
{
  "id": 15,
  "topic": "Test",
  "data": "This is a post.",
  "created_at": "2026-02-05T18:20:00.000Z",
  "updated_at": "2026-02-05T18:20:00.000Z"
}
```

### Errors

- **400 Bad Request** if topic or data is missing or empty

---

## PUT /api/posts/:id

Replaces an existing post (full update).

### Example Request

```json
{
  "topic": "Edited",
  "data": "New content"
}
```

### Success

**200 OK**

```json
{
  "id": 15,
  "topic": "Edited",
  "data": "New content",
  "created_at": "2026-02-05T18:20:00.000Z",
  "updated_at": "2026-02-05T18:45:12.000Z"
}
```

### Errors

- **400 Bad Request** if required fields are missing
- **404 Not Found** if post does not exist

---

## PATCH /api/posts/:id

Partially updates a post.

### Request Body

Must include at least one of:

- `topic`
- `data`

### Success

**200 OK**

Returns the updated post object.

### Errors

- **400 Bad Request** if no fields provided
- **404 Not Found** if post does not exist

---

## DELETE /api/posts/:id

Deletes a post.

### Success

**204 No Content**

(No response body)

### Errors

- **400 Bad Request** if ID is invalid
- **404 Not Found** if post does not exist
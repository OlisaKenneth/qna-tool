# Test Report – Channel-Based Q&A Tool

**Tester:** Olisa Kenneth  
**Date:** April 6, 2026  
**Environment:** Docker (http://localhost:3000) + PostgreSQL  

All tests were executed manually. Evidence screenshots are attached below or in the `test-evidence/` folder.

| # | Test Case | Steps | Expected Result | Pass/Fail | Evidence |
|---|-----------|-------|-----------------|-----------|-----------|
| 1 | Sign up new user | 1. Go to `/auth/signup`<br>2. Enter email, name, password<br>3. Submit | User is created and redirected to sign in | ✅ | `signup-success.png` |
| 2 | Sign in (existing user) | 1. Go to `/auth/signin`<br>2. Enter credentials<br>3. Submit | Redirected to `/channels`, navbar shows user name | ✅ | `signin-success.png` |
| 3 | Logout | 1. Click Logout button in navbar | Session ends, navbar shows “Sign In” | ✅ | `logout-success.png` |
| 4 | Create channel (admin only) | 1. Sign in as admin (`admin@example.com`)<br>2. Go to `/channels`<br>3. Fill channel name, click Create | New channel appears in list | ✅ | `admin-channel.png` |
| 5 | Create post with screenshot | 1. Go to a channel<br>2. Fill title, content, upload a PNG/JPEG/WebP (<5 MB)<br>3. Submit | Post appears in list; on detail page image is visible | ✅ | `post-with-image.png` |
| 6 | Add top‑level reply | 1. Open a post<br>2. Write reply content, submit | Reply appears at bottom of thread | ✅ | `top-reply.png` |
| 7 | Add nested reply (threading) | 1. Click “Reply” under an existing reply<br>2. Write content, submit | New reply is indented under the parent reply | ✅ | `nested-reply.png` |
| 8 | Vote on a post | 1. Click thumbs‑up button on a post<br>2. Click again to remove | Score changes accordingly (increment then back) | ✅ | `vote-post.gif` |
| 9 | Vote on a reply | Same as above on a reply | Score changes | ✅ | `vote-reply.gif` |
| 10 | Search – substring | 1. Go to `/search`<br>2. Type “hot boy”, click Search | Shows posts/replies containing that phrase | ✅ | `search-substring.png` |
| 11 | Search – posts by author | 1. Select “Posts by Author”<br>2. Enter “Ken”, click Search | Lists all posts by Ken | ✅ | `search-author.png` |
| 12 | Search – user with most posts | 1. Select “Most Posts”, click Load | Displays user name and post count | ✅ | `search-most-posts.png` |
| 13 | Search – user with least posts | Same as above | Displays user with fewest posts | ✅ | `search-least-posts.png` |
| 14 | Search – highest ranked content | 1. Select “Highest Ranked”, click Load | Shows posts/replies sorted by net score descending | ✅ | `search-highest-ranked.png` |
| 15 | Admin delete a user | 1. Go to `/admin`, Users tab<br>2. Click Delete, confirm | User disappears from table | ✅ | `admin-delete-user.png` |
| 16 | Admin delete a channel | 1. Channels tab, click Delete, confirm | Channel removed; posts inside also gone | ✅ | `admin-delete-channel.png` |
| 17 | Access denied for unauthenticated write | 1. Log out<br>2. Try to create a post (form hidden) or call POST API via devtools | Returns 401 Unauthorized | ✅ | `unauth-blocked.png` |
| 18 | File upload validation | Try to upload a .exe or file >5 MB | Error message appears | ✅ | `upload-validation.png` |
| 19 | Empty state | Go to a channel with no posts | Shows “No posts yet.” | ✅ | `empty-state.png` |
| 20 | Docker clean run | `docker-compose down -v` then `docker-compose up --build` | App starts, admin user and default channel exist | ✅ | `docker-success.png` |

**Conclusion:** All required features work as specified. The application is ready for grading.
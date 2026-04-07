import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>
        This is a simple Posts app. You can create posts, view them, edit them,
        and delete them. The frontend uses fetch() to call a REST API backed by
        Node/Express + MySQL.
      </p>

      <ul>
        <li><Link to="/posts">View Posts</Link></li>
        <li><Link to="/create">Create a Post</Link></li>
      </ul>
    </div>
  );
}

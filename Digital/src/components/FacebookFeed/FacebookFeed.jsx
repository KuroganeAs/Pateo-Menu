import { useState, useEffect } from 'react';
import './FacebookFeed.css';

// Formats an ISO date as e.g. "3 de agosto de 2026" (Portuguese).
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// Fetches the latest Páteo posts from our own serverless proxy (/api/facebook-posts)
// and renders them as cards. On loading it shows skeletons; on error or when there
// are no posts it renders nothing, letting the "Follow us" card in App act as the
// fallback. (In plain `vite dev` the /api route doesn't exist, so this quietly
// falls back too — run `vercel dev` to exercise the real feed locally.)
export default function FacebookFeed() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | empty | error

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetch('/api/facebook-posts', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data.posts) ? data.posts : [];
        setPosts(list);
        setStatus(list.length ? 'ready' : 'empty');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="fb-feed" aria-hidden="true">
        <div className="fb-post-skeleton card" />
        <div className="fb-post-skeleton card" />
      </div>
    );
  }

  // error / empty → render nothing; the CTA card in App.jsx is the fallback.
  if (status !== 'ready') return null;

  return (
    <div className="fb-feed">
      {posts.map((post) => (
        <a
          key={post.id}
          className="fb-post card"
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {post.image && (
            <div className="fb-post-media">
              <img src={post.image} alt="" loading="lazy" />
            </div>
          )}
          <div className="fb-post-body">
            {post.createdTime && <span className="fb-post-date">{formatDate(post.createdTime)}</span>}
            {post.message && <p className="fb-post-text">{post.message}</p>}
            <span className="fb-post-link">
              Ver no Facebook
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

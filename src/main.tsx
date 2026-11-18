import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Legacy HashRouter links (e.g. /#/blog/123) -> clean URLs (/blog/123/)
if (window.location.hash.startsWith('#/')) {
  const legacy = window.location.hash.slice(1);
  const [path, query = ''] = legacy.split('?');
  const clean = path === '/' || path.endsWith('/') ? path : `${path}/`;
  window.history.replaceState(null, '', clean + (query ? `?${query}` : ''));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Post-build step (runs after `vite build`).
 *
 * GitHub Pages only serves real files. Since this is a client-side React app,
 * every route used to return 404 to Google. This script writes a real HTML file
 * for every public URL — with its own <title>, description, canonical, Open Graph
 * tags and JSON-LD — so each page answers 200 and can be indexed:
 *
 *   dist/about/index.html, dist/blog/<id>/index.html, dist/project/<id>/index.html, ...
 *
 * It also generates dist/sitemap.xml and dist/404.html (SPA fallback for /admin
 * and anything not pre-rendered yet).
 *
 * URLs always end with "/" because GitHub Pages redirects /about -> /about/.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "vite";

const SITE = "https://abdellahsheikh.dev";
const DIST = path.resolve("dist");
const DEFAULT_IMAGE = `${SITE}/favicon.svg`;
const today = new Date().toISOString().slice(0, 10);

const env = loadEnv("production", process.cwd(), "VITE_");
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

// Keep in sync with the <Seo> props of each screen in src/screens/
const STATIC_PAGES = [
  {
    path: "/",
    title: "Abdellah Sheikh | عبداللاه شيخ — Full-Stack Software Engineer",
    description:
      "الموقع الرسمي للمهندس عبداللاه شيخ (Abdellah Sheikh) — مهندس برمجيات ومطور ويب متكامل. Official portfolio and engineering projects.",
    priority: "1.0",
  },
  {
    path: "/about/",
    title: "About Abdellah Sheikh | عن عبداللاه شيخ — Profile & CV",
    description:
      "سيرة وخبرات المهندس عبداللاه شيخ (Abdellah Sheikh). مهندس برمجيات ومطور ويب متكامل، المؤهلات والخبرات والمشاريع الهندسية. Full-Stack Software Engineer.",
    priority: "0.9",
  },
  {
    path: "/projects/",
    title: "Projects & Engineering Systems | مشاريع Abdellah Sheikh — عبداللاه شيخ",
    description:
      "معرض المشاريع والتطبيقات والأنظمة البرمجية للمهندس عبداللاه شيخ (Abdellah Sheikh). Selected web applications and architectures.",
    priority: "0.9",
  },
  {
    path: "/blog/",
    title: "Technical Blog | مدونة Abdellah Sheikh — عبداللاه شيخ",
    description:
      "مقالات هندسية ورؤى معمارية برمجية يكتبها المهندس عبداللاه شيخ (Abdellah Sheikh). Software engineering insights and architecture.",
    priority: "0.8",
  },
  {
    path: "/contact/",
    title: "Contact Abdellah Sheikh | تواصل مع عبداللاه شيخ",
    description:
      "تواصل مع المهندس عبداللاه شيخ (Abdellah Sheikh) لمناقشة المشاريع البرمجية، الاستشارات التقنية، وفرص العمل. Get in touch with Abdellah Sheikh.",
    priority: "0.8",
  },
];

// ---------- helpers ----------

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const stripHtml = (s = "") =>
  String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const truncate = (s, n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const absUrl = (u) => {
  if (!u) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE}${u.startsWith("/") ? "" : "/"}${u}`;
};

const isoDate = (d) => {
  const t = d ? new Date(d) : null;
  return t && !isNaN(t) ? t.toISOString().slice(0, 10) : today;
};

/** Replace a single tag matched by `re` (or insert before </head> if missing). */
function setTag(html, re, tag) {
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

function renderPage(template, page) {
  const url = `${SITE}${page.path}`;
  const title = esc(page.title);
  const desc = esc(page.description);
  const image = esc(absUrl(page.image));
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setTag(html, /<meta\s+name="title"[^>]*>/, `<meta name="title" content="${title}" />`);
  html = setTag(html, /<meta\s+name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
  if (page.keywords?.length) {
    html = setTag(html, /<meta\s+name="keywords"[^>]*>/, `<meta name="keywords" content="${esc(page.keywords.join(", "))}" />`);
  }
  if (page.noindex) {
    html = setTag(html, /<meta\s+name="robots"[^>]*>/, `<meta name="robots" content="noindex, follow" />`);
    html = setTag(html, /<meta\s+name="googlebot"[^>]*>/, `<meta name="googlebot" content="noindex, follow" />`);
    html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/, "");
  } else {
    html = setTag(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  }

  html = setTag(html, /<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="${page.ogType || "website"}" />`);
  html = setTag(html, /<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`);
  html = setTag(html, /<meta\s+property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`);
  html = setTag(html, /<meta\s+name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${url}" />`);
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}" />`);
  html = setTag(html, /<meta\s+name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`);

  if (page.jsonLd) {
    const json = JSON.stringify(page.jsonLd).replace(/</g, "\\u003c");
    html = html.replace("</head>", `  <script type="application/ld+json">${json}</script>\n</head>`);
  }

  // Text for crawlers that don't run JavaScript (Bing, social previews, ...)
  html = html.replace(
    /(<noscript>[\s\S]*?<div[^>]*>)[\s\S]*?(<\/div>\s*<\/noscript>)/,
    (_m, open, close) => `${open}\n      <h1>${title}</h1>\n      <p>${desc}</p>${page.noscriptHtml || ""}\n    ${close}`,
  );

  return html;
}

async function writePage(relPath, html) {
  const file = relPath === "/" ? path.join(DIST, "index.html") : path.join(DIST, relPath, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
}

async function fetchTable(table, select) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=created_at.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${table}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

// ---------- main ----------

async function main() {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const pages = [...STATIC_PAGES];

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing (set them in .env.local or CI secrets).");
  }

  const [blogs, projects] = await Promise.all([
    fetchTable("blogs", "id,title,short_description,content,cover_image,image_url,tags,category,author,created_at"),
    fetchTable("projects", "id,title,short_description,description,overview,cover_image,image_url,technical_stack,category,created_at"),
  ]);

  for (const b of blogs) {
    const p = `/blog/${b.id}/`;
    const description = truncate(stripHtml(b.short_description || b.content || b.title));
    pages.push({
      path: p,
      title: `${b.title} — Abdellah Sheikh`,
      description,
      image: b.cover_image || b.image_url,
      keywords: [...(b.tags || []), "Abdellah Sheikh", "عبداللاه شيخ", "blog"],
      ogType: "article",
      lastmod: isoDate(b.created_at),
      priority: "0.7",
      noscriptHtml: `\n      <p><a href="/blog/">← Blog</a></p>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: b.title,
        description,
        image: absUrl(b.cover_image || b.image_url),
        datePublished: b.created_at,
        url: `${SITE}${p}`,
        mainEntityOfPage: `${SITE}${p}`,
        keywords: (b.tags || []).join(", "),
        articleSection: b.category || undefined,
        author: { "@id": `${SITE}/#person` },
        publisher: { "@id": `${SITE}/#person` },
        isPartOf: { "@id": `${SITE}/#website` },
      },
    });
  }

  for (const pr of projects) {
    const p = `/project/${pr.id}/`;
    const description = truncate(stripHtml(pr.short_description || pr.description || pr.overview || pr.title));
    pages.push({
      path: p,
      title: `${pr.title} — Abdellah Sheikh`,
      description,
      image: pr.cover_image || pr.image_url,
      keywords: [...(pr.technical_stack || []), "Abdellah Sheikh", "عبداللاه شيخ", "project"],
      ogType: "article",
      lastmod: isoDate(pr.created_at),
      priority: "0.7",
      noscriptHtml: `\n      <p><a href="/projects/">← Projects</a></p>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: pr.title,
        description,
        image: absUrl(pr.cover_image || pr.image_url),
        dateCreated: pr.created_at,
        url: `${SITE}${p}`,
        keywords: (pr.technical_stack || []).join(", "),
        genre: pr.category || undefined,
        creator: { "@id": `${SITE}/#person` },
        isPartOf: { "@id": `${SITE}/#website` },
      },
    });
  }

  for (const page of pages) {
    await writePage(page.path, renderPage(template, page));
  }

  // SPA fallback: /admin, and any new article until the next build. Never indexed.
  await writeFile(
    path.join(DIST, "404.html"),
    renderPage(template, {
      path: "/",
      title: "Abdellah Sheikh | عبداللاه شيخ",
      description: "Abdellah Sheikh — Full-Stack Software Engineer.",
      noindex: true,
    }),
    "utf8",
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  await writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

  console.log(`prerender: ${pages.length} pages (${blogs.length} blogs, ${projects.length} projects) + 404.html + sitemap.xml`);
}

main().catch((err) => {
  console.error("prerender failed:", err.message);
  process.exit(1);
});

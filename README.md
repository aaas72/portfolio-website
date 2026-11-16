# abdellahsheikh.dev — Portfolio & Blog

Source code of my personal website: a portfolio, technical blog and services page, managed through a built-in admin dashboard backed by Supabase.

**Live site:** [abdellahsheikh.dev](https://abdellahsheikh.dev)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

## Features

**Public site**
- Home page with about, services, working process and tools
- Projects showcase with dedicated project pages
- Technical blog with rich content: code blocks with syntax highlighting, tables, images and aligned text
- Consultation booking (Calendly) and a contact form
- SEO: per-page meta tags, `sitemap.xml` and `robots.txt`
- Scroll-reveal animations and a polished, responsive design

**Admin dashboard** (`/admin`, protected by Supabase Auth)
- Create and edit projects, blog posts, tools and the About section
- Rich-text editor built on TipTap, with resizable images
- Image uploads with client-side compression to Supabase Storage
- Inbox for contact messages and a board for project ideas

## Architecture

```text
src/
├── screens/            # Public pages + Admin/ (layout, login, managers for each content type)
├── components/         # UI: cards, headers, blog, projects, forms, TipTap editor/renderer, alerts
├── services/           # Supabase data access per entity (projects, blogs, tools, messages…)
├── context/            # Global alert/toast state
├── hooks/              # Scroll reveal
├── lib/supabase.ts     # Supabase client
└── types/              # Shared TypeScript models
supabase_schema.sql     # Tables and row-level security policies
```

Data is read publicly and written only by authenticated admins, enforced with Supabase row-level security policies.

## Getting Started

**Requirements:** Node.js 20+, a Supabase project

```bash
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Apply `supabase_schema.sql` in the Supabase SQL editor, then:

```bash
npm run dev       # development server
npm run build     # type-check and production build
```

## Author

**Abdellah Sheikh** — [abdellahsheikh.dev](https://abdellahsheikh.dev) · [LinkedIn](https://www.linkedin.com/in/abdellahsheikh)

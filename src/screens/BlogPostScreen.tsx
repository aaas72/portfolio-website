import React from "react";
import { useParams } from "react-router-dom";
import { NavBar, BlogPage, Footer } from "../components/index";

// SEO tags are set by BlogPage once the article is loaded (and pre-rendered at build time).
const BlogPostScreen: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();

  return (
    <div className="min-h-screen">
      <NavBar />
      <BlogPage blogId={blogId} />
      <Footer />
    </div>
  );
};

export default BlogPostScreen;

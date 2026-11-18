import React from "react";
import { useParams } from "react-router-dom";
import { NavBar, ProjectPage, Footer } from "../components/index";

// SEO tags are set by ProjectPage once the project is loaded (and pre-rendered at build time).
const ProjectScreen: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="min-h-screen ">
      <NavBar />
      <ProjectPage projectId={projectId} />
      <Footer />
    </div>
  );
};

export default ProjectScreen;

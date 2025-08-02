import { useState } from "react";
import { ProjectModal } from "./ProjectModal";

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  paperUrl?: string | null;
  date: string;
  image: string;
  award?: string | null;
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, shopping cart, payment processing, order management, and admin dashboard.",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    githubUrl: "https://github.com/gene/ecommerce",
    liveUrl: "https://ecommerce-demo.com",
    paperUrl: "https://arxiv.org/pdf/example-paper.pdf",
    date: "2024-01",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    award: "winner"
  },
  {
    id: 2,
    title: "Task Management App",
    description: "Real-time collaborative task management with drag-and-drop functionality. Built with Socket.io for real-time updates and Material-UI for modern design.",
    technologies: ["React", "Socket.io", "Express", "MongoDB", "Material-UI"],
    githubUrl: "https://github.com/gene/taskapp",
    liveUrl: "https://taskapp-demo.com",
    paperUrl: null,
    date: "2023-11",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    award: "finalist"
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description: "Interactive weather dashboard with charts and location-based forecasts. Integrates with OpenWeather API for real-time data visualization.",
    technologies: ["React", "D3.js", "OpenWeather API", "Chart.js"],
    githubUrl: "https://github.com/gene/weather",
    liveUrl: "https://weather-dashboard-demo.com",
    paperUrl: null,
    date: "2023-08",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=250&fit=crop",
    award: null
  },
  {
    id: 4,
    title: "Social Media Analytics",
    description: "Analytics dashboard for social media platforms with real-time data processing. Features sentiment analysis and engagement metrics.",
    technologies: ["React", "Python", "FastAPI", "Redis", "Docker"],
    githubUrl: "https://github.com/gene/analytics",
    paperUrl: "https://example.com/research-paper.pdf",
    date: "2024-03",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=250&fit=crop",
    award: "winner"
  },
  {
    id: 5,
    title: "Cryptocurrency Tracker",
    description: "Real-time cryptocurrency price tracker with portfolio management. Built with Vue.js and Firebase for seamless user experience.",
    technologies: ["Vue.js", "TypeScript", "CoinGecko API", "Firebase"],
    githubUrl: "https://github.com/gene/crypto-tracker",
    liveUrl: "https://crypto-tracker-demo.com",
    paperUrl: null,
    date: "2023-06",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=400&h=250&fit=crop",
    award: null
  },
  {
    id: 6,
    title: "Code Editor Extension",
    description: "VS Code extension for enhanced productivity with custom snippets and intelligent code completion features.",
    technologies: ["TypeScript", "VS Code API", "Node.js"],
    githubUrl: "https://github.com/gene/vscode-extension",
    paperUrl: null,
    date: "2024-02",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    award: "finalist"
  }
];

export const PortfolioContent = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">My Projects</h1>
          <p className="text-muted-foreground text-lg">
            Hover to preview • Click to explore
          </p>
        </div>

        {/* Netflix-style Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
              onClick={() => handleProjectClick(project)}
            >
              <div className="aspect-video overflow-hidden rounded-md bg-muted">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center p-2">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 line-clamp-2">
                      {project.title}
                    </h3>
                    {project.award && (
                      <div className="text-yellow-400 text-xs">
                        {project.award === 'winner' ? '🏆' : '🥈'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Award Badge */}
                {project.award && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/80 text-yellow-400 text-xs px-2 py-1 rounded">
                      {project.award === 'winner' ? 'Winner' : 'Finalist'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show more projects message */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Showing 6 of 32+ projects • More coming soon
          </p>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectModal 
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};
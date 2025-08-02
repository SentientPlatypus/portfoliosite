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

        {/* Netflix-style Angled Grid */}
        <div 
          className="perspective-container"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%'
          }}
        >
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 transform-gpu"
            style={{
              transform: 'rotateX(25deg) rotateY(-25deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative cursor-pointer transition-all duration-500 hover:scale-125 hover:z-20 transform-gpu"
                onClick={() => handleProjectClick(project)}
                style={{
                  transformOrigin: 'center center',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div className="aspect-video overflow-hidden rounded-lg bg-muted shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/50">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-150 group-hover:contrast-110 group-hover:saturate-110"
                  />
                  
                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 via-transparent to-primary/10 rounded-lg"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <div className="text-center p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-bold text-sm sm:text-base mb-2 line-clamp-2 drop-shadow-lg">
                        {project.title}
                      </h3>
                      <div className="text-primary font-semibold text-xs">
                        Click to explore
                      </div>
                      {project.award && (
                        <div className="text-yellow-300 text-sm mt-1 animate-pulse">
                          {project.award === 'winner' ? '🏆 Winner' : '🥈 Finalist'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Border Glow */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]"></div>
                </div>
              </div>
            ))}
          </div>
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
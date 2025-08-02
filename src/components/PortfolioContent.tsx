import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Calendar, FileText } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform with React, Node.js, and PostgreSQL",
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
    description: "Real-time collaborative task management with drag-and-drop functionality",
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
    description: "Interactive weather dashboard with charts and location-based forecasts",
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
    description: "Analytics dashboard for social media platforms with real-time data",
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
    description: "Real-time cryptocurrency price tracker with portfolio management",
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
    description: "VS Code extension for enhanced productivity with custom snippets",
    technologies: ["TypeScript", "VS Code API", "Node.js"],
    githubUrl: "https://github.com/gene/vscode-extension",
    paperUrl: null,
    date: "2024-02",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    award: "finalist"
  }
];

export const PortfolioContent = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            A collection of projects showcasing my development skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {project.award && (
                    <Badge variant={project.award === 'winner' ? 'default' : 'secondary'}>
                      {project.award === 'winner' ? '🏆 Winner' : '🥈 Finalist'}
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {project.date}
                  </div>
                </div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="text-sm">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3 h-3 mr-1" />
                        Code
                      </a>
                    </Button>
                    {project.liveUrl && (
                      <Button size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {project.paperUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.paperUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-3 h-3 mr-1" />
                          Paper
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
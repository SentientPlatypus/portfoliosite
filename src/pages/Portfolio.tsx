import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Calendar } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform with React, Node.js, and PostgreSQL",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    githubUrl: "https://github.com/gene/ecommerce",
    liveUrl: "https://ecommerce-demo.com",
    date: "2024-01",
    status: "completed"
  },
  {
    id: 2,
    title: "Task Management App",
    description: "Real-time collaborative task management with drag-and-drop functionality",
    technologies: ["React", "Socket.io", "Express", "MongoDB", "Material-UI"],
    githubUrl: "https://github.com/gene/taskapp",
    liveUrl: "https://taskapp-demo.com",
    date: "2023-11",
    status: "completed"
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description: "Interactive weather dashboard with charts and location-based forecasts",
    technologies: ["React", "D3.js", "OpenWeather API", "Chart.js"],
    githubUrl: "https://github.com/gene/weather",
    liveUrl: "https://weather-dashboard-demo.com",
    date: "2023-08",
    status: "completed"
  },
  {
    id: 4,
    title: "Social Media Analytics",
    description: "Analytics dashboard for social media platforms with real-time data",
    technologies: ["React", "Python", "FastAPI", "Redis", "Docker"],
    githubUrl: "https://github.com/gene/analytics",
    date: "2024-03",
    status: "in-progress"
  },
  {
    id: 5,
    title: "Cryptocurrency Tracker",
    description: "Real-time cryptocurrency price tracker with portfolio management",
    technologies: ["Vue.js", "TypeScript", "CoinGecko API", "Firebase"],
    githubUrl: "https://github.com/gene/crypto-tracker",
    liveUrl: "https://crypto-tracker-demo.com",
    date: "2023-06",
    status: "completed"
  },
  {
    id: 6,
    title: "Code Editor Extension",
    description: "VS Code extension for enhanced productivity with custom snippets",
    technologies: ["TypeScript", "VS Code API", "Node.js"],
    githubUrl: "https://github.com/gene/vscode-extension",
    date: "2024-02",
    status: "in-progress"
  }
];

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-xl text-muted-foreground">
            A collection of projects showcasing my development skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                    {project.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {project.date}
                  </div>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </a>
                    </Button>
                    {project.liveUrl && (
                      <Button size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
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

export default Portfolio;
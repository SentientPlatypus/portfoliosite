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
const projects: Project[] = [{
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
}, {
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
}, {
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
}, {
  id: 4,
  title: "Social Media Analytics",
  description: "Analytics dashboard for social media platforms with real-time data processing. Features sentiment analysis and engagement metrics.",
  technologies: ["React", "Python", "FastAPI", "Redis", "Docker"],
  githubUrl: "https://github.com/gene/analytics",
  paperUrl: "https://example.com/research-paper.pdf",
  date: "2024-03",
  image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=250&fit=crop",
  award: "winner"
}, {
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
}, {
  id: 6,
  title: "Code Editor Extension",
  description: "VS Code extension for enhanced productivity with custom snippets and intelligent code completion features.",
  technologies: ["TypeScript", "VS Code API", "Node.js"],
  githubUrl: "https://github.com/gene/vscode-extension",
  paperUrl: null,
  date: "2024-02",
  image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 7,
  title: "AI Chatbot Platform",
  description: "Intelligent chatbot platform with natural language processing and machine learning capabilities for customer service automation.",
  technologies: ["Python", "TensorFlow", "React", "FastAPI", "PostgreSQL"],
  githubUrl: "https://github.com/gene/ai-chatbot",
  liveUrl: "https://chatbot-demo.com",
  paperUrl: null,
  date: "2024-04",
  image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 8,
  title: "Fitness Tracking App",
  description: "Mobile-first fitness application with workout tracking, nutrition logging, and social features for community engagement.",
  technologies: ["React Native", "Node.js", "MongoDB", "Express"],
  githubUrl: "https://github.com/gene/fitness-app",
  liveUrl: "https://fitness-tracker-demo.com",
  paperUrl: null,
  date: "2023-09",
  image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=250&fit=crop",
  award: null
}, {
  id: 9,
  title: "Music Streaming Service",
  description: "Spotify-like music streaming platform with playlist creation, social sharing, and personalized recommendations using machine learning.",
  technologies: ["React", "Node.js", "Redis", "AWS S3", "TensorFlow"],
  githubUrl: "https://github.com/gene/music-stream",
  liveUrl: "https://music-demo.com",
  paperUrl: null,
  date: "2023-12",
  image: "https://images.unsplash.com/photo-1493564738392-d05ce04f0d86?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 10,
  title: "Blockchain Voting System",
  description: "Secure digital voting platform built on blockchain technology ensuring transparency and immutability of election results.",
  technologies: ["Solidity", "Web3.js", "React", "Ethereum", "IPFS"],
  githubUrl: "https://github.com/gene/blockchain-voting",
  paperUrl: "https://example.com/blockchain-paper.pdf",
  date: "2024-05",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 11,
  title: "Recipe Discovery Platform",
  description: "Food discovery app with AI-powered recipe recommendations, meal planning, and grocery list generation based on dietary preferences.",
  technologies: ["React", "Python", "FastAPI", "PostgreSQL", "OpenAI API"],
  githubUrl: "https://github.com/gene/recipe-platform",
  liveUrl: "https://recipe-demo.com",
  paperUrl: null,
  date: "2023-10",
  image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=250&fit=crop",
  award: null
}, {
  id: 12,
  title: "Virtual Reality Gallery",
  description: "Immersive VR art gallery platform allowing artists to showcase 3D artwork and users to explore virtual exhibitions.",
  technologies: ["A-Frame", "Three.js", "WebXR", "Node.js", "MongoDB"],
  githubUrl: "https://github.com/gene/vr-gallery",
  liveUrl: "https://vr-gallery-demo.com",
  paperUrl: null,
  date: "2024-06",
  image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 13,
  title: "Smart Home Dashboard",
  description: "IoT dashboard for home automation with real-time device monitoring, energy usage tracking, and voice control integration.",
  technologies: ["React", "IoT Core", "AWS Lambda", "DynamoDB", "Alexa SDK"],
  githubUrl: "https://github.com/gene/smart-home",
  liveUrl: "https://smarthome-demo.com",
  paperUrl: null,
  date: "2023-07",
  image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=250&fit=crop",
  award: null
}, {
  id: 14,
  title: "Language Learning Platform",
  description: "Interactive language learning app with speech recognition, gamification, and adaptive learning algorithms for personalized education.",
  technologies: ["React", "Python", "TensorFlow", "WebRTC", "PostgreSQL"],
  githubUrl: "https://github.com/gene/language-app",
  liveUrl: "https://language-demo.com",
  paperUrl: null,
  date: "2024-07",
  image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 15,
  title: "Stock Portfolio Analyzer",
  description: "Advanced financial portfolio analysis tool with real-time market data, risk assessment, and automated trading strategies.",
  technologies: ["React", "Python", "pandas", "Alpha Vantage API", "Redis"],
  githubUrl: "https://github.com/gene/portfolio-analyzer",
  liveUrl: "https://portfolio-demo.com",
  paperUrl: "https://example.com/finance-paper.pdf",
  date: "2023-05",
  image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 16,
  title: "Event Management System",
  description: "Comprehensive event planning platform with ticketing, attendee management, and real-time analytics for event organizers.",
  technologies: ["React", "Node.js", "Stripe API", "MongoDB", "Socket.io"],
  githubUrl: "https://github.com/gene/event-management",
  liveUrl: "https://events-demo.com",
  paperUrl: null,
  date: "2024-08",
  image: "https://images.unsplash.com/photo-1511795409834-432f7b91b4b6?w=400&h=250&fit=crop",
  award: null
}, {
  id: 17,
  title: "Mental Health Tracker",
  description: "Personal wellness app with mood tracking, meditation guides, therapy session scheduling, and progress analytics.",
  technologies: ["React Native", "Node.js", "PostgreSQL", "Stripe", "Push Notifications"],
  githubUrl: "https://github.com/gene/mental-health",
  liveUrl: "https://wellness-demo.com",
  paperUrl: null,
  date: "2023-04",
  image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 18,
  title: "3D Model Marketplace",
  description: "Digital marketplace for buying and selling 3D models with preview functionality, user reviews, and secure payment processing.",
  technologies: ["React", "Three.js", "Node.js", "Stripe", "AWS S3"],
  githubUrl: "https://github.com/gene/3d-marketplace",
  liveUrl: "https://3d-models-demo.com",
  paperUrl: null,
  date: "2024-09",
  image: "https://images.unsplash.com/photo-1558618666-d9d0c5518ad0?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 19,
  title: "AI Code Generator",
  description: "Machine learning powered code generation tool that converts natural language descriptions into functional code snippets.",
  technologies: ["Python", "OpenAI GPT", "React", "FastAPI", "Docker"],
  githubUrl: "https://github.com/gene/ai-codegen",
  liveUrl: "https://codegen-demo.com",
  paperUrl: null,
  date: "2024-10",
  image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 20,
  title: "Drone Mapping System",
  description: "Aerial mapping and surveying platform using drone imagery with AI-powered analysis for construction and agriculture.",
  technologies: ["React", "Python", "OpenCV", "PostGIS", "Leaflet"],
  githubUrl: "https://github.com/gene/drone-mapping",
  liveUrl: "https://drone-demo.com",
  paperUrl: null,
  date: "2023-03",
  image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=250&fit=crop",
  award: null
}, {
  id: 21,
  title: "Quantum Computing Simulator",
  description: "Educational quantum computing simulator with visual circuit builder and quantum algorithm implementations.",
  technologies: ["React", "Python", "Qiskit", "WebGL", "D3.js"],
  githubUrl: "https://github.com/gene/quantum-sim",
  paperUrl: "https://example.com/quantum-paper.pdf",
  date: "2024-11",
  image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 22,
  title: "Video Streaming Platform",
  description: "Netflix-like video streaming service with adaptive bitrate streaming, content recommendations, and offline viewing.",
  technologies: ["React", "Node.js", "FFmpeg", "Redis", "AWS CloudFront"],
  githubUrl: "https://github.com/gene/video-stream",
  liveUrl: "https://video-demo.com",
  paperUrl: null,
  date: "2023-01",
  image: "https://images.unsplash.com/photo-1489599735734-79b4625ba913?w=400&h=250&fit=crop",
  award: "winner"
}, {
  id: 23,
  title: "Supply Chain Tracker",
  description: "Blockchain-based supply chain management system with real-time tracking and transparency for logistics companies.",
  technologies: ["Solidity", "React", "Node.js", "MongoDB", "RFID Integration"],
  githubUrl: "https://github.com/gene/supply-chain",
  liveUrl: "https://supply-demo.com",
  paperUrl: null,
  date: "2024-12",
  image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=250&fit=crop",
  award: "finalist"
}, {
  id: 24,
  title: "Neural Network Visualizer",
  description: "Interactive tool for visualizing and understanding neural network architectures with real-time training visualization.",
  technologies: ["React", "D3.js", "TensorFlow.js", "WebGL", "Python"],
  githubUrl: "https://github.com/gene/nn-visualizer",
  liveUrl: "https://neural-demo.com",
  paperUrl: "https://example.com/neural-paper.pdf",
  date: "2023-02",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
  award: "winner"
}];
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

  // Create different span sizes for varied widths
  const getGridSpan = (index: number) => {
    const patterns = [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1];
    return patterns[index % patterns.length];
  };

  // Extend projects array to go beyond edges and duplicate edge projects lower
  const extendedProjects = [...projects, ...projects.slice(0, 12) // Duplicate first 12 projects to ensure edge ones appear fully later
  ];
  return <div className="h-full overflow-y-auto overflow-x-hidden" style={{backgroundColor: 'hsl(var(--portfolio-shadow))'}}>
      <div className="pt-2 pb-6 -mx-8">
        

        {/* Full-width Grid Layout with Subtle Angle */}
        <div className="perspective-container" style={{
        perspective: '2000px',
        perspectiveOrigin: '50% 50%'
      }}>
          <div className="grid auto-rows-fr gap-2 sm:gap-3 transform-gpu" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          transform: 'rotateX(15deg) rotateY(-15deg)',
          transformStyle: 'preserve-3d',
          width: 'calc(100% + 16rem)',
          // Extend beyond viewport
          marginLeft: '-8rem' // Center the extended grid
        }}>
          {extendedProjects.map((project, index) => <div key={project.id} className="group relative cursor-pointer transition-all duration-700 hover:scale-110 hover:z-20 transform-gpu" onClick={() => handleProjectClick(project)} style={{
            gridColumn: `span ${getGridSpan(index)}`,
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden'
          }}>
              <div className="h-full overflow-hidden rounded-lg transition-all duration-700 shadow-[0_8px_30px_hsl(var(--portfolio-card-shadow))] group-hover:shadow-[0_20px_60px_hsl(var(--portfolio-hover-glow)/0.6)]" 
                   style={{backgroundColor: 'hsl(var(--portfolio-card-dark))'}}>
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-all duration-700 brightness-[0.3] contrast-75 saturate-50 group-hover:brightness-110 group-hover:contrast-125 group-hover:saturate-125" />
                
                {/* Subtle Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40 transition-opacity duration-700 group-hover:opacity-0"></div>
                
                {/* Light-up Glow Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-radial from-transparent via-transparent to-transparent" 
                     style={{background: 'radial-gradient(circle at center, hsl(var(--portfolio-hover-glow)/0.2) 0%, transparent 70%)'}}></div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center rounded-lg backdrop-blur-sm">
                  <div className="text-center p-3 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-2 line-clamp-2 drop-shadow-lg">
                      {project.title}
                    </h3>
                    <div className="font-semibold text-xs transition-colors duration-300" style={{color: 'hsl(var(--portfolio-hover-glow))'}}>
                      Click to explore
                    </div>
                    {project.award && <div className="text-yellow-300 text-sm mt-1 animate-pulse">
                        {project.award === 'winner' ? '🏆 Winner' : '🥈 Finalist'}
                      </div>}
                  </div>
                </div>

                {/* Illuminated Border */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-700 border-2 border-transparent group-hover:border-[hsl(var(--portfolio-hover-glow)/0.8)] group-hover:shadow-[0_0_30px_hsl(var(--portfolio-hover-glow)/0.5),inset_0_0_20px_hsl(var(--portfolio-hover-glow)/0.1)]"></div>
              </div>
            </div>)}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={handleModalClose} />
    </div>;
};
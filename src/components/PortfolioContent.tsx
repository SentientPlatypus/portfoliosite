import { useState, useEffect } from "react";
import { ProjectModal } from "./ProjectModal";
interface Project {
  id: number | string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  paperUrl?: string | null;
  date: string;
  image: string;
  images?: string[];
  award?: string | null;
}
const projects: Project[] = [{
  id: 1,
  title: "QuantJL",
  description: "DDPG based RL agent for trading. Written in Julia, from scratch.",
  technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
  githubUrl: "https://github.com/SentientPlatypus/quantjl",
  liveUrl: null,
  paperUrl: null,
  date: "2024",
  image: "images/gbm_path_full.png",
  images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"],
  award: null
}, {
  id: 2,
  title: "SeeRound",
  description: "The theme for the hackathon was wellness for tech. We immediately thought of our visually impaired friends. We created a hat that has a raspberry pi, a camera, and an ultrasonic sensor. \n This hat connects to your airpods or headphones and uses an object classification model to detect obstacles like people, chairs and tables, along with a distance sensor to detect immediate threats in front of the user. We use bounding boxes and centerpoints to calculate angle, and we wrote a surround-sound script that plays a calm hum in the direction of that object. The volume of this hum is proportional to the distance of the obstacle.",
  technologies: ["Raspberry PI", "YOLOv8", "pysound", "arduino sensors"],
  githubUrl: "https://github.com/AuraHatlol/AuraHat",
  liveUrl: null,
  paperUrl: null,
  date: "2025",
  image: "images/seeround.png",
  award: "Best Hardware Hack @ Makeathon 2025"
}, {
  id: 3,
  title: "LockD",
  description: "Project we built for BigRedHacks. We created a motorized smart lock system with remote control and break-in detection, along with an app to go with it. The lock system was built using a Raspberry Pi and a Servo, supported in a 3-D printed case. A shock and sound sensor connected to the Pi was responsible for break-in detection. The app was scaffolded using React Native with Expos for the frontend and Flask for the backend, and connects to a web server hosted by the Pi. By sending requests to various API endpoints from the Pi's web server, the app is able to remotely unlock and lock the system, and monitor for any red flags raised by the detection system. Whenever suspicious activity is detected i.e. the sensors detect activity beyond normal threshold, a push notification and email is sent out to everyone in the group.",
  technologies: ["Raspberry PI", "Arduino Sensors", "Flask", "Chart.js"],
  githubUrl: "https://github.com/bigredhacks-LockD/lockd",
  liveUrl: "https://devpost.com/software/lockd",
  paperUrl: null,
  date: "2024",
  image: "images/lockd.png",
  images: ["images/lockd.png", "images/lockdemo.png"],
  award: "Best Beginner Hack & Finalist @ BigRedHacks 2024"
}, {
  id: 4,
  title: "Scroll Nudge Experiment",
  description: "Context: The paper aims to study how ranking quality affects seller behavior on a B2B platform. The platform arranges buyer requests sequentially on a seller’s log in page. When the seller logs in, they view requests sequentially starting from the top and click on a button called “contact buyer” if they want to transact with the buyer. The platform generates revenue from the number of times the seller clicks on the “contact buyer” button. The platform is making investments to improve ranking quality, i.e., it wants to show buyer requests that have the highest value to the seller at the top of the page. Empirical results from my paper thus far show that as the platform improves ranking quality, sellers decrease the number of positions viewed on the page, i.e., they do not scroll deep. While this is a good outcome for the seller as they spend less effort on the platform, it may lead to lost usage for the platform, i.e., since the seller is not scrolling deep, there is a possibility of there being a request that the seller would have liked (or clicked “contact buyer” button) if only they had seen it. To overcome this possibility, we are recommending the platform to accompany their investments in improving ranking quality with scroll nudges. A scroll nudge is a prompt to the seller to scroll at least up to a certain position number before ending a session. We want to test this strategy using an experiment at different levels of ranking quality. Goal: Study the impact of scroll nudges on the number of “contact buyer” clicks and views of the seller at different levels of ranking quality. Experiment design: We two groups of participants as follows: without a scroll nudge with a scroll nudge Each participant will be asked to play 30 rounds. In each round we will show a list of 500 requests each and the participant is asked to find all buyer requests which have a value greater than a threshold V (= 75). Among the 30 rounds, 10 will have perfect ranking, 10 will have partial ranking and 10 will have random ranking. The sequence in which the perfect, partial and random ranking are shown can be randomly generated with the following conditions met. Among the first 6, there must be 2 partial, 2 perfect and 2 random sequences Among the last 6, there must be 2 partial, 2 perfect and 2 random sequences The rest can be sequenced randomly. Compensation: Participants will be paid a fixed fee to participate, and a small compensation based on the number of requests they find with a value greater than V. How do we rank: We consider that the value of each buyer request for a seller comes from four features, say x1, x2, x3, x4, x5, x6. The value from each feature is randomly drawn from uniform distributions U(1,17), U(1,19), U(1,14), U(1,19), U(1,17), U(1,14) respectively. The total value of a request for a seller is the sum of values from all the features. Perfect ranking: We obtain this by sorting requests based on total value Partial ranking: We obtain this by sorting requests based on value from only A and C Random ranking: We do not sort.",
  technologies: ["Python", "Flask", "Google Sheet API"],
  githubUrl: "https://github.com/SentientPlatypus/scrollnudge",
  paperUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4684782",
  date: "2024",
  image: "images/ScrollNudge.png",
  award: null
}, {
  id: 5,
  title: "Fight Rig",
  description: "The status quo requires that you go to a gym to train striking sports. Why? Because you need to train with a reactive partner, who will not just take all your hits, but will dodge, and most importantly, Hit Back. We interviewed, observed, and even immersed ourselves in combat sports around ithaca, including Black Irish Boxing, Corazon Martial arts, Ithaca Jiu Jitsu, and even personal trainers. In each area, we saw that people only trained in partners. When asked, they said that training is about building their 'fighting sense.' For example, Spencer from Black Irish Boxing stated that when he went into his first sparring match, he thought he was going to be able to plan things out, and do combos. This all stopped when he got hit. People fight very reflexively. They need people to train with to build that skill. However, we thought that as engineers, we could do better. We are making a training dummy that hits back. Paired with an array of motors and YOLOv8 powered computer vision, our robot will hit you where you are open. Before you needed a partner, a gym, and a car. Now you just need a Fight Rig.",
  technologies: ["Raspberry PI", "Fusion 360", "OpenCV", "FRC Parts"],
  githubUrl: "https://github.com/FightRig",
  liveUrl: "https://sites.google.com/icsd.k12.ny.us/impact-combat-sports/home",
  paperUrl: "https://docs.google.com/document/d/19ejj-SJxbCuwGiaWzqHHQRLWf4gGdKmE3FlvNW5tzmc/edit?usp=sharing",
  date: "2023-06",
  image: "images/FightRig.png",
  images: ["images/FightRig_model.png", "/images/FightRig_wiring.png", "images/fight_rig_base.png", "images/fightrig_slice.png"],
  award: null
}, {
  id: 6,
  title: "Red Hot Chilli Bot",
  description: "For the 2024 FRC game, Crescendo, I continued doing PnP but this time: with 6 cameras. Goodbye Code Red Robotics!",
  technologies: ["OpenCV", "Debian", "Apriltags"],
  githubUrl: "https://github.com/CRRobotics/2024Visions",
  paperUrl: "https://github.com/CRRobotics/2024Visions/blob/master/Code_Red_Robotics_2024_Visions_Docs.pdf",
  date: "2024",
  image: "images/wholeLottaRed.jpg",
  award: null
}, {
  id: 7,
  title: "Cornell ASL Jackal",
  description: "Robots have the potential to assist in emergency evacuation tasks, but it is not clear how robots should behave to evacuate people who are not fully compliant, perhaps due to panic or other priorities in an emergency. In our study, we compare two robot strategies: an actively nudging robot that initiates evacuation and pulls toward the exit and a passively waiting robot that stays around users and waits for instruction. Our robot uses the drive base of Clearpath’s wheeled robot, Jackal, and uses a LIDAR for mapping surroundings, along with cameras for human tracking. The robot will use the LIDAR to localize where it is on whatever map we have given it and will use waypoints to guide users to the exit. For our study, we time people to retrieve objects of value stored in safes and “escape.” They are given a sheet of paper with a lookup table of the code for each safe. Each run is recorded with go-pros placed around Rhodes Hall for further analysis. We have run pilot studies for each of the evacuation methods, and are currently implementing feedback from participants, for the main study that will happen this November. We will submit our paper to the Robotics Science & Systems (RSS). I expanded our particle filtering method to handle sensor uncertainty and navigation in unmapped areas. This algorithm projects the human's position onto the roadmap between waypoints. It involves evaluating every segment between waypoints, excluding those intersecting with walls to create a roadmap. The robot moves to the nearest projected position and follows the human within its navigable area. For the waiting robot, users signal their readiness to be led to the exit using Shadowsense. By placing their hand on top of the robot's inflatable balloon with an embedded camera, the camera detects the hand and signals the robot to change states. I made necessary modifications to the existing code, particularly refining the support vector machine (linear neural network). This involved fitting the model across a grid of hyperparameters, saving it for future use, and deploying it. I developed a state machine that uses the classifier and localization data to ascertain the robot's current state. It also controls the UI by projecting various images on the balloon providing instructions. I developed an algorithm, processing a text file of walls to create a “bloated map”, ensuring the robot avoids corners when following waypoints with Dijkstra's algorithm. Additionally, I also quick fixes to the robot code such as inverting the output from feedback linearization and recording training data. All work is implemented as ROS (robot operating system) nodes for deployment.",
  technologies: ["Python", "Matlab", "ROS"],
  githubUrl: "https://github.com/SentientPlatypus/jackal",
  liveUrl: null,
  paperUrl: "https://dl.acm.org/doi/abs/10.1145/3568162.3576955",
  date: "2023",
  image: "images/jackal.png",
  images: ["images/jackal.png"],
  award: null
}, {
  id: 8,
  title: "FKTXT",
  description: "Over 1.6 million car crashes happen annually due to texting and driving. We wondered how we could help. This started out as a prompt for an engineering presentation, but we decided to go further. We prototyped our software with the pretrained YOLO dataset and the mediapipe hand landmarking model.",
  technologies: ["YOLOv8", "MediaPipe"],
  githubUrl: "https://github.com/FKTXT/FKTXT",
  liveUrl: null,
  paperUrl: null,
  date: "2024",
  image: "images/ftxt.png",
  award: null
}, {
  id: 9,
  title: "Beluga Sturgeon Financial",
  description: "The model expands on Jun's generalized Deep reinforcement learning approach, by adding geometric brownian motion as an indicator. I worked on experimenting with sentiment to see if it was a good indicator. Unfortunately, due to its volatility, it would not provide much advantage to the model. The website shows the stock price over time, the `state` of the environment over time, and finally a recommended action. (0 for short, 1 for idle, and 2 for long.). We have realized that simulation time is quite a bottleneck for website performance so I rewrote it with pytorch to take advantage of parallel GPU computations. Website allows users to purchase “portfolios” which advise them on how to partition their money among chosen stocks. Utilizes firebase database, firebase authentication, and PayPal API.",
  technologies: ["React", "Node.js", "Redis", "AWS S3", "TensorFlow"],
  githubUrl: "https://github.com/Beluga-Sturgeon",
  liveUrl: null,
  paperUrl: null,
  date: "2024",
  image: "images/belugaSturgeon.png",
  images: ["https://github.com/Beluga-Sturgeon/site/raw/main/image.png", "images/belugaSturgeon.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-1.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-4.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-2.png"],
  award: null
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
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Trigger the drop-down animation shortly after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Calculate rows for rotation effect
  const getRowIndex = (index: number) => {
    const gridMinWidth = 160;
    const containerWidth = window.innerWidth - 160;
    const maxColumns = Math.floor(containerWidth / gridMinWidth);
    
    let currentIndex = 0;
    let rowIndex = 0;
    
    while (currentIndex < index) {
      let currentRowSpan = 0;
      while (currentRowSpan < maxColumns && currentIndex < projects.length) {
        const span = getGridSpan(currentIndex);
        if (currentRowSpan + span <= maxColumns) {
          currentRowSpan += span;
          currentIndex++;
        } else {
          break;
        }
      }
      if (currentIndex <= index) rowIndex++;
    }
    
    return rowIndex;
  };
  return <div className="h-full overflow-x-hidden sm:overflow-y-auto">
      <div className="pt-2 pb-6 -mx-8">
        {isMobile ? (
          /* Mobile: Simple Grid Layout */
          <div className="px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`cursor-pointer transition-all duration-700 ease-out ${
                    isVisible 
                      ? 'transform translate-y-0 opacity-100' 
                      : 'transform -translate-y-16 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-muted-foreground text-xs">+{project.technologies.length - 3} more</span>
                        )}
                      </div>
                      {project.award && (
                        <div className="text-yellow-600 text-sm font-medium">
                          {project.award}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Gallery Layout with Row Rotation */
          <div className="perspective-container overflow-hidden" style={{
            perspective: '2000px',
            perspectiveOrigin: '50% 50%'
          }}>
            <div className="grid auto-rows-fr gap-2 sm:gap-3 transform-gpu rotating-gallery" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              transform: 'rotateX(15deg) rotateY(-15deg)',
              transformStyle: 'preserve-3d',
              width: 'calc(100% + 16rem)',
              marginLeft: '-8rem'
            }}>
              {projects.map((project, index) => {
                return (
                  <div 
                    key={project.id} 
                    className={`group relative transition-all duration-700 ease-out transform-gpu cursor-pointer hover:scale-105 hover:z-20 ${
                      isVisible 
                        ? 'transform translate-y-0 opacity-100' 
                        : 'transform -translate-y-20 opacity-0'
                    }`}
                    onClick={() => handleProjectClick(project)} 
                     style={{
                      gridColumn: `span ${getGridSpan(index)}`,
                      transformOrigin: 'center center',
                      backfaceVisibility: 'hidden',
                      transitionDelay: `${Math.min(index * 80, 2000)}ms`
                    }}
                  >
                    <div className="h-full overflow-hidden rounded-lg bg-muted shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/50">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-150 group-hover:contrast-110 group-hover:saturate-110" />
                      
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
                          {project.award && <div className="text-yellow-300 text-sm mt-1 animate-pulse">
                              {project.award === 'winner' ? '🏆 Winner' : '🥈 Finalist'}
                            </div>}
                        </div>
                      </div>

                      {/* Border Glow */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={handleModalClose} />
    </div>;
};
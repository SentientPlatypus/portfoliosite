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
  image: "images/wholelottared.JPG",
  images: ["images/wholelottared.JPG"],
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
  images: ["https://github.com/Beluga-Sturgeon/site/raw/main/image.png", "images/sentimentovertime.png", "images/belugaSturgeon.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-1.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-4.png", "https://github.com/Beluga-Sturgeon/site/raw/main/image-2.png"],
  award: null
}, {
  id: 10,
  title: "Lunar Gateway Storage",
  description: "GrabCad design challenge. Worked with Arda Griffin and Ziqi wang. My part was to CAD the containers for the boxes.",
  technologies: ["Autodesk Inventor"],
  githubUrl: null,
  paperUrl: null,
  liveUrl: "https://grabcad.com/library/nasa-lunar-gateway-module-1",
  date: "2024",
  image: "https://d2t1xqejof9utc.cloudfront.net/screenshots/pics/b94ef139cc3b73ad414a7a05aa3f7dad/large.png",
  images: ["https://d2t1xqejof9utc.cloudfront.net/screenshots/pics/b94ef139cc3b73ad414a7a05aa3f7dad/large.png"],
  award: "Semifinalist @ NASA GrabCad Lunar Gateway Design Challenge"
}, {
  id: 11,
  title: "Toy Rocket League Car",
  description: "I tried making a rocket league car. Check the github.",
  technologies: ["Autodesk 360", "Raspberry PI"],
  githubUrl: "https://github.com/SentientPlatypus/octane7",
  liveUrl: null,
  paperUrl: null,
  date: "2023-10",
  image: "https://github.com/SentientPlatypus/octane7/raw/main/images/engine.png",
  images: ["https://github.com/SentientPlatypus/octane7/raw/main/images/engine.png","https://github.com/SentientPlatypus/octane7/raw/main/images/octane7%20diagram.png","https://github.com/SentientPlatypus/octane7/raw/main/images/body.png", "https://github.com/SentientPlatypus/octane7/raw/main/images/jumper.png"],
  award: null
}, {
  id: 12,
  title: "Johns Hopkins CTY",
  description: "This is a repository of turned in work for the Center for Talented Youth at Johns Hopkins University, Investigations in Engineering. This course was taught by Dr. Manuela Badea TA. Yarin C.A. Throughout the 3 week course, we completed lots of labs, and projects, with each of them documented here. I chose to do most of my writeups in notebooks, as it seemed like a great tool when working with datasets and calculations. I tried R, but Im better with np and pandas haha. For one of the projects, I designed and prototyped an anti-texting device, and I think I might pursue it, dont know though. Kinda overloaded with other things. Check it out. CTY is fun",
  technologies: ["Matplotlib"],
  githubUrl: "https://github.com/SentientPlatypus/JHU-CTY/tree/master",
  liveUrl: null,
  paperUrl: null,
  date: "2023",
  image: "https://i.ytimg.com/vi/XoZz8ZJRpaU/hqdefault.jpg?sqp=-oaymwEXCOADEI4CSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDdi2EDlwFB1D84LqAiupU-8kdFUg",
  images: ["https://i.ytimg.com/vi/XoZz8ZJRpaU/hqdefault.jpg?sqp=-oaymwEXCOADEI4CSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDdi2EDlwFB1D84LqAiupU-8kdFUg"],
  award: null
}, {
  id: 13,
  title: "Gerrymandering Map Analyzer",
  description: "Gerrymandering, the manipulation of district boundaries to benefit a particular political party or group, is a serious issue that undermines the integrity of democratic elections. It can result in the unfair representation of certain communities, the suppression of minority voices, and the consolidation of power in the hands of a select few. Our program aims to allow the user to input an image of a voting district and establish the values of the contiguous, compactness and solidity of the district. We define solidity as the area of a contour subtracted by the areas of all child contours, divided by the area of the parent contour's onvex hull. A convex hull is a boundary which a line segment connecting any two points within the boundary does not intersect the boundary. Compactness of a voting district is measured in a different way. If the shape of the voting district is a perfect circle, the compactness will be 100%. The general formula for compactness is: 4π * (A/P²), where A is the area of the district and P is the parameter of the district. For visualizatoin, a circle that has the same area as the distric will appear upon the district These values will allow the user to then calculate whether or not the district has fallen victim to political gerrymandering or not. In addition, the program can aid the user in determining what group or groups have been suppressed. Upon running this program, 3 windows will open. The first has sliders, which allow ou do configure different color filters, and display different elements of our analysis. The second is the display window. Upon filtering districts, ideal circles will be drawn along with contiguousness and solidity values. You also have the ability to select different districts by clicking on them. Finally, there is a filtering window. Our filter method relies on an HSV filter for colors. The filter window assists the user in finding their desired HSV thresholds for the districts they wish to analyze. We hope that our program can lead to the removal of gerrymandered voting districts and the unfair representation of minority groups and communities. In turn, this will allow us to hold fair and impartial elections and promote greater transparency and acountability in the political process. We believe that developing a reliable and accurate tool to detect gerrymandering, we can ensure that all voices are heard and all communities are represented fairly in our democracy.",
  technologies: ["OpenCV"],
  githubUrl: "https://github.com/Rocky0Shao/GerrymanderProject",
  liveUrl: null,
  paperUrl: null,
  date: "2023",
  image: "images/Selection.png",
  images: ["images/Selection.png"],
  award: null
}, {
  id: 14,
  title: "Tyrannosaurus Red",
  description: "For the 2023 FRC game, Charged up, Code Red made three pipelines, used 5 cameras, and won an award for integrating them into the robot code. One for global positioning, one for game piece detection, and another for game piece orientation. I worked heavily on the first one. Photonvision was mentioned, but a limelight didnt provide a sufficient FOV for detection in the community, so we wrote our own pipeline from scratch. This process forced us to learn how pose estimation was based upon fundamental projection concepts. The details are detailed in documentation I wrote, and I also made this the basis of my AP lang research paper. and ran three cameras, a thread for each. We put a PC on the robot, and made our python script a systemctl service, which ran on startup. The second pipeline, was mainly worked on my Rocky Shao, and involved HSV filters on an RGBD camera, and distance calculations. The Third, was for a deprecated indexer subsystem. Good season overall man I loove solvePnP",
  technologies: ["React", "Python", "TensorFlow", "WebRTC", "PostgreSQL"],
  githubUrl: "https://github.com/CRRobotics/2023Visions",
  liveUrl: null,
  paperUrl: "https://docs.google.com/document/d/11vBBTx2znrTHLFnlTPs0ZAiM80KnKGRd8zlHxrLlmtw/edit#",
  date: "2023",
  image: "images/tyrannosaurusred.png",
  images: ["images/tyrannosaurusred.png", "images/apriltags.png"],
  award: "Innovation In Control Systems Award @ NYTV"
}, {
  id: 15,
  title: "Math animation for finding determinants",
  description: "I made this to freshen up my manim skills for writing visions documentation for Code red. This was also a project for my math teacher. it was supposed to be extra credit, but I didnt finish the animations in time.",
  technologies: ["Manim Animation Library", "Python"],
  githubUrl: "https://github.com/SentientPlatypus/finding-determinants",
  liveUrl: "https://github.com/SentientPlatypus/octane7/raw/main/images/engine.png",
  paperUrl: null,
  date: "2023",
  image: "images/findingdeterminants.png",
  images: ["images/findingdeterminants.png"],
  award: null
}, {
  id: 16,
  title: "Inverted Spear of Heaven",
  description: "I made this to potentially print, and (maybe?) cosplay. If you read Jujutsu Kaisen, you know that the person who weilds this is none other than the absolute UNIT, Toji Fushiguro. Ever since I started working out, I always wanted to have a physique like his.",
  technologies: ["Fusion 360"],
  githubUrl: "https://a360.co/3w6y1V3",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "images/invertedspear.png",
  images: ["images/invertedspear.png", "images/invertedspearmodel.png"],
  award: null
}, {
  id: 17,
  title: "Handwritten Digit Recognition",
  description: "https://machinelearningmastery.com/wp-content/uploads/2019/02/Plot-of-a-Subset-of-Images-from-the-MNIST-Dataset.png",
  technologies: ["Rust"],
  githubUrl: "https://github.com/SentientPlatypus/digit-recognition-dnn",
  liveUrl: null,
  paperUrl: null,
  date: "2023-04",
  image: "https://machinelearningmastery.com/wp-content/uploads/2019/02/Plot-of-a-Subset-of-Images-from-the-MNIST-Dataset.png",
  images: ["https://machinelearningmastery.com/wp-content/uploads/2019/02/Plot-of-a-Subset-of-Images-from-the-MNIST-Dataset.png", "https://github.com/SentientPlatypus/digit-recognition-dnn/raw/master/image-1.png"],
  award: null
}, {
  id: 18,
  title: "Foresight",
  description: "The Foresight is a webapp that does stock price prediction with tensorflow's LSTM dense model. Foresight splits its responsibilities into 2 applications: The webapp, and the Foresight API. The webapp is responsible for displaying content, while the API does most of the heavylifting. I did this, because I needed to access data in javascript that is only available with python libraries. So, I just had my scripts send queries to a python application: the Foresight API. Foresight took a lot of work. Routing, Styling, Scripting, Webscraping, Machine learning, integration and deployment were all things that needed to happen. it was daunting at first, but my enthusiasm increased as things started coming together, especially after integrating the graph (Huge thanks to anychart)",
  technologies: ["Tensorflow", "Javascript", "Python", "Flask", "BS4"],
  githubUrl: "https://github.com/SentientPlatypus/Foresight",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/ForesightLogo.png",
  images: ["https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/ForesightLogo.png", "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/image.png", "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/gf.png"],
  award: "finalist"
}, {
  id: 19,
  title: "Tau Defense",
  description: "I watched a 3b1b video. My math teacher, Shaun Errichiello also had a project. So I learned manim. This proof just details why Tau/2 r squared is actually better than the traditional pi r^2. The focus is maintaining the integrity of the circumference.",
  technologies: ["Python", "Manim"],
  githubUrl: "https://github.com/SentientPlatypus/circle-area-proof",
  liveUrl: "https://www.youtube.com/watch?v=Okraa2ZElrE",
  paperUrl: null,
  date: "2023",
  image: "images/tauV.png",
  images: ["images/tauV.png"],
  award: null
}, {
  id: 20,
  title: "Foresight API",
  description: "The Foresight API is the brain behind My Stock prediction webapp foresight. It scrapes data from the google finance website, and makes predictions using Tensorflow's LSTM Dense model. Its also open source, so you should check out the github, and some of its endpoints",
  technologies: ["TensorFlow", "Python", "Flask", "BS4"],
  githubUrl: "https://github.com/SentientPlatypus/Foresight-API",
  liveUrl: "https://foresightapi.herokuapp.com/",
  paperUrl: null,
  date: "2023-03",
  image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=250&fit=crop",
  award: null
}, {
  id: 21,
  title: "Neural Network Traffic Simulation",
  description: "A project made entirely on vanilla javascript HTML and CSS. Implements a basic feed forwards neural network which determines the Cars movements. The simulation relies on random variability in the parameters instead of stochastic gradient descent. In other words, it omits the calculus. The Car movements made a great application of the unit circle.",
  technologies: ["js", "HTML", "CSS"],
  githubUrl: "https://github.com/SentientPlatypus/Self-Driving-Car-Simulation",
  paperUrl: null,
  date: "2022",
  image: "images/selfdrivingcar.png",
  award: null
}, {
  id: 22,
  title: "Red Zeppelin",
  description: "Rapid React, the FRC 2022 game was very similar to basketball. Code Red Robotics (My Highschools Robotics Team), wanted a visions pipeline that would accurately track the circular target and relay its distance and angle data at a high rate. We delivered. I worked with one other student and a mentor to create not only a target tracking pipeline, but also a ball tracking one. This was the first year that the visions sytsem worked on the robot. The target tracking pipeline was deployed on a limelight, while the ball tracking one was developed on a jevois camera. Both used OpenCV, involved lots of trig, and yielded results that required (mostly) linear corrections. Overall, It was a solid pipeline that helped the team perform amazing at the competition.",
  technologies: ["OpenCV", "Python", "limelight", "jevois"],
  githubUrl: "https://github.com/CRRobotics/2022Visions",
  liveUrl: "https://www.youtube.com/watch?v=TQ1GWP2IlH4g",
  paperUrl: "https://docs.google.com/document/d/1_yqAvAPJ5UYAn3vQuKAiG6M5FvJACrHMLZhiMXVHW5s/edit?usp=sharing",
  date: "2023-01",
  image: "https://i.ytimg.com/vi/TQ1GWP2IlH4/mqdefault.jpg",
  images: ["https://i.ytimg.com/vi/TQ1GWP2IlH4/mqdefault.jpg"],
  award: null
}, {
  id: 23,
  title: "Lives SMP",
  description: "Lives SMP is a spigot plugin for minecraft that implements a life system. In this life system, You can donate lives, and steal lives when you kill another player. When a player's lives reaches 0, they are put in spectator mode, and a message is shown to everyone in the server. This was my first java project, and It was really fun making it.",
  technologies: ["Java", "Spigot", "Minecraft"],
  githubUrl: "https://github.com/SentientPlatypus/LiveSMP",
  liveUrl: "https://supply-demo.com",
  paperUrl: null,
  date: "2024-12",
  image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=250&fit=crop",
  award: "705 downloads"
}, {
  id: 24,
  title: "LightSaber",
  description: "I made this lightsaber for a project in school. I hope to print it. First cool thing I made with CAD software.",
  technologies: ["React", "D3.js", "TensorFlow.js", "WebGL", "Python"],
  githubUrl: null,
  liveUrl: "https://a360.co/3VDHZrd",
  paperUrl: null,
  date: "2022",
  image: "images/lightsabermodel.png",
  images: ["images/lightsabermodel.png", "images/Lightsaberwithblade.png"],
  award: null
}, {
  id: 25,
  title: "IHS Social Credit",
  description: "The Peoples Republic of IHS is a discord bot made for my highschools discord server. Each server member is given social credit, which may increase or decrease depending on what they do. This project is open source, I am not maintaining it anymore, but feel free to fork and make pull reqs.",
  technologies: ["nextcord", "Python"],
  githubUrl: "https://github.com/SentientPlatypus/SocialCredit",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "images/lightsabermodel.png",
  images: ["images/lightsabermodel.png", "images/Lightsaberwithblade.png"],
  award: null
}, {
  id: 26,
  title: "BozuBot",
  description: "BozuBot is a discord bot made for the CodeBozu communnity. Codebozu was a cornell edtech startup, which offered coding courses. I wrote this bot in like 2 days. Rishi hit me up and asked me If I could make a bot that could sort people into groups based on a google spreadsheet. I said yes. This bot also adds support for Bozu point tracking, which was an awards system in the community. Unfortunately, CodeBozu has been discontinued.",
  technologies: ["nextcord", "Python"],
  githubUrl: "https://github.com/SentientPlatypus/BozuBot",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "https://media-exp1.licdn.com/dms/image/C4D0BAQFmTZ4t_b7H8A/company-logo_200_200/0/1639364471276?e=2147483647&v=beta&t=KB2ySCdsQzrU7hV9jmZS_kXoka7GnR_HUifxCRNoVdM",
  images: ["https://media-exp1.licdn.com/dms/image/C4D0BAQFmTZ4t_b7H8A/company-logo_200_200/0/1639364471276?e=2147483647&v=beta&t=KB2ySCdsQzrU7hV9jmZS_kXoka7GnR_HUifxCRNoVdM"],
  award: null
}, {
  id: 27,
  title: "BozuBot",
  description: "BozuBot is a discord bot made for the CodeBozu communnity. Codebozu was a cornell edtech startup, which offered coding courses. I wrote this bot in like 2 days. Rishi hit me up and asked me If I could make a bot that could sort people into groups based on a google spreadsheet. I said yes. This bot also adds support for Bozu point tracking, which was an awards system in the community. Unfortunately, CodeBozu has been discontinued.",
  technologies: ["nextcord", "Python"],
  githubUrl: "https://github.com/SentientPlatypus/BozuBot",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "https://media-exp1.licdn.com/dms/image/C4D0BAQFmTZ4t_b7H8A/company-logo_200_200/0/1639364471276?e=2147483647&v=beta&t=KB2ySCdsQzrU7hV9jmZS_kXoka7GnR_HUifxCRNoVdM",
  images: ["https://media-exp1.licdn.com/dms/image/C4D0BAQFmTZ4t_b7H8A/company-logo_200_200/0/1639364471276?e=2147483647&v=beta&t=KB2ySCdsQzrU7hV9jmZS_kXoka7GnR_HUifxCRNoVdM"],
  award: null
}, {
  id: 28,
  title: "Reflex Testing Game",
  description: "This game is played with a camera. The goal is to catch as many circles as you can with your hand. This project was made to help me get familiar with openCV before the code red season. It uses a library that adds landmarks to where the joints in your hands are, after that its just basic math.",
  technologies: ["OpenCV", "Mediapipe Models"],
  githubUrl: "https://github.com/SentientPlatypus/Advanced-AI-Visions/tree/main/Hand%20tracker",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "images/ReflexGame.png",
  images: ["images/ReflexGame.png"],
  award: null
}, {
  id: 29,
  title: "Amoris",
  description: "Amoris was a discord bot that had an absolute truckload of features. It was my very first project in python. So everything new that I learned, would have some implementation in Amoris. Each of the systems in Amoris was interconnected. You want to play minecraft with your virtual friend? You need to buy a pc and minecraft from the shop first. And make sure your PC meets the specs minecraft has. You need money? Get a job! Job application rejected? Get some xp first. Or, if you want secondary income, you can fish, mine or hunt (make sure you buy the correct tools to do so). Want to get better loot? Craft better tools. Someone is trying to rob you? Defend yourself! Got beaten, upgrade your stats by levelling up! Use your money to buy weapons and items that have different abilities and ultimates. I even made a webapp that you can change personal settings from! Amoris' main feature was the.. well.. lets call it the 'friend simulator' This simulator allows you to customize everything about your buddy. Images, personality, etc. The cool thing is, The experiences with your friend are saved, and their responses update as well. Its like talking to a real person. This is thanks to GPT-3, an incredibly advanced NLP engine. It should also be noted that Amoris has a webapp that users can go to modify guild settings. Source code is linked down below. It was an excellent application of MongoDB.",
  technologies: ["Nextcord", "MongoDB", "Python", "Flask", "OpenAI GPT-3"],
  githubUrl: "https://github.com/SentientPlatypus/Amoris",
  liveUrl: "https://discord.com/oauth2/authorize?client_id=822265614244511754&permissions=8&scope=bot",
  paperUrl: null,
  date: "2021",
  image: "https://cdn.discordapp.com/avatars/822265614244511754/61cdc288c07c18e83082e538e5ca6671.webp?size=1024",
  images: ["https://cdn.discordapp.com/avatars/822265614244511754/61cdc288c07c18e83082e538e5ca6671.webp?size=1024"],
  award: null
}, {
  id: 30,
  title: "Puzzles",
  description: "This was the submission for the discord code jam hosted by the Python discord server. It was a competition among groups made of individuals who had solved the qualifier. It was my very first time working in a group with other developers, so it was a very valuable experience.",
  technologies: ["Python", "Turtle"],
  githubUrl: "https://github.com/Sleek-Snails/Snail-Snacks",
  liveUrl: "https://discord.com/oauth2/authorize?client_id=822265614244511754&permissions=8&scope=bot",
  paperUrl: null,
  date: "2021",
  image: "images/puzzles.png",
  images: ["images/puzzles.png"],
  award: null
}, {
  id: 30,
  title: "Politician Scraping",
  description: "This was a project focused on webscraping from various web sources and running sentiment analysis. In this paper, my group details its results and process scraping statistics from the web. In the last scrape, We generated a heatmap which showed different news sources sentiment towards different presidents.",
  technologies: ["Python", "BS4"],
  githubUrl: "https://github.com/CodeBozu-Group-24",
  liveUrl: null,
  paperUrl: "https://docs.google.com/document/d/1wopOZllNE47XJXkMYUnJH79BcgCRephUfpS8FBaqJrw/export?format=pdf",
  date: "2021",
  image: "images/puzzles.png",
  images: ["images/puzzles.png"],
  award: null
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
    const patterns = [2, 2, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1];
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
  return <div className="h-full overflow-x-hidden overflow-y-auto">
      <div className="pt-2 pb-6 -mx-8">
        {/* Always use mobile-style linear layout */}
        <div className="px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>

      {/* Project Details Modal */}
      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={handleModalClose} />
    </div>;
};
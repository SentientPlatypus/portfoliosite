import { useState, useEffect } from "react";
import { ProjectModal } from "./ProjectModal";
import { TechTag } from "./TechTag";
import { motion } from "framer-motion";
import type { InteractiveKind } from "./interactive/kinds";
export type ProjectTableCell = string | { text: string; href: string };

export interface ProjectTable {
  headers: string[];
  rows: ProjectTableCell[][];
}

interface Project {
  id: number | string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  liveUrlLabel?: string;
  pypiUrl?: string;
  paperUrl?: string | null;
  date: string;
  image: string;
  images?: string[];
  videos?: string[];
  award?: string | null;
  interactive?: InteractiveKind;
  resultsTable?: ProjectTable;
}
const projects: Project[] = [
{
  id: 1,
  title: "FourierMesh",
  description: "A Blender Addon and registered pypi python library for spectral analysis and low-frequency reconstruction for triangle meshes using the graph Laplacian.Its eigenvectors form a Fourier basis shaped by the geometry itself — low modes carry broad form, high modes carry fine detail. The add-on solves the eigenbasis once and caches it, keeping the k slider live in the viewport, and can paint individual modes onto the surface. ",
  technologies: ["Python", "Blender"],
  githubUrl: "https://github.com/SentientPlatypus/FourierMesh",
  liveUrl: "https://extensions.blender.org/add-ons/fouriermesh/",
  liveUrlLabel: "View on Blender",
  pypiUrl: "https://pypi.org/project/FourierMesh/",
  paperUrl: null,
  date: "2026",
  image: "images/Fouriermesh.png",
  images: ["images/david_mesh_fourier_compare_k_30.png"],
  videos: ["david_fourier_smoothing.mp4", "visualize_eigen.mp4"],
  award: "500 downloads on Blender Add-ons!",
  interactive: "fouriermesh-david"
},
{
  id: 2,
  title: "Spinphony",
  description: "Spinphony is an embedded audio-to-motor system built on the FRDM-KL46Z microcontroller. Instead of recording through an analog microphone, the current system listens to computer audio routed through a virtual audio cable, analyzes it live on the host, and streams motor commands to the board as the song plays. On the laptop, system audio is captured at 48 kHz, mixed to mono, normalized, resampled to 8.4 kHz, and analyzed with a Short-Time Fourier Transform. The Python code turns the notes it finds into motor frequencies and sends compact serial packets to the board. The FRDM receives those frames over USB-UART, buffers them, and drives four NEMA17 stepper motors with a 20 kHz phase-accumulator loop. The live visualizer helped us see the spectrum and the motor notes while a song was playing.",
  technologies: ["C", "FRDM KL46z"],
  githubUrl: "https://github.com/SentientPlatypus/spinphony",
  liveUrl: "https://sentientplatypus.github.io/spinphony/",
  paperUrl: null,
  date: "2026",
  image: "images/spinphony_demo.png",
  images: ["images/spinphony_exploded.png"],
  videos: ["https://www.youtube.com/watch?v=9HgGE3Rc5pE", "https://www.youtube.com/watch?v=yMq8EANEw10&t=10s"],
  award: "ECE 3140 Honorable Mention"
},
{
  id: 3,
  title: "GroovyAR",
  description: "AR-assisted real-time drumming trainer that maps songs to timed 4-lane percussion cues via Fast fourier transform, and displays them to a Raspberry Pi Screen in an Osu-like game. Engineered a low-latency pipeline by preprocessing MP3s into timestamped JSON events (librosa), streaming cues over WebSockets, and anchoring UI with ArUco tracking (OpenCV PnP).",
  technologies: ["OpenCV, scikit"],
  githubUrl: "https://github.com/Cyberninja101/Groovy/tree/main",
  liveUrl: "https://www.youtube.com/watch?v=zjiVDPzzH5k",
  paperUrl: null,
  date: "2026",
  image: "images/renderLOL.png",
  images: ["https://github.com/Cyberninja101/Groovy/blob/main/image.png?raw=true", "https://github.com/Cyberninja101/Groovy/blob/main/docs/media/IMG_0723.png?raw=true"],
  videos: [],
  award: "1st Place @ Cornell Makeathon 2026"
},
{
  id: 4,
  title: "OptionsImpliedPDF.jl",
  description: "OptionsImpliedPDF.jl is a registered package in the Julia registry that extracts risk-neutral probability distributions from options market data, revealing the market's collective expectations about future asset price movements. This is done by solving for implied volatility, fitting an SVI curve, and numerically differentiating, thus creating a PDF by breeden litzenberger.",
  technologies: ["Julia"],
  githubUrl: "https://github.com/SentientPlatypus/OptionsImpliedPDF.jl",
  liveUrl: "https://juliahub.com/ui/Packages/General/OptionsImpliedPDF",
  paperUrl: null,
  date: "2026",
  image: "images/oipd_logo.png",
  images: ["images/7_pdf_numerical.png"],
  videos: [],
  award: "Registered Julia Package",
  interactive: "optionspdf"
},
{
  id: 36,
  title: "Electric Fire",
  description: "Electric Fire is Cornell Team 10's autonomous drone-racing stack for the 2026 Anduril AI Grand Prix physical qualifier. A deep-RL flight policy trained in Isaac Lab flies through gates that a YOLO pose model finds in the camera image, using a vision–inertial state estimate, all running onboard an NVIDIA Jetson Orin NX.\n\nThe onboard loop: IMX477 camera at 30 fps into YOLOv8n-pose (8 corners per gate), PnP plus a pose filter and gate tracker that fuse vision with IMU, then a PPO policy at 40 Hz (55 channels × 32 frames) that outputs collective thrust and three body rates. A control adapter inverts Betaflight's rate curve and streams four RC channels over MSP. Training is Isaac Sim / Isaac Lab / skrl PPO on race and hover tasks (checkpoints race40 and race40drop). My contributions include on-site camera calibration and gate-corner view alignment in the Isaac Sim stack.",
  technologies: ["Python", "Isaac Lab", "PPO", "YOLOv8"],
  githubUrl: "https://github.com/Etienne-Sasenarine/AI-Grand-Prix",
  liveUrl: null,
  paperUrl: "https://github.com/Etienne-Sasenarine/AI-Grand-Prix/blob/main/docs/paper/paper.md",
  date: "2026",
  image: "images/electric_fire_race_start.png",
  images: ["images/electric_fire_system.png", "images/electric_fire_camera.png"],
  videos: ["electric_fire_race_start.mp4"],
  award: "Anduril AI-GP team #10"
},
{
  id: 5,
  title: "Indonesian Coconut",
  description: "Indonesian Coconut is a 1v1 Rocket League bot trained with deep RL (PPO) and no human replays.\n\nTraining is ~1.7× faster than upstream (40.8k → 70.1k steps/s on one NVIDIA L4).\n\nEach tick is a 106-float observation; the policy picks one of 90 discrete actions every 8 physics ticks (~15 decisions/s). Actor and critic are 2048-2048-1024-1024 MLPs. Rewards cover goals, ball velocity toward goal, aerials, flip resets, air dribble bumps, demos, boost, and possession. Warm-started from the earlier Python policy, then trained in 1B-step stages in RocketSim on one L4 against a league of frozen past versions plus Rust ports of community bots (FR4, Galactus, Megabyte, a top C++ bot verified action-for-action against the original, and others). 200-game evals every 50M steps; a stage only becomes champion if it wins head-to-head without regressing. Current champion is ST11 after ~11.1B steps. Deploys as an RLBot v5 bot: compiled Rust binary on CPU, Windows and Linux.\n\nThe trainer is indococo-ppo (https://github.com/SentientPlatypus/indococo-ppo), a high-throughput learning framework for Rocket League bots — a Rust workspace forked from VirxEC's rlgymppo_rs and extended. Parallel RocketSim games on CPU thread pools, batched GPU inference, PPO (GAE, clipped loss) in Burn with a LibTorch backend, league/self-play opponents, checkpoints, metrics, a terminal dashboard, and RLBot export. Additions: GPU-side update metrics, optional per-network bf16, a TF32 path, external frozen opponents (foreign bots with their own obs/action tables/delay), and CI with tests. Bot: https://github.com/SentientPlatypus/indonesian_coconut/tree/indococo-ppo",
  technologies: ["Rust", "PPO", "Burn", "RLBOT"],
  githubUrl: "https://github.com/SentientPlatypus/indonesian_coconut/tree/indococo-ppo",
  liveUrl: "https://github.com/SentientPlatypus/indococo-ppo",
  liveUrlLabel: "indococo-ppo",
  paperUrl: null,
  date: "2025",
  image: "images/indococo_vs_ripple_v1.webp",
  images: [],
  videos: ["images/indococo_highlight.mp4"],
  award: "SSL->Pro tier",
  resultsTable: {
    headers: ["Bot", "Rank", "Checkpoint that beat it", "Date beaten", "Score", "Replay"],
    rows: [
      ["Ripple v1.1", "Pro", "ST8 (`checkpoints_to_test/st8_8666M.bpk`, 8666.3M steps)", "2026-11-05", "17-1", { text: "ballchasing", href: "https://ballchasing.com/replay/2fc5fa80-2a16-4905-84b4-c175f72743dc" }],
      ["Ripple v1.0", "SSL", "ST8 (`checkpoints_to_test/st8_8666M.bpk`, 8666.3M steps)", "2026-11-06", "16-3", { text: "ballchasing", href: "https://ballchasing.com/replay/3be4d259-2550-4ea9-8b78-91c496f819dd" }],
      ["Nexto", "Grand Champion", "E2G1 (`PPO_POLICY_V4_E2G1.pt`, Python policy)", "2026-09-30", "42-11", { text: "ballchasing", href: "https://ballchasing.com/replay/dcdad7bc-640d-4eb7-bfd8-f0634e49cd30" }],
      ["Necto", "Champion", "pending", "pending", "pending", "pending"],
      ["Element", "Diamond", "V3 checkpoint (Python policy)", "2025-12-28", "47-3", { text: "ballchasing", href: "https://ballchasing.com/replay/41b8d475-dc5a-4488-9144-a2c86c9a649b" }],
    ],
  }
},
{
  id: 6,
  title: "QuantJL",
  description: "Built a minute intraday trading simulation platform in Julia from scratch, implementing Deep Deterministic Policy Gradient (DDPG) for automated portfolio management. Designed custom neural networks, feature pipelines (EMA, RSI, MACD, Bollinger Bands, VWAP, ATR, OBV, time-of-day, and a proprietary GBM-based volatility score), and reward functions balancing risk, transaction costs, and capital preservation. Leveraged RL techniques including continuous action spaces, policy gradients, exploration strategies, experience replay, target networks, and environment simulation for training and evaluation.",
  technologies: ["Julia"],
  githubUrl: "https://github.com/SentientPlatypus/quantjl",
  liveUrl: null,
  paperUrl: null,
  date: "2024",
  image: "images/gbm_path_full.png",
  images: ["https://github.com/SentientPlatypus/quantjl/blob/master/plots/capital_distribution/2025-09-12/total_rewards.png?raw=true", "https://github.com/SentientPlatypus/quantjl/blob/master/plots/total_rewards.png?raw=true", "https://github.com/SentientPlatypus/quantjl/blob/master/plots/capital_distribution/2025-11-08/total_rewards.png?raw=true"],
  award: null,
  interactive: "quantjl"
},
{
  id: 7,
  title: "SeeRound",
  description: "The theme for the hackathon was wellness for tech. We immediately thought of our visually impaired friends. We created a hat that has a raspberry pi, a camera, and an ultrasonic sensor. \n This hat connects to your airpods or headphones and uses an object classification model to detect obstacles like people, chairs and tables, along with a distance sensor to detect immediate threats in front of the user. We use bounding boxes and centerpoints to calculate angle, and we wrote a surround-sound script that plays a calm hum in the direction of that object. The volume of this hum is proportional to the distance of the obstacle.",
  technologies: ["Raspberry PI", "YOLOv8", "pysound", "arduino sensors"],
  githubUrl: "https://github.com/AuraHatlol/AuraHat",
  liveUrl: null,
  paperUrl: null,
  date: "2025",
  image: "images/seeround.png",
  award: "Best Hardware Hack @ Makeathon 2025"
},
{
  id: 8,
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
},
{
  id: 11,
  title: "Red Hot Chilli Bot",
  description: "For the 2024 FRC game, Crescendo, I continued doing PnP but this time: with 6 cameras. Goodbye Code Red Robotics!",
  technologies: ["OpenCV", "Debian", "Apriltags"],
  githubUrl: "https://github.com/CRRobotics/2024Visions",
  paperUrl: "https://github.com/CRRobotics/2024Visions/blob/master/Code_Red_Robotics_2024_Visions_Docs.pdf",
  date: "2024",
  image: "images/wholelottared.JPG",
  images: ["images/wholelottared.JPG"],
  award: null
},
{
  id: 12,
  title: "Cornell ASL Jackal",
  description: "Robots have the potential to assist in emergency evacuation tasks, but it is not clear how robots should behave to evacuate people who are not fully compliant, perhaps due to panic or other priorities in an emergency. In our study, we compare two robot strategies: an actively nudging robot that initiates evacuation and pulls toward the exit and a passively waiting robot that stays around users and waits for instruction. Our robot uses the drive base of Clearpath’s wheeled robot, Jackal, and uses a LIDAR for mapping surroundings, along with cameras for human tracking. The robot will use the LIDAR to localize where it is on whatever map we have given it and will use waypoints to guide users to the exit. For our study, we time people to retrieve objects of value stored in safes and “escape.” They are given a sheet of paper with a lookup table of the code for each safe. Each run is recorded with go-pros placed around Rhodes Hall for further analysis. We have run pilot studies for each of the evacuation methods, and are currently implementing feedback from participants, for the main study that will happen this November. We will submit our paper to the Robotics Science & Systems (RSS). I expanded our particle filtering method to handle sensor uncertainty and navigation in unmapped areas. This algorithm projects the human's position onto the roadmap between waypoints. It involves evaluating every segment between waypoints, excluding those intersecting with walls to create a roadmap. The robot moves to the nearest projected position and follows the human within its navigable area. For the waiting robot, users signal their readiness to be led to the exit using Shadowsense. By placing their hand on top of the robot's inflatable balloon with an embedded camera, the camera detects the hand and signals the robot to change states. I made necessary modifications to the existing code, particularly refining the support vector machine (linear neural network). This involved fitting the model across a grid of hyperparameters, saving it for future use, and deploying it. I developed a state machine that uses the classifier and localization data to ascertain the robot's current state. It also controls the UI by projecting various images on the balloon providing instructions. I developed an algorithm, processing a text file of walls to create a “bloated map”, ensuring the robot avoids corners when following waypoints with Dijkstra's algorithm. Additionally, I also quick fixes to the robot code such as inverting the output from feedback linearization and recording training data. All work is implemented as ROS (robot operating system) nodes for deployment.",
  technologies: ["Python", "Matlab", "ROS"],
  githubUrl: "https://github.com/SentientPlatypus/jackal",
  liveUrl: null,
  paperUrl: "https://mc.manuscriptcentral.com/ijrr?DOWNLOAD=TRUE&PARAMS=xik_2eKxjJUi7fAXit9pCBfhTcZ69K9Ef1kpZKSzNZRv8ZTGZi1yUxk2YCUVWgbH3PuYmABPwDhjXwcNiZDceX8Eo3zSQycZFPbkTC6QcPWpruN6iEBHqaoBbmVQ4XZqmDwTY8ykP5R1Q5pPxFY6jcnrv9avDQjXpqTdudN7joCJWQ74onaxS3X9XoRXCkbkCs852ws9H",
  date: "2023",
  image: "images/jackal.png",
  images: ["images/jackal.png"],
  award: null
},
{
  id: 15,
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
},
{
  id: 18,
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
},
{
  id: 19,
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
},
{
  id: 20,
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
},
{
  id: 21,
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
},
{
  id: 22,
  title: "Handwritten Digit Recognition",
  description: "Deep Neural Network written in Rust, In scratch.  (Had to parse the dataset in python first tho idk if that counts)",
  technologies: ["Rust"],
  githubUrl: "https://github.com/SentientPlatypus/digit-recognition-dnn",
  liveUrl: null,
  paperUrl: null,
  date: "2023-04",
  image: "https://machinelearningmastery.com/wp-content/uploads/2019/02/Plot-of-a-Subset-of-Images-from-the-MNIST-Dataset.png",
  images: ["https://machinelearningmastery.com/wp-content/uploads/2019/02/Plot-of-a-Subset-of-Images-from-the-MNIST-Dataset.png", "https://github.com/SentientPlatypus/digit-recognition-dnn/raw/master/image-1.png"],
  award: null
},
{
  id: 23,
  title: "Foresight",
  description: "The Foresight is a webapp that does stock price prediction with tensorflow's LSTM dense model. Foresight splits its responsibilities into 2 applications: The webapp, and the Foresight API. The webapp is responsible for displaying content, while the API does most of the heavylifting. I did this, because I needed to access data in javascript that is only available with python libraries. So, I just had my scripts send queries to a python application: the Foresight API. Foresight took a lot of work. Routing, Styling, Scripting, Webscraping, Machine learning, integration and deployment were all things that needed to happen. it was daunting at first, but my enthusiasm increased as things started coming together, especially after integrating the graph (Huge thanks to anychart)",
  technologies: ["Tensorflow", "Javascript", "Python", "Flask", "BS4"],
  githubUrl: "https://github.com/SentientPlatypus/Foresight",
  liveUrl: null,
  paperUrl: null,
  date: "2022",
  image: "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/ForesightLogo.png",
  images: ["https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/ForesightLogo.png", "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/image.png", "https://github.com/SentientPlatypus/Foresight/raw/main/flaskApp/static/images/gf.png"],
  award: null
},
{
  id: 24,
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
},
{
  id: 25,
  title: "Foresight API",
  description: "The Foresight API is the brain behind My Stock prediction webapp foresight. It scrapes data from the google finance website, and makes predictions using Tensorflow's LSTM Dense model. Its also open source, so you should check out the github, and some of its endpoints",
  technologies: ["TensorFlow", "Python", "Flask", "BS4"],
  githubUrl: "https://github.com/SentientPlatypus/Foresight-API",
  liveUrl: "https://foresightapi.herokuapp.com/",
  paperUrl: null,
  date: "2023-03",
  image: "https://foresightapi.herokuapp.com/static/images/ForesightLogo.png",
  award: null
},
{
  id: 27,
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
},
{
  id: 28,
  title: "Lives SMP",
  description: "Lives SMP is a spigot plugin for minecraft that implements a life system. In this life system, You can donate lives, and steal lives when you kill another player. When a player's lives reaches 0, they are put in spectator mode, and a message is shown to everyone in the server. This was my first java project, and It was really fun making it.",
  technologies: ["Java", "Spigot", "Minecraft"],
  githubUrl: "https://github.com/SentientPlatypus/LiveSMP",
  liveUrl: "https://www.spigotmc.org/resources/lives-smp.96177/",
  paperUrl: null,
  date: "2024-12",
  image: "images/smpGUI.png",
  images: ["images/SMPlives.png"],
  award: "705 downloads"
},
{
  id: 29,
  title: "LightSaber",
  description: "I made this lightsaber for a project in school. I hope to print it. First cool thing I made with CAD software.",
  technologies: ["Fusion 360"],
  githubUrl: null,
  liveUrl: "https://a360.co/3VDHZrd",
  paperUrl: null,
  date: "2022",
  image: "images/lightsabermodel.png",
  images: ["images/lightsabermodel.png", "images/Lightsaberwithblade.png"],
  award: null
}
];

interface PortfolioContentProps {
  onProjectOpen?: (project: Project) => void;
}

export { projects };
export type { Project };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProjectGrid = ({
  items,
  onOpen,
}: {
  items: Project[];
  onOpen: (project: Project) => void;
}) => (
  <motion.div
    variants={container}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
  >
    {items.map((project) => (
      <motion.div
        key={project.id}
        variants={item}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="cursor-pointer"
        onClick={() => onOpen(project)}
      >
        <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="aspect-video w-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
            <img
              src={project.image}
              alt={project.title}
              className="max-w-full max-h-full object-contain sm:w-full sm:h-full sm:max-w-none sm:max-h-none sm:object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.image-placeholder');
                if (placeholder) {
                  (placeholder as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="image-placeholder hidden w-full h-full items-center justify-center flex-col bg-[var(--theme-sidebar)] border border-[var(--theme-border)]">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm text-[var(--theme-comment)]">{project.title}</div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.technologies.slice(0, 3).map((tech) => (
                <TechTag key={tech} tech={tech} />
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
      </motion.div>
    ))}
  </motion.div>
);

export const PortfolioContent = ({ onProjectOpen }: PortfolioContentProps = {}) => {
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

  const openProject = (project: Project) => {
    if (onProjectOpen) {
      onProjectOpen(project);
    } else {
      handleProjectClick(project);
    }
  };

  return <div className="h-full overflow-x-hidden overflow-y-auto">
      <div className="pt-2 pb-6 sm:-mx-8">
        {/* Always use mobile-style linear layout */}
        <div className="px-2 sm:px-8">
          <ProjectGrid items={projects} onOpen={openProject} />
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={handleModalClose} />
    </div>;
};
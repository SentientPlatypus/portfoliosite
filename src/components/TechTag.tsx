import { useState } from 'react';
import { motion } from 'framer-motion';

interface TechTagProps {
  tech: string;
  className?: string;
}

const techDescriptions: Record<string, string> = {
  'Python': 'High-level programming language for AI/ML, automation, and backend development',
  'React': 'JavaScript library for building user interfaces',
  'TypeScript': 'Typed superset of JavaScript for scalable applications',
  'Julia': 'High-performance language for numerical and scientific computing',
  'Rust': 'Systems programming language focused on safety and performance',
  'C': 'Low-level language for embedded systems and performance-critical code',
  'C++': 'Object-oriented extension of C for complex software',
  'Java': 'Platform-independent OOP language',
  'Blender': 'Open-source 3D creation suite',
  'PyTorch': 'Deep learning framework for neural networks',
  'TensorFlow': 'End-to-end machine learning platform',
  'OpenCV': 'Computer vision and image processing library',
  'RLGYM': 'Reinforcement learning environment for Rocket League',
  'Flask': 'Lightweight Python web framework',
  'ROS': 'Robot Operating System for robotics development',
  'YOLOv8': 'Real-time object detection algorithm',
  'Fusion 360': 'CAD software for 3D modeling and design',
  'Matlab': 'Numerical computing environment',
  'Arduino': 'Open-source electronics platform',
  'Raspberry PI': 'Small single-board computer for embedded projects',
  'FRDM KL46z': 'ARM Cortex-M0+ development board',
  'MediaPipe': 'Cross-platform ML solutions for live perception',
};

export const TechTag = ({ tech, className = '' }: TechTagProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const description = techDescriptions[tech];

  return (
    <span 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs cursor-default">
        {tech}
      </span>
      
      {showTooltip && description && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
        >
          <div className="bg-[#2d2d30] border border-[#454545] rounded-lg shadow-2xl p-3 max-w-xs">
            <div className="text-xs font-semibold text-white mb-1">{tech}</div>
            <div className="text-xs text-[#cccccc]">{description}</div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#454545]" />
          </div>
        </motion.div>
      )}
    </span>
  );
};

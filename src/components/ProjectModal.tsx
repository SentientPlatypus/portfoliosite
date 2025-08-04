import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!project) return null;

  // Get all available images (main image + additional images)
  const allImages = project.images && project.images.length > 0 
    ? [project.image, ...project.images] 
    : [project.image];
  
  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Image Slideshow */}
          <div className="aspect-video w-full overflow-hidden rounded-lg relative group">
            <img 
              src={allImages[currentImageIndex]} 
              alt={`${project.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            
            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
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

            <p className="text-muted-foreground leading-relaxed">
              {project.description}
            </p>

            {/* Technologies */}
            <div>
              <h3 className="font-semibold mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Code
                </a>
              </Button>
              {project.liveUrl && (
                <Button asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {project.paperUrl && (
                <Button variant="outline" asChild>
                  <a href={project.paperUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    Paper
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
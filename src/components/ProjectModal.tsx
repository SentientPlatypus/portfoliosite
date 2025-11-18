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
  embedUrls?: string[];
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

  // Get all available media (images + embeds)
  const mediaItems: Array<{ type: 'image' | 'embed', url: string }> = [];
  
  // Add main image
  mediaItems.push({ type: 'image', url: project.image });
  
  // Add additional images
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => mediaItems.push({ type: 'image', url: img }));
  }
  
  // Add embed URLs
  if (project.embedUrls && project.embedUrls.length > 0) {
    project.embedUrls.forEach(url => mediaItems.push({ type: 'embed', url }));
  }
  
  const hasMultipleMedia = mediaItems.length > 1;

  const nextMedia = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Media Slideshow */}
          <div className="aspect-video w-full overflow-hidden rounded-lg relative group bg-muted">
            {mediaItems[currentImageIndex].type === 'image' ? (
              <img 
                src={mediaItems[currentImageIndex].url} 
                alt={`${project.title} - Media ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <iframe 
                src={mediaItems[currentImageIndex].url}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${project.title} - Embed ${currentImageIndex + 1}`}
              />
            )}
            
            {/* Navigation Arrows */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Media Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to media ${index + 1}`}
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
import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface ProjectsErrorProps {
  onGenerateArtifacts: () => void;
  artifactsGenerated: boolean;
  onGoToPortfolio: () => void;
}

export const ProjectsError = ({ onGenerateArtifacts, artifactsGenerated, onGoToPortfolio }: ProjectsErrorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateArtifacts = () => {
    setIsLoading(true);
    
    // Simulate loading for 0.5 seconds
    setTimeout(() => {
      onGenerateArtifacts();
      setIsLoading(false);
    }, 500);
  };

  if (artifactsGenerated) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Projects</h2>
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-muted-foreground">I've been sorta busy...</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Working on some cool projects lately 🚀
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGoToPortfolio}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                take me to portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Projects</h2>
        <div className="bg-card/50 border border-red-500/20 rounded-lg p-4">
          <div className="space-y-3">
            <div className="text-red-500 text-sm font-mono">
              <div className="text-red-400">error[E0432]:</div>
              <div>FileNotFoundError: portfolio does not exist</div>
              <div className="text-red-400 mt-1">{'  --> src/me.rs:2:5'}</div>
              <div className="text-muted-foreground">{'   |'}</div>
              <div className="text-muted-foreground">{' 2 |     me.projects()'}</div>
              <div className="text-muted-foreground">{'   |        ^^^^^^^^ not found in this scope'}</div>
              <div className="text-muted-foreground mt-2">
                help: consider importing `portfolio` module or generating artifacts
              </div>
            </div>
            
            {!isLoading ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateArtifacts}
                className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
              >
                Generate Artifacts?
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Generating artifacts...</div>
                <Progress value={100} className="h-2 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
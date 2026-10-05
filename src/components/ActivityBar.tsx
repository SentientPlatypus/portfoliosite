import { Files, Search, GitBranch, Settings, Terminal, FolderGit2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityBarProps {
  activeView: 'explorer' | 'search' | 'git' | 'settings' | 'terminal';
  onViewChange: (view: 'explorer' | 'search' | 'git' | 'settings' | 'terminal') => void;
}

export const ActivityBar = ({ activeView, onViewChange }: ActivityBarProps) => {
  const items = [
    { id: 'explorer' as const, icon: Files, label: 'Explorer' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'git' as const, icon: GitBranch, label: 'Source Control' },
    { id: 'terminal' as const, icon: Terminal, label: 'Terminal' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#2d2d30]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <Tooltip key={item.id} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-12 h-12 flex items-center justify-center cursor-pointer transition-colors relative ${
                  isActive ? 'text-white' : 'text-[#858585] hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-0.5 h-full bg-white" />
                )}
                <Icon className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2d2d30] text-white border-[#454545]">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
      
      {/* User Icon at bottom */}
      <div className="flex-1" />
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm mb-2">
        GW
      </div>
    </div>
  );
};

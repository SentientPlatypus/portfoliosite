import { X } from 'lucide-react';
import { FileText, FileCode, Image, FileJson } from 'lucide-react';
import { RustIcon } from './RustIcon';

interface Tab {
  id: string;
  path: string;
  name: string;
  isDirty: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const EditorTabs = ({ tabs, activeTab, onTabClick, onTabClose }: EditorTabsProps) => {
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'rs':
        return <RustIcon className="w-4 h-4 text-orange-500" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-[#3b82f6]" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-[#fbbf24]" />;
      case 'md':
        return <FileText className="w-4 h-4 text-[#6366f1]" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#ef4444]" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="w-4 h-4 text-[#10b981]" />;
      default:
        return <FileText className="w-4 h-4 text-[#858585]" />;
    }
  };

  return (
    <div className="h-9 bg-[var(--theme-sidebar)] border-b border-[var(--theme-border)] flex items-center overflow-x-auto overflow-y-hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <div
            key={tab.id}
            className={`group border-r border-[var(--theme-border)] px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0 relative ${
              isActive 
                ? 'bg-[var(--theme-editor)] text-[#cccccc]' 
                : 'bg-[var(--theme-sidebar)] text-[#858585] hover:bg-[var(--theme-editor)]'
            }`}
            onClick={() => onTabClick(tab.id)}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--theme-statusBar)]" />
            )}
            {getFileIcon(tab.name)}
            <span className="max-w-[120px] truncate">
              {tab.name}
            </span>
            {tab.isDirty && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded p-0.5 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

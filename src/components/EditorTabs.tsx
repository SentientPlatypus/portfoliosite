import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="h-9 border-b flex items-center overflow-x-auto overflow-y-hidden" style={{ background: 'var(--theme-tab)', borderColor: 'var(--theme-border)' }}>
      <AnimatePresence mode="popLayout">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`group border-r px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0 relative`}
              style={{
                background: isActive ? 'var(--theme-tabActive)' : 'var(--theme-tab)',
                borderColor: 'var(--theme-tabBorder)',
                color: isActive ? 'var(--theme-foreground)' : 'rgba(var(--theme-foreground-rgb, 204, 204, 204), 0.6)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--theme-tabActive)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--theme-tab)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onClick={() => onTabClick(tab.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: 'var(--theme-tabActiveBorder)' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getFileIcon(tab.name)}
              <span className="max-w-[120px] truncate">
                {tab.name}
              </span>
              {tab.isDirty && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--theme-foreground)' }}
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity hover:bg-[rgba(255,255,255,0.1)]"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

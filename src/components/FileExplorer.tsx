import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, FileCode, Folder, FolderOpen, Image, FileJson, Award } from 'lucide-react';
import { RustIcon } from './RustIcon';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileNode[];
  path: string;
}

interface FileExplorerProps {
  onFileSelect: (path: string, name: string) => void;
  selectedFile: string;
}

export const FileExplorer = ({ onFileSelect, selectedFile }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/portfolio']));

  const fileTree: FileNode[] = [
    {
      name: 'portfolio',
      type: 'folder',
      path: '/portfolio',
      children: [
        { name: 'about.tsx', type: 'file', extension: 'tsx', path: '/portfolio/about.tsx' },
        { name: 'contact.md', type: 'file', extension: 'md', path: '/portfolio/contact.md' },
        { name: 'experience.json', type: 'file', extension: 'json', path: '/portfolio/experience.json' },
        {
          name: 'projects',
          type: 'folder',
          path: '/portfolio/projects',
          children: [
            { name: 'all-projects.tsx', type: 'file', extension: 'tsx', path: '/portfolio/projects/all-projects.tsx' },
          ]
        },
        {
          name: 'pictures',
          type: 'folder',
          path: '/portfolio/pictures',
          children: [
            { name: 'gallery.tsx', type: 'file', extension: 'tsx', path: '/portfolio/pictures/gallery.tsx' },
          ]
        },
        { name: 'awards.tsx', type: 'file', extension: 'tsx', path: '/portfolio/awards.tsx' },
        { name: 'resume.pdf', type: 'file', extension: 'pdf', path: '/portfolio/resume.pdf' },
      ]
    },
    { name: 'me.rs', type: 'file', extension: 'rs', path: '/me.rs' },
    { name: 'README.md', type: 'file', extension: 'md', path: '/README.md' },
  ];

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedFolders.has(node.path) ? 
        <FolderOpen className="w-4 h-4 text-[#dcb67a]" /> : 
        <Folder className="w-4 h-4 text-[#dcb67a]" />;
    }
    
    switch (node.extension) {
      case 'rs':
        return <RustIcon className="w-4 h-4 text-orange-500" />;
      case 'tsx':
      case 'ts':
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

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 py-0.5 px-2 cursor-pointer text-[13px]`}
          style={{ 
            paddingLeft: `${level * 12 + 8}px`,
            background: isSelected ? 'var(--theme-tabActive)' : 'transparent',
            color: 'var(--theme-foreground)'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path, node.name);
            }
          }}
        >
          {node.type === 'folder' && (
            <span className="flex-shrink-0">
              {isExpanded ? 
                <ChevronDown className="w-3 h-3" style={{ color: 'var(--theme-foreground)' }} /> : 
                <ChevronRight className="w-3 h-3" style={{ color: 'var(--theme-foreground)' }} />
              }
            </span>
          )}
          {node.type === 'file' && <span className="w-3" />}
          <span className="flex-shrink-0">{getFileIcon(node)}</span>
          <span className={`truncate ${node.type === 'folder' ? 'font-medium' : ''}`}>
            {node.name}
          </span>
        </div>
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r flex flex-col h-full" style={{ background: 'var(--theme-sidebar)', borderColor: 'var(--theme-border)' }}>
      <div className="px-4 py-2 text-[11px] uppercase font-semibold tracking-wider" style={{ color: 'var(--theme-foreground)' }}>
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto text-sm scrollbar-hidden">
        <div className="px-2">
          <div className="text-[11px] uppercase font-semibold tracking-wider mb-1 px-2" style={{ color: 'var(--theme-foreground)' }}>
            Portfolio
          </div>
          {fileTree.map(node => renderNode(node))}
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or index.css:
// .scrollbar-hidden {
//   -ms-overflow-style: none;  /* IE and Edge */
//   scrollbar-width: none;  /* Firefox */
// }
// .scrollbar-hidden::-webkit-scrollbar {
//   display: none;  /* Chrome, Safari, Opera */
// }

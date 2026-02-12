"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Layout, 
  Box, 
  Image, 
  FileText, 
  Clock, 
  Activity, 
  ChevronDown, 
  ChevronRight,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'quick-access': true,
    'project-structure': true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-[280px] h-screen bg-card border-r border-border flex flex-col font-sans text-sm shadow-sm">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border transition-colors">
        <button className="flex items-center gap-2 font-semibold text-foreground hover:bg-muted p-1.5 rounded-md transition-colors">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-400 text-primary-foreground rounded-md flex items-center justify-center text-xs font-bold shadow-md glow">M</div>
          <span>Minimal SaaS</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
        <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md hover:text-foreground transition-colors">
          <Search size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        
        {/* Workspace */}
        <div className="space-y-0.5">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</div>
          <NavItem icon={<Sparkles size={18} />} label="AI Assistant" badge="BETA" subLabel="Generate sections, layouts" active={false} />
          <NavItem icon={<Layout size={18} />} label="Pages" active={false} />
          <NavItem icon={<Box size={18} />} label="Saved Blocks" active={false} />
          <NavItem icon={<Image size={18} />} label="Media Library" active={false} />
          <NavItem icon={<FileText size={18} />} label="Templates" active={false} />
          <NavItem icon={<Clock size={18} />} label="History" active={false} />
          <NavItem icon={<Activity size={18} />} label="Activity" active={false} />
        </div>

        {/* Quick Access */}
        <div>
          <div 
             className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground mb-0.5 cursor-pointer hover:text-foreground transition-colors"
             onClick={() => toggleSection('quick-access')}
          >
            <div className="flex items-center gap-1">
                <span>Quick Access</span>
                <Star size={10} className="text-warning fill-warning" />
            </div>
            <ChevronDown size={14} className={`transition-transform ${openSections['quick-access'] ? '' : '-rotate-90'}`} />
          </div>
          
          {openSections['quick-access'] && (
            <div className="space-y-0.5">
                <NavItem icon={<Layout size={16} />} label="Home Page" active={false} />
                <NavItem icon={<Layout size={16} />} label="Landing Pages" active={false} />
                <NavItem icon={<FileText size={16} />} label="Blog" active={false} />
                <NavItem icon={<Layout size={16} />} label="Contact Page" active={false} />
            </div>
          )}
        </div>

        {/* Project Structure */}
        <div>
          <div 
             className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground mb-0.5 cursor-pointer hover:text-foreground transition-colors"
             onClick={() => toggleSection('project-structure')}
          >
             <span>Project Structure</span>
             <ChevronDown size={14} className={`transition-transform ${openSections['project-structure'] ? '' : '-rotate-90'}`} />
          </div>

          {openSections['project-structure'] && (
              <div className="space-y-0.5">
                <div className="mt-1">
                     <NavItem icon={<Box size={16} />} label="Website" active={false} hasSubmenu expanded />
                     <div className="ml-4 pl-2 border-l border-border/50 mt-1 space-y-0.5">
                        <NavItem icon={<Layout size={16} />} label="v3.0" active={false} hasSubmenu expanded />
                        <div className="ml-4 pl-2 border-l border-border/50 mt-1 space-y-0.5">
                            <NavItem icon={<FileText size={16} />} label="Wireframes" active={false} />
                            <NavItem icon={<Layout size={16} />} label="Designs" active={false} />
                            <NavItem icon={<Box size={16} />} label="UI Kit" active={true} />
                        </div>
                        <NavItem icon={<Layout size={16} />} label="v2.0 (Published)" active={false} />
                     </div>
                </div>
                <NavItem icon={<Activity size={16} />} label="SEO" active={false} />
                <NavItem icon={<Layout size={16} />} label="Domains" active={false} />
                <NavItem icon={<Box size={16} />} label="Integrations" active={false} />
                <NavItem icon={<Activity size={16} />} label="Settings" active={false} />
              </div>
          )}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="h-14 border-t border-border flex items-center px-4 hover:bg-muted transition-colors cursor-pointer">
         <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            SW
         </div>
         <div className="flex-1 min-w-0">
             <div className="text-sm font-medium text-foreground truncate">Sophia Wilson</div>
             <div className="text-xs text-muted-foreground truncate">Product Designer</div>
         </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon?: React.ReactNode;
  imgSrc?: string;
  label: string;
  subLabel?: string;
  count?: number;
  badge?: string;
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
}

function NavItem({ icon, imgSrc, label, subLabel, count, badge, active, hasSubmenu, expanded }: NavItemProps) {
  return (
    <button 
      className={cn(
        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all duration-200 group",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-secondary-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {hasSubmenu && (
         <div className={cn("text-muted-foreground transition-transform", expanded ? 'rotate-90' : '')}>
            <ChevronRight size={12} />
         </div>
      )}
      
      {!hasSubmenu && (
           <div className={cn(
             "flex-shrink-0 flex items-center justify-center transition-colors",
             hasSubmenu ? 'w-4' : '',
             active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
           )}>
             {imgSrc ? (
               <img src={imgSrc} alt="" className="w-5 h-5 rounded-full" />
             ) : (
               icon
             )}
           </div>
      )}

      <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{label}</span>
            {badge && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded border border-primary/20">
                {badge}
                </span>
            )}
          </div>
          {subLabel && <div className="text-[10px] text-muted-foreground truncate">{subLabel}</div>}
      </div>
      
      {count !== undefined && (
        <span className="text-xs text-muted-foreground font-medium">{count}</span>
      )}
    </button>
  );
}

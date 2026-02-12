import React from 'react';
import { 
  Search, 
  File, 
  User, 
  Hash, 
  CornerDownLeft, 
  ArrowUp, 
  ArrowDown, 
  MoveHorizontal,
  Command,
  X,
  SlidersHorizontal,
  Layout,
  Box,
  Image,
  Link
} from 'lucide-react';

export default function SearchModal() {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[640px] overflow-hidden flex flex-col max-h-[600px]">
      {/* Search Input */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <Search className="text-muted-foreground mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Search pages, blocks, components, assets..." 
          className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none"
          autoFocus
        />
        <div className="flex items-center gap-2 text-muted-foreground">
           <SlidersHorizontal size={16} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <TabButton active label="All" />
        <TabButton label="Pages" />
        <TabButton label="Blocks" />
        <TabButton label="Components" />
        <TabButton label="Assets" />
        <TabButton label="Team" />
        <TabButton label="Links" />
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Items</h3>
        </div>

        <div className="space-y-1">
            <ResultItem 
                icon={<Box size={16} />} 
                title="hero-section.json" 
                subtitle="UI Kit" 
                type="component" 
            />
            <ResultItem 
                icon={<File size={16} />} 
                title="responsive-guidelines.pdf" 
                subtitle="Design System" 
                type="file" 
            />
            <ResultItem 
                imgSrc="https://i.pravatar.cc/150?u=sophia" 
                title="Sophia Wilson" 
                subtitle="Product Designer" 
                type="user" 
            />
            <ResultItem 
                icon={<Layout size={16} />} 
                title="pricing-page" 
                subtitle="Draft" 
                type="page"
                isActive 
            />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <span className="bg-white border border-gray-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm"><ArrowUp size={10} /></span>
                <span className="bg-white border border-gray-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm"><ArrowDown size={10} /></span>
                <span>Move</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="bg-white border border-gray-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">↵</span>
                <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="bg-white border border-gray-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">⌘</span>
                <span className="bg-white border border-gray-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">K</span>
                <span>Command</span>
            </div>
        </div>
        <div className="flex items-center gap-1">
             <span className="bg-white border border-gray-200 rounded px-1 min-w-[24px] h-[18px] flex items-center justify-center shadow-sm">Esc</span>
             <span>Close</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`
            px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
            ${active ? 'border-gray-900 text-gray-900' : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'}
        `}>
            {label}
        </button>
    );
}

function ResultItem({ icon, imgSrc, title, subtitle, type, isActive }: {
    icon?: React.ReactNode;
    imgSrc?: string;
    title: string;
    subtitle: string;
    type: 'file' | 'user' | 'page' | 'component';
    isActive?: boolean;
}) {
    return (
        <div className={`
            flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group
            ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
        `}>
            <div className="flex items-center gap-3">
                <div className={`
                    w-8 h-8 rounded flex items-center justify-center flex-shrink-0
                    ${type === 'file' ? 'bg-orange-100 text-orange-600' : ''}
                    ${type === 'component' ? 'bg-purple-100 text-purple-600' : ''}
                    ${type === 'page' ? 'bg-blue-100 text-blue-600' : ''}
                `}>
                    {imgSrc ? (
                        <img src={imgSrc} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : icon}
                </div>
                <div>
                   <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {title} 
                      {type !== 'user' && <span className="text-xs text-muted-foreground font-normal">{subtitle}</span>}
                   </div>
                   {type === 'user' && subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
                </div>
            </div>

             {isActive && (
                <div className="p-1 text-primary">
                    <CornerDownLeft size={16} />
                </div>
             )}
        </div>
    );
}


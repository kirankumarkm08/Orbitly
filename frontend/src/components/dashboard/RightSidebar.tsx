import React from 'react';
import { 
  User, 
  Calendar, 
  Activity, 
  Tag, 
  CheckCircle2, 
  ChevronRight,
  MoreHorizontal,
  Info as InfoIcon,
  Plus,
  SlidersHorizontal,
  ArrowDownUp,
  Palette,
  Type,
  Grid,
  Box,
  Link,
  Users
} from 'lucide-react';

export default function RightSidebar() {
  return (
    <div className="w-[300px] h-screen bg-white border-l border-gray-200 flex flex-col font-sans text-sm">
      {/* Page Info Header */}
      <div className="p-4 border-b border-gray-100">
         <h2 className="font-semibold text-gray-900">Page Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Info */}
        <section>
          <div className="space-y-3">
            <InfoItem icon={<User size={16} />} label="Owner" value="Andrew M." imgSrc="https://i.pravatar.cc/150?u=andrew" />
            <InfoItem icon={<Calendar size={16} />} label="Created" value="28 May" />
            <InfoItem icon={<Activity size={16} />} label="Status" badge="Active" />
            <InfoItem icon={<Tag size={16} />} label="Version" value="v3.0" />
          </div>
        </section>

        {/* Design Tokens */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
             <Palette size={16} className="text-muted-foreground" /> Design Tokens
          </h3>
          <div className="grid grid-cols-2 gap-2">
             <TokenCard icon={<Palette size={14} />} label="Colors" value="13" />
             <TokenCard icon={<Type size={14} />} label="Typography" value="4 styles" />
             <TokenCard icon={<Grid size={14} />} label="Spacing" value="8px grid" />
             <TokenCard icon={<Box size={14} />} label="Components" value="42" />
          </div>
        </section>

        {/* Linked Pages */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
             <Link size={16} className="text-muted-foreground" /> Linked Pages
          </h3>
          <div className="space-y-1">
             <LinkedPage label="Home" active />
             <LinkedPage label="Pricing" />
             <LinkedPage label="About" />
             <LinkedPage label="Contact" />
          </div>
        </section>

        {/* Activity Timeline */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3">Activity</h3>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 14 }).map((_, i) => (
                <div 
                   key={i} 
                   className={`w-3 h-8 rounded-sm ${i > 10 ? 'bg-green-400' : 'bg-gray-100'} hover:bg-green-200 transition-colors cursor-pointer`} 
                   title={`Day ${i+1}`}
                />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Recent edits and publishes visualized as a timeline</div>
        </section>

        {/* Team Panel */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                   <Users size={16} className="text-muted-foreground" /> Team
                </h3>
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">9</span>
             </div>
          </div>
          
          <div className="space-y-3">
             <MemberItem name="Daniel Anderson" role="Art Director" tag="Design" tagColor="bg-purple-100 text-purple-700" imgSrc="https://i.pravatar.cc/150?u=daniel" />
             <MemberItem name="Andrew Miller" role="Product Owner" tag="Management" tagColor="bg-orange-100 text-orange-700" imgSrc="https://i.pravatar.cc/150?u=andrewm" />
             <MemberItem name="William Johnson" role="UI/UX Designer" tag="Design" tagColor="bg-purple-100 text-purple-700" imgSrc="https://i.pravatar.cc/150?u=william" />
             <MemberItem name="Emily Davis" role="Frontend Developer" tag="Development" tagColor="bg-blue-100 text-blue-700" imgSrc="https://i.pravatar.cc/150?u=emily" />
          </div>
        </section>

      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, imgSrc, badge, chevron }: { 
    icon: React.ReactNode; 
    label: string; 
    value?: string; 
    imgSrc?: string; 
    badge?: string;
    chevron?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-1 group cursor-pointer">
            <div className="flex items-center gap-3 text-muted-foreground">
                {icon}
                <span className="text-gray-600">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {badge}
                    </span>
                )}
                {imgSrc && (
                    <img src={imgSrc} alt="" className="w-5 h-5 rounded-full" />
                )}
                {value && <span className="font-medium text-gray-900">{value}</span>}
                {chevron && <ChevronRight size={14} className="text-muted-foreground" />}
            </div>
        </div>
    );
}

function TokenCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-gray-50 p-2 rounded-md flex flex-col gap-1 items-start border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
            <div className="text-muted-foreground">{icon}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold text-gray-900">{value}</div>
        </div>
    );
}

function LinkedPage({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className={`
            flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer
            ${active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}
        `}>
            <span className="font-medium">{label}</span>
            <Link size={12} className={active ? 'text-primary' : 'text-secondary-foreground'} />
        </div>
    );
}

function MemberItem({ name, role, tag, tagColor, imgSrc }: { 
    name: string; 
    role: string; 
    tag: string; 
    tagColor: string; 
    imgSrc: string 
}) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={imgSrc} alt="" className="w-8 h-8 rounded-full object-cover" />
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                </div>
            </div>
            {/* <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${tagColor}`}>
                {tag}
            </span> */}
        </div>
    );
}

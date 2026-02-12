import React from 'react';
import { 
  Hash, 
  Bookmark, 
  MoreHorizontal, 
  Info, 
  Plus, 
  Smile, 
  Paperclip, 
  Mic,
  Layout,
  MessageSquare,
  Globe
} from 'lucide-react';

export default function ChannelView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Context Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
          <Globe size={18} className="text-muted-foreground" />
          <div className="flex items-center gap-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
             <span>Website</span>
             <span className="text-secondary-foreground">/</span>
             <span>v3.0</span>
             <span className="text-secondary-foreground">/</span>
             <span className="text-gray-900 font-semibold flex items-center gap-2">
                <Layout size={16} className="text-blue-500" /> UI Kit
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
             <div className="flex -space-x-1.5 overflow-hidden p-1">
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=daniel" alt="Daniel"/>
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=andrew" alt="Andrew"/>
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=william" alt="William"/>
             </div>
             <MoreHorizontal size={18} className="cursor-pointer hover:text-gray-600" />
             <Info size={18} className="cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* Builder Thread / Canvas Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
         
         {/* System Message */}
         <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <Layout size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">System Message</span>
                    <span className="text-xs text-muted-foreground">Today at 9:00 AM</span>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-gray-800 text-sm leading-relaxed">
                    <p className="font-medium text-blue-900 mb-1">Page Context Active</p>
                    <p>This UI kit defines reusable components and design rules used across all pages. Updates here apply globally unless overridden.</p>
                </div>
            </div>
         </div>

         {/* Builder Notes */}
         <div className="flex items-center justify-center relative my-4">
             <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-200"></div>
             </div>
             <div className="relative z-10 bg-gray-50 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Builder Notes</div>
         </div>

         <Message 
            user="Andrew Miller" 
            role="Product Owner"
            time="10:42 AM" 
            avatar="https://i.pravatar.cc/150?u=andrewm"
            content="Let's finalize button styles, typography scale, and spacing rules so all pages stay consistent."
         />

         {/* Empty State / Prompt */}
         <div className="mt-8 p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Layout size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No Components</h3>
            <p className="text-muted-foreground text-sm max-w-xs">Save reusable sections as components to speed up building.</p>
            <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                Create First Component
            </button>
         </div>

      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
         <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
             <div className="bg-gray-50 px-2 py-1.5 flex items-center gap-1 border-b border-gray-100">
                 <button className="p-1 hover:bg-gray-200 rounded text-muted-foreground"><b className="font-serif font-bold">B</b></button>
                 <button className="p-1 hover:bg-gray-200 rounded text-muted-foreground"><i className="font-serif italic">I</i></button>
                 <button className="p-1 hover:bg-gray-200 rounded text-muted-foreground underline"><u>U</u></button>
                 <div className="h-4 w-px bg-gray-300 mx-1"></div>
                 <button className="p-1 hover:bg-gray-200 rounded text-muted-foreground text-xs">Link</button>
             </div>
             <textarea 
                className="w-full max-h-40 p-3 outline-none resize-none text-sm min-h-[80px]" 
                placeholder="Add a comment or note about this page..."
             ></textarea>
             <div className="flex items-center justify-between px-2 py-2">
                 <div className="flex items-center gap-1 text-muted-foreground">
                     <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><Plus size={18} /></button>
                     <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><Smile size={18} /></button>
                     <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><Paperclip size={18} /></button>
                 </div>
                 <div className="flex items-center gap-2">
                     <button className="px-3 py-1.5 bg-blue-600 text-foreground rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
                        Post Comment
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}

function Message({ user, role, time, avatar, content }: { user: string, role: string, time: string, avatar: string, content: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="flex-shrink-0 mt-1">
                <img src={avatar} alt="" className="w-10 h-10 rounded-md object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{user}</span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                    <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                <div className="text-gray-800 text-sm leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}

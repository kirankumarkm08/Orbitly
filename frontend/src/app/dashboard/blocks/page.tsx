"use client";

import { Block } from '@/components/ui/Block';

export default function BlocksPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Block Editor</h1>
        
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          <Block
            content=""
            onChange={(content) => console.log(content)}
            placeholder="Start creating your block..."
            height={500}
          />
        </div>
      </div>
    </div>
  );
}

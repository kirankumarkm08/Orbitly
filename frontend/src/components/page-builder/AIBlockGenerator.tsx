'use client';

import React, { useState, useRef } from 'react';
import { aiApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Loader2,
  X,
  RefreshCw,
  Check,
  Copy,
  Wand2,
  Palette,
  Sun,
  Moon,
  Layers,
  Type,
  FormInput,
  ShoppingCart,
  Image,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Quick Prompt Templates ─────────────────────
const QUICK_PROMPTS = [
  { label: 'Hero Section', prompt: 'Create a modern hero section with a bold headline, subtitle, a call-to-action button, and a gradient background.', category: 'layout', icon: Layers },
  { label: 'Pricing Table', prompt: 'Create a 3-tier pricing table with a free, pro, and enterprise plan. Highlight the pro plan as most popular.', category: 'layout', icon: Zap },
  { label: 'Testimonials', prompt: 'Create a testimonial section with 3 cards showing customer photo placeholder, quote, name, and title.', category: 'content', icon: Type },
  { label: 'Features Grid', prompt: 'Create a features section with a 3-column grid showing 6 features, each with an emoji icon, title, and description.', category: 'content', icon: Layers },
  { label: 'Contact Form', prompt: 'Create a contact form with name, email, and message fields, plus a submit button. Include a side panel with contact info.', category: 'form', icon: FormInput },
  { label: 'FAQ Accordion', prompt: 'Create an FAQ section with 5 expandable questions and answers using CSS-only accordion.', category: 'content', icon: Type },
  { label: 'Product Card', prompt: 'Create a product card grid with 3 products showing image placeholder, title, price, rating stars, and add-to-cart button.', category: 'ecommerce', icon: ShoppingCart },
  { label: 'Image Gallery', prompt: 'Create a responsive image gallery grid with 6 image placeholders using CSS gradients. Include hover zoom effect.', category: 'media', icon: Image },
  { label: 'CTA Banner', prompt: 'Create a call-to-action banner with a compelling headline, description, and two buttons (primary + secondary).', category: 'layout', icon: Wand2 },
  { label: 'Stats Counter', prompt: 'Create a stats section showing 4 key metrics with large numbers, labels, and subtle animations.', category: 'content', icon: Zap },
];

const CATEGORIES = [
  { value: '', label: 'Any' },
  { value: 'layout', label: 'Layout' },
  { value: 'content', label: 'Content' },
  { value: 'form', label: 'Form' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'media', label: 'Media' },
];

// ─── Types ──────────────────────────────────────
interface GeneratedBlock {
  html: string;
  css: string;
  name: string;
  description: string;
  category: string;
}

interface AIBlockGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (block: { html: string; css: string }) => void;
}

// ─── Component ──────────────────────────────────
export default function AIBlockGenerator({ isOpen, onClose, onInsert }: AIBlockGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlock, setGeneratedBlock] = useState<GeneratedBlock | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast.error('Please describe the block you want to create');
      return;
    }

    setIsGenerating(true);
    setGeneratedBlock(null);

    try {
      const result = await aiApi.generateBlock({
        prompt: finalPrompt,
        category: category || undefined,
        style_preferences: {
          theme,
          accent_color: accentColor,
        },
      });
      setGeneratedBlock(result);
      toast.success(`Generated: ${result.name}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate block');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim() || !generatedBlock) return;

    setIsRefining(true);
    try {
      const result = await aiApi.refineBlock({
        prompt: refinePrompt,
        current_html: generatedBlock.html,
        current_css: generatedBlock.css,
      });
      setGeneratedBlock({ ...generatedBlock, ...result });
      setRefinePrompt('');
      toast.success('Block refined!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to refine block');
    } finally {
      setIsRefining(false);
    }
  };

  const handleInsert = () => {
    if (!generatedBlock) return;
    onInsert({ html: generatedBlock.html, css: generatedBlock.css });
    toast.success('Block inserted into page!');
    onClose();
  };

  const handleCopyCode = () => {
    if (!generatedBlock) return;
    const code = `<!-- ${generatedBlock.name} -->\n<style>\n${generatedBlock.css}\n</style>\n${generatedBlock.html}`;
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const previewHtml = generatedBlock
    ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    ${generatedBlock.css}
  </style>
</head>
<body>${generatedBlock.html}</body>
</html>`
    : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[95vw] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Block Generator</h2>
              <p className="text-xs text-muted-foreground">Describe a block and AI will create it for you</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel — Prompt & Controls */}
          <div className="w-[380px] border-r border-border flex flex-col bg-muted/20">
            
            {/* Prompt Input */}
            <div className="p-4 space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the block you want to create...&#10;&#10;e.g. 'A hero section with a gradient background, animated text, and two CTA buttons'"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              
              {/* Style Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                  className={cn(
                    "h-9 w-9 rounded-lg border flex items-center justify-center transition-colors",
                    theme === 'dark'
                      ? "bg-gray-800 border-gray-700 text-yellow-400"
                      : "bg-white border-border text-gray-600"
                  )}
                  title={`Theme: ${theme}`}
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>

                <div className="relative">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-border cursor-pointer"
                    title="Accent color"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="w-full gap-2 h-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Block
                  </>
                )}
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2 hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
                Quick Templates
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => {
                        setPrompt(qp.prompt);
                        setCategory(qp.category);
                        handleGenerate(qp.prompt);
                      }}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border text-left text-xs hover:bg-primary/5 hover:border-primary/30 transition-all disabled:opacity-50"
                    >
                      <qp.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground font-medium truncate">{qp.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Preview */}
          <div className="flex-1 flex flex-col bg-background">
            {generatedBlock ? (
              <>
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{generatedBlock.category}</Badge>
                    <span className="text-sm font-medium text-foreground">{generatedBlock.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={handleCopyCode} className="h-7 gap-1 text-xs">
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleGenerate()} className="h-7 gap-1 text-xs">
                      <RefreshCw className="h-3 w-3" /> Regenerate
                    </Button>
                    <Button size="sm" onClick={handleInsert} className="h-7 gap-1 text-xs bg-primary text-white">
                      <Check className="h-3 w-3" /> Insert to Page
                    </Button>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex-1 p-4">
                  <div className="w-full h-full rounded-xl border border-border overflow-hidden bg-white shadow-inner">
                    <iframe
                      ref={previewRef}
                      srcDoc={previewHtml}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      title="AI Block Preview"
                    />
                  </div>
                </div>

                {/* Refine Bar */}
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <Input
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      placeholder="Refine: 'Make the text bigger' or 'Change colors to blue'"
                      className="flex-1 h-9 text-sm bg-muted border-border"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRefine();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefine}
                      disabled={isRefining || !refinePrompt.trim()}
                      className="h-9 gap-1"
                    >
                      {isRefining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      Refine
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center text-center px-8">
                <div className="space-y-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto">
                    <Wand2 className="h-10 w-10 text-primary/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {isGenerating ? 'Generating your block...' : 'Describe your block'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      {isGenerating
                        ? 'AI is crafting HTML & CSS for your design. This usually takes 3-5 seconds.'
                        : 'Type a description or pick a quick template from the left panel to get started.'}
                    </p>
                  </div>
                  {isGenerating && (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

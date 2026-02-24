'use client';

import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List, 
  ListOrdered,
  Link, 
  Image,
  Code,
  Quote,
  Minus,
  Save,
  Eye,
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  Palette,
  Type,
  Layers,
  Grid,
  Box,
  Sparkles,
  ArrowLeft,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: 'text' | 'hero' | 'feature' | 'cta' | 'testimonial' | 'pricing';
  content: string;
  thumbnail?: string;
}

const blockTemplates: BlockTemplate[] = [
  {
    id: '1',
    name: 'Rich Text',
    description: 'Basic text content with formatting',
    category: 'text',
    content: '<h2>Your Heading Here</h2><p>Write your content here. You can use <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>'
  },
  {
    id: '2',
    name: 'Hero Section',
    description: 'Full-width hero with title and description',
    category: 'hero',
    content: '<div style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white;"><h1 style="font-size: 48px; margin-bottom: 20px;">Build Something Amazing</h1><p style="font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 30px;">Create beautiful websites with our powerful page builder.</p><button style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; border: none; font-size: 16px; cursor: pointer;">Get Started</button></div>'
  },
  {
    id: '3',
    name: 'Feature Grid',
    description: '3-column feature highlights',
    category: 'feature',
    content: '<div style="padding: 60px 20px; background: #f8fafc;"><h2 style="text-align: center; font-size: 32px; margin-bottom: 40px;">Why Choose Us</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto;"><div style="text-align: center; padding: 30px;"><div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">⚡</div><h3 style="font-size: 20px; margin-bottom: 10px;">Lightning Fast</h3><p style="color: #6b7280;">Blazing fast performance optimized for speed.</p></div><div style="text-align: center; padding: 30px;"><div style="width: 60px; height: 60px; background: #10b981; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🔒</div><h3 style="font-size: 20px; margin-bottom: 10px;">Secure</h3><p style="color: #6b7280;">Enterprise-grade security for your data.</p></div><div style="text-align: center; padding: 30px;"><div style="width: 60px; height: 60px; background: #8b5cf6; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🎨</div><h3 style="font-size: 20px; margin-bottom: 10px;">Beautiful Design</h3><p style="color: #6b7280;">Stunning templates and components.</p></div></div></div>'
  },
  {
    id: '4',
    name: 'Call to Action',
    description: 'Compact CTA banner',
    category: 'cta',
    content: '<div style="padding: 40px 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-align: center;"><h3 style="font-size: 24px; margin-bottom: 10px;">Ready to get started?</h3><p style="opacity: 0.9; margin-bottom: 20px;">Join thousands of satisfied customers today.</p><button style="background: white; color: #3b82f6; padding: 12px 32px; border-radius: 8px; border: none; font-size: 16px; font-weight: 600; cursor: pointer;">Start Free Trial</button></div>'
  },
  {
    id: '5',
    name: 'Testimonial',
    description: 'Customer quote with avatar',
    category: 'testimonial',
    content: '<div style="padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 600px; margin: 20px auto;"><p style="font-size: 18px; line-height: 1.7; color: #4b5563; font-style: italic; margin-bottom: 20px;">"This product has completely transformed how we build websites. The drag-and-drop interface is intuitive and the results are stunning."</p><div style="display: flex; align-items: center; gap: 16px;"><div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">JD</div><div><p style="font-weight: 600; color: #1f2937;">John Doe</p><p style="font-size: 14px; color: #6b7280;">CEO, Tech Company</p></div></div></div>'
  },
  {
    id: '6',
    name: 'Pricing Card',
    description: 'Single pricing tier display',
    category: 'pricing',
    content: '<div style="padding: 40px; background: white; border: 2px solid #e2e8f0; border-radius: 20px; max-width: 350px; margin: 20px auto; text-align: center;"><span style="display: inline-block; background: #3b82f6; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">MOST POPULAR</span><h3 style="font-size: 24px; margin-bottom: 10px;">Pro Plan</h3><div style="font-size: 48px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">$49<span style="font-size: 16px; font-weight: 400; color: #6b7280;">/mo</span></div><ul style="list-style: none; padding: 0; margin: 0 0 30px; text-align: left; color: #4b5563;"><li style="padding: 8px 0;">✓ Unlimited projects</li><li style="padding: 8px 0;">✓ Advanced analytics</li><li style="padding: 8px 0;">✓ Priority support</li><li style="padding: 8px 0;">✓ Custom domains</li></ul><button style="width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">Get Started</button></div>'
  }
];

const categoryConfig = {
  text: { icon: Type, color: 'bg-blue-500/10 text-blue-500', label: 'Text' },
  hero: { icon: Layers, color: 'bg-purple-500/10 text-purple-500', label: 'Hero' },
  feature: { icon: Grid, color: 'bg-green-500/10 text-green-500', label: 'Feature' },
  cta: { icon: Sparkles, color: 'bg-orange-500/10 text-orange-500', label: 'CTA' },
  testimonial: { icon: Quote, color: 'bg-pink-500/10 text-pink-500', label: 'Testimonial' },
  pricing: { icon: Box, color: 'bg-cyan-500/10 text-cyan-500', label: 'Pricing' }
};

export default function BlockCreatorPage() {
  const [blockName, setBlockName] = useState('');
  const [blockDescription, setBlockDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('text');
  const [editorContent, setEditorContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);

  const handleTemplateSelect = (template: BlockTemplate) => {
    setSelectedTemplate(template);
    setBlockName(template.name);
    setBlockDescription(template.description);
    setSelectedCategory(template.category);
    setEditorContent(template.content);
  };

  const handleSave = () => {
    const blockData = {
      name: blockName,
      description: blockDescription,
      category: selectedCategory,
      content: editorContent,
      createdAt: new Date().toISOString()
    };
    console.log('Saving block:', blockData);
    alert('Block saved successfully!');
  };

  const handleExport = () => {
    const blob = new Blob([editorContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blockName || 'block'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    alert('HTML copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Block Creator</h1>
            <p className="text-muted-foreground mt-1">Create custom content blocks using TinyMCE editor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            Copy HTML
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Block
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Templates</h3>
            <div className="space-y-2">
              {blockTemplates.map((template) => {
                const config = categoryConfig[template.category];
                const Icon = config.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={cn(
                      "w-full p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group",
                      selectedTemplate?.id === template.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Block Settings */}
          <Card variant="glass" className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Block Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blockName">Block Name</Label>
                  <Input
                    id="blockName"
                    placeholder="e.g., Hero Banner"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockDescription">Description</Label>
                  <Input
                    id="blockDescription"
                    placeholder="Brief description"
                    value={blockDescription}
                    onChange={(e) => setBlockDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedCategory === key 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor / Preview Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={!previewMode ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setPreviewMode(false)}
              >
                <Edit3 className="h-4 w-4" />
                Editor
              </Button>
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* TinyMCE Editor */}
          <Card variant="glass" className="border-border overflow-hidden">
            {previewMode ? (
              <div 
                className="p-8 min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            ) : (
              <div className="p-2">
                <Editor
                  initialValue={editorContent}
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
                      'print', 'preview', 'anchor', 'searchreplace', 'visualblocks', 
                      'code', 'fullscreen', 'insertdatetime', 'media', 'table', 
                      'paste', 'code', 'help', 'wordcount', 'lists'
                    ],
                    toolbar:
                      'undo redo | formatselect | bold italic underline strikethrough | \
                      alignleft aligncenter alignright alignjustify | \
                      bullist numlist outdent indent | \
                      link image media table | \
                      blockquote removeformat | \
                      code fullscreen help',
                    content_style: `
                      body { 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        font-size: 16px; 
                        line-height: 1.6;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                      }
                      h1, h2, h3, h4 { font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
                      h1 { font-size: 2.5em; }
                      h2 { font-size: 2em; }
                      h3 { font-size: 1.5em; }
                      p { margin-bottom: 1em; }
                      ul, ol { padding-left: 2em; margin-bottom: 1em; }
                      li { margin-bottom: 0.5em; }
                      blockquote { 
                        border-left: 4px solid #3b82f6; 
                        padding-left: 1em; 
                        margin-left: 0; 
                        color: #6b7280;
                        font-style: italic;
                      }
                      code { 
                        background: #f3f4f6; 
                        padding: 0.2em 0.4em; 
                        border-radius: 4px; 
                        font-size: 0.9em; 
                      }
                      pre { 
                        background: #1f2937; 
                        color: #f9fafb; 
                        padding: 1em; 
                        border-radius: 8px; 
                        overflow-x: auto;
                      }
                      img { max-width: 100%; height: auto; border-radius: 8px; }
                      a { color: #3b82f6; text-decoration: underline; }
                    `,
                    placeholder: 'Start creating your block content...',
                    branding: false,
                    resize: true,
                  }}
                  onEditorChange={(value) => setEditorContent(value)}
                />
              </div>
            )}
          </Card>

          {/* Quick Insert Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Quick insert:</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<h2>Heading</h2>')}
            >
              <Type className="h-3 w-3" /> Heading
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<p>Paragraph text goes here...</p>')}
            >
              <Edit3 className="h-3 w-3" /> Paragraph
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<ul><li>List item</li></ul>')}
            >
              <List className="h-3 w-3" /> List
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<blockquote>Quote text</blockquote>')}
            >
              <Quote className="h-3 w-3" /> Quote
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Button</button>')}
            >
              <Sparkles className="h-3 w-3" /> Button
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 30px 0;" />')}
            >
              <Minus className="h-3 w-3" /> Divider
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setEditorContent(editorContent + '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;"><div>Column 1</div><div>Column 2</div></div>')}
            >
              <Grid className="h-3 w-3" /> Columns
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

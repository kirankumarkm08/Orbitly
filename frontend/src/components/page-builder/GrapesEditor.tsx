'use client';

import { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Free plugins
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsForms from 'grapesjs-plugin-forms';

export interface PageData {
  html: string;
  css: string;
  components: string;
  styles: string;
}

export interface GrapesEditorProps {
  initialContent?: PageData;
  onSave?: (data: PageData) => void;
  onLoad?: () => void;
}

// Free CSS animations
const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); } }

  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
  .animate-fadeInDown { animation: fadeInDown 0.5s ease-out; }
  .animate-fadeInLeft { animation: fadeInLeft 0.5s ease-out; }
  .animate-fadeInRight { animation: fadeInRight 0.5s ease-out; }
  .animate-zoomIn { animation: zoomIn 0.5s ease-out; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-bounce { animation: bounce 1s ease infinite; }
`;

export default function GrapesEditor({
  initialContent,
  onSave,
  onLoad,
}: GrapesEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rightTab, setRightTab] = useState<'styles' | 'properties'>('styles');
  const [activeDevice, setActiveDevice] = useState('Desktop');
  const [pages] = useState([
    { id: 'home', name: 'Home', active: true },
    { id: 'about', name: 'About', active: false },
    { id: 'contact', name: 'Contact', active: false },
  ]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,
      storageManager: false,
      plugins: [gjsBlocksBasic, gjsPresetWebpage, gjsForms],
      pluginsOpts: {
        [gjsBlocksBasic as unknown as string]: { flexGrid: true },
        [gjsPresetWebpage as unknown as string]: {},
        [gjsForms as unknown as string]: {},
      },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        ],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '375px', widthMedia: '480px' },
        ],
      },
      panels: { defaults: [] },
      blockManager: {
        appendTo: '#blocks-container',
      },
      layerManager: {
        appendTo: '#layers-container',
      },
      styleManager: {
        appendTo: '#styles-container',
        sectors: [
          {
            name: 'Layout',
            open: false,
            buildProps: ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap'],
          },
          {
            name: 'Size',
            open: true,
            buildProps: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height'],
          },
          {
            name: 'Space',
            open: true,
            buildProps: ['padding', 'margin'],
          },
          {
            name: 'Position',
            open: false,
            buildProps: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
          },
          {
            name: 'Background',
            open: false,
            buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size'],
          },
          {
            name: 'Borders',
            open: false,
            buildProps: ['border-radius', 'border', 'border-width', 'border-style', 'border-color'],
          },
          {
            name: 'Effects',
            open: false,
            buildProps: ['opacity', 'box-shadow', 'transition', 'transform'],
          },
        ],
      },
      selectorManager: {
        appendTo: '#selector-container',
      },
      traitManager: {
        appendTo: '#traits-container',
      },
    });

    editorRef.current = editor;

    if (typeof window !== 'undefined') {
      (window as unknown as { editor: typeof editor }).editor = editor;
    }

    // Inject animation styles into the canvas
    editor.on('load', () => {
      const frame = editor.Canvas.getFrameEl();
      if (frame && frame.contentDocument) {
        const style = frame.contentDocument.createElement('style');
        style.innerHTML = animationStyles;
        frame.contentDocument.head.appendChild(style);
      }
    });

    // Load initial content
    if (initialContent?.html) {
      editor.setComponents(initialContent.html);
    }
    if (initialContent?.css) {
      editor.setStyle(initialContent.css);
    }

    // Add save command
    editor.Commands.add('save-page', {
      run: () => {
        const data: PageData = {
          html: editor.getHtml(),
          css: animationStyles + '\n' + (editor.getCss() || ''),
          components: JSON.stringify(editor.getComponents()),
          styles: JSON.stringify(editor.getStyle()),
        };
        onSave?.(data);
        console.log('Page saved:', data);
      },
    });

    // ==================== CUSTOM BLOCKS ====================
    const bm = editor.BlockManager;

    // Event Card Block
    bm.add('event-card', {
      label: 'Event Card',
      category: 'Events',
      content: `
        <div class="event-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; font-family: 'Inter', sans-serif;">
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop" style="width: 100%; height: 200px; object-fit: cover;" alt="Event" />
          <div style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Conference</span>
              <span style="color: #6b7280; font-size: 12px;">Mar 15, 2024</span>
            </div>
            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Tech Summit 2024</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">Join industry leaders for a day of insights and networking.</p>
            <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
              <span>📍</span>
              <span>San Francisco, CA</span>
            </div>
            <a href="#" style="display: inline-block; margin-top: 16px; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">Register Now</a>
          </div>
        </div>
      `,
      attributes: { class: 'gjs-block-section' },
    });

    // Event List Block
    bm.add('event-list', {
      label: 'Event List',
      category: 'Events',
      content: `
        <section style="padding: 60px 20px; background: #f9fafb; font-family: 'Inter', sans-serif;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 40px;">Upcoming Events</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
              <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=300&fit=crop" style="width: 100%; height: 180px; object-fit: cover;" />
                <div style="padding: 20px;">
                  <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Workshop</span>
                  <h3 style="font-size: 18px; font-weight: 600; margin: 12px 0 8px;">Design Systems Workshop</h3>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">April 5, 2024 • 9:00 AM</p>
                  <a href="#" style="color: #3b82f6; font-size: 14px; font-weight: 500; text-decoration: none;">Learn more →</a>
                </div>
              </div>
              <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=300&fit=crop" style="width: 100%; height: 180px; object-fit: cover;" />
                <div style="padding: 20px;">
                  <span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Webinar</span>
                  <h3 style="font-size: 18px; font-weight: 600; margin: 12px 0 8px;">AI in Product Design</h3>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">April 12, 2024 • 2:00 PM</p>
                  <a href="#" style="color: #3b82f6; font-size: 14px; font-weight: 500; text-decoration: none;">Learn more →</a>
                </div>
              </div>
              <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=300&fit=crop" style="width: 100%; height: 180px; object-fit: cover;" />
                <div style="padding: 20px;">
                  <span style="background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Conference</span>
                  <h3 style="font-size: 18px; font-weight: 600; margin: 12px 0 8px;">DevCon 2024</h3>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">May 1-3, 2024 • All Day</p>
                  <a href="#" style="color: #3b82f6; font-size: 14px; font-weight: 500; text-decoration: none;">Learn more →</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    // Speaker Card Block
    bm.add('speaker-card', {
      label: 'Speaker Card',
      category: 'Speakers',
      content: `
        <div class="speaker-card" style="background: white; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 300px; font-family: 'Inter', sans-serif;">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;" alt="Speaker" />
          <h4 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">John Smith</h4>
          <p style="color: #3b82f6; font-size: 14px; margin: 0 0 8px 0;">CEO, TechCorp</p>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">15+ years of experience in building scalable products.</p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <a href="#" style="color: #1da1f2; font-size: 18px;">𝕏</a>
            <a href="#" style="color: #0077b5; font-size: 18px;">in</a>
            <a href="#" style="color: #333; font-size: 18px;">⌘</a>
          </div>
        </div>
      `,
    });

    // Speaker Grid Block
    bm.add('speaker-grid', {
      label: 'Speaker Grid',
      category: 'Speakers',
      content: `
        <section style="padding: 60px 20px; background: white; font-family: 'Inter', sans-serif;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 16px;">Meet Our Speakers</h2>
            <p style="text-align: center; color: #6b7280; max-width: 600px; margin: 0 auto 48px;">Industry experts sharing their knowledge and insights</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px;">
              <div style="text-align: center;">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;" />
                <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 4px;">John Smith</h4>
                <p style="color: #3b82f6; font-size: 14px; margin: 0 0 4px;">CEO, TechCorp</p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">Keynote Speaker</p>
              </div>
              <div style="text-align: center;">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;" />
                <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 4px;">Sarah Johnson</h4>
                <p style="color: #3b82f6; font-size: 14px; margin: 0 0 4px;">VP Design, Startup</p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">Workshop Lead</p>
              </div>
              <div style="text-align: center;">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;" />
                <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 4px;">Mike Chen</h4>
                <p style="color: #3b82f6; font-size: 14px; margin: 0 0 4px;">CTO, DevHub</p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">Panelist</p>
              </div>
              <div style="text-align: center;">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;" />
                <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 4px;">Emily Davis</h4>
                <p style="color: #3b82f6; font-size: 14px; margin: 0 0 4px;">Founder, AI Labs</p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">Speaker</p>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    // Event Schedule Block
    bm.add('event-schedule', {
      label: 'Event Schedule',
      category: 'Events',
      content: `
        <section style="padding: 60px 20px; background: #1f2937; font-family: 'Inter', sans-serif;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: 700; color: white; text-align: center; margin-bottom: 48px;">Event Schedule</h2>
            <div style="space-y: 0;">
              <div style="display: flex; gap: 24px; padding: 24px 0; border-bottom: 1px solid #374151;">
                <div style="min-width: 100px;">
                  <div style="color: #3b82f6; font-weight: 600;">9:00 AM</div>
                  <div style="color: #6b7280; font-size: 13px;">1 hour</div>
                </div>
                <div>
                  <h4 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Registration & Breakfast</h4>
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">Main Hall</p>
                </div>
              </div>
              <div style="display: flex; gap: 24px; padding: 24px 0; border-bottom: 1px solid #374151;">
                <div style="min-width: 100px;">
                  <div style="color: #3b82f6; font-weight: 600;">10:00 AM</div>
                  <div style="color: #6b7280; font-size: 13px;">1.5 hours</div>
                </div>
                <div>
                  <h4 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Keynote: Future of Technology</h4>
                  <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Speaker: John Smith</p>
                  <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Keynote</span>
                </div>
              </div>
              <div style="display: flex; gap: 24px; padding: 24px 0; border-bottom: 1px solid #374151;">
                <div style="min-width: 100px;">
                  <div style="color: #3b82f6; font-weight: 600;">12:00 PM</div>
                  <div style="color: #6b7280; font-size: 13px;">1 hour</div>
                </div>
                <div>
                  <h4 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Lunch & Networking</h4>
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">Terrace</p>
                </div>
              </div>
              <div style="display: flex; gap: 24px; padding: 24px 0;">
                <div style="min-width: 100px;">
                  <div style="color: #3b82f6; font-weight: 600;">1:00 PM</div>
                  <div style="color: #6b7280; font-size: 13px;">2 hours</div>
                </div>
                <div>
                  <h4 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Workshop Sessions</h4>
                  <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Multiple tracks available</p>
                  <span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Workshop</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    // Registration Form Block
    bm.add('registration-form', {
      label: 'Registration Form',
      category: 'Events',
      content: `
        <section style="padding: 60px 20px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); font-family: 'Inter', sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
            <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 8px;">Register Now</h2>
            <p style="color: #6b7280; text-align: center; margin-bottom: 32px;">Secure your spot at the event</p>
            <form>
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Full Name</label>
                <input type="text" placeholder="John Smith" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box;" />
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Email Address</label>
                <input type="email" placeholder="john@example.com" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box;" />
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Company</label>
                <input type="text" placeholder="Your Company" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box;" />
              </div>
              <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Ticket Type</label>
                <select style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white;">
                  <option>General Admission - Free</option>
                  <option>VIP Pass - $99</option>
                  <option>Student - Free</option>
                </select>
              </div>
              <button type="submit" style="width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Register Now</button>
            </form>
          </div>
        </section>
      `,
    });

    // Countdown Timer Block
    bm.add('countdown-timer', {
      label: 'Countdown Timer',
      category: 'Events',
      content: `
        <section style="padding: 80px 20px; background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%); text-align: center; font-family: 'Inter', sans-serif;">
          <h2 style="font-size: 36px; font-weight: 700; color: white; margin-bottom: 16px;">Event Starts In</h2>
          <p style="color: #93c5fd; font-size: 18px; margin-bottom: 48px;">Don't miss out on this amazing experience</p>
          <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px 32px; min-width: 100px;">
              <div style="font-size: 48px; font-weight: 700; color: white;">15</div>
              <div style="color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Days</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px 32px; min-width: 100px;">
              <div style="font-size: 48px; font-weight: 700; color: white;">08</div>
              <div style="color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Hours</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px 32px; min-width: 100px;">
              <div style="font-size: 48px; font-weight: 700; color: white;">42</div>
              <div style="color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Minutes</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px 32px; min-width: 100px;">
              <div style="font-size: 48px; font-weight: 700; color: white;">19</div>
              <div style="color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Seconds</div>
            </div>
          </div>
          <a href="#" style="display: inline-block; margin-top: 48px; background: white; color: #3b82f6; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Reserve Your Spot</a>
        </section>
      `,
    });

    onLoad?.();

    // Set default content
    if (!initialContent?.html) {
      editor.setComponents(`
        <nav style="display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; background: white; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px; color: #3b82f6;">◉</span>
            <span style="font-size: 18px; font-weight: 600; color: #1f2937; font-family: 'Inter', sans-serif;">Logoipsum</span>
          </div>
          <div style="display: flex; gap: 32px; align-items: center;">
            <a href="#" style="color: #4b5563; text-decoration: none; font-size: 14px; font-family: 'Inter', sans-serif;">About</a>
            <a href="#" style="color: #4b5563; text-decoration: none; font-size: 14px; font-family: 'Inter', sans-serif;">Features</a>
            <a href="#" style="color: #4b5563; text-decoration: none; font-size: 14px; font-family: 'Inter', sans-serif;">Testimonials</a>
            <a href="#" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;">Join Waitlist</a>
          </div>
        </nav>
        <section style="text-align: center; padding: 60px 20px; background: white;">
          <h1 style="font-size: 42px; font-weight: 700; color: #1f2937; margin-bottom: 16px; font-family: 'Inter', sans-serif;">Insert Hero <span style="color: #3b82f6;">text here</span></h1>
          <p style="font-size: 16px; color: #6b7280; max-width: 600px; margin: 0 auto 32px; font-family: 'Inter', sans-serif;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;">Join Waitlist</a>
        </section>
        <section style="padding: 0;">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop" style="width: 100%; height: 300px; object-fit: cover;" alt="Building" />
        </section>
      `);
    }

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [initialContent, onSave, onLoad]);

  const handleDeviceChange = (device: string) => {
    setActiveDevice(device);
    editorRef.current?.setDevice(device);
  };

  const handleSave = () => {
    editorRef.current?.Commands.run('save-page');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh',
      background: '#1e1e24',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#2a2a32',
        borderBottom: '1px solid #3a3a44',
        height: '48px',
        flexShrink: 0,
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '200px' }}></div>
        </div>

        {/* Center: Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={activeDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            style={{
              background: '#3a3a44',
              border: '1px solid #4a4a54',
              borderRadius: '6px',
              color: '#e4e4e7',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Undo */}
          <button onClick={() => editorRef.current?.Commands.run('core:undo')} style={toolbarBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
          </button>
          {/* Redo */}
          <button onClick={() => editorRef.current?.Commands.run('core:redo')} style={toolbarBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
          </button>
          <div style={{ width: '1px', height: '20px', background: '#4a4a54', margin: '0 8px' }}></div>
          {/* Code */}
          <button onClick={() => editorRef.current?.Commands.run('core:open-code')} style={toolbarBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
          </button>
          {/* Export */}
          <button onClick={() => {
            const html = editorRef.current?.getHtml();
            const css = editorRef.current?.getCss();
            console.log('HTML:', html);
            console.log('CSS:', css);
            alert('Exported to console');
          }} style={toolbarBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          </button>
          <div style={{ width: '1px', height: '20px', background: '#4a4a54', margin: '0 8px' }}></div>
          {/* Settings */}
          <button style={toolbarBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          </button>

          {/* Right Tab Switcher */}
          <div style={{ display: 'flex', marginLeft: '16px', background: '#3a3a44', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setRightTab('styles')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                background: rightTab === 'styles' ? '#3b82f6' : 'transparent',
                color: rightTab === 'styles' ? 'white' : '#a1a1aa',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Styles
            </button>
            <button
              onClick={() => setRightTab('properties')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                background: rightTab === 'properties' ? '#3b82f6' : 'transparent',
                color: rightTab === 'properties' ? 'white' : '#a1a1aa',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Properties
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{
          width: '240px',
          background: '#2a2a32',
          borderRight: '1px solid #3a3a44',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Pages Section */}
          <div style={{ borderBottom: '1px solid #3a3a44' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #3a3a44',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#71717a"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pages</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}>+</button>
                <button style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}>∧</button>
              </div>
            </div>
            <div style={{ padding: '8px' }}>
              {pages.map((page) => (
                <div
                  key={page.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: page.active ? '#3b82f6' : 'transparent',
                    color: page.active ? 'white' : '#a1a1aa',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                  }}
                >
                  {page.name}
                </div>
              ))}
            </div>
          </div>

          {/* Layers Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderBottom: '1px solid #3a3a44',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#71717a"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layers</span>
            </div>
            <div id="layers-container" style={{ flex: 1, overflow: 'auto', padding: '8px' }}></div>
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />

        {/* Right Sidebar */}
        <div style={{
          width: '280px',
          background: '#2a2a32',
          borderLeft: '1px solid #3a3a44',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {/* Selector Display */}
          <div id="selector-container" style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #3a3a44',
            display: rightTab === 'styles' ? 'block' : 'none',
          }}></div>
          
          {/* Styles Content */}
          <div id="styles-container" style={{ 
            flex: 1, 
            overflow: 'auto', 
            padding: '8px 12px',
            display: rightTab === 'styles' ? 'block' : 'none',
          }}></div>

          {/* Properties/Traits Content */}
          <div id="traits-container" style={{ 
            flex: 1, 
            overflow: 'auto', 
            padding: '8px 12px',
            display: rightTab === 'properties' ? 'block' : 'none',
          }}></div>

          {/* Blocks (hidden but mounted) */}
          <div id="blocks-container" style={{ display: 'none' }}></div>
        </div>
      </div>

      {/* Studio Theme Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .gjs-editor {
          font-family: 'Inter', -apple-system, sans-serif !important;
          background: #1e1e24 !important;
        }

        .gjs-one-bg { background: #1e1e24 !important; }
        .gjs-two-color { color: #e4e4e7 !important; }
        .gjs-three-bg { background: #2a2a32 !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #3b82f6 !important; }

        /* Canvas */
        .gjs-cv-canvas {
          background: #1e1e24 !important;
        }

        .gjs-frame-wrapper {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
          margin: 24px !important;
        }

        .gjs-frame {
          border-radius: 8px !important;
          background: white !important;
        }

        /* Layers */
        .gjs-layers { padding: 0 !important; }

        .gjs-layer {
          background: transparent !important;
          border-radius: 4px !important;
          margin: 1px 0 !important;
          font-size: 13px !important;
        }

        .gjs-layer:hover {
          background: #3a3a44 !important;
        }

        .gjs-layer.gjs-selected {
          background: #3b82f6 !important;
        }

        .gjs-layer-title {
          padding: 6px 8px !important;
          color: #a1a1aa !important;
        }

        .gjs-layer.gjs-selected .gjs-layer-title {
          color: white !important;
        }

        .gjs-layer-name {
          color: inherit !important;
        }

        .gjs-layer-caret {
          color: #71717a !important;
          margin-right: 4px !important;
        }

        .gjs-layer-count {
          color: #71717a !important;
        }

        /* Style Manager */
        .gjs-sm-sector {
          background: transparent !important;
          border: none !important;
          margin-bottom: 4px !important;
        }

        .gjs-sm-sector-title {
          background: #3a3a44 !important;
          color: #e4e4e7 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          padding: 10px 12px !important;
          border-radius: 6px !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .gjs-sm-sector-title::before {
          content: '◆' !important;
          color: #f59e0b !important;
          font-size: 8px !important;
        }

        .gjs-sm-sector-caret {
          color: #71717a !important;
        }

        .gjs-sm-properties {
          padding: 12px 0 !important;
          background: transparent !important;
        }

        .gjs-sm-property {
          margin-bottom: 12px !important;
        }

        .gjs-sm-label {
          color: #a1a1aa !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          margin-bottom: 6px !important;
        }

        /* Form Fields */
        .gjs-field {
          background: #3a3a44 !important;
          border: 1px solid #4a4a54 !important;
          border-radius: 6px !important;
          color: #e4e4e7 !important;
          font-size: 13px !important;
        }

        .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        .gjs-field input,
        .gjs-field select {
          background: transparent !important;
          border: none !important;
          color: #e4e4e7 !important;
          font-size: 13px !important;
          padding: 6px 10px !important;
        }

        .gjs-field-arrows {
          color: #71717a !important;
        }

        /* Selector Manager */
        .gjs-clm-tags {
          padding: 8px !important;
          background: #3a3a44 !important;
          border-radius: 6px !important;
        }

        .gjs-clm-tag {
          background: #4a4a54 !important;
          border-radius: 4px !important;
          color: #a1a1aa !important;
          padding: 4px 8px !important;
          margin: 2px !important;
          font-size: 12px !important;
        }

        .gjs-clm-tag.gjs-three-bg {
          background: #3b82f6 !important;
          color: white !important;
        }

        .gjs-clm-sels-info {
          color: #71717a !important;
          font-size: 11px !important;
        }

        /* Selection */
        .gjs-selected {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px !important;
        }

        .gjs-hovered {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: -2px !important;
        }

        /* Toolbar */
        .gjs-toolbar {
          background: #2a2a32 !important;
          border-radius: 6px !important;
          border: 1px solid #3a3a44 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }

        .gjs-toolbar-item {
          color: #a1a1aa !important;
          padding: 6px !important;
        }

        .gjs-toolbar-item:hover {
          color: #3b82f6 !important;
        }

        /* RTE */
        .gjs-rte-toolbar {
          background: #2a2a32 !important;
          border: 1px solid #3a3a44 !important;
          border-radius: 6px !important;
        }

        .gjs-rte-action {
          color: #a1a1aa !important;
          border: none !important;
        }

        .gjs-rte-action:hover {
          color: #3b82f6 !important;
        }

        /* Traits */
        .gjs-trt-trait {
          padding: 10px 0 !important;
          border-bottom: 1px solid #3a3a44 !important;
        }

        .gjs-trt-trait .gjs-label {
          color: #a1a1aa !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          margin-bottom: 6px !important;
        }

        /* Scrollbars */
        #layers-container::-webkit-scrollbar,
        #styles-container::-webkit-scrollbar,
        #traits-container::-webkit-scrollbar {
          width: 6px;
        }

        #layers-container::-webkit-scrollbar-track,
        #styles-container::-webkit-scrollbar-track,
        #traits-container::-webkit-scrollbar-track {
          background: #2a2a32;
        }

        #layers-container::-webkit-scrollbar-thumb,
        #styles-container::-webkit-scrollbar-thumb,
        #traits-container::-webkit-scrollbar-thumb {
          background: #4a4a54;
          border-radius: 3px;
        }

        /* Resizer */
        .gjs-resizer-h {
          border-color: #3b82f6 !important;
          background: #3b82f6 !important;
        }

        /* Modal */
        .gjs-mdl-dialog {
          background: #2a2a32 !important;
          border-radius: 8px !important;
          border: 1px solid #3a3a44 !important;
        }

        .gjs-mdl-header {
          background: #3a3a44 !important;
          color: #e4e4e7 !important;
          border-radius: 8px 8px 0 0 !important;
        }

        .gjs-mdl-content {
          background: #2a2a32 !important;
          color: #e4e4e7 !important;
        }

        .gjs-btn-prim {
          background: #3b82f6 !important;
          border: none !important;
          border-radius: 6px !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#a1a1aa',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

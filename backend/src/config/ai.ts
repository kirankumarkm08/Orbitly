import Groq from 'groq-sdk';

// Initialize Groq client (OpenAI-compatible, uses Llama 3.3 70B)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

// System prompt that instructs the LLM to generate clean HTML/CSS blocks
export const BLOCK_SYSTEM_PROMPT = `You are an expert web designer and front-end developer. Your job is to generate clean, modern HTML and CSS code for website sections/blocks.

RULES:
1. Return ONLY valid JSON with this exact structure: {"html": "...", "css": "...", "name": "...", "description": "..."}
2. The HTML must be a single root element (a <section> or <div>)
3. Use modern CSS: flexbox, grid, custom properties, clamp(), etc.
4. Make everything responsive using relative units and media queries
5. Use a consistent BEM-like class naming: .ai-blockname__element--modifier
6. Use CSS custom properties for colors so users can easily re-theme:
   --ai-primary: #6366f1;
   --ai-secondary: #a855f7;
   --ai-bg: #ffffff;
   --ai-text: #1e293b;
   --ai-muted: #64748b;
7. Do NOT use JavaScript — HTML and CSS only
8. Do NOT use external images — use CSS gradients, SVG inline, or emoji as placeholders
9. Use Google Fonts via @import for typography if needed
10. Make the design modern, polished, and production-ready
11. Include hover effects and smooth transitions where appropriate
12. The "name" should be a short 2-4 word title (e.g. "Hero Gradient Section")
13. The "description" should be one sentence describing the block`;

export const REFINE_SYSTEM_PROMPT = `You are an expert web designer. You will receive existing HTML and CSS code for a website block, plus a refinement request. Modify the code according to the request.

RULES:
1. Return ONLY valid JSON: {"html": "...", "css": "..."}
2. Preserve the existing structure as much as possible
3. Apply the requested changes cleanly
4. Keep all CSS custom properties (--ai-*) for theming
5. Do NOT add JavaScript`;

export default groq;

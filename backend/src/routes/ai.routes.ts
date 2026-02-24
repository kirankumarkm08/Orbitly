import { Router } from 'express';
import type { Request, Response } from 'express';
import groq, { AI_MODEL, BLOCK_SYSTEM_PROMPT, REFINE_SYSTEM_PROMPT } from '../config/ai.js';

const router = Router();

// Helper to safely parse LLM response as JSON
function parseLLMResponse(content: string): any {
  // Try to extract JSON from the response (LLMs sometimes wrap in ```json blocks)
  let cleaned = content.trim();
  
  // Remove markdown code fences if present
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    cleaned = jsonMatch[1].trim();
  }
  
  return JSON.parse(cleaned);
}

// Wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => 
  (req: Request, res: Response) => fn(req, res).catch((err: any) => {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  });

// ──────────────────────────────────────────────
// POST /api/ai/generate-block
// Generate a new HTML/CSS block from a text prompt
// ──────────────────────────────────────────────
router.post('/generate-block', asyncHandler(async (req: Request, res: Response) => {
  const { prompt, category, style_preferences } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return res.status(400).json({ error: 'A prompt of at least 3 characters is required' });
  }

  // Build user message with optional context
  let userMessage = prompt.trim();
  
  if (category) {
    userMessage += `\n\nCategory: ${category}`;
  }
  
  if (style_preferences) {
    if (style_preferences.theme === 'dark') {
      userMessage += '\n\nUse a dark theme: dark background (#0f172a or similar), light text.';
    }
    if (style_preferences.accent_color) {
      userMessage += `\nUse ${style_preferences.accent_color} as the primary accent color.`;
    }
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: BLOCK_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    model: AI_MODEL,
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    return res.status(500).json({ error: 'No response from AI model' });
  }

  const parsed = parseLLMResponse(content);

  // Validate required fields
  if (!parsed.html) {
    return res.status(500).json({ error: 'AI did not return valid HTML' });
  }

  res.json({
    html: parsed.html,
    css: parsed.css || '',
    name: parsed.name || 'AI Block',
    description: parsed.description || '',
    category: category || 'content',
    ai_generated: true,
  });
}));

// ──────────────────────────────────────────────
// POST /api/ai/refine-block
// Refine/edit an existing block with a follow-up prompt
// ──────────────────────────────────────────────
router.post('/refine-block', asyncHandler(async (req: Request, res: Response) => {
  const { prompt, current_html, current_css } = req.body;

  if (!prompt || !current_html) {
    return res.status(400).json({ error: 'Both prompt and current_html are required' });
  }

  const userMessage = `Here is the current block:

HTML:
\`\`\`html
${current_html}
\`\`\`

CSS:
\`\`\`css
${current_css || '/* no styles */'}
\`\`\`

Refinement request: ${prompt}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: REFINE_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    model: AI_MODEL,
    temperature: 0.5,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    return res.status(500).json({ error: 'No response from AI model' });
  }

  const parsed = parseLLMResponse(content);

  res.json({
    html: parsed.html || current_html,
    css: parsed.css || current_css || '',
  });
}));

export default router;

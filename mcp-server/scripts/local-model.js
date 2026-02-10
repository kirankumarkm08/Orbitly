// Simple local model wrapper for testing on Windows
// Usage: node scripts/local-model.js "<prompt>"
const prompt = process.argv.slice(2).join(' ') || '';
// Simulate some model output
const output = `Stub model response for prompt: ${prompt}`;
console.log(output);

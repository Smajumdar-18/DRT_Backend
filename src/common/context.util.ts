const MAX_CONTEXT_CHARS = 6000; // safe for Gemini prompts

type SearchResult = {
  text: string;
  source: string;
  score: number;
};

export function assembleContext(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return 'No relevant documentation was found for this query.';
  }

  // Sort by relevance (highest score first)
  const sorted = [...results].sort((a, b) => b.score - a.score);

  let context = '';
  let usedChars = 0;

  for (let i = 0; i < sorted.length; i++) {
    const chunk = sorted[i];

    const section = `
[Source: ${chunk.source} | Score: ${chunk.score.toFixed(2)}]
${chunk.text}
`;

    if (usedChars + section.length > MAX_CONTEXT_CHARS) {
      break;
    }

    context += section;
    usedChars += section.length;
  }

  return context.trim();
}

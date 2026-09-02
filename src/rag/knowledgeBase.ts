import { RAGDocument, RAGSearchResult, SupportCategory } from '../types/agent';
import { FOODCHOW_KNOWLEDGE_BASE } from '../data/defaultKnowledgeBase';
import { appStore } from '../store/appStore';

export { FOODCHOW_KNOWLEDGE_BASE };

export function searchKnowledgeBase(
  query: string, 
  category?: SupportCategory, 
  customDocs?: RAGDocument[]
): RAGSearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const tokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  let liveDocs: RAGDocument[] = FOODCHOW_KNOWLEDGE_BASE;
  try {
    if (customDocs && customDocs.length > 0) {
      liveDocs = customDocs;
    } else if (appStore && typeof appStore.getKnowledgeBase === 'function') {
      liveDocs = appStore.getKnowledgeBase();
    }
  } catch (err) {
    liveDocs = FOODCHOW_KNOWLEDGE_BASE;
  }

  const results: RAGSearchResult[] = liveDocs.map(doc => {
    let score = 0;
    const matchedKeywords: string[] = [];

    const lowerTitle = doc.title.toLowerCase();
    const lowerContent = doc.content.toLowerCase();

    // Category match bonus
    if (category && doc.category === category) {
      score += 3.0;
    }

    tokens.forEach(token => {
      // Check title match
      if (lowerTitle.includes(token)) {
        score += 2.5;
        matchedKeywords.push(token);
      }

      // Check tags match
      if (doc.tags && doc.tags.some(tag => tag.includes(token))) {
        score += 3.0;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }

      // Check content match
      if (lowerContent.includes(token)) {
        score += 1.0;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
    });

    return {
      doc,
      score,
      matchedKeywords
    };
  });

  return results
    .filter(r => r.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

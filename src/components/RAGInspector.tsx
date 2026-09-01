import React, { useState } from 'react';
import { FOODCHOW_KNOWLEDGE_BASE, searchKnowledgeBase } from '../rag/knowledgeBase';
import { RAGDocument, RAGSearchResult, SupportCategory } from '../types/agent';
import { FormattedText } from '../utils/formatText';
import { DocumentModal } from './DocumentModal';
import { Database, Search, Tag, Sparkles, ExternalLink, BookOpen } from 'lucide-react';

export const RAGInspector: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [results, setResults] = useState<RAGSearchResult[]>([]);
  const [activeDocModal, setActiveDocModal] = useState<RAGDocument | null>(null);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const cat = selectedCategory === 'ALL' ? undefined : (selectedCategory as SupportCategory);
    const searchRes = searchKnowledgeBase(query, cat);
    setResults(searchRes);
  };

  const filteredBaseDocs = FOODCHOW_KNOWLEDGE_BASE.filter(doc => 
    selectedCategory === 'ALL' || doc.category === selectedCategory
  );

  return (
    <div className="rag-inspector-layout">
      {/* Search Header */}
      <div className="rag-header-box">
        <div className="title-area">
          <Database className="rag-icon" />
          <div>
            <h2>FoodChow Knowledge Base & RAG Index Inspector</h2>
            <p>Query the indexed vector/hybrid RAG troubleshooting documentation used by the autonomous support agent. Click any card to pop up the full article.</p>
          </div>
        </div>

        <div className="search-controls">
          <div className="input-group">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search knowledge base (e.g., 'paper jam', 'printer offline', 'payment deducted', 'kds socket')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="ALL">All Categories</option>
            <option value="POS">POS System</option>
            <option value="KDS">Kitchen Display (KDS)</option>
            <option value="PAYMENTS">Payments & Refunds</option>
            <option value="ONLINE_ORDERING">Online Ordering</option>
            <option value="ACCOUNT">Account Management</option>
          </select>

          <button className="btn-search-rag" onClick={handleSearch}>
            <Sparkles className="btn-icon" />
            Test RAG Query
          </button>
        </div>
      </div>

      {/* Results or Complete Index View */}
      <div className="rag-results-grid">
        {results.length > 0 ? (
          <div className="results-section">
            <h3>RAG Vector Search Results ({results.length} Matches)</h3>
            <div className="rag-full-card-list">
              {results.map((res, i) => (
                <div 
                  key={i} 
                  className="rag-card full-width match clickable"
                  onClick={() => setActiveDocModal(res.doc)}
                >
                  <div className="card-badge-row">
                    <span className="cat-badge">{res.doc.category}</span>
                    <span className="score-badge">Relevance Score: {res.score.toFixed(2)}</span>
                  </div>

                  <div className="card-title-row">
                    <h4>{res.doc.title}</h4>
                    <ExternalLink className="pop-icon" />
                  </div>

                  <div className="matched-tags">
                    <span className="tag-label">Matched Tokens: </span>
                    <div className="tags-chips">
                      {res.matchedKeywords.map((kw, k) => (
                        <span key={k} className="token-tag">{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div className="doc-content-formatted">
                    <FormattedText content={res.doc.content} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="full-index-section">
            <h3>Indexed Documentation Repository ({filteredBaseDocs.length} Articles)</h3>
            <div className="card-grid">
              {filteredBaseDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="rag-card clickable"
                  onClick={() => setActiveDocModal(doc)}
                >
                  <div className="card-badge-row">
                    <span className="cat-badge">{doc.category}</span>
                    <span className="id-badge">{doc.id}</span>
                  </div>

                  <h4>{doc.title}</h4>

                  <div className="tags-row">
                    <Tag className="tag-icon" />
                    <div className="tags-chips">
                      {doc.tags.map((t, idx) => (
                        <span key={idx} className="doc-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="doc-preview">
                    <FormattedText content={doc.content.slice(0, 180) + '...'} />
                  </div>

                  <button className="btn-read-full">
                    <BookOpen className="btn-icon" />
                    <span>Read Full Article (Popup)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Smooth Article Popup Modal */}
      <DocumentModal
        doc={activeDocModal}
        onClose={() => setActiveDocModal(null)}
      />
    </div>
  );
};

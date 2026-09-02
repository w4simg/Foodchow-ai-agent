import React, { useState, useEffect } from 'react';
import { searchKnowledgeBase } from '../rag/knowledgeBase';
import { RAGDocument, RAGSearchResult, SupportCategory } from '../types/agent';
import { FormattedText } from '../utils/formatText';
import { DocumentModal } from './DocumentModal';
import { appStore } from '../store/appStore';
import { Database, Search, Tag, Sparkles, ExternalLink, BookOpen, Plus, Edit3, Trash2 } from 'lucide-react';

interface RAGInspectorProps {
  onViewDoc?: (doc: RAGDocument) => void;
  onEditDoc?: (doc: RAGDocument) => void;
  onCreateDoc?: () => void;
  onDeleteDoc?: (id: string) => void;
}

export const RAGInspector: React.FC<RAGInspectorProps> = ({
  onViewDoc,
  onEditDoc,
  onCreateDoc,
  onDeleteDoc
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [results, setResults] = useState<RAGSearchResult[]>([]);
  const [activeDocModal, setActiveDocModal] = useState<RAGDocument | null>(null);
  const [baseDocs, setBaseDocs] = useState<RAGDocument[]>(() => appStore.getKnowledgeBase());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setBaseDocs([...appStore.getKnowledgeBase()]);
    });
    return unsubscribe;
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const cat = selectedCategory === 'ALL' ? undefined : (selectedCategory as SupportCategory);
    const searchRes = searchKnowledgeBase(query, cat);
    setResults(searchRes);
  };

  const filteredBaseDocs = baseDocs.filter(doc => 
    selectedCategory === 'ALL' || doc.category === selectedCategory
  );

  const handleView = (doc: RAGDocument) => {
    if (onViewDoc) onViewDoc(doc);
    else setActiveDocModal(doc);
  };

  return (
    <div className="rag-inspector-layout">
      {/* Search Header */}
      <div className="rag-header-box">
        <div className="title-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Database className="rag-icon" />
            <div>
              <h2>FoodChow Knowledge Base & RAG Index Inspector</h2>
              <p>Query, add, edit, or delete indexed RAG troubleshooting documentation used by the autonomous support agent.</p>
            </div>
          </div>

          {onCreateDoc && (
            <button 
              className="btn-create-item" 
              onClick={onCreateDoc}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
              }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              <span>Create New Article</span>
            </button>
          )}
        </div>

        <div className="search-controls" style={{ marginTop: '1rem' }}>
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
                  className="rag-card full-width match"
                >
                  <div className="card-badge-row">
                    <span className="cat-badge">{res.doc.category}</span>
                    <span className="score-badge">Relevance Score: {res.score.toFixed(2)}</span>
                  </div>

                  <div className="card-title-row">
                    <h4>{res.doc.title}</h4>
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

                  {/* Card Actions */}
                  <div className="rag-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-read-full" onClick={() => handleView(res.doc)} style={{ flex: 1 }}>
                      <BookOpen className="btn-icon" />
                      <span>Read Article</span>
                    </button>
                    {onEditDoc && (
                      <button className="btn-edit-item" onClick={() => onEditDoc(res.doc)} title="Edit Article" style={{ padding: '0.5rem 0.85rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer' }}>
                        <Edit3 style={{ width: 15, height: 15 }} />
                      </button>
                    )}
                    {onDeleteDoc && (
                      <button className="btn-delete-item" onClick={() => onDeleteDoc(res.doc.id)} title="Delete Article" style={{ padding: '0.5rem 0.85rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    )}
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
                  className="rag-card"
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
                    <FormattedText content={doc.content.slice(0, 150) + '...'} />
                  </div>

                  <div className="rag-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.85rem' }}>
                    <button className="btn-read-full" onClick={() => handleView(doc)} style={{ flex: 1 }}>
                      <BookOpen className="btn-icon" />
                      <span>Read</span>
                    </button>

                    {onEditDoc && (
                      <button className="btn-edit-item" onClick={() => onEditDoc(doc)} title="Edit Article" style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer' }}>
                        <Edit3 style={{ width: 15, height: 15 }} />
                      </button>
                    )}

                    {onDeleteDoc && (
                      <button className="btn-delete-item" onClick={() => onDeleteDoc(doc.id)} title="Delete Article" style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    )}
                  </div>
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

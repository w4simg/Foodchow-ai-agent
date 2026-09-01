import React from 'react';
import { RAGDocument } from '../types/agent';
import { FormattedText } from '../utils/formatText';
import { X, BookOpen, Tag, Calendar, Sparkles } from 'lucide-react';

interface DocumentModalProps {
  doc: RAGDocument | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="doc-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-top-bar">
          <div className="meta-left">
            <span className="cat-badge">{doc.category}</span>
            <span className="id-badge">{doc.id}</span>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close Modal">
            <X className="close-icon" />
          </button>
        </div>

        {/* Modal Title */}
        <div className="modal-title-section">
          <BookOpen className="title-icon" />
          <h2>{doc.title}</h2>
        </div>

        {/* Tags & Metadata */}
        <div className="modal-meta-row">
          <div className="tags-chips">
            <Tag className="tag-icon" />
            {doc.tags.map((t, idx) => (
              <span key={idx} className="doc-tag">{t}</span>
            ))}
          </div>

          <div className="last-updated">
            <Calendar className="time-icon" />
            <span>Updated: {doc.lastUpdated}</span>
          </div>
        </div>

        {/* Modal Body - Full Formatted Article Content */}
        <div className="modal-body-content">
          <FormattedText content={doc.content} />
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="footer-note">
            <Sparkles className="sparkle-icon" />
            Indexed in FoodChow Hybrid RAG Retriever Engine
          </span>
          <button className="btn-modal-close" onClick={onClose}>
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};

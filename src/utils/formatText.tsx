import React from 'react';

interface FormattedTextProps {
  content: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ content }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  const parseInline = (text: string): React.ReactNode[] => {
    // Regex for bold (**text**), code (`text`), and inline tags
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Pattern for **bold** or `code`
    const regex = /(\*\*(.*?)\*\*|`(.*?)`)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add preceding normal text
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      if (match[1].startsWith('**')) {
        // Bold text
        parts.push(
          <strong key={match.index} className="formatted-bold">
            {match[2]}
          </strong>
        );
      } else if (match[1].startsWith('`')) {
        // Inline code
        parts.push(
          <code key={match.index} className="formatted-code">
            {match[3]}
          </code>
        );
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts;
  };

  return (
    <div className="formatted-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="line-spacer" />;
        }

        // Headers: # or ## or ###
        if (trimmed.startsWith('# ')) {
          return (
            <h3 key={idx} className="formatted-h1">
              {parseInline(trimmed.substring(2))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={idx} className="formatted-h2">
              {parseInline(trimmed.substring(3))}
            </h4>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className="formatted-h3">
              {parseInline(trimmed.substring(4))}
            </h5>
          );
        }

        // Bullet lists: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="formatted-bullet-item">
              <span className="bullet-dot">•</span>
              <span>{parseInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered lists: 1. 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="formatted-num-item">
              <span className="num-badge">{numMatch[1]}.</span>
              <span>{parseInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="formatted-p">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
};

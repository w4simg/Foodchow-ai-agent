import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { PredefinedScenario } from '../types/agent';
import { Zap, Play, CheckCircle2, Edit3, Trash2, Plus } from 'lucide-react';

interface PredefinedScenariosViewProps {
  onRunScenario: (scenario: PredefinedScenario) => void;
  onEditScenario?: (scenario: PredefinedScenario) => void;
  onCreateScenario?: () => void;
  onDeleteScenario?: (id: string) => void;
}

export const PredefinedScenariosView: React.FC<PredefinedScenariosViewProps> = ({
  onRunScenario,
  onEditScenario,
  onCreateScenario,
  onDeleteScenario
}) => {
  const [scenarios, setScenarios] = useState<PredefinedScenario[]>(() => appStore.getScenarios());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setScenarios([...appStore.getScenarios()]);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="scenarios-layout">
      <div className="scenarios-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="title-row">
          <Zap className="scenarios-icon" />
          <div>
            <h2>Evaluation Scenarios & Agent Stress-Testing Suite</h2>
            <p>Select any predefined scenario below to test the agentic reasoning, RAG search, diagnostic API calling, and guardrails.</p>
          </div>
        </div>

        {onCreateScenario && (
          <button 
            className="btn-create-item" 
            onClick={onCreateScenario}
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
            <span>Create New Scenario</span>
          </button>
        )}
      </div>

      <div className="scenarios-grid">
        {scenarios.map((sc) => (
          <div key={sc.id} className="scenario-card">
            <div className="sc-header">
              <span className="sc-badge">{sc.badge}</span>
              <span className="sc-cat">{sc.category}</span>
            </div>

            <h3>{sc.title}</h3>
            <p className="sc-desc">{sc.description}</p>

            <div className="sc-prompt-box">
              <span className="prompt-label">Simulated Customer Prompt:</span>
              <p className="prompt-text">"{sc.initialMessage}"</p>
            </div>

            <div className="sc-flow-section">
              <span className="flow-title">Expected Agentic Reasoning Flow:</span>
              <ol className="flow-steps">
                {sc.expectedFlow.map((step, idx) => (
                  <li key={idx}>
                    <CheckCircle2 className="step-icon" />
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Admin Action Buttons */}
            <div className="card-actions-row" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
              <button
                className="btn-launch-scenario"
                style={{ flex: 1 }}
                onClick={() => onRunScenario(sc)}
              >
                <Play className="btn-icon" />
                Launch Scenario
              </button>

              {onEditScenario && (
                <button
                  className="btn-edit-item"
                  onClick={() => onEditScenario(sc)}
                  title="Edit Scenario"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.65rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 style={{ width: 15, height: 15 }} />
                </button>
              )}

              {onDeleteScenario && (
                <button
                  className="btn-delete-item"
                  onClick={() => onDeleteScenario(sc.id)}
                  title="Delete Scenario"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.65rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    color: '#EF4444',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 style={{ width: 15, height: 15 }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

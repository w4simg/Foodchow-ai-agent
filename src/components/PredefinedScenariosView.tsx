import React from 'react';
import { PREDEFINED_SCENARIOS } from '../data/predefinedScenarios';
import { PredefinedScenario } from '../types/agent';
import { Zap, Play, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface PredefinedScenariosViewProps {
  onRunScenario: (scenario: PredefinedScenario) => void;
}

export const PredefinedScenariosView: React.FC<PredefinedScenariosViewProps> = ({
  onRunScenario
}) => {
  return (
    <div className="scenarios-layout">
      <div className="scenarios-header">
        <div className="title-row">
          <Zap className="scenarios-icon" />
          <div>
            <h2>Evaluation Scenarios & Agent Stress-Testing Suite</h2>
            <p>Select any predefined scenario below to test the agentic reasoning, RAG search, diagnostic API calling, and guardrails.</p>
          </div>
        </div>
      </div>

      <div className="scenarios-grid">
        {PREDEFINED_SCENARIOS.map((sc) => (
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

            <button
              className="btn-launch-scenario"
              onClick={() => onRunScenario(sc)}
            >
              <Play className="btn-icon" />
              Launch Scenario in Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

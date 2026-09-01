import React, { useState } from 'react';
import { TraceStep, ToolCallRecord, RAGSearchResult } from '../types/agent';
import { 
  Activity, 
  Brain, 
  Database, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Lock,
  Code
} from 'lucide-react';

interface TraceDrawerProps {
  steps: TraceStep[];
  toolCalls?: ToolCallRecord[];
  retrievedDocs?: RAGSearchResult[];
  confidenceScore?: number;
}

export const ObservabilityTraceDrawer: React.FC<TraceDrawerProps> = ({
  steps,
  toolCalls = [],
  retrievedDocs = [],
  confidenceScore = 95
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const getAgentIcon = (phase: string) => {
    switch (phase) {
      case 'TRIAGE': return <Brain className="phase-icon triage" />;
      case 'RETRIEVAL': return <Database className="phase-icon rag" />;
      case 'DIAGNOSTIC': return <Wrench className="phase-icon diag" />;
      case 'GUARDRAIL': return <ShieldAlert className="phase-icon guard" />;
      case 'ACTION': return <CheckCircle2 className="phase-icon action" />;
      case 'ESCALATION': return <Lock className="phase-icon esc" />;
      default: return <Activity className="phase-icon" />;
    }
  };

  return (
    <div className="trace-drawer-container">
      {/* Drawer Toggle Bar */}
      <button 
        className="trace-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="toggle-left">
          <Activity className="pulse-icon" />
          <span className="toggle-title">Agent Execution Trace & Observability</span>
          <span className="step-count-badge">{steps.length} Steps</span>
        </div>

        <div className="toggle-right">
          <div className="confidence-meter">
            <span className="meter-label">Confidence:</span>
            <span className={`meter-val ${confidenceScore > 85 ? 'high' : 'medium'}`}>
              {confidenceScore}%
            </span>
          </div>
          {isOpen ? <ChevronDown className="arrow" /> : <ChevronRight className="arrow" />}
        </div>
      </button>

      {/* Expanded Trace Timeline */}
      {isOpen && (
        <div className="trace-content">
          <div className="timeline">
            {steps.map((step, idx) => (
              <div key={step.id || idx} className="timeline-item">
                <div className="timeline-marker">
                  {getAgentIcon(step.phase)}
                </div>

                <div className="timeline-card">
                  <div className="card-header">
                    <span className="agent-name">{step.agentName}</span>
                    <span className="step-phase">{step.phase}</span>
                    <span className="step-time">
                      <Clock className="time-icon" />
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="thought-text">{step.thought}</p>

                  {step.details && (
                    <div className="details-accordion">
                      <button 
                        className="details-toggle"
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      >
                        <Code className="code-icon" />
                        <span>{expandedStep === step.id ? 'Hide Telemetry Data' : 'Inspect Telemetry Data'}</span>
                      </button>

                      {expandedStep === step.id && (
                        <pre className="json-block">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Tool Calls Summary Section */}
            {toolCalls.length > 0 && (
              <div className="tools-summary-box">
                <div className="summary-title">
                  <Wrench className="title-icon" />
                  <span>Invoked Telemetry Tools ({toolCalls.length})</span>
                </div>
                <div className="tool-chips">
                  {toolCalls.map(tc => (
                    <div key={tc.id} className={`tool-chip ${tc.status.toLowerCase()}`}>
                      <span className="tool-name">{tc.toolName}()</span>
                      <span className="tool-duration">{tc.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

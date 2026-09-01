import React from 'react';
import { Activity, ShieldCheck, DollarSign, Smile, Gauge, Clock } from 'lucide-react';

interface AnalyticsBarProps {
  totalMessages: number;
  openTicketsCount: number;
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({
  totalMessages,
  openTicketsCount
}) => {
  const estimatedTokens = totalMessages * 450;
  const estimatedCost = (estimatedTokens / 1000) * 0.0015;

  return (
    <div className="analytics-bar">
      <div className="stat-card">
        <Gauge className="stat-icon primary" />
        <div className="stat-info">
          <span className="stat-val">96.4%</span>
          <span className="stat-label">Agent Accuracy Score</span>
        </div>
      </div>

      <div className="stat-card">
        <Smile className="stat-icon success" />
        <div className="stat-info">
          <span className="stat-val">Positive (4.8/5)</span>
          <span className="stat-label">Customer Sentiment</span>
        </div>
      </div>

      <div className="stat-card">
        <ShieldCheck className="stat-icon warning" />
        <div className="stat-info">
          <span className="stat-val">100% Policy Enforced</span>
          <span className="stat-label">Guardrail Action Control</span>
        </div>
      </div>

      <div className="stat-card">
        <DollarSign className="stat-icon info" />
        <div className="stat-info">
          <span className="stat-val">${estimatedCost.toFixed(4)}</span>
          <span className="stat-label">Est. LLM Token Cost ({estimatedTokens} tokens)</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Smile, Gauge, Headphones } from 'lucide-react';

interface AnalyticsBarProps {
  totalMessages: number;
  openTicketsCount: number;
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({
  openTicketsCount
}) => {
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
        <Headphones className="stat-icon info" />
        <div className="stat-info">
          <span className="stat-val">{openTicketsCount} Active</span>
          <span className="stat-label">Human Handoff Queue</span>
        </div>
      </div>
    </div>
  );
};

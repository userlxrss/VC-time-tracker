import React from 'react';
import { TrendingUp, Brain, Calendar } from 'lucide-react';
import './JournalWeeklyInsight.css';

export const JournalWeeklyInsight: React.FC = () => {
  const insights = [
    {
      icon: <TrendingUp size={20} />,
      label: 'Mood Trend',
      value: '+15%',
      trend: 'up'
    },
    {
      icon: <Brain size={20} />,
      label: 'Reflections',
      value: '12',
      trend: 'neutral'
    },
    {
      icon: <Calendar size={20} />,
      label: 'Streak',
      value: '7 days',
      trend: 'up'
    }
  ];

  return (
    <div className="weekly-insight-card ai-insight-card interactive-element">
      <div className="weekly-insight-header">
        <div className="weekly-insight-icon">
          <Brain size={24} />
        </div>
        <h3 className="weekly-insight-title">Your Weekly Insight</h3>
        <span className="status-indicator status-success">Active</span>
      </div>

      <div className="weekly-insight-content">
        <p>
          Your journaling practice has shown consistent improvement this week.
          You've maintained a daily streak with increasing positive mood patterns.
          Your reflections demonstrate growing self-awareness and gratitude practices.
        </p>
      </div>

      <div className="weekly-insight-metrics">
        {insights.map((insight, index) => (
          <div key={index} className="metric-item">
            <div className="metric-icon">{insight.icon}</div>
            <span className="metric-value">
              {insight.value}
              {insight.trend === 'up' && <span className="metric-trend trend-up">↑</span>}
              {insight.trend === 'down' && <span className="metric-trend trend-down">↓</span>}
              {insight.trend === 'neutral' && <span className="metric-trend trend-neutral">→</span>}
            </span>
            <span className="metric-label">{insight.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
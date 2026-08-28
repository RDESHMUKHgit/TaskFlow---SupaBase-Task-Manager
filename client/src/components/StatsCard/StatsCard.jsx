import React from 'react';
import { FiCheckCircle, FiClock, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './StatsCard.css';

export default function StatsCard() {
  const { stats, setSelectedStatus } = useTaskContext();

  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total || 0,
      icon: <FiActivity />,
      color: 'indigo',
      onClick: () => setSelectedStatus('all'),
      subtitle: `${stats.completionRate || 0}% completed`,
    },
    {
      title: 'Pending',
      value: stats.pending || 0,
      icon: <FiClock />,
      color: 'amber',
      onClick: () => setSelectedStatus('pending'),
      subtitle: 'Awaiting action',
    },
    {
      title: 'In Progress',
      value: stats.inProgress || 0,
      icon: <FiActivity />,
      color: 'blue',
      onClick: () => setSelectedStatus('in_progress'),
      subtitle: 'Currently working',
    },
    {
      title: 'Completed',
      value: stats.completed || 0,
      icon: <FiCheckCircle />,
      color: 'emerald',
      onClick: () => setSelectedStatus('completed'),
      subtitle: 'Done & dusted',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`stat-card glass-card stat-${card.color}`}
          onClick={card.onClick}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-title">{card.title}</span>
            <div className="stat-icon-wrapper">{card.icon}</div>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}

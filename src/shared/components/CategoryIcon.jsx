import React from 'react';

export default function CategoryIcon({ category }) {
  const normalized = (category || '').toLowerCase().trim();
  
  const icons = {
    // Old fallback keys
    roads: '🛣️',
    water: '💧',
    electricity: '⚡',
    health: '🏥',
    education: '🏫',
    agriculture: '🌾',
    revenue: '📋',
    welfare: '🤝',
    sanitation: '🧹',
    traffic: '🚦',
    
    // New CAT-* keys
    'cat-wtr': '💧',
    'cat-ele': '⚡',
    'cat-rdc': '🛣️',
    'cat-rdh': '🛣️',
    'cat-san': '🧹',
    'cat-lgt': '💡',
    'cat-hlt': '🦟',
    'cat-enc': '🏗️',
    'cat-lnd': '📋',
    'cat-pol': '👮',
    'cat-tax': '🪙',
    'cat-pds': '🌾',
    'cat-edu': '🏫',
    'cat-med': '🏥',
    'cat-trn': '🚌',
    'cat-pol2': '🌱',
    'cat-anm': '🐕',
    'cat-wmn': '🛡️'
  };

  return (
    <span className="text-xl inline-block mr-1.5" role="img" aria-label={category}>
      {icons[normalized] || '📝'}
    </span>
  );
}


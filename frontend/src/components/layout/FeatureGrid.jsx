import React from 'react';

const FeatureGrid = ({ features, columns = 4 }) => {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns] || colClasses[4]} gap-4`}>
      {features.map((feature, index) => (
        <div key={index} className="feature-card h-full">
          <span className="icon text-3xl text-primary">{feature.icon}</span>
          <h4 className="font-bold text-sm mt-2">{feature.title}</h4>
          <p className="text-xs text-[var(--text-secondary)]">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;
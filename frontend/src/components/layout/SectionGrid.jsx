import React from 'react';
import { Link } from 'react-router-dom';

const SectionGrid = ({ 
  sections, 
  columns = 4,
  className = '',
  variant = 'default'
}) => {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  };

  const variantClasses = {
    default: 'p-6 rounded-2xl text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-center backdrop-blur-sm',
    compact: 'p-4 rounded-xl text-white hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-center backdrop-blur-sm',
    featured: 'p-8 rounded-2xl text-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-center ring-2 ring-white/20 backdrop-blur-sm',
  };

  return (
    <div className={`grid ${colClasses[columns] || colClasses[4]} gap-4 ${className}`}>
      {sections.map((section) => (
        <Link
          key={section.id}
          to={section.path}
          className={`bg-gradient-to-br ${section.color} ${variantClasses[variant] || variantClasses.default}`}
        >
          <div className="text-3xl mb-2 drop-shadow-sm">{section.icon}</div>
          <div className="font-bold text-sm drop-shadow-sm">{section.label}</div>
          <div className="text-xs opacity-85 drop-shadow-sm">{section.desc || 'تسوق الآن →'}</div>
          {section.badge && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-white/18 backdrop-blur rounded-full text-[10px] font-bold">
              {section.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};

export default SectionGrid;
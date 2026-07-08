import React from 'react';

const AdminMetricCard = ({
  icon,
  label,
  value,
  delta,
  deltaClassName = '',
  iconClassName = '',
  valueClassName = '',
  onClick,
  className = '',
}) => {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card p-4 text-right transition-all ${onClick ? 'hover:border-primary/30 hover:-translate-y-1 cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--text-secondary)]">{label}</div>
          <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-[var(--bg-input)] flex items-center justify-center ${iconClassName}`}>
          {icon}
        </div>
      </div>
      {delta !== undefined && delta !== null && delta !== '' && (
        <div className={`text-xs mt-2 flex items-center gap-1 ${deltaClassName}`}>
          {delta}
        </div>
      )}
    </Wrapper>
  );
};

export default AdminMetricCard;
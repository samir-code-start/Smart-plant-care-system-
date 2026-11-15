interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function Card({ title, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

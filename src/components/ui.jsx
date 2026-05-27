export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  const variants = {
    primary: 'bg-brutal-black text-brutal-yellow shadow-brutal-yellow',
    secondary: 'bg-brutal-white text-brutal-black shadow-brutal',
    success: 'bg-brutal-green text-brutal-black shadow-brutal',
    danger: 'bg-brutal-red text-brutal-white shadow-brutal',
    warning: 'bg-brutal-orange text-brutal-black shadow-brutal',
    ghost: 'bg-transparent text-brutal-black shadow-none',
  };
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  };

  return (
    <button
      className={`border-4 border-brutal-black font-display tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'CARREGANDO...' : children}
    </button>
  );
}

export function Input({ label, helper, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block font-display text-xs tracking-widest mb-1 text-brutal-black">{label}</span>}
      <input
        className={`w-full border-4 border-brutal-black bg-brutal-white p-3 font-body font-bold placeholder-brutal-black/40 focus:outline-none focus:bg-brutal-yellow transition-colors ${className}`}
        {...props}
      />
      {helper && <span className="mt-1 block text-xs font-bold text-brutal-black/50">{helper}</span>}
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block font-display text-xs tracking-widest mb-1 text-brutal-black">{label}</span>}
      <select
        className={`w-full border-4 border-brutal-black bg-brutal-white p-3 font-body font-bold focus:outline-none focus:bg-brutal-yellow ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Card({ children, className = '' }) {
  return (
    <section className={`border-4 border-brutal-black bg-brutal-white shadow-brutal ${className}`}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-brutal-white text-brutal-black',
    dark: 'bg-brutal-black text-brutal-yellow',
    success: 'bg-brutal-green text-brutal-black',
    warning: 'bg-brutal-orange text-brutal-black',
    danger: 'bg-brutal-red text-brutal-white',
    info: 'bg-brutal-blue text-brutal-white',
  };

  return (
    <span className={`inline-flex items-center border-2 border-brutal-black px-2 py-1 font-display text-[10px] tracking-wider ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Position({ value, className = '' }) {
  return (
    <span className={`inline-flex items-start gap-0.5 font-display leading-none ${className}`}>
      <span>{value}</span>
      <span className="mt-0.5 text-[0.55em] leading-none">o</span>
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, action, children }) {
  return (
    <div className="bg-brutal-black text-brutal-yellow border-b-4 border-brutal-black">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="font-display text-xs tracking-widest text-brutal-yellow/60">{eyebrow}</p>}
            <h1 className="font-display text-3xl leading-none sm:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl font-body text-sm font-bold text-brutal-yellow/65">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoadingState({ rows = 3, type = 'card' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse border-4 border-brutal-black bg-brutal-yellow/40 shadow-brutal ${
            type === 'row' ? 'h-16' : 'h-44'
          }`}
        />
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-4 border-brutal-black bg-brutal-yellow font-display text-2xl">
        !
      </div>
      <h2 className="font-display text-xl text-brutal-black">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm font-bold text-brutal-black/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function StatCard({ label, value, tone = 'white' }) {
  const tones = {
    white: 'bg-brutal-white',
    yellow: 'bg-brutal-yellow',
    green: 'bg-brutal-green',
    orange: 'bg-brutal-orange',
    blue: 'bg-brutal-blue text-brutal-white',
    black: 'bg-brutal-black text-brutal-yellow',
  };

  return (
    <div className={`border-4 border-brutal-black p-3 shadow-brutal-sm ${tones[tone]}`}>
      <p className="font-display text-2xl leading-none">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-70">{label}</p>
    </div>
  );
}

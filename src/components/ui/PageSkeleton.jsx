export default function PageSkeleton({ label = 'Loading page…' }) {
  return <div className="page-wrap" role="status" aria-label={label} aria-live="polite">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="page-skeleton">
      <div className="skeleton-line w-48 h-8 mb-4" />
      <div className="skeleton-line w-72 max-w-full h-3 mb-8" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(key => <div key={key} className="skeleton-card"><div className="skeleton-line h-3 w-20 mb-5" /><div className="skeleton-line h-5 w-32 max-w-full" /></div>)}
      </div>
      <div className="skeleton-card mt-5 h-48" />
    </div>
  </div>;
}

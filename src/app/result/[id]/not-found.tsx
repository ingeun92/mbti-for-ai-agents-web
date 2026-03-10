import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-16 max-w-md mx-auto px-6">
      <div className="flex gap-2 mb-2">
        {['#88619A', '#33A474', '#4298B4', '#E4AE3A'].map((c) => (
          <span key={c} className="w-3 h-3 rounded-full opacity-30" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="font-display text-7xl font-semibold text-surface-300 italic">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-body">Result Not Found</h1>
        <p className="text-body-light">
          This test result does not exist or may have been removed. Double-check the URL or run a new test.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-body text-white font-semibold text-sm transition-all duration-200 hover:bg-body/80"
      >
        Back to Home
      </Link>
    </div>
  );
}

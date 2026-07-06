'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F7F8FA', color: '#0F172A' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Cornerstore is temporarily unavailable
            </h1>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#64748B', marginBottom: '1.5rem' }}>
              Something went wrong on our side. Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#0F172A',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #C4863A 0%, #A06E28 100%)",
              boxShadow: "0 20px 40px rgba(196, 134, 58, 0.3)",
            }}
          >
            <svg
              className="w-10 h-10 text-storm-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-storm-text">rePlay</h1>
          <p className="text-storm-muted mt-2 text-sm">
            Information Crisis Simulator
          </p>
        </div>

        <div className="gradient-divider max-w-xs mx-auto" />

        <p className="text-storm-muted text-sm leading-relaxed max-w-sm mx-auto">
          History already happened. Your decisions do not have to repeat it.
        </p>

        {/* Featured Case Card */}
        <Link
          href="/cases"
          className="block rounded-xl p-5 border border-storm-dim/25 hover:border-storm-accent/50 transition-colors text-left"
          style={{ background: "rgba(28,25,22,0.5)" }}
        >
          <div className="text-storm-accent text-xs font-semibold uppercase tracking-wider mb-2">
            Featured Case
          </div>
          <h3 className="text-storm-text font-bold text-lg">
            Case 001: The Flood Was Real
          </h3>
          <p className="text-storm-muted text-sm mt-1">
            Typhoon Tino (Kalmaegi), Cebu, 2025
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-storm-dim">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Nov 2025
            </span>
            <span className="w-1 h-1 rounded-full bg-storm-dim" />
            <span className="flex items-center gap-1">7 Decisions</span>
            <span className="w-1 h-1 rounded-full bg-storm-dim" />
            <span className="flex items-center gap-1">~8 min</span>
          </div>
        </Link>

        <Link
          href="/cases"
          className="inline-flex items-center gap-2 font-bold py-4 px-10 rounded-xl transition-all shadow-2xl text-lg"
          style={{
            background: "linear-gradient(135deg, #C4863A 0%, #D49A44 100%)",
            color: "#0D0C0A",
            boxShadow: "0 20px 40px rgba(196, 134, 58, 0.3)",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Start Simulation
        </Link>

        <p className="text-xs text-storm-dim">
          No account needed | Built for UNESCO Youth Hackathon 2026
        </p>
      </div>
    </div>
  );
}

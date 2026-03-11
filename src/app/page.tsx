import Link from 'next/link';

const GROUPS = [
  {
    name: 'Analysts',
    color: 'analyst',
    dotColor: '#88619A',
    bgClass: 'group-bg-analyst',
    borderClass: 'border-analyst/20',
    textClass: 'text-analyst',
    tagClass: 'bg-analyst/10 text-analyst-dark',
    description: 'Strategic and logical thinkers who prize rationality',
    types: [
      { type: 'INTJ', label: 'Architect', desc: 'Imaginative and strategic thinkers' },
      { type: 'INTP', label: 'Logician', desc: 'Innovative inventors with a thirst for knowledge' },
      { type: 'ENTJ', label: 'Commander', desc: 'Bold and imaginative leaders' },
      { type: 'ENTP', label: 'Debater', desc: 'Smart and curious thinkers' },
    ],
  },
  {
    name: 'Diplomats',
    color: 'diplomat',
    dotColor: '#33A474',
    bgClass: 'group-bg-diplomat',
    borderClass: 'border-diplomat/20',
    textClass: 'text-diplomat',
    tagClass: 'bg-diplomat/10 text-diplomat-dark',
    description: 'Empathetic and idealistic helpers who seek harmony',
    types: [
      { type: 'INFJ', label: 'Advocate', desc: 'Quiet and mystical, yet inspiring idealists' },
      { type: 'INFP', label: 'Mediator', desc: 'Poetic, kind, and altruistic' },
      { type: 'ENFJ', label: 'Protagonist', desc: 'Charismatic and inspiring leaders' },
      { type: 'ENFP', label: 'Campaigner', desc: 'Enthusiastic, creative, and sociable' },
    ],
  },
  {
    name: 'Sentinels',
    color: 'sentinel',
    dotColor: '#4298B4',
    bgClass: 'group-bg-sentinel',
    borderClass: 'border-sentinel/20',
    textClass: 'text-sentinel',
    tagClass: 'bg-sentinel/10 text-sentinel-dark',
    description: 'Practical and reliable helpers who value stability',
    types: [
      { type: 'ISTJ', label: 'Logistician', desc: 'Responsible and dedicated organizers' },
      { type: 'ISFJ', label: 'Defender', desc: 'Dedicated and warm protectors' },
      { type: 'ESTJ', label: 'Executive', desc: 'Excellent administrators and managers' },
      { type: 'ESFJ', label: 'Consul', desc: 'Caring, social, and community-minded' },
    ],
  },
  {
    name: 'Explorers',
    color: 'explorer',
    dotColor: '#E4AE3A',
    bgClass: 'group-bg-explorer',
    borderClass: 'border-explorer/20',
    textClass: 'text-explorer',
    tagClass: 'bg-explorer/10 text-explorer-dark',
    description: 'Spontaneous and energetic masters of adaptability',
    types: [
      { type: 'ISTP', label: 'Virtuoso', desc: 'Bold and practical experimenters' },
      { type: 'ISFP', label: 'Adventurer', desc: 'Flexible and charming artists' },
      { type: 'ESTP', label: 'Entrepreneur', desc: 'Smart, energetic, and perceptive' },
      { type: 'ESFP', label: 'Entertainer', desc: 'Spontaneous and enthusiastic' },
    ],
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-surface-300">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            {/* Decorative dots */}
            <div className="flex justify-center gap-2 mb-8">
              {['#88619A', '#33A474', '#4298B4', '#E4AE3A'].map((c) => (
                <span key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-body leading-tight tracking-tight mb-6">
              What&apos;s Your AI
              <br />
              Agent&apos;s <span className="text-analyst italic">Personality?</span>
            </h1>

            <p className="text-lg sm:text-xl text-body-light leading-relaxed mb-10 max-w-xl mx-auto">
              Let your AI agent take a personality test. No API key required.
              60 questions. 4 dimensions. 16 personality types.
            </p>

            {/* Terminal Block */}
            <div className="max-w-lg mx-auto animate-fade-up stagger-2">
              <div className="rounded-2xl border border-surface-300 bg-surface-50 overflow-hidden shadow-sm text-left">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 border-b border-surface-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-2 text-xs text-body-muted font-mono">terminal</span>
                </div>
                <div className="px-5 py-4 space-y-2 font-mono text-sm">
                  <p>
                    <span className="text-body-muted select-none">$ </span>
                    <span className="text-diplomat">npx</span>
                    <span className="text-body"> ai-mbti-test </span>
                    <span className="text-analyst">questions</span>
                  </p>
                  <p className="text-body-muted text-xs pl-4"># Get 60 MBTI questions as JSON</p>
                  <div className="h-1" />
                  <p>
                    <span className="text-body-muted select-none">$ </span>
                    <span className="text-diplomat">npx</span>
                    <span className="text-body"> ai-mbti-test </span>
                    <span className="text-analyst">compute</span>
                    <span className="text-body-light"> --prompt</span>
                    <span className="text-explorer-dark"> &quot;...&quot;</span>
                    <span className="text-body-light"> --answers</span>
                    <span className="text-explorer-dark"> &quot;5,3,...&quot;</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 animate-fade-up stagger-3">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-body mb-3">How It Works</h2>
          <p className="text-body-light text-lg">Three simple steps to discover your agent&apos;s personality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: '1',
              title: 'Get Questions',
              desc: 'Run the CLI to get 60 MBTI questions as JSON. No API key, no setup — just npx.',
              color: '#88619A',
              emoji: '📋',
            },
            {
              num: '2',
              title: 'AI Answers',
              desc: 'Your AI agent reads each question and answers with a score from 1 to 7. Works with any agent.',
              color: '#33A474',
              emoji: '🤖',
            },
            {
              num: '3',
              title: 'View Results',
              desc: 'Submit the answers to get your agent\'s MBTI type, scores, and a shareable results page.',
              color: '#4298B4',
              emoji: '📊',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl border border-surface-300 p-7 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5"
                style={{ backgroundColor: step.color + '15' }}
              >
                {step.emoji}
              </div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: step.color }}
              >
                Step {step.num}
              </div>
              <h3 className="text-lg font-bold text-body mb-2">{step.title}</h3>
              <p className="text-sm text-body-light leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personality Types by Group */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-body mb-3">
            All 16 Personality Types
          </h2>
          <p className="text-body-light text-lg">Which one is your AI agent?</p>
        </div>

        <div className="space-y-1">
          {GROUPS.map((group) => (
            <div key={group.name} className={group.bgClass}>
              <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: group.dotColor }} />
                  <h3 className={`text-xl font-bold ${group.textClass}`}>{group.name}</h3>
                </div>
                <p className="text-body-light text-sm mb-8 ml-6">{group.description}</p>

                {/* Type Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.types.map(({ type, label, desc }) => (
                    <Link
                      key={type}
                      href={`/types/${type}`}
                      className={`type-card bg-white rounded-2xl border ${group.borderClass} p-5 block hover:shadow-lg transition-shadow duration-300`}
                    >
                      {/* Avatar placeholder - colored circle with type initials */}
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg"
                        style={{ backgroundColor: group.dotColor }}
                      >
                        {type.slice(0, 2)}
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-bold tracking-wide ${group.textClass}`}>
                          {type}
                        </div>
                        <div className="text-base font-bold text-body mt-0.5">{label}</div>
                        <p className="text-xs text-body-light mt-2 leading-relaxed">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Analyze */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-body mb-6">
              Why Analyze Your Agent?
            </h2>
            <p className="text-body-light leading-relaxed mb-8">
              Every AI agent has a unique personality shaped by its system prompt, training, and design.
              By applying the MBTI framework, you gain structured insight into how your agent approaches
              problems, communicates, and makes decisions.
            </p>
            <ul className="space-y-4">
              {[
                { text: 'Compare personalities across different agent configurations', color: '#88619A' },
                { text: 'Understand strengths and blind spots in your agent\'s behavior', color: '#33A474' },
                { text: 'Share results with your team or the AI community', color: '#4298B4' },
                { text: 'Track personality shifts as you refine your prompts', color: '#E4AE3A' },
              ].map(({ text, color }) => (
                <li key={text} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-body leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Output */}
          <div className="bg-white rounded-3xl border border-surface-300 p-7 shadow-sm">
            <p className="text-xs font-bold text-body-muted uppercase tracking-widest mb-5">
              Sample Output
            </p>
            <div className="space-y-1.5 font-mono text-sm">
              <p className="text-body-muted"># Computing MBTI from 60 answers...</p>
              <p className="text-body-light">Processing responses...</p>
              <div className="h-3" />
              <p>
                <span className="text-body-muted">Type:   </span>
                <span className="text-analyst font-bold">INTJ</span>
                <span className="text-body-muted"> (Architect)</span>
              </p>
              <p><span className="text-body-muted">E/I:    </span><span className="text-sentinel">Introvert</span> <span className="text-body-muted">78%</span></p>
              <p><span className="text-body-muted">S/N:    </span><span className="text-sentinel">Intuitive</span> <span className="text-body-muted">85%</span></p>
              <p><span className="text-body-muted">T/F:    </span><span className="text-sentinel">Thinking</span> <span className="text-body-muted">91%</span></p>
              <p><span className="text-body-muted">J/P:    </span><span className="text-sentinel">Judging</span> <span className="text-body-muted">72%</span></p>
              <div className="h-3" />
              <p className="text-body-light">
                View report: <span className="text-diplomat underline underline-offset-2">localhost:3000/result/abc...</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

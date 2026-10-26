import { BookOpen, Armchair, Sparkles } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: BookOpen,
    number: '01',
    title: 'Books & Manga',
    desc: 'Over 20,000 literature volumes, Japanese language learning resources, and curated manga editions.',
  },
  {
    icon: Armchair,
    number: '02',
    title: 'Study Spaces',
    desc: 'Quiet wooden study desks, comfortable reading lounges, and open views for contemplative reading.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Japanese Culture',
    desc: 'Contemporary periodicals, arts and crafts archives, cinema monographs, and cultural screenings.',
  },
];

export default function InfoStrip() {
  return (
    <section className="info-strip" id="info-strip" aria-label="Feature Highlights">
      <div className="container">
        <div className="feature-highlights-grid">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div className="feature-highlight-col reveal" key={item.title}>
                <div className="feature-highlight-header">
                  <div className="feature-highlight-icon-wrap" aria-hidden="true">
                    <Icon className="feature-highlight-icon" />
                  </div>
                  <span className="feature-highlight-num">{item.number}</span>
                </div>
                <h3 className="feature-highlight-title">{item.title}</h3>
                <p className="feature-highlight-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

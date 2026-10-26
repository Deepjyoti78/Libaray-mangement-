import { BookOpen, Users, Landmark, Sparkles } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: BookOpen,
    number: '01',
    title: 'Books & Manga',
    desc: 'Over 20,000 literature volumes, Japanese language learning resources, and curated manga editions.',
    shortDesc: 'Curated collection',
  },
  {
    icon: Users,
    number: '02',
    title: 'Study Spaces',
    desc: 'Quiet wooden study desks, comfortable reading lounges, and open views for contemplative reading.',
    shortDesc: 'Quiet and comfortable',
  },
  {
    icon: Landmark,
    number: '03',
    title: 'Japanese Culture',
    desc: 'Contemporary periodicals, arts and crafts archives, cinema monographs, and cultural screenings.',
    shortDesc: 'Events, reads and more',
  },
];

export default function InfoStrip() {
  return (
    <section className="info-strip" id="info-strip" aria-label="Feature Highlights">
      <div className="container">
        <div className="feature-highlights-card-wrap">
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
                  <p className="feature-highlight-short-desc">{item.shortDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

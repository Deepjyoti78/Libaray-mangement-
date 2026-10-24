import { BookOpen, Armchair, Layers, CalendarCheck } from 'lucide-react';

const INFO_ITEMS = [
  {
    icon: BookOpen,
    title: 'Extensive Collection',
    desc: 'Japanese literature, manga, periodicals, and language learning materials.',
  },
  {
    icon: Armchair,
    title: 'Reading Spaces',
    desc: 'Quiet study desks, lounge seating, and natural light for contemplative reading.',
  },
  {
    icon: Layers,
    title: 'Cultural Resources',
    desc: 'Art, design, history, craft archives, and curated multimedia collections.',
  },
  {
    icon: CalendarCheck,
    title: 'Library Visits',
    desc: 'Open Tuesday to Saturday with dedicated morning and afternoon sessions.',
  },
];

export default function InfoStrip() {
  return (
    <section className="info-strip" id="info-strip" aria-label="Library Overview Highlights">
      <div className="container">
        <div className="info-strip-grid">
          {INFO_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div className="info-strip-col reveal" key={item.title}>
                <div className="info-strip-header">
                  <span className="info-strip-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="info-strip-num">0{idx + 1}</span>
                </div>
                <h3 className="info-strip-title">{item.title}</h3>
                <p className="info-strip-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

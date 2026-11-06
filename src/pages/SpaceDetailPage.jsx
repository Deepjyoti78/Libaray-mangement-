import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  BookOpen,
  Wifi,
  Zap,
  VolumeX,
  Volume2,
  Sun,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
  Users,
  Compass,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Coffee,
  ShieldCheck
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingWizard from './BookingWizard';

export const SPACES_DATA = {
  'reading-room': {
    id: 'reading-room',
    number: '01',
    category: 'Silent Study',
    title: 'Reading & Study Room',
    kanji: '閲覧室・静寂の読書空間',
    tagline: 'A silent sanctuary crafted with natural timber, acoustic buffering, and ergonomic study carrels for immersive reading and academic research.',
    heroImage: '/images/library-study-room.webp',
    gallery: [
      {
        src: '/images/library-study-room.webp',
        caption: 'Central study hall with individual carrels and acoustic partitions',
      },
      {
        src: '/images/reading-room.jpg',
        caption: 'Quiet reading tables with warm ergonomic task lighting',
      },
      {
        src: '/images/books-literature.jpg',
        caption: 'Open catalog stacks housing academic texts, monographs, and literature',
      },
      {
        src: '/images/hero-library.jpg',
        caption: 'Floor-to-ceiling wooden joinery overlooking the courtyard garden',
      },
    ],
    stats: [
      { label: 'Seating Capacity', value: '45 Seats', sub: 'Individual & Shared Desks' },
      { label: 'Acoustic Rating', value: 'Silent Zone', sub: 'Laptops with silent keys only' },
      { label: 'Lighting', value: '3000K Warm', sub: 'Flicker-free eye comfort' },
      { label: 'Power & USB', value: '100% Available', sub: 'Dedicated sockets per desk' },
    ],
    features: [
      {
        icon: VolumeX,
        title: 'Strict Silent Environment',
        description: 'Complete quiet policy ensures deep focus. Mobile phones must be silenced, and calls taken outside.',
      },
      {
        icon: Zap,
        title: 'Power at Every Station',
        description: 'Every study carrel features universal AC outlets and dual USB-A/C charging ports.',
      },
      {
        icon: Wifi,
        title: 'Gigabit Fiber Wi-Fi',
        description: 'Complimentary high-speed, secure wireless connection for digital archives and academic databases.',
      },
      {
        icon: Sun,
        title: 'Natural Daylight & Garden Views',
        description: 'Large Japanese lattice windows bring soft northern light with serene views of the courtyard.',
      },
      {
        icon: Shield,
        title: 'Personal Day Lockers',
        description: 'Secure electronic lockers right outside the hall for personal bags and outerwear.',
      },
      {
        icon: BookOpen,
        title: 'Reference Stacks On-Hand',
        description: 'Immediate access to Japanese encyclopedias, JLPT reference materials, and linguistics texts.',
      },
    ],
    collections: [
      'Contemporary Japanese Literature (Akutagawa, Kawabata, Murakami & Yoshimoto)',
      'JLPT Exam Prep Guides (Comprehensive N5 through N1 grammar, kanji & listening)',
      'Historical Chronicles, Meiji Restoration archives & Edo culture studies',
      'Architecture, Urbanism & Traditional Japanese Garden design folios',
      'Bilingual Dictionaries (Kenkyusha, Sanseido & Kodansha English-Japanese)',
      'Academic journals on Indo-Japan international relations and diplomacy',
    ],
    guidelines: [
      {
        rule: 'Quiet Conduct',
        detail: 'Please maintain complete silence. Headphone audio must not leak to adjacent readers.',
      },
      {
        rule: 'Beverage Policy',
        detail: 'Only sealed water bottles or travel tumblers are permitted on study surfaces. No snacks or meals.',
      },
      {
        rule: 'Book Handling',
        detail: 'Please place consulted books on the designated return trolleys rather than re-shelving them yourself.',
      },
      {
        rule: 'Desk Reservation',
        detail: 'Advance slot reservation is highly advised during peak weekend sessions to guarantee a carrel.',
      },
    ],
    sessions: [
      { name: 'Morning Session', time: '11:00 AM – 2:30 PM', note: 'Best for deep analytical study' },
      { name: 'Sanitization Break', time: '2:30 PM – 3:00 PM', note: 'Hall ventilation & dusting' },
      { name: 'Afternoon Session', time: '3:00 PM – 6:30 PM', note: 'Warm ambient lighting session' },
    ],
  },

  'community-area': {
    id: 'community-area',
    number: '02',
    category: 'Collaborative Lounge',
    title: 'Community & Culture Area',
    kanji: '交流ラウンジ・文化サロン',
    tagline: 'A warm, relaxed lounge where library members gather for quiet discussion, browse illustrated cultural volumes, and attend cultural gatherings.',
    heroImage: '/images/library-reading-area.webp',
    gallery: [
      {
        src: '/images/library-reading-area.webp',
        caption: 'Pastel armchair clusters around communal round tables',
      },
      {
        src: '/images/community-lounge.jpg',
        caption: 'Low coffee tables and conversational seating zones',
      },
      {
        src: '/images/cultural-resources.jpg',
        caption: 'Cultural periodicals, magazine display racks, and quarterly journals',
      },
      {
        src: '/images/botanical-detail.jpg',
        caption: 'Natural bonsai planters and curated Japanese design exhibits',
      },
    ],
    stats: [
      { label: 'Seating Capacity', value: '32 Seats', sub: 'Lounge chairs & round tables' },
      { label: 'Acoustic Rating', value: 'Conversational', sub: 'Low-voice quiet interaction' },
      { label: 'Periodicals', value: '60+ Titles', sub: 'Monthly design & lifestyle' },
      { label: 'Atmosphere', value: 'Relaxed & Social', sub: 'Natural daylight & greenery' },
    ],
    features: [
      {
        icon: Users,
        title: 'Group Conversation Tables',
        description: 'Circular wooden tables designed for collaborative language practice, tandem reading, and cultural research.',
      },
      {
        icon: Sparkles,
        title: 'Cultural Notice Wall',
        description: 'Curated announcements for upcoming Japan Foundation film screenings, calligraphy workshops, and lectures.',
      },
      {
        icon: BookOpen,
        title: 'Periodical Display Racks',
        description: 'Browse the latest Japanese lifestyle magazines including Pen, Casa BRUTUS, Popeye, and Kateigaho.',
      },
      {
        icon: Wifi,
        title: 'High-Speed Wireless',
        description: 'Seamless network coverage across all armchairs and communal zones.',
      },
      {
        icon: Sun,
        title: 'Floor-to-Ceiling Daylight',
        description: 'Panoramic glass frontage facing the landscaped greenery of the Embassy enclave.',
      },
      {
        icon: Layers,
        title: 'Exhibition & Artefact Corner',
        description: 'Seasonal showcases of traditional Japanese craftsmanship, ceramics, washi paper, and origami.',
      },
    ],
    collections: [
      'Design, Typography & Graphic Arts in contemporary Japan',
      'Traditional Crafts (Mingei folk craft, pottery, kimono textiles & lacquerware)',
      'Travel & Culinary Guides (Regional prefectural tourism, Washoku & Cha-no-yu tea)',
      'Japanese Cinema & Theater (Kabuki, Noh, Bunraku & Kurosawa monographs)',
      'Children’s Picture Books (Ehon) with vibrant full-color illustrations & furigana',
      'Bilingual lifestyle quarterlies and photography monographs',
    ],
    guidelines: [
      {
        rule: 'Conversational Tone',
        detail: 'Soft, conversational speaking is welcome. Please be mindful of nearby readers in adjacent rooms.',
      },
      {
        rule: 'Shared Tables',
        detail: 'All tables are communal. Feel free to pull up a chair and share reading surfaces respectfully.',
      },
      {
        rule: 'Newspaper Handling',
        detail: 'Please fold and return daily periodicals to the hanging wooden racks after browsing.',
      },
      {
        rule: 'Events & Meetups',
        detail: 'Weekend study groups or language exchanges are encouraged during regular opening hours.',
      },
    ],
    sessions: [
      { name: 'Morning Browsing', time: '11:00 AM – 2:30 PM', note: 'Casual reading and newspaper review' },
      { name: 'Mid-Day Refresh', time: '2:30 PM – 3:00 PM', note: 'Space organization' },
      { name: 'Afternoon Lounge', time: '3:00 PM – 6:30 PM', note: 'Conversational reading & exchange' },
    ],
  },

  'manga-corner': {
    id: 'manga-corner',
    number: '03',
    category: 'Manga & Graphic Novels',
    title: 'Manga Corner',
    kanji: 'マンガ・グラフィックノベル',
    tagline: 'An expansive collection of over 3,200 curated volumes spanning historic pioneers, classic masterpieces, and contemporary chart-toppers.',
    heroImage: '/images/manga-corner-collection.jpg',
    gallery: [
      {
        src: '/images/manga-corner-collection.jpg',
        caption: 'Full-height custom bookshelves displaying complete series runs',
      },
      {
        src: '/images/manga-corner.jpg',
        caption: 'Close-up of categorized genre shelves and award-winning collections',
      },
      {
        src: '/images/books-literature.jpg',
        caption: 'Graphic novel adaptations and illustrated art books',
      },
      {
        src: '/images/library-reading-area.webp',
        caption: 'Comfortable reading corner adjoining the manga stacks',
      },
    ],
    stats: [
      { label: 'Collection Count', value: '3,200+ Vols', sub: 'Continuously updated catalog' },
      { label: 'Language Options', value: 'EN & Japanese', sub: 'Originals + official translations' },
      { label: 'Borrowing Limit', value: '2 Volumes', sub: 'For library members (14 days)' },
      { label: 'Genres Represented', value: '12+ Genres', sub: 'Shonen, Seinen, Shojo & Classics' },
    ],
    features: [
      {
        icon: BookOpen,
        title: 'Complete Series Catalog',
        description: 'Read entire story arcs from beginning to end without missing intermediate volumes.',
      },
      {
        icon: Sparkles,
        title: 'Original Japanese Stacks',
        description: 'Ideal for language learners; explore tankōbon with furigana glosses alongside English editions.',
      },
      {
        icon: Compass,
        title: 'Genre & Demographic Organization',
        description: 'Color-coded and clearly labeled shelf dividers make finding your favorite creator effortless.',
      },
      {
        icon: Bookmark,
        title: 'New Releases Display Shelf',
        description: 'Directly imported newest volumes added monthly, showcasing latest buzzworthy titles.',
      },
      {
        icon: Users,
        title: 'Casual Reading Benches',
        description: 'Relaxed low-bench seating right in front of the shelves for quick chapter browsing.',
      },
      {
        icon: Shield,
        title: 'Pristine Preservation',
        description: 'All volumes are protected in archival covers to ensure clean, durable reading for everyone.',
      },
    ],
    collections: [
      'Epic Adventures: One Piece, Jujutsu Kaisen, Demon Slayer, Hunter x Hunter, Bleach',
      'Literary & Psychological: Monster, 20th Century Boys, Vinland Saga, Tokyo Ghoul',
      'Artistic Classics: Osamu Tezuka’s Phoenix, Black Jack, Astro Boy, Akira, Nausicaä',
      'Slice of Life & Culinary: Oishinbo, Laid-Back Camp, Way of the Househusband, Silver Spoon',
      'Sports & Passion: Haikyu!!, Slam Dunk, Ping Pong, Blue Lock, Aoashi',
      'Award-Winners: Frieren: Beyond Journey’s End, Witch Hat Atelier, Spy x Family',
    ],
    guidelines: [
      {
        rule: 'Careful Page Turning',
        detail: 'Please treat manga bindings with care. Avoid folding page corners or breaking spines.',
      },
      {
        rule: 'In-Room Browsing',
        detail: 'Non-members can enjoy all volumes on-site freely during public visit hours.',
      },
      {
        rule: 'Borrowing Privileges',
        detail: 'Library members may borrow up to 2 manga volumes at a time for up to 14 days.',
      },
      {
        rule: 'Shelf Order',
        detail: 'If you are unsure where a volume belongs, place it on the sorting cart so staff can re-file it.',
      },
    ],
    sessions: [
      { name: 'Morning Browsing', time: '11:00 AM – 2:30 PM', note: 'Quiet reading hours' },
      { name: 'Afternoon Rush', time: '3:00 PM – 6:30 PM', note: 'Popular after-school & work session' },
    ],
  },

  'visitor-info': {
    id: 'visitor-info',
    number: '04',
    category: 'Services & Reception',
    title: 'Visitor Information & Circulation',
    kanji: '受付カウンター・利用案内',
    tagline: 'Your front-door welcome desk for library registration, book borrowing, visitor verification, and research assistance.',
    heroImage: '/images/library-circulation-desk.webp',
    gallery: [
      {
        src: '/images/library-circulation-desk.webp',
        caption: 'Circulation desk counter with warm illumination and reception signage',
      },
      {
        src: '/images/cultural-resources.jpg',
        caption: 'Member registration guides, program pamphlets, and cultural newsletters',
      },
      {
        src: '/images/library-study-room.webp',
        caption: 'Entrance corridor leading toward the quiet study halls',
      },
      {
        src: '/images/hero-library.jpg',
        caption: 'Central atrium connecting all 4 functional library quarters',
      },
    ],
    stats: [
      { label: 'Library Access', value: 'Free Entry', sub: 'On-site reading is open to all' },
      { label: 'Membership Fee', value: '₹300 / Year', sub: 'Includes home borrowing privileges' },
      { label: 'Loan Allowance', value: '4 Books', sub: '14-day borrowing duration' },
      { label: 'Staff Assistance', value: 'Bilingual', sub: 'English, Hindi & Japanese' },
    ],
    features: [
      {
        icon: Shield,
        title: 'Membership Card Issuance',
        description: 'Sign up in under 5 minutes with a valid photo ID to receive your smart circulation card.',
      },
      {
        icon: BookOpen,
        title: 'Loan Check-Out & Return',
        description: 'Instant computerized borrowing, returns, and reservation pickups managed by friendly librarians.',
      },
      {
        icon: Compass,
        title: 'Reference & Research Guidance',
        description: 'Our librarians assist with complex queries, research bibliographies, and Japanese translation tools.',
      },
      {
        icon: Zap,
        title: 'QR Code Fast Check-In',
        description: 'Visitors with pre-booked visits can scan their digital pass instantly for expedited entry.',
      },
      {
        icon: Users,
        title: 'Locker Key Assignment',
        description: 'Complimentary secure day lockers provided at the desk for bags and laptop cases.',
      },
      {
        icon: HelpCircle,
        title: 'Orientation & Facility Tours',
        description: 'First-time visitor walk-throughs and catalog search orientation available upon request.',
      },
    ],
    collections: [
      'Official Japan Foundation publications, white papers, and language curricula',
      'Free cultural program pamphlets, film festival schedules, and brochures',
      'Japanese scholarship (MEXT) guides and student exchange information',
      'New arrivals bulletin and thematic reading recommendations curated monthly',
    ],
    guidelines: [
      {
        rule: 'Valid Identification',
        detail: 'First-time visitors and new members must present an original government-issued photo ID.',
      },
      {
        rule: 'Bag Deposit',
        detail: 'Backpacks and large tote bags must be placed in lockers prior to entering the reading halls.',
      },
      {
        rule: 'Timely Returns',
        detail: 'Borrowed materials may be renewed once online unless another reader has placed a hold.',
      },
      {
        rule: 'Holiday Schedules',
        detail: 'The library is closed on Sundays, Mondays, and gazetted national holidays in India and Japan.',
      },
    ],
    sessions: [
      { name: 'Tuesday – Saturday', time: '11:00 AM – 6:30 PM', note: 'Standard desk operating hours' },
      { name: 'Sunday & Monday', time: 'Closed', note: 'Maintenance & inventory' },
    ],
  },
};

const getStatIcon = (label) => {
  const l = (label || '').toLowerCase();
  if (l.includes('seat') || l.includes('capacity')) return Users;
  if (l.includes('acoustic') || l.includes('sound') || l.includes('silent')) return VolumeX;
  if (l.includes('light')) return Sun;
  if (l.includes('power') || l.includes('usb')) return Zap;
  if (l.includes('periodical') || l.includes('title')) return BookOpen;
  return Sparkles;
};

const getGuidelineIcon = (rule) => {
  const r = (rule || '').toLowerCase();
  if (r.includes('quiet') || r.includes('tone') || r.includes('silence')) return VolumeX;
  if (r.includes('beverage') || r.includes('drink') || r.includes('snack') || r.includes('bottle')) return Coffee;
  if (r.includes('book') || r.includes('reading') || r.includes('handling') || r.includes('trolley')) return BookOpen;
  if (r.includes('desk') || r.includes('seat') || r.includes('reservation') || r.includes('carrel')) return Calendar;
  return ShieldCheck;
};

export default function SpaceDetailPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const space = SPACES_DATA[spaceId] || SPACES_DATA['reading-room'];

  useEffect(() => {
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    root.scrollTop = 0;
    document.documentElement.classList.remove('black-theme', 'dark');
    document.body.classList.remove('black-theme', 'dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    setSelectedPhotoIndex(0);

    const timer = setTimeout(() => {
      root.style.scrollBehavior = prevBehavior;
    }, 50);

    return () => {
      clearTimeout(timer);
      root.style.scrollBehavior = prevBehavior;
    };
  }, [spaceId]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight' && isLightboxOpen) {
        setSelectedPhotoIndex((prev) => (prev === space.gallery.length - 1 ? 0 : prev + 1));
      }
      if (e.key === 'ArrowLeft' && isLightboxOpen) {
        setSelectedPhotoIndex((prev) => (prev === 0 ? space.gallery.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, space?.gallery?.length]);

  const otherSpaces = Object.values(SPACES_DATA).filter((s) => s.id !== space.id);

  return (
    <div className="space-detail-page-layout light-theme" data-theme="light">
      {/* Universal Top Navigation */}
      <Header onBookSlot={() => setIsBookingOpen(true)} />

      {/* Hero Header Section - Seamlessly positioned below navbar without breadcrumb clutter */}
      <header className="space-hero-header">
        <div className="container">
          {/* Streamlined Top Meta & Navigation Bar */}
          <div className="space-hero-top-row">
            <div className="space-hero-nav-group">
              <Link to="/#about" className="space-back-btn" title="Back to All Spaces">
                <ArrowLeft size={15} />
                <span>All Spaces</span>
              </Link>
              <span className="space-meta-divider" aria-hidden="true">/</span>
              <div className="space-category-badge">
                <span className="badge-num">{space.number}</span>
                <span className="badge-text">{space.category}</span>
              </div>
            </div>

            <div className="space-live-status-pill">
              <span className="live-status-pulse" aria-hidden="true" />
              <Clock size={13} />
              <span>Open Tue – Sat · 11:00 AM – 6:30 PM</span>
            </div>
          </div>

          <div className="space-hero-title-grid">
            <div className="space-hero-title-col">
              <span className="space-kanji-sub">{space.kanji}</span>
              <h1 className="space-hero-title">{space.title}</h1>
              <div className="space-title-accent" aria-hidden="true" />
              <p className="space-hero-tagline">{space.tagline}</p>

              {/* Quick Highlighting Tags */}
              <div className="space-hero-tags-row">
                <span className="space-hero-tag">
                  <VolumeX size={13} /> Strict Silence Zone
                </span>
                <span className="space-hero-tag">
                  <Zap size={13} /> Universal AC + Dual USB-C
                </span>
                <span className="space-hero-tag">
                  <Wifi size={13} /> Gigabit Fiber Wi-Fi
                </span>
                <span className="space-hero-tag highlight">
                  <Sparkles size={13} /> Complimentary Entry
                </span>
              </div>
            </div>

            <div className="space-hero-actions-col">
              <div className="space-hero-booking-card">
                <div className="booking-card-header">
                  <div className="booking-card-titles">
                    <span className="booking-card-label">SEAT RESERVATION</span>
                    <h3 className="booking-card-title">Priority Study Desk</h3>
                  </div>
                  <span className="booking-card-free-tag">Free Entry</span>
                </div>
                <button
                  type="button"
                  className="space-primary-action-btn"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Calendar size={18} />
                  <span>Reserve a Seat in {space.title}</span>
                  <ArrowRight size={16} />
                </button>
                <div className="booking-card-notes">
                  <div className="booking-note-item">
                    <CheckCircle2 size={13} />
                    <span>Instant digital QR pass</span>
                  </div>
                  <div className="booking-note-item">
                    <CheckCircle2 size={13} />
                    <span>Dedicated carrel guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Visual Showcase & Photo Gallery */}
      <section className="space-gallery-section" aria-label="Space Gallery">
        <div className="container">
          <div className="space-main-stage-card">
            <div className="space-main-stage-img-wrap" onClick={() => setIsLightboxOpen(true)}>
              <img
                src={space.gallery[selectedPhotoIndex]?.src || space.heroImage}
                alt={space.gallery[selectedPhotoIndex]?.caption || space.title}
                className="space-main-stage-img"
              />

              {/* Prev / Next Image Quick Buttons */}
              <button
                type="button"
                className="gallery-stage-arrow prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex((prev) => (prev === 0 ? space.gallery.length - 1 : prev - 1));
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="gallery-stage-arrow next"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex((prev) => (prev === space.gallery.length - 1 ? 0 : prev + 1));
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>

              {/* Fullscreen Expand Action */}
              <button
                type="button"
                className="gallery-stage-expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                aria-label="Open image in fullscreen"
              >
                <Maximize2 size={14} />
                <span>Fullscreen</span>
              </button>

              {/* Caption Overlay */}
              <div className="space-main-stage-caption">
                <span className="stage-caption-counter">
                  {selectedPhotoIndex + 1} / {space.gallery.length}
                </span>
                <span className="stage-caption-text">
                  {space.gallery[selectedPhotoIndex]?.caption}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="space-gallery-thumbnails-strip">
              {space.gallery.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb-btn ${idx === selectedPhotoIndex ? 'active' : ''}`}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img src={item.src} alt="" className="thumb-img" />
                  <div className="thumb-tag">0{idx + 1}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers / Specifications Strip */}
      <section className="space-stats-section">
        <div className="container">
          <div className="space-stats-grid">
            {space.stats.map((stat, idx) => {
              const StatIcon = getStatIcon(stat.label);
              return (
                <div key={idx} className="space-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">{stat.label}</span>
                    <div className="stat-icon-bubble">
                      <StatIcon size={16} />
                    </div>
                  </div>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-sub">{stat.sub}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities & Amenities */}
      <section className="space-features-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="label">FACILITIES &amp; AMENITIES</span>
            <h2 className="heading-lg section-title">Designed for Comfort &amp; Focus</h2>
            <p className="section-subtitle">
              Carefully engineered spaces to foster scholarly research, serene reading, and uninterrupted study.
            </p>
          </div>

          <div className="space-features-grid">
            {space.features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="space-feature-card">
                  <div className="feature-card-header">
                    <div className="feature-icon-bubble">
                      <IconComp size={22} />
                    </div>
                    <span className="feature-badge">Included</span>
                  </div>
                  <h3 className="feature-card-title">{feat.title}</h3>
                  <p className="feature-card-desc">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deep-Dive: Collections & Sessions Grid */}
      <section className="space-details-split-section">
        <div className="container">
          <div className="space-details-split-grid">
            {/* Left Column: Available Collections / Highlights */}
            <div className="split-col-card collections-card">
              <div className="split-card-header">
                <div className="split-header-icon-wrap">
                  <BookOpen size={20} className="split-card-icon" />
                </div>
                <div>
                  <span className="split-card-kanji">所蔵資料・参考図書</span>
                  <h3 className="split-card-title">Curated Collections in this Area</h3>
                </div>
              </div>

              <p className="split-card-intro">
                Direct access to an extensive collection of rare, reference, and academic resources available on open carrel shelves:
              </p>

              <ul className="collections-checklist">
                {space.collections.map((item, idx) => (
                  <li key={idx} className="checklist-item">
                    <CheckCircle2 size={16} className="checklist-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="split-consultation-box">
                <Info size={16} />
                <span>
                  <strong>Reference Desk:</strong> Consult our bilingual librarians for archival retrieval, bibliography verification, and inter-library requests.
                </span>
              </div>
            </div>

            {/* Right Column: Sessions, Timings & Guidelines */}
            <div className="split-col-card guidelines-card">
              <div className="split-card-header">
                <div className="split-header-icon-wrap">
                  <Clock size={20} className="split-card-icon" />
                </div>
                <div>
                  <span className="split-card-kanji">利用時間・利用規約</span>
                  <h3 className="split-card-title">Daily Sessions &amp; Quiet Etiquette</h3>
                </div>
              </div>

              <div className="sessions-list">
                {space.sessions.map((sess, idx) => (
                  <div key={idx} className="session-item-row">
                    <div className="session-time-col">
                      <span className="session-name">{sess.name}</span>
                      <span className="session-hours">{sess.time}</span>
                    </div>
                    <span className="session-badge">{sess.note}</span>
                  </div>
                ))}
              </div>

              <div className="guidelines-accordion-wrap">
                <h4 className="guidelines-subheading">Visitor Code of Conduct</h4>
                <div className="rules-compact-grid">
                  {space.guidelines.map((guide, idx) => {
                    const GuideIcon = getGuidelineIcon(guide.rule);
                    return (
                      <div key={idx} className="rule-compact-box">
                        <div className="rule-box-header">
                          <GuideIcon size={15} className="rule-icon" />
                          <span className="rule-name">{guide.rule}</span>
                        </div>
                        <p className="rule-text">{guide.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Reservation Banner */}
      <section className="space-cta-banner-section">
        <div className="container">
          <div className="space-cta-banner-box">
            <div className="banner-content">
              <span className="banner-badge">PLAN YOUR VISIT · 予約案内</span>
              <h2 className="banner-title">Ready to experience this space?</h2>
              <p className="banner-sub">
                Entry is complimentary for reading and research on-site. Reserve your seat in advance to secure priority carrel placement with power outlets and ergonomic seating.
              </p>
              <div className="banner-perks-row">
                <span className="banner-perk">
                  <CheckCircle2 size={14} /> Complimentary Access
                </span>
                <span className="banner-perk">
                  <CheckCircle2 size={14} /> Instant QR Pass
                </span>
                <span className="banner-perk">
                  <CheckCircle2 size={14} /> Silent Carrel Guaranteed
                </span>
              </div>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="banner-primary-btn"
                onClick={() => setIsBookingOpen(true)}
              >
                <Calendar size={18} />
                <span>Reserve a Slot Now</span>
                <ArrowRight size={16} />
              </button>
              <Link to="/#contact" className="banner-secondary-link">
                <MapPin size={16} />
                <span>Directions to Lajpat Nagar Center</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Other Spaces Carousel */}
      <section className="other-spaces-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="label">OTHER SPACES</span>
            <h2 className="heading-md section-title">Explore more of The Library</h2>
          </div>

          <div className="other-spaces-grid">
            {otherSpaces.map((item) => (
              <Link
                key={item.id}
                to={`/spaces/${item.id}`}
                className="other-space-card"
              >
                <div className="other-space-media">
                  <img src={item.heroImage} alt={item.title} className="other-space-img" />
                  <span className="other-space-num">{item.number}</span>
                </div>
                <div className="other-space-content">
                  <span className="other-space-cat">{item.category}</span>
                  <h3 className="other-space-title">{item.title}</h3>
                  <p className="other-space-desc">{item.tagline.slice(0, 95)}...</p>
                  <div className="other-space-link-row">
                    <span>View Space Details</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="space-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="space-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="space-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close photo preview"
            >
              <X size={20} />
            </button>
            <div className="space-lightbox-media-wrap">
              <img
                src={space.gallery[selectedPhotoIndex]?.src || space.heroImage}
                alt={space.gallery[selectedPhotoIndex]?.caption || space.title}
                className="space-lightbox-image"
              />
              <button
                type="button"
                className="lightbox-arrow prev"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === 0 ? space.gallery.length - 1 : prev - 1))}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="lightbox-arrow next"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === space.gallery.length - 1 ? 0 : prev + 1))}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="space-lightbox-footer">
              <span className="lightbox-caption">{space.gallery[selectedPhotoIndex]?.caption}</span>
              <span className="lightbox-counter">
                {selectedPhotoIndex + 1} / {space.gallery.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <Footer />

      {/* Booking Wizard Modal */}
      {isBookingOpen && (
        <BookingWizard
          isModal={true}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}

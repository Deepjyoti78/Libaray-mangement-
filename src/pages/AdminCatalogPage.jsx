import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  BookOpen,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Barcode,
  MapPin,
  ExternalLink,
} from 'lucide-react';

// Initial curated Japanese and bilingual library catalog
const INITIAL_BOOKS = [
  {
    id: 1,
    isbn: '978-4-06-275889-1',
    title: 'Norwegian Wood',
    japaneseTitle: 'ノルウェイの森',
    author: 'Haruki Murakami',
    authorJa: '村上 春樹',
    category: 'Fiction',
    language: 'Japanese / English',
    shelf: 'JPN.813.6/M97n',
    copiesTotal: 6,
    copiesAvailable: 4,
    year: 1987,
    status: 'available',
    description: 'A nostalgic story of loss, grief and awakening sexuality in late 1960s Tokyo, centered on college student Toru Watanabe.',
    publisher: 'Kodansha',
  },
  {
    id: 2,
    isbn: '978-4-10-100101-2',
    title: 'Kokoro',
    japaneseTitle: 'こころ',
    author: 'Natsume Soseki',
    authorJa: '夏目 漱石',
    category: 'Literature',
    language: 'Japanese / English',
    shelf: 'JPN.813.5/N27k',
    copiesTotal: 5,
    copiesAvailable: 2,
    year: 1914,
    status: 'available',
    description: 'A classic masterpiece dealing with isolation, modernity and the complex transition from the Meiji era to modern industrial Japan.',
    publisher: 'Shinchosha',
  },
  {
    id: 3,
    isbn: '978-4-08-872509-3',
    title: 'One Piece: Romance Dawn (Vol. 1)',
    japaneseTitle: 'ONE PIECE 巻一',
    author: 'Eiichiro Oda',
    authorJa: '尾田 栄一郎',
    category: 'Manga',
    language: 'Japanese',
    shelf: 'MANGA.J.741/O21o',
    copiesTotal: 8,
    copiesAvailable: 1,
    year: 1997,
    status: 'low_stock',
    description: 'Monkey D. Luffy embarks on an epic voyage to find the legendary treasure and become the King of the Pirates.',
    publisher: 'Shueisha Jump Comics',
  },
  {
    id: 4,
    isbn: '978-4-00-310101-5',
    title: 'Rashomon and Other Stories',
    japaneseTitle: '羅生門・鼻',
    author: 'Ryunosuke Akutagawa',
    authorJa: '芥川 龍之介',
    category: 'Literature',
    language: 'English Translation',
    shelf: 'JPN.813.4/A38r',
    copiesTotal: 4,
    copiesAvailable: 4,
    year: 1915,
    status: 'available',
    description: 'Iconic psychological short stories examining morality, truth and human survival during desolate times in Kyoto.',
    publisher: 'Iwanami Bunko',
  },
  {
    id: 5,
    isbn: '978-4-79-813456-7',
    title: 'Modern Japanese Architecture & Spatial Design',
    japaneseTitle: '日本の現代建築と空間',
    author: 'Kengo Kuma & Associates',
    authorJa: '隈 研吾',
    category: 'Arts & Culture',
    language: 'Bilingual (EN/JA)',
    shelf: 'ART.720.9/K96m',
    copiesTotal: 3,
    copiesAvailable: 3,
    year: 2021,
    status: 'available',
    description: 'Exploration of natural timber, transparency, and traditional Japanese joinery in modern civic and museum structures.',
    publisher: 'Shoeisha Architecture',
  },
  {
    id: 6,
    isbn: '978-4-04-101234-8',
    title: 'Your Name (Kimi no Na wa) Light Novel',
    japaneseTitle: '君の名は。',
    author: 'Makoto Shinkai',
    authorJa: '新海 誠',
    category: 'Fiction',
    language: 'Japanese',
    shelf: 'JPN.813.6/S52y',
    copiesTotal: 5,
    copiesAvailable: 0,
    year: 2016,
    status: 'lent_out',
    description: 'Two teenagers, Mitsuha and Taki, discover they are magically swapping bodies across time and distance in Japan.',
    publisher: 'Kadokawa Bunko',
  },
  {
    id: 7,
    isbn: '978-4-10-109205-8',
    title: 'Snow Country',
    japaneseTitle: '雪国',
    author: 'Yasunari Kawabata',
    authorJa: '川端 康成',
    category: 'Literature',
    language: 'Japanese / English',
    shelf: 'JPN.813.5/K22s',
    copiesTotal: 5,
    copiesAvailable: 3,
    year: 1937,
    status: 'available',
    description: 'Nobel laureate Kawabata poignant depiction of an illicit love affair at an isolated hot-spring town in northern Japan.',
    publisher: 'Shinchosha',
  },
  {
    id: 8,
    isbn: '978-4-53-231901-4',
    title: 'AI, Robotics & High-Speed Rail Innovation in Japan',
    japaneseTitle: '日本のAIロボティクスと新幹線イノベーション',
    author: 'Dr. Hiroshi Ishiguro',
    authorJa: '石黒 浩',
    category: 'Science & Tech',
    language: 'English Translation',
    shelf: 'SCI.629.8/I77a',
    copiesTotal: 4,
    copiesAvailable: 2,
    year: 2023,
    status: 'available',
    description: 'Insight into cutting-edge humanoid robotics, Shinkansen automated safety algorithms, and automation ethics.',
    publisher: 'Nikkei Publishing',
  },
  {
    id: 9,
    isbn: '978-4-15-209801-1',
    title: 'The Memory Police',
    japaneseTitle: '密やかな結晶',
    author: 'Yoko Ogawa',
    authorJa: '小川 洋子',
    category: 'Fiction',
    language: 'Japanese / English',
    shelf: 'JPN.813.6/O34m',
    copiesTotal: 6,
    copiesAvailable: 5,
    year: 1994,
    status: 'available',
    description: 'An evocative Orwellian meditation on state control, remembrance, and vanishing objects on an isolated island.',
    publisher: 'Hayakawa Publishing',
  },
  {
    id: 10,
    isbn: '978-4-09-123456-0',
    title: 'Demon Slayer: Kimetsu no Yaiba (Vol. 1)',
    japaneseTitle: '鬼滅の刃 1',
    author: 'Koyoharu Gotouge',
    authorJa: '吾峠 呼世晴',
    category: 'Manga',
    language: 'Japanese',
    shelf: 'MANGA.J.741/G68d',
    copiesTotal: 7,
    copiesAvailable: 2,
    year: 2016,
    status: 'available',
    description: 'Tanjiro Kamado sets out on a quest to avenge his slain family and cure his demon-turned sister Nezuko during the Taisho era.',
    publisher: 'Shueisha',
  },
  {
    id: 11,
    isbn: '978-4-13-021001-9',
    title: 'A History of Japan: From Prehistory to the 21st Century',
    japaneseTitle: '概説 日本の歴史',
    author: 'Prof. Kenji Takahashi',
    authorJa: '高橋 健司',
    category: 'History',
    language: 'English Translation',
    shelf: 'HIST.952.0/T13h',
    copiesTotal: 4,
    copiesAvailable: 4,
    year: 2022,
    status: 'available',
    description: 'Thorough scholarly chronicle spanning Jomon civilization, the Heian court, Samurai warfare, Meiji restoration, and postwar economic ascent.',
    publisher: 'University of Tokyo Press',
  },
  {
    id: 12,
    isbn: '978-4-88-335123-5',
    title: 'Kenkyusha Japanese-English Comprehensive Dictionary',
    japaneseTitle: '新和英大辞典',
    author: 'Editorial Committee',
    authorJa: '研究社 編集部',
    category: 'Reference',
    language: 'Bilingual (JA/EN)',
    shelf: 'REF.813.0/K33d',
    copiesTotal: 5,
    copiesAvailable: 5,
    year: 2020,
    status: 'available',
    description: 'The premier reference authority for Japanese idioms, classical terms, technical compounds, and grammar.',
    publisher: 'Kenkyusha',
  },
];

const CATEGORIES = [
  'All',
  'Fiction',
  'Literature',
  'Manga',
  'Arts & Culture',
  'Science & Tech',
  'History',
  'Reference',
];

export default function AdminCatalogPage() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectedBook, setInspectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  // New book form state
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    japaneseTitle: '',
    author: '',
    isbn: '',
    category: 'Fiction',
    language: 'Japanese / English',
    shelf: 'JPN.813.6/',
    copiesTotal: 3,
    year: 2024,
    publisher: 'Japan Foundation Curation',
    description: '',
  });

  // Filtered dataset
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        searchTerm === '' ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.japaneseTitle.includes(searchTerm) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn.includes(searchTerm) ||
        b.shelf.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || b.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && b.copiesAvailable > 0) ||
        (statusFilter === 'lent_out' && b.copiesAvailable === 0) ||
        (statusFilter === 'low_stock' && b.copiesAvailable === 1);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [books, searchTerm, selectedCategory, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Aggregate stats
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.copiesTotal, 0);
  const totalAvailable = books.reduce((acc, b) => acc + b.copiesAvailable, 0);
  const totalLent = totalCopies - totalAvailable;

  // Handle book creation
  const handleCreateBook = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      ...newBookForm,
      copiesTotal: parseInt(newBookForm.copiesTotal, 10) || 1,
      copiesAvailable: parseInt(newBookForm.copiesTotal, 10) || 1,
      year: parseInt(newBookForm.year, 10) || 2024,
      status: 'available',
    };
    setBooks([created, ...books]);
    setIsAddModalOpen(false);
    setNewBookForm({
      title: '',
      japaneseTitle: '',
      author: '',
      isbn: '',
      category: 'Fiction',
      language: 'Japanese / English',
      shelf: 'JPN.813.6/',
      copiesTotal: 3,
      year: 2024,
      publisher: 'Japan Foundation Curation',
      description: '',
    });
  };

  // Handle edit save
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingBook) return;
    setBooks(
      books.map((b) => (b.id === editingBook.id ? { ...b, ...editingBook } : b))
    );
    setEditingBook(null);
  };

  // Handle quick delete
  const handleDeleteBook = (id) => {
    if (window.confirm('Are you sure you want to retire this book from the catalog?')) {
      setBooks(books.filter((b) => b.id !== id));
      if (inspectedBook?.id === id) setInspectedBook(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ISBN', 'Title', 'Japanese Title', 'Author', 'Category', 'Shelf', 'Total Copies', 'Available Copies'];
    const rows = filteredBooks.map((b) => [
      `"${b.isbn}"`,
      `"${b.title}"`,
      `"${b.japaneseTitle}"`,
      `"${b.author}"`,
      `"${b.category}"`,
      `"${b.shelf}"`,
      b.copiesTotal,
      b.copiesAvailable,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sora_Library_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedBooks.size === paginatedBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(paginatedBooks.map((b) => b.id)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedBooks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBooks(next);
  };

  return (
    <div className="admin-bookings-page admin-catalog-page">
      {/* 1. Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA COLLECTIONS &amp; CURATION</span>
          <h1 className="bookings-main-title">Book Catalog &amp; Inventory</h1>
          <p className="bookings-subtitle">
            Catalog Japanese literature, manga, periodicals, and manage copies and shelf call locations.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportCSV}
            title="Export catalog data as CSV"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="action-primary-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={15} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL TITLES</span>
            <div className="kpi-icon-wrap"><BookOpen size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalTitles.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">+12 new this month</span>
            <span className="kpi-sub-label">Cataloged</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL COPIES</span>
            <div className="kpi-icon-wrap"><Layers size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalCopies.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Across reading rooms</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">CURRENTLY LENT</span>
            <div className="kpi-icon-wrap"><ArrowLeftRight size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalLent.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend neutral">
              {Math.round((totalLent / (totalCopies || 1)) * 100)}% utilization
            </span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">AVAILABLE ON SHELF</span>
            <div className="kpi-icon-wrap"><CheckCircle2 size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalAvailable.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Ready for immediate checkout</span>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search Controls */}
      <div className="catalog-controls-container">
        {/* Category Pill Tabs */}
        <div className="catalog-category-tabs" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
            >
              <span>{cat}</span>
              <span className="cat-count">
                {cat === 'All'
                  ? books.length
                  : books.filter((b) => b.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Status Controls Bar */}
        <div className="bookings-filter-bar">
          <div className="filter-search-box">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by title, Japanese kanji, author, ISBN or shelf code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="filter-dropdowns-group">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-dropdown-select"
            >
              <option value="all">All Availability</option>
              <option value="available">Available on Shelf</option>
              <option value="low_stock">Low Stock (1 copy left)</option>
              <option value="lent_out">Fully Lent Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Catalog Data Table */}
      <div className="bookings-table-wrapper">
        <table className="bookings-data-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={paginatedBooks.length > 0 && selectedBooks.size === paginatedBooks.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all books on page"
                />
              </th>
              <th>Book Title &amp; Author</th>
              <th>Category</th>
              <th>Shelf Call No.</th>
              <th>Copies (Avail / Total)</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  <div className="empty-state-wrap">
                    <BookOpen size={32} className="empty-icon" />
                    <p className="empty-title">No books match your search filters</p>
                    <p className="empty-subtitle">
                      Try adjusting the search query or reset category selection.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBooks.map((book) => {
                const isSelected = selectedBooks.has(book.id);
                const percentAvail = Math.round((book.copiesAvailable / (book.copiesTotal || 1)) * 100);

                return (
                  <tr key={book.id} className={isSelected ? 'row-selected' : ''}>
                    <td className="td-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(book.id)}
                        aria-label={`Select ${book.title}`}
                      />
                    </td>
                    <td>
                      <div className="book-title-cell">
                        <div className="book-calligraphy-mark" title={book.japaneseTitle}>
                          <span>{book.japaneseTitle.slice(0, 1)}</span>
                        </div>
                        <div className="book-text-info">
                          <span className="book-en-title">{book.title}</span>
                          <span className="book-ja-title">{book.japaneseTitle}</span>
                          <span className="book-meta-sub">
                            By {book.author} · {book.publisher} ({book.year})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill-badge">{book.category}</span>
                    </td>
                    <td>
                      <span className="shelf-code-badge">
                        <MapPin size={11} className="inline mr-1" />
                        {book.shelf}
                      </span>
                    </td>
                    <td>
                      <div className="copies-meter-col">
                        <div className="copies-numbers">
                          <strong>{book.copiesAvailable}</strong> / {book.copiesTotal} available
                        </div>
                        <div className="copies-progress-track">
                          <div
                            className={`copies-progress-bar ${
                              book.copiesAvailable === 0
                                ? 'bar-red'
                                : book.copiesAvailable === 1
                                ? 'bar-amber'
                                : 'bar-green'
                            }`}
                            style={{ width: `${percentAvail}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {book.copiesAvailable === 0 ? (
                        <span className="status-pill pill-cancelled">Lent Out</span>
                      ) : book.copiesAvailable === 1 ? (
                        <span className="status-pill pill-amber">1 Copy Left</span>
                      ) : (
                        <span className="status-pill pill-active">Available</span>
                      )}
                    </td>
                    <td className="td-actions">
                      <div className="row-actions-group">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => setInspectedBook(book)}
                          title="View Book Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => setEditingBook({ ...book })}
                          title="Edit Book Information"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => handleDeleteBook(book.id)}
                          title="Retire Volume"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="bookings-pagination-footer">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredBooks.length)} of {filteredBooks.length} titles
          </div>

          <div className="pagination-nav-group">
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. ADD NEW BOOK MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">CATALOGING SYSTEM</span>
                <h2 className="dialog-title">Add New Volume to Catalog</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>English / Main Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Tale of Genji"
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Japanese Title (Kanji/Kana)</label>
                  <input
                    type="text"
                    placeholder="e.g. 源氏物語"
                    value={newBookForm.japaneseTitle}
                    onChange={(e) => setNewBookForm({ ...newBookForm, japaneseTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Murasaki Shikibu"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>ISBN-13 Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 978-4-06-275889-1"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-3col">
                <div className="form-field-item">
                  <label>Category</label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field-item">
                  <label>Shelf Location Call No.</label>
                  <input
                    type="text"
                    placeholder="e.g. JPN.813.5/M97"
                    value={newBookForm.shelf}
                    onChange={(e) => setNewBookForm({ ...newBookForm, shelf: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Copies Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newBookForm.copiesTotal}
                    onChange={(e) => setNewBookForm({ ...newBookForm, copiesTotal: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-item">
                <label>Synopsis &amp; Collection Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief thematic overview, historical context or reader guidance..."
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Plus size={15} />
                  <span>Register into Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BOOK DETAILS INSPECTOR MODAL */}
      {inspectedBook && (
        <div className="modal-backdrop-overlay" onClick={() => setInspectedBook(null)}>
          <div className="modal-card-dialog book-inspector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">VOLUME SPECIFICATION</span>
                <h2 className="dialog-title">{inspectedBook.title}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setInspectedBook(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspector-content-body">
              <div className="inspector-kanji-hero">
                <span className="kanji-large-display">{inspectedBook.japaneseTitle}</span>
                <span className="kanji-subtitle-badge">Official Japanese Foundation Archive</span>
              </div>

              <div className="inspector-meta-grid">
                <div className="meta-card-item">
                  <span className="meta-label">Author</span>
                  <strong className="meta-value">{inspectedBook.author}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Category</span>
                  <strong className="meta-value">{inspectedBook.category}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">ISBN-13</span>
                  <strong className="meta-value font-mono">{inspectedBook.isbn}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Shelf Call Number</span>
                  <strong className="meta-value font-mono">{inspectedBook.shelf}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Language</span>
                  <strong className="meta-value">{inspectedBook.language}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Publisher</span>
                  <strong className="meta-value">{inspectedBook.publisher} ({inspectedBook.year})</strong>
                </div>
              </div>

              <div className="inspector-synopsis-box">
                <span className="synopsis-title">Synopsis</span>
                <p>{inspectedBook.description}</p>
              </div>

              <div className="inspector-copies-status">
                <div className="copies-badge-summary">
                  <span>Available on Shelf: <strong>{inspectedBook.copiesAvailable}</strong></span>
                  <span>Total Copies: <strong>{inspectedBook.copiesTotal}</strong></span>
                </div>
                <div className="barcode-mock-box">
                  <Barcode size={36} className="barcode-icon" />
                  <span className="barcode-code-text">{inspectedBook.isbn}</span>
                </div>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="dialog-secondary-btn"
                onClick={() => setInspectedBook(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="action-primary-btn"
                onClick={() => {
                  setEditingBook({ ...inspectedBook });
                  setInspectedBook(null);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Volume</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT BOOK MODAL */}
      {editingBook && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingBook(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">UPDATE ENTRY</span>
                <h2 className="dialog-title">Edit Volume Details</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setEditingBook(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Title</label>
                  <input
                    type="text"
                    required
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Japanese Title</label>
                  <input
                    type="text"
                    value={editingBook.japaneseTitle}
                    onChange={(e) => setEditingBook({ ...editingBook, japaneseTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-3col">
                <div className="form-field-item">
                  <label>Category</label>
                  <select
                    value={editingBook.category}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field-item">
                  <label>Shelf Location</label>
                  <input
                    type="text"
                    value={editingBook.shelf}
                    onChange={(e) => setEditingBook({ ...editingBook, shelf: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Total Copies</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBook.copiesTotal}
                    onChange={(e) => setEditingBook({ ...editingBook, copiesTotal: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setEditingBook(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

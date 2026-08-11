import { useState } from 'react';
import AccordionGallery from './components/AccordionGallery/AccordionGallery';
import FacebookFeed from './components/FacebookFeed/FacebookFeed';
import './App.css';

// Full Menu Data Extracted from Pateo PDF
const MENU_DATA = [
  {
    id: 'sandes',
    label: 'Sandes',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: 'Bola Manteiga', price: '0.80' },
      { name: 'Bola Queijo', price: '1.40' },
      { name: 'Bola Fiambre', price: '1.40' },
      { name: 'Bola Presunto', price: '1.70' },
      { name: 'Bola Mista', price: '1.80' },
      { name: 'Bola Mista Presunto/Queijo', price: '1.95' },
      { name: 'Bola Cereais Manteiga', price: '1.70' },
      { name: 'Bola Cereais Queijo', price: '2.35' },
      { name: 'Bola Cereais Fiambre', price: '2.35' },
      { name: 'Bola Cereais Presunto', price: '2.45' },
      { name: 'Bola Cereais Mista', price: '2.70' },
      { name: 'Bola Cereais Mista Presunto/Queijo', price: '2.95' },
      { name: 'Carcaça Saloia Manteiga', price: '1.60' },
      { name: 'Carcaça Saloia Queijo', price: '2.25' },
      { name: 'Carcaça Saloia Fiambre', price: '2.25' },
      { name: 'Carcaça Saloia Presunto', price: '2.35' },
      { name: 'Carcaça Saloia Mista', price: '2.75' },
      { name: 'Carcaça Saloia Mista Presunto/Queijo', price: '2.95' },
      { name: 'Bola Centeio Manteiga', price: '1.70' },
      { name: 'Bola Centeio Queijo', price: '2.35' },
      { name: 'Bola Centeio Fiambre', price: '2.35' },
      { name: 'Bola Centeio Presunto', price: '2.45' },
      { name: 'Bola Centeio Mista', price: '2.70' },
      { name: 'Bola Centeio Mista Presunto/Queijo', price: '2.95' },
      { name: 'Pão de Leite Simples', price: '1.50' },
      { name: 'Pão de Leite Manteiga', price: '1.85' },
      { name: 'Pão de Leite Queijo', price: '2.35' },
      { name: 'Pão de Leite Fiambre', price: '2.35' },
      { name: 'Pão de Leite Misto', price: '2.50' },
      { name: 'Pão de Deus Simples', price: '1.80' },
      { name: 'Pão de Deus Manteiga', price: '2.40' },
      { name: 'Pão de Deus Queijo', price: '2.70' },
      { name: 'Pão de Deus Fiambre', price: '2.70' },
      { name: 'Pão de Deus Misto', price: '2.95' }
    ]
  },
  {
    id: 'sandes_especiais',
    label: 'Sandes Especiais',
    image: 'https://images.unsplash.com/photo-1481070114443-e078b538c74c?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: '½ Torrada Manteiga', price: '1.00' },
      { name: 'Torrada Manteiga', price: '1.90' },
      { name: '½ Tosta de Queijo', price: '1.50' },
      { name: 'Tosta de Queijo', price: '2.75' },
      { name: '½ Tosta de Fiambre', price: '1.50' },
      { name: 'Tosta de Fiambre', price: '2.75' },
      { name: '½ Tosta Mista', price: '1.65' },
      { name: 'Tosta Mista', price: '3.00' },
      { name: '½ Sandes Omolette', price: '1.95' },
      { name: 'Sandes Omolette', price: '3.50' },
      { name: '½ Sandes Atum', price: '1.95' },
      { name: 'Sandes Atum', price: '3.50' },
      { name: 'Sandes Panado Carne', price: '4.50' },
      { name: 'Sandes Panado Peixe', price: '4.50' },
      { name: 'Bifana', price: '4.00' }
    ]
  },
  {
    id: 'barista',
    label: 'Barista',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: 'Café Expresso', price: '1.50' },
      { name: 'Capuccino', price: '2.50' },
      { name: 'Meia de Leite / Garoto', price: '2.25' },
      { name: 'Carioca', price: '1.50' },
      { name: 'Café Americano / Long Black', price: '1.50' },
      { name: 'Café Expresso Duplo', price: '2.00' },
      { name: 'Café Expresso Descafeinado', price: '1.75' },
      { name: 'Café Pingado', price: '1.75' },
      { name: 'Café Expresso Cápsula', price: '1.00' },
      { name: 'Copo de Leite', price: '1.00' },
      { name: 'Copo de Leite c/ Chocolate', price: '1.70' },
      { name: 'Chá', price: '2.00' },
      { name: 'Chá com Leite', price: '2.25' }
    ],
    note: 'Takeaway aumenta $0.20 à sua bebida'
  },
  {
    id: 'croissants',
    label: 'Croissants',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: 'Croissant Simples', price: '1.50' },
      { name: 'Croissant Manteiga', price: '1.85' },
      { name: 'Croissant Queijo', price: '2.35' },
      { name: 'Croissant Fiambre', price: '2.35' },
      { name: 'Croissant Misto', price: '2.50' },
      { name: 'Croissant XL Simples', price: '2.30' },
      { name: 'Croissant XL Manteiga', price: '2.40' },
      { name: 'Croissant XL Queijo', price: '2.70' },
      { name: 'Croissant XL Fiambre', price: '2.70' },
      { name: 'Croissant XL Misto', price: '3.25' },
      { name: 'Croissant Brioche Creme', price: '2.00' },
      { name: 'Croissant Chocolate', price: '2.00' },
      { name: 'Croissant Folhado Creme', price: '2.00' }
    ]
  },
  {
    id: 'salgados',
    label: 'Pasteis & Salgados',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: 'Vegetarian Samosa', price: '1.30' },
      { name: 'Chicken Samosa', price: '1.75' },
      { name: 'Folhado Atum', price: '2.00' },
      { name: 'Folhado Carne', price: '2.00' },
      { name: 'Folhado de Espinafres', price: '2.00' },
      { name: 'Folhado de Frango', price: '2.00' },
      { name: 'Folhado Pizza Queijo Oregãos', price: '2.00' },
      { name: 'Folhado Salsicha com Queijo', price: '2.00' },
      { name: 'Lanches', price: '2.00' },
      { name: 'Panike Cereais Misto', price: '2.00' },
      { name: 'Panike Misto', price: '2.00' },
      { name: 'Rissol (Carne ou Peixe)', price: '1.50' }
    ]
  },
  {
    id: 'doces',
    label: 'Bolos & Doces',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop',
    items: [
      { name: 'Pastel de Nata Tradicional', price: '1.50' },
      { name: 'Pastel de Nata Chocolate', price: '1.80' },
      { name: 'Bolo Arroz', price: '2.50' },
      { name: 'Bretzel Amêndoa', price: '2.50' },
      { name: 'Bretzel Maçã Alcobaça', price: '2.50' },
      { name: 'Maple Pecan', price: '2.50' },
      { name: 'Dot\'s Açucarado', price: '1.50' },
      { name: 'Dot\'s Negrito', price: '1.50' },
      { name: 'Dot\'s Classic Glace', price: '1.50' }
    ]
  },
  {
    id: 'bebidas',
    label: 'Bebidas & Cocktails',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=900&w=1200&auto=format&fit=crop',
    items: [
      { name: 'Copo de Vinho da Casa', price: '2.50' },
      { name: 'Ginjinha', price: '2.00' },
      { name: 'Moscatel Favaito', price: '1.75' },
      { name: 'Aperol Spritz', price: '6.00' },
      { name: 'Gin Tónico Premium', price: '9.00' },
      { name: 'Porto Tónico', price: '7.00' },
      { name: 'Whisky', price: '4.00' },
      { name: 'Cachaça 51', price: '4.50' }
    ]
  }
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalActive, setIsModalActive] = useState(false);
  // Index of the category currently "chosen" (its modal is open). null = none
  // chosen, so every gallery panel shows greyscale until one is picked.
  const [coloredIndex, setColoredIndex] = useState(null);

  const handleOpenCategory = (category, index) => {
    setSelectedCategory(category);
    setColoredIndex(index);
    setSearchQuery('');
    setTimeout(() => {
      setIsModalActive(true);
    }, 50);
  };

  const handleCloseCategory = () => {
    setIsModalActive(false);
    setColoredIndex(null); // category greys out again once the modal is dismissed
    setTimeout(() => {
      setSelectedCategory(null);
    }, 300);
  };

  const filteredItems = selectedCategory
    ? selectedCategory.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="app-container">
      {/* Header with Logo */}
      <header className="main-header">
        <div className="logo-wrap">
          <img src="/logo.png" alt="Páteo Logo" className="logo-img" />
        </div>
      </header>

      {/* Accordion Gallery */}
      <main className="section">
        <div className="section-title-wrap">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2>Menu Digital</h2>
        </div>

        <p className="menu-tip">Explore as categorias abaixo. Toque na secção expandida para ver todos os itens.</p>

        <div className="accordion-wrapper">
          <AccordionGallery
            items={MENU_DATA}
            defaultIndex={0}
            expandRatio={0.58}
            trigger="click"
            accentColor="var(--pop-color)"
            overlayColor="#0a0a1e"
            textColor="#ffffff"
            height={400}
            orientation="vertical"
            coloredIndex={coloredIndex}
            onItemClick={handleOpenCategory}
          />
        </div>
      </main>

      {/* Facebook Section at the Bottom */}
      <section className="section facebook-ad-section">
        <div className="section-title-wrap">
          <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <h2>Últimas Novidades</h2>
        </div>

        {/* Live posts from the Graph API proxy; renders nothing if unavailable */}
        <FacebookFeed />

        {/* Always-present Follow card — also the fallback when the feed is empty/errors */}
        <a
          className="facebook-cta card"
          href="https://www.facebook.com/pateo.timor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="facebook-cta-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="facebook-cta-text">
            <span className="facebook-cta-title">Segue-nos no Facebook</span>
            <span className="facebook-cta-subtitle">
              Acompanha promoções, eventos e as últimas novidades do Páteo.
            </span>
          </div>
          <span className="facebook-cta-button">
            <span>Abrir Facebook</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </section>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className={`menu-modal-overlay ${isModalActive ? 'active' : ''}`} onClick={handleCloseCategory}>
          <div className="menu-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="menu-modal-header">
              <h3>{selectedCategory.label}</h3>
              <button className="btn-close" onClick={handleCloseCategory} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="search-box-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Procurar prato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="menu-items-list">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div key={index} className="menu-item-row">
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-dots"></span>
                    <span className="menu-item-price">${item.price}</span>
                  </div>
                ))
              ) : (
                <p className="no-results">Nenhum item encontrado.</p>
              )}
            </div>

            {selectedCategory.note && (
              <div className="menu-category-note">
                {selectedCategory.note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Area */}
      <footer className="main-footer">
        <div className="info-card card">
          <div className="info-row">
            <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <h4>Horário</h4>
              <p>Seg - Sáb: 08:00 - 20:00</p>
              <p>Domingo: 09:00 - 18:00</p>
            </div>
          </div>

          <div className="info-row">
            <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <h4>Contacto</h4>
              <p>7792 9055</p>
              <p>info@pateo.tl</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 PÁTEO. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

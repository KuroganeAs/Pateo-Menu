/* ----------------------------------------------------
   PATEO CAFÉ & RETROSTORE - CLIENT LOGIC
   Pure Vanilla JS with Responsive PDF.js Engine & Gestures
   ---------------------------------------------------- */

// Configurable settings for the café owner
const CONFIG = {
  pdfPath: 'Menu/MENU PAINES CAFETARIA.pdf',
  facebookPageUrl: 'https://www.facebook.com/PateoRetrostoreCafe/', // Café FB Page
  promotions: [
    {
      image: 'Menu/Combo.png',
      title: 'Especial Pateo Combo',
      description: 'Aproveite o nosso menu de café + pastelaria a um preço exclusivo. Disponível a qualquer hora!'
    },
    {
      image: 'Menu/Combo.png',
      title: 'Menu de Pequeno-Almoço',
      description: 'Comece o dia da melhor forma com os nossos menus frescos. Peça na mesa!'
    }
  ]
};

// Global state variables
let pdfDocument = null;
let currentLightboxPage = 1;
let totalPages = 0;
let renderQueue = [];
let isRendering = false;

// Carousel State
let currentPromoSlide = 0;
let promoTimer = null;

// Lightbox Zoom & Pan State
let zoomState = {
  scale: 1,
  maxScale: 4,
  minScale: 1,
  x: 0,
  y: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  touchStartDist: 0,
  touchStartScale: 1,
  lastTapTime: 0
};

// Initialize elements on load
document.addEventListener('DOMContentLoaded', () => {
  initTableNumber();
  initPromoCarousel();
  initPDFMenu();
  initLightbox();
});

/* ==========================================
   1. Table Number Query Parser
   ========================================== */
function initTableNumber() {
  const urlParams = new URLSearchParams(window.location.search);
  const tableNum = urlParams.get('table');

  const headerBadge = document.getElementById('header-table-badge');
  const headerNum = document.getElementById('header-table-num');
  const footerNum = document.getElementById('footer-table-num');

  if (tableNum) {
    // Sanitize input to prevent injection, limiting to alphanumeric/hyphen
    const sanitizedTable = tableNum.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 5);
    
    // Display in header
    headerNum.textContent = sanitizedTable;
    headerBadge.style.display = 'flex';
    
    // Display in footer
    footerNum.textContent = sanitizedTable;
  } else {
    // Fallback if no table parameter is supplied
    footerNum.textContent = 'Café';
  }
}

/* ==========================================
   2. Facebook Promo & Fallback
   ========================================== */
/* ==========================================
   2. Promotions Carousel & Auto-scroll
   ========================================== */
function initPromoCarousel() {
  const track = document.getElementById('promo-carousel-track');
  const dotsContainer = document.getElementById('promo-carousel-dots');
  const fbPageLink = document.getElementById('fb-page-link');

  // Set the view more button URL
  if (fbPageLink) fbPageLink.href = CONFIG.facebookPageUrl;

  const promos = CONFIG.promotions;
  if (!promos || promos.length === 0) {
    // If no promos, hide wrapper
    const wrapper = document.getElementById('promo-carousel-wrapper');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }

  // Populate slides and dots
  promos.forEach((promo, index) => {
    // Create slide element
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = `
      <img src="${promo.image}" alt="${promo.title}">
      <div class="carousel-caption">
        <h3>${promo.title}</h3>
        <p>${promo.description}</p>
      </div>
    `;
    track.appendChild(slide);

    // Create dot element
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('data-slide', index);
    dot.setAttribute('aria-label', `Ir para slide ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoScroll();
    });
    dotsContainer.appendChild(dot);
  });

  // Start auto scrolling with 3-second interval
  startAutoScroll();
}

function goToSlide(index) {
  const track = document.getElementById('promo-carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (index >= CONFIG.promotions.length) index = 0;
  if (index < 0) index = CONFIG.promotions.length - 1;
  
  currentPromoSlide = index;
  
  // Slide transition via transform translateX
  if (track) track.style.transform = `translateX(-${index * 100}%)`;
  
  // Update active dot indicator
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function startAutoScroll() {
  if (CONFIG.promotions.length <= 1) return;
  promoTimer = setInterval(() => {
    goToSlide(currentPromoSlide + 1);
  }, 3000); // 3-second interval
}

function resetAutoScroll() {
  clearInterval(promoTimer);
  startAutoScroll();
}

/* ==========================================
   3. PDF Menu Renderer using PDF.js
   ========================================== */
function initPDFMenu() {
  // Specify CDN worker source for performance
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

  const loader = document.getElementById('menu-loader');
  const progressFill = document.getElementById('menu-progress-fill');
  const renderTarget = document.getElementById('pdf-pages-render-target');

  // Load the PDF Document
  const loadingTask = pdfjsLib.getDocument(CONFIG.pdfPath);

  // Monitor loading progress
  loadingTask.onProgress = (progress) => {
    if (progress.total > 0) {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      progressFill.style.width = `${percentage}%`;
      progressFill.textContent = `${percentage}%`;
    }
  };

  loadingTask.promise.then(pdf => {
    pdfDocument = pdf;
    totalPages = pdf.numPages;
    document.getElementById('lightbox-page-num').textContent = `Página 1 de ${totalPages}`;

    // Hide navigation arrows if there's only 1 page
    if (totalPages <= 1) {
      document.getElementById('prev-page-btn').style.display = 'none';
      document.getElementById('next-page-btn').style.display = 'none';
    }

    // Begin rendering pages sequentially
    renderAllPages(renderTarget, loader);
  }).catch(err => {
    console.error('Error loading PDF menu:', err);
    loader.innerHTML = `
      <p style="color: var(--accent-color); font-weight: 600;">Não foi possível carregar o menu</p>
      <p style="font-size: 0.75rem; margin-top: 4px;">Por favor, tente ler o código QR novamente ou peça ajuda aos nossos funcionários.</p>
      <a href="${CONFIG.pdfPath}" target="_blank" class="btn" style="background: var(--primary-color); color: var(--text-dark); margin-top: 12px; width: auto;">Abrir PDF Diretamente</a>
    `;
  });
}

// Sequential page rendering queue to avoid mobile memory crashing
async function renderAllPages(target, loader) {
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    await renderPageCanvas(pageNum, target);
  }
  // All pages rendered, fade out loader
  loader.style.transition = 'opacity 0.4s ease';
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 400);
}

function renderPageCanvas(pageNum, target) {
  return new Promise((resolve) => {
    pdfDocument.getPage(pageNum).then(page => {
      // Create a canvas for this page
      const canvas = document.createElement('canvas');
      canvas.className = 'menu-page-canvas';
      canvas.id = `menu-canvas-p${pageNum}`;
      canvas.setAttribute('data-page', pageNum);
      
      const context = canvas.getContext('2d');

      // Check current mobile width to set optimal display resolution
      const containerWidth = target.clientWidth || 340;
      // We want high visual fidelity, so render at 1.8x scale
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const computedScale = (containerWidth / unscaledViewport.width) * 1.8;
      const viewport = page.getViewport({ scale: computedScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // Tap click event to launch interactive lightbox
      canvas.addEventListener('click', () => {
        openLightbox(pageNum);
      });

      target.appendChild(canvas);

      // Render the page on canvas
      page.render(renderContext).promise.then(() => {
        resolve();
      });
    });
  });
}

/* ==========================================
   4. Interactive Lightbox Modal with Zoom/Pan
   ========================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const overlay = lightbox.querySelector('.lightbox-overlay');
  
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');

  // Close handlers
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // Action Bar Zoom buttons
  zoomInBtn.addEventListener('click', () => adjustZoom(0.5));
  zoomOutBtn.addEventListener('click', () => adjustZoom(-0.5));

  // Arrow navigation
  prevBtn.addEventListener('click', () => navigateLightbox(-1));
  nextBtn.addEventListener('click', () => navigateLightbox(1));

  // Touch and Drag handlers setup
  setupGestureControls();
}

function openLightbox(pageNum) {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop background scrolling
  
  loadLightboxPage(pageNum);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
  
  // Reset zoom styles on close
  resetZoomState();
}

function loadLightboxPage(pageNum) {
  currentLightboxPage = pageNum;
  
  const pageNumText = document.getElementById('lightbox-page-num');
  pageNumText.textContent = `Página ${pageNum} de ${totalPages}`;

  // Update button states
  document.getElementById('prev-page-btn').disabled = (pageNum === 1);
  document.getElementById('next-page-btn').disabled = (pageNum === totalPages);

  // Load high-resolution page canvas onto the lightbox
  const lbCanvas = document.getElementById('lightbox-canvas');
  const context = lbCanvas.getContext('2d');
  
  // Reset zoom state when loading a new page
  resetZoomState();

  // Load high definition details from PDF
  pdfDocument.getPage(pageNum).then(page => {
    // Render at high resolution (2.5x scale) for zoom clarity
    const viewport = page.getViewport({ scale: 2.5 });
    lbCanvas.width = viewport.width;
    lbCanvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext);
  });
}

function navigateLightbox(direction) {
  const targetPage = currentLightboxPage + direction;
  if (targetPage >= 1 && targetPage <= totalPages) {
    loadLightboxPage(targetPage);
  }
}

/* ==========================================
   5. Pinch-to-Zoom & Pan Gesture Logic
   ========================================== */
function setupGestureControls() {
  const zoomContainer = document.getElementById('lightbox-zoom-container');
  const lbCanvas = document.getElementById('lightbox-canvas');

  // Mouse Drag / Touch Drag variables
  zoomContainer.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);

  zoomContainer.addEventListener('touchstart', touchStart, { passive: false });
  window.addEventListener('touchmove', touchMove, { passive: false });
  window.addEventListener('touchend', touchEnd);

  // Double tap to zoom
  zoomContainer.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - zoomState.lastTapTime < 300) {
      e.preventDefault();
      // Double tap detected
      if (zoomState.scale > 1.1) {
        resetZoomState();
      } else {
        // Zoom to clicked spot if possible
        const rect = zoomContainer.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const tapY = e.clientY - rect.top;
        zoomToPoint(tapX, tapY, 2.0);
      }
    }
    zoomState.lastTapTime = now;
  });
}

function dragStart(e) {
  if (zoomState.scale <= 1) return; // Only pan when zoomed in
  zoomState.isDragging = true;
  zoomState.startX = e.clientX - zoomState.x;
  zoomState.startY = e.clientY - zoomState.y;
}

function dragMove(e) {
  if (!zoomState.isDragging) return;
  e.preventDefault();
  
  zoomState.x = e.clientX - zoomState.startX;
  zoomState.y = e.clientY - zoomState.startY;
  
  applyTransform();
}

function dragEnd() {
  zoomState.isDragging = false;
  constrainPan();
}

function touchStart(e) {
  const touches = e.touches;

  if (touches.length === 1) {
    // Single touch drag (panning)
    if (zoomState.scale > 1) {
      zoomState.isDragging = true;
      zoomState.startX = touches[0].clientX - zoomState.x;
      zoomState.startY = touches[0].clientY - zoomState.y;
    }
  } else if (touches.length === 2) {
    // Multi-touch pinch zoom
    zoomState.isDragging = false;
    e.preventDefault();
    
    // Distance between fingers
    zoomState.touchStartDist = getTouchDistance(touches[0], touches[1]);
    zoomState.touchStartScale = zoomState.scale;
    
    // Calculate center point of pinch to zoom around it
    const rect = document.getElementById('lightbox-zoom-container').getBoundingClientRect();
    zoomState.pinchCenterX = ((touches[0].clientX + touches[1].clientX) / 2) - rect.left;
    zoomState.pinchCenterY = ((touches[0].clientY + touches[1].clientY) / 2) - rect.top;
  }
}

function touchMove(e) {
  const touches = e.touches;
  if (touches.length === 1 && zoomState.isDragging) {
    // Drag/Pan
    e.preventDefault();
    zoomState.x = touches[0].clientX - zoomState.startX;
    zoomState.y = touches[0].clientY - zoomState.startY;
    applyTransform();
  } else if (touches.length === 2) {
    // Pinch Zoom
    e.preventDefault();
    const dist = getTouchDistance(touches[0], touches[1]);
    const factor = dist / zoomState.touchStartDist;
    const targetScale = Math.max(zoomState.minScale, Math.min(zoomState.maxScale, zoomState.touchStartScale * factor));
    
    zoomToPoint(zoomState.pinchCenterX, zoomState.pinchCenterY, targetScale);
  }
}

function touchEnd(e) {
  zoomState.isDragging = false;
  constrainPan();
}

function getTouchDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function adjustZoom(amount) {
  const container = document.getElementById('lightbox-zoom-container');
  const targetScale = Math.max(zoomState.minScale, Math.min(zoomState.maxScale, zoomState.scale + amount));
  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;
  zoomToPoint(centerX, centerY, targetScale);
}

function zoomToPoint(centerX, centerY, targetScale) {
  const lbCanvas = document.getElementById('lightbox-canvas');
  if (!lbCanvas) return;

  // Zoom center relative to the untransformed canvas
  const canvasRect = lbCanvas.getBoundingClientRect();
  const container = document.getElementById('lightbox-zoom-container');
  const containerRect = container.getBoundingClientRect();
  
  // Determine coordinate offset from center
  const originX = centerX - (canvasRect.left - containerRect.left + canvasRect.width / 2);
  const originY = centerY - (canvasRect.top - containerRect.top + canvasRect.height / 2);

  const scaleRatio = targetScale / zoomState.scale;
  
  zoomState.scale = targetScale;
  zoomState.x -= originX * (scaleRatio - 1);
  zoomState.y -= originY * (scaleRatio - 1);

  applyTransform();
}

function constrainPan() {
  if (zoomState.scale <= 1) {
    resetZoomState();
    return;
  }

  const lbCanvas = document.getElementById('lightbox-canvas');
  const container = document.getElementById('lightbox-zoom-container');
  
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  const canvasW = lbCanvas.clientWidth * zoomState.scale;
  const canvasH = lbCanvas.clientHeight * zoomState.scale;

  // Constrain horizontally
  const xLimit = Math.max(0, (canvasW - containerW) / 2);
  if (zoomState.x > xLimit) zoomState.x = xLimit;
  if (zoomState.x < -xLimit) zoomState.x = -xLimit;

  // Constrain vertically
  const yLimit = Math.max(0, (canvasH - containerH) / 2);
  if (zoomState.y > yLimit) zoomState.y = yLimit;
  if (zoomState.y < -yLimit) zoomState.y = -yLimit;

  applyTransform();
}

function applyTransform() {
  const lbCanvas = document.getElementById('lightbox-canvas');
  if (lbCanvas) {
    lbCanvas.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
  }
}

function resetZoomState() {
  zoomState.scale = 1;
  zoomState.x = 0;
  zoomState.y = 0;
  applyTransform();
}


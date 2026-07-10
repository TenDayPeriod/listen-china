const products = [
  {
    id: 1,
    name: '青花瓷缠枝莲纹瓶',
    description: '此瓶造型端庄典雅，通体以青花描绘缠枝莲纹，线条流畅细腻，青花发色浓艳，具有典型的明代青花瓷艺术风格。缠枝莲纹寓意吉祥，象征着富贵连绵、生生不息。',
    price: 128000,
    images: [
      'img/qinghua/1.jpg',
      'img/qinghua/2.jpg',
      'img/qinghua/3.jpg'
    ]
  },
  {
    id: 2,
    name: '松竹梅',
    description: '松竹梅是一种传统的中国艺术，由松竹和梅组成，以松竹为背景，以梅为主体，以松竹为装饰，是一种传统的中国艺术。',
    price: 86000,
    images: [
      'img/bamboo/1.jpg',
      'img/bamboo/2.jpg',
      'img/bamboo/3.jpg',
      'img/bamboo/4.jpg',
      'img/bamboo/5.jpg',
      'img/bamboo/6.jpg',
      'img/bamboo/7.jpg',
      'img/bamboo/8.jpg',
    ]
  },
  {
    id: 3,
    name: '汝窑天青釉三足樽',
    description: '汝窑为宋代五大名窑之首，此樽以天青釉色著称，釉面温润如玉，开片细密自然，三足鼎立，造型古朴典雅。天青釉色如雨后初晴，意境深远，极具收藏价值。',
    price: 268000,
    images: [
      'img/ruyao/1.jpg',
      'img/ruyao/2.jpg',
      'img/ruyao/3.jpg'
    ]
  },
  {
    id: 4,
    name: '珐琅彩山水人物杯',
    description: '珐琅彩是清代宫廷御用瓷器，此杯以珐琅彩绘制山水人物图，色彩丰富艳丽，构图精妙，人物刻画细腻传神，展现了珐琅彩瓷的独特艺术魅力。',
    price: 156000,
    images: [
      'img/falangcai/1.jpg',
      'img/falangcai/2.jpg',
      'img/falangcai/3.jpg'
    ]
  },
  {
    id: 5,
    name: '定窑白釉刻花梅瓶',
    description: '定窑白瓷以其洁白细腻的釉色和精湛的刻花工艺闻名。此梅瓶造型挺拔，瓶身刻饰缠枝花卉纹样，线条流畅，刀工娴熟，是定窑瓷器中的珍品。',
    price: 98000,
    images: [
      'img/dingyao/1.jpg',
      'img/dingyao/2.jpg',
      'img/dingyao/3.jpg'
    ]
  },
  {
    id: 6,
    name: '慵懒熊猫',
    description: '小熊猫的懒懒，总是在这里休息。',
    price: 29999,
    images: [
      'img/panda/1.jpg',
      'img/panda/2.jpg',
      'img/panda/3.jpg'
    ]
  }
];

function formatPrice(price) {
  return price.toLocaleString('zh-CN');
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const dotsHtml = product.images.map((_, index) =>
      `<button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`
    ).join('');

    card.innerHTML = `
      <div class="carousel" data-product-id="${product.id}">
        <img class="carousel-image" src="${product.images[0]}" alt="${product.name}" data-index="0">
        <button class="carousel-btn prev" data-action="prev">&#10094;</button>
        <button class="carousel-btn next" data-action="next">&#10095;</button>
        <div class="carousel-nav">${dotsHtml}</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">${formatPrice(product.price)}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const productId = parseInt(carousel.dataset.productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const imageEl = carousel.querySelector('.carousel-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let currentIndex = 0;

    function updateImage(index) {
      currentIndex = index;
      if (currentIndex < 0) currentIndex = product.images.length - 1;
      if (currentIndex >= product.images.length) currentIndex = 0;

      imageEl.src = product.images[currentIndex];
      imageEl.dataset.index = currentIndex;

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    prevBtn.addEventListener('click', () => updateImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateImage(currentIndex + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateImage(index));
    });

    imageEl.addEventListener('click', () => {
      openLightbox(productId, currentIndex);
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentProductId = null;
  let currentImageIndex = 0;

  window.openLightbox = function (productId, imageIndex) {
    currentProductId = productId;
    currentImageIndex = imageIndex;
    const product = products.find(p => p.id === productId);
    if (product) {
      lightboxImage.src = product.images[currentImageIndex];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage(offset) {
    const product = products.find(p => p.id === currentProductId);
    if (!product) return;

    currentImageIndex += offset;
    if (currentImageIndex < 0) currentImageIndex = product.images.length - 1;
    if (currentImageIndex >= product.images.length) currentImageIndex = 0;

    lightboxImage.src = product.images[currentImageIndex];
  }

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  prevBtn.addEventListener('click', () => updateLightboxImage(-1));
  nextBtn.addEventListener('click', () => updateLightboxImage(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightboxImage(-1);
    if (e.key === 'ArrowRight') updateLightboxImage(1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initCarousels();
  initLightbox();
});
// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Gallery lightbox (property pages)
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var counter = lightbox.querySelector('.lightbox-counter');
    var galleryLinks = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
    var currentIndex = 0;

    function getFullSrc(link) {
      return link.getAttribute('data-full') || link.querySelector('img').src;
    }
    function getAlt(link) {
      var img = link.querySelector('img');
      return img ? img.alt : 'Foto ampliada do imóvel';
    }
    function showImage(index) {
      if (!galleryLinks.length) return;
      currentIndex = (index + galleryLinks.length) % galleryLinks.length;
      var link = galleryLinks[currentIndex];
      lightboxImg.src = getFullSrc(link);
      lightboxImg.alt = getAlt(link);
      if (counter) counter.textContent = (currentIndex + 1) + ' / ' + galleryLinks.length;
    }
    function openLightbox(index) {
      showImage(index);
      lightbox.classList.add('open');
    }
    function closeLightbox() { lightbox.classList.remove('open'); lightboxImg.src = ''; }

    galleryLinks.forEach(function (link, index) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(index);
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex + 1); });
    if (galleryLinks.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    });
  }
});


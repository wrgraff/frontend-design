'use strict';

(function () {
  /* touch detection */
  window.addEventListener('touchstart', function touched() {
    document.body.parentElement.classList.add('touch');
    window.removeEventListener('touchstart', touched, false);
  }, false);

  /* lazy loading and button controls */
  var gallery = document.querySelector('.portfolio__container');
  var slides = gallery.querySelectorAll('.portfolio__item');

  slides.forEach(slide => {
    const slideLink = slide.querySelector('.portfolio__link');
    slideLink.setAttribute('tabindex', '-1');
  });

  var observerSettings = {
    root: gallery
  };

  if ('IntersectionObserver' in window) {
    var scrollIt = function scrollIt(slideToShow) {
      const currentIndex = Array.prototype.indexOf.call(slides, slideToShow);
	  const gapsWidth = (slides.length - 1) * 32;
	  const slideWidth = (gallery.scrollWidth  - gapsWidth) / slides.length;
	  const gapsBeforeCurrentSlide = currentIndex * 32;
      var scrollPos = currentIndex * slideWidth + gapsBeforeCurrentSlide;
      gallery.scrollTo({
        left: scrollPos,
        behavior: 'smooth',
      });
    };

    var showSlide = function showSlide(dir, slides) {
      var visible = document.querySelectorAll('.portfolio__container .visible');
      var i = dir === 'previous' ? 0 : 1;

      if (visible.length > 1) {
        scrollIt(visible[i]);
      } else {
        var newSlide = i === 0 ? visible[0].previousElementSibling : visible[0].nextElementSibling;
        if (newSlide) {
          scrollIt(newSlide);
        }
      }
    };

    var callback = function callback(slides, observer) {
      Array.prototype.forEach.call(slides, function (entry) {
        entry.target.classList.remove('visible');
        var link = entry.target.querySelector('a');
        link.setAttribute('tabindex', '-1');
        if (!entry.intersectionRatio > 0) {
          return;
        }
        var img = entry.target.parentNode.querySelector('img');
        if (img.dataset.src) {
          img.setAttribute('src', img.dataset.src);
          img.removeAttribute('data-src');
        }
        entry.target.classList.add('visible');
        link.removeAttribute('tabindex', '-1');
      });
    };

    var observer = new IntersectionObserver(callback, observerSettings);
    Array.prototype.forEach.call(slides, function (t) {
      return observer.observe(t);
    });

    var controls = document.querySelector('.portfolio__nav');
    controls.removeAttribute('hidden');

    controls.addEventListener('click', function (e) {
      const direction = e.target.classList.contains('ico-button_previous') ? 'previous' : 'next';
      showSlide(direction, slides);
    });
  } else {
    Array.prototype.forEach.call(slides, function (s) {
      var img = s.querySelector('img');
      img.setAttribute('src', img.getAttribute('data-src'));
    });
  }
})();

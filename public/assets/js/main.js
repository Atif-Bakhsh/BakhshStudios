document.addEventListener('DOMContentLoaded', () => {
    "use strict";
  
    // Preloader
    const preloader = document.querySelector('#preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 1000);
            setTimeout(() => {
                preloader.remove();
            }, 2000);
        });
    }
  
    // Mobile nav toggle
    const mobileNavShow = document.querySelector('.mobile-nav-show');
    const mobileNavHide = document.querySelector('.mobile-nav-hide');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');
  
    if (mobileNavShow && mobileNavHide && mobileNavToggles.length > 0) {
      mobileNavToggles.forEach(el => {
          el.addEventListener('click', function(event) {
              event.preventDefault();
              mobileNavToogle();
          })
      });
  
      function mobileNavToogle() {
          document.querySelector('body').classList.toggle('mobile-nav-active');
          mobileNavShow.classList.toggle('d-none');
          mobileNavHide.classList.toggle('d-none');
      }
    }
  
    // Hide mobile nav on same-page/hash links
    document.querySelectorAll('#navbar a').forEach(navbarlink => {
        if (!navbarlink.hash) return;
        let section = document.querySelector(navbarlink.hash);
        if (!section) return;
  
        navbarlink.addEventListener('click', () => {
            if (document.querySelector('.mobile-nav-active')) {
                mobileNavToogle();
            }
        });
    });
  
    // Toggle mobile nav dropdowns
    const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');
    navDropdowns.forEach(el => {
        el.addEventListener('click', function(event) {
            if (document.querySelector('.mobile-nav-active')) {
                event.preventDefault();
                this.classList.toggle('active');
                this.nextElementSibling.classList.toggle('dropdown-active');
  
                let dropDownIndicator = this.querySelector('.dropdown-indicator');
                dropDownIndicator.classList.toggle('bi-chevron-up');
                dropDownIndicator.classList.toggle('bi-chevron-down');
            }
        })
    });
  
    // Scroll top button
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
        const togglescrollTop = function() {
            window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
        }
        window.addEventListener('load', togglescrollTop);
        document.addEventListener('scroll', togglescrollTop);
        scrollTop.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
  
    // Initiate glightbox
    const glightbox = GLightbox({ selector: '.glightbox' });

  // Init swiper slider with 1 slide at once in desktop view
  new Swiper('.slides-1', {
      speed: 600,
      loop: true,
      autoplay: {
          delay: 5000,
          disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true
      },
      navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
      }
  });

  // Init swiper slider with 3 slides at once in desktop view
  new Swiper('.slides-3', {
      speed: 600,
      loop: true,
      autoplay: {
          delay: 5000,
          disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true
      },
      navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
      },
      breakpoints: {
          320: {
              slidesPerView: 1,
              spaceBetween: 40
          },
          1200: {
              slidesPerView: 3,
          }
      }
  });

  // Animation on scroll function and init
  function aos_init() {
      AOS.init({
          duration: 1000,
          easing: 'ease-in-out',
          once: true,
          mirror: false
      });
  }
  window.addEventListener('load', () => {
      aos_init();
  });

  // Conditional event listeners for forms and other elements
//   // Booking form submission
//   const bookingForm = document.getElementById('bookingForm');
//   if (bookingForm) {
//     bookingForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//       const formData = {
//           serviceType: document.getElementById('serviceType').value,
//           date: document.getElementById('date').value,
//           time: document.getElementById('time').value,
//           location: document.getElementById('location').value,
//           notes: document.getElementById('notes').value
//       };

//       fetch('http://localhost:8080/bookings', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(formData)
//       })
//       .then(response => response.json())
//       .then(data => {
//           console.log(data);
//           // Handle response here (e.g., display a success message)
//       })
//       .catch(error => {
//           console.error('Error:', error);
//           // Handle error here (e.g., display an error message)
//       });
//     });
//   }

//   const clientForm = document.getElementById('clientForm');
//   if (clientForm) {
//     clientForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//       const formData = {
//           name: document.getElementById('name').value,
//           email: document.getElementById('email').value,
//           phone: document.getElementById('phone').value,
//           password: document.getElementById('password').value
//       };

//       fetch('http://localhost:8080/clients', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(formData)
//       })
//       .then(response => response.json())
//       .then(data => {
//           console.log(data);
//           // Handle response here (e.g., display a success message)
//       })
//       .catch(error => {
//           console.error('Error:', error);
//           // Handle error here (e.g., display an error message)
//       });
//     });
// }

    // Login form submission
//   const loginForm = document.getElementById('loginForm');
//   if (loginForm) {
//     loginForm.addEventListener('submit', function(event) {
//         event.preventDefault();

//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
  
//         fetch('http://localhost:8080/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email, password })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (response.ok) {
//                 localStorage.setItem('accessToken', data.accessToken);
//                 window.location.href = 'index.html'; // Redirect to index.html
//             } else {
//                 console.error('Login failed');
//                 // Display an error message to the user
//             }
//         })
//         .catch(error => console.error('Error:', error));
//     });
//   }

 
 // Load Profile button
 const loadProfileButton = document.getElementById('loadProfile');
 if (loadProfileButton) {
   loadProfileButton.addEventListener('click', fetchProfile);
 }

 // Function to fetch profile data
 async function fetchProfile() {
   // ... (fetch profile data logic) ...
   const token = localStorage.getItem('accessToken');
  const response = await fetch('/profile', {
      headers: {
          'Authorization': `Bearer ${token}`
      }
  });
  if (response.ok) {
      const data = await response.json();
      // Update UI with profile data
  } else {
      // Handle error (e.g., redirect to login page)
  }
 }

 
});

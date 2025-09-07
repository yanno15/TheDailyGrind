document.addEventListener("DOMContentLoaded", () => {
// loaded
// script.js - version robuste avec overlay centré
(function () {
  console.log('[loader] script chargé');

  const loader = document.querySelector('.loader');
  if (!loader) {
    console.warn('[loader] Élément .loader introuvable. Vérifie que <div class="loader"></div> existe.');
    return;
  }

  // Crée un overlay plein écran et y place le loader (styles inline pour être sûr)
  let overlay = document.getElementById('loader-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loader-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.92)', // tu peux mettre transparent si tu veux
      zIndex: '99999',
      transition: 'opacity 0.45s ease',
      opacity: '1'
    });
    // Insère l'overlay juste avant le loader puis déplace le loader dedans
    loader.parentNode && loader.parentNode.insertBefore(overlay, loader);
    overlay.appendChild(loader);
  }

  // Bloque le scroll pendant le loader
  const prevOverflowHtml = document.documentElement.style.overflow || '';
  const prevOverflowBody = document.body.style.overflow || '';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  function hideLoader() {
    console.log('[loader] démarrage de la disparition');
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      // restaure le overflow
      document.documentElement.style.overflow = prevOverflowHtml;
      document.body.style.overflow = prevOverflowBody;
      console.log('[loader] supprimé');
    }, 500); // attendre la transition
  }

  // Si la page est déjà complètement chargée
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 3000);
  } else {
    // cas normal : attendre window.load
    window.addEventListener('load', () => {
      setTimeout(hideLoader, 3000);
    });
    // fallback : au bout de 7s, on force la disparition pour éviter blocage si load ne se déclenche pas
    setTimeout(() => {
      if (document.getElementById('loader-overlay')) {
        console.warn('[loader] fallback : disparition forcée après timeout');
        hideLoader();
      }
    }, 7000);
  }
})();



// Je récupère les éléments du DOM par leurs id
const links = document.querySelectorAll(".nav-link");
const navbarContainer = document.getElementById("navbar-container");
const cartIconDesktop = document.getElementById("cart-icon-desktop");
const cartIconMobile = document.getElementById("cart-icon-mobile");
const cart = document.getElementById("cart");
const cartCountDesktop = document.getElementById("cart-count-desktop");
const cartCountMobile = document.getElementById("cart-count-mobile");
const categories = document.getElementsByClassName("animate__animated");

// Récupérer le panier depuis localStorage si existant
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Mettre à jour l’affichage dès le chargement
updateCartCount();
displayCartItems();

// Affiche le panier au clic sur l’icône
cartIconDesktop.addEventListener("click", () => {
  cart.classList.toggle("hidden");
  displayCartItems();
});
cartIconMobile.addEventListener("click", () => {
  cart.classList.toggle("hidden");
  displayCartItems();
});

// Ajout produit
function addProductToCart(product) {
  const existing = cartItems.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  updateCartCount();
  displayCartItems();
  saveCart(); // <-- Sauvegarde dans localStorage
}

// Suppression produit
function removeProductFromCart(productId) {
  cartItems = cartItems.filter((item) => item.id !== productId);
  updateCartCount();
  displayCartItems();
  saveCart(); // <-- Sauvegarde dans localStorage
}

// Fonction pour sauvegarder le panier dans localStorage
function saveCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Mise à jour du compteur
function updateCartCount() {
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCountDesktop.textContent = total;
  cartCountMobile.textContent = total;
}

// Affichage des articles du panier
function displayCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="text-gray-500">Votre panier est vide.</p>';
    return;
  }
  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
    const div = document.createElement("div");
    div.className =
      "flex justify-between items-center mb-4 p-2 bg-gray-100 rounded";
    div.innerHTML = `
      <span class="font-semibold">${item.name}</span>
      <span>x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
      <button class="text-red-500 ml-2" title="Supprimer" onclick="removeProductFromCart('${
        item.id
      }')">
          <i class="fa fa-trash"></i>
      </button>
    `;
    cartItemsContainer.appendChild(div);
  });
  // Affichage du total
  const totalDiv = document.createElement("div");
  totalDiv.className = "flex justify-end items-center mt-4 font-bold text-lg";
  totalDiv.innerHTML = `Total : $${totalPrice.toFixed(2)}`;
  cartItemsContainer.appendChild(totalDiv);
}

// Ajout des listeners sur les boutons
document.querySelectorAll(".ajouter-produit").forEach((btn) => {
  btn.addEventListener("click", function () {
    addProductToCart({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
    });
  });
});

// Effet de déplacement gauche-droite des product cards au scroll
const productCards = document.querySelectorAll(".group");
function animateCardsOnScroll() {
  productCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.style.transform = "translateX(0)";
      card.style.opacity = "1";
      card.style.transition =
        "transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.7s";
    } else {
      card.style.transform = "translateX(-80px)";
      card.style.opacity = "0";
    }
  });
  // Animation des catégories
  Array.from(categories).forEach((category) => {
    const rect = category.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      category.classList.add("animate__backInLeft");
    } else {
      category.classList.remove("animate__backInLeft");
    }
  });
}
window.addEventListener("scroll", animateCardsOnScroll);
window.addEventListener("load", animateCardsOnScroll);

// Initial styles
productCards.forEach((card) => {
  card.style.transform = "translateX(-80px)";
  card.style.opacity = "0";
});

// navbar qui se déplace légeremement vers le haut au scroll et se colle au top et change e couleur de Fond
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("bg-white", "shadow-lg");
    navbar.classList.remove("bg-transparent");
    for (let i = 0; i < links.length; i++) {
      links[i].classList.remove("text-white");
      links[i].classList.add("text-black");
    }
    //leger deplacement vers le haut
    navbarContainer.classList.add("translate-y-[-4px]");
  } else {
    navbar.classList.remove("bg-white", "shadow-lg");
    navbar.classList.add("bg-transparent");
    for (let i = 0; i < links.length; i++) {
      links[i].classList.remove("text-black");
      links[i].classList.add("text-white");
    }
  }
});

// Animation du curseur personnalisé
document.addEventListener("mousemove", function (e) {
  let cursor = document.getElementById("custom-cursor");
  if (!cursor) {
    cursor = document.createElement("div");
    cursor.id = "custom-cursor";
    cursor.style.position = "fixed";
    cursor.style.pointerEvents = "none";
    cursor.style.width = "24px";
    cursor.style.height = "24px";
    cursor.style.borderRadius = "50%";
    cursor.style.background = "rgba(74,44,42,0.2)";
    cursor.style.border = "2px solid #4A2C2A";
    cursor.style.zIndex = "9999";
    cursor.style.transition = "transform 0.1s ease";
    document.body.appendChild(cursor);
  }
  cursor.style.left = e.clientX - 12 + "px";
  cursor.style.top = e.clientY - 12 + "px";
  cursor.style.transform = "scale(1.1)";
  setTimeout(() => {
    cursor.style.transform = "scale(1)";
  }, 80);
});


const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const menuPanel = document.getElementById("menu-panel");
const closeMenu = document.getElementById("close-menu-panel");

// Ouvrir le menu
hamburger.addEventListener("click", () => {
  menu.classList.remove("hidden"); // afficher overlay
  setTimeout(() => {
    menuPanel.classList.remove("-translate-x-full"); // slide-in
  }, 10);
});

// Fermer le menu via le bouton close
closeMenu.addEventListener("click", () => {
  menuPanel.classList.add("-translate-x-full"); // slide-out
  menuPanel.classList.add("bg-transparent");
  setTimeout(() => {
    menu.classList.add("hidden"); // cacher overlay
  }, 300); // correspond à la durée transition
});

// Fermer le menu en cliquant en dehors du panel
menu.addEventListener("click", (e) => {
  if (e.target === menu) { // si clic sur overlay
    menuPanel.classList.add("-translate-x-full"); // slide-out
    setTimeout(() => {
      menu.classList.add("hidden"); // cacher overlay
    }, 300);
  }
});


// Carrousel des avis
const carouselInner = document.getElementById("carousel-inner");
const dots = document.querySelectorAll("#carousel-dots button");
let currentIndex = 0;
const avisCount = dots.length;

function showAvis(index) {
  carouselInner.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => {
    dot.style.opacity = i === index ? "0.7" : "0.3";
  });
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    currentIndex = i;
    showAvis(currentIndex);
  });
});

setInterval(() => {
  currentIndex = (currentIndex + 1) % avisCount;
  showAvis(currentIndex);
}, 4000);

showAvis(currentIndex);

});

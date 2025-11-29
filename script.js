// GLOBAL VARIABLES
let cart = JSON.parse(localStorage.getItem("myCart")) || [];

// INIT
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    if (document.getElementById("orderList")) loadOrder(); // Payment Page
    if (document.getElementById("reviewContainer")) loadReviews(); // Index Page
});

// --- CART FUNCTIONS ---
function addToCart(name, price, image, sizeElementId) {
    const selectedSize = document.getElementById(sizeElementId).value;
    let existingItem = cart.find((item) => item.name === name && item.size === selectedSize);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name: name, price: price, image: image, quantity: 1, size: selectedSize });
    }
    updateCartUI();
    openCart();
}

function updateCartUI() {
    const cartItemsEl = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const cartCountEl = document.getElementById("cartCount");
    
    if(!cartItemsEl) return; // Nếu không ở trang có sidebar thì bỏ qua

    cartItemsEl.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;
        cartItemsEl.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p style="font-size:13px;color:#555;">Size: <b>${item.size}</b></p>
                    <p>$${item.price} x ${item.quantity}</p>
                </div>
                <i class="fa-solid fa-trash remove-btn" onclick="removeItem(${index})"></i>
            </div>`;
    });

    if(cartTotalEl) cartTotalEl.innerText = total.toFixed(2);
    if(cartCountEl) cartCountEl.innerText = count;

    localStorage.setItem("myCart", JSON.stringify(cart));
    localStorage.setItem("cartTotal", total.toFixed(2));
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("active");
    document.getElementById("cartOverlay").classList.toggle("active");
}
function openCart() {
    document.getElementById("cartSidebar").classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");
}

// --- SEARCH FUNCTION ---
function searchProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].querySelector('h2').innerText.toLowerCase();
        cards[i].style.display = title.includes(input) ? "" : "none";
    }
}

// --- REVIEW FUNCTION ---
function handleReview(e) {
    e.preventDefault();
    const name = document.getElementById("reviewName").value;
    const rating = document.getElementById("reviewRating").value;
    const text = document.getElementById("reviewText").value;
    const newReview = { name: name, rating: parseInt(rating), text: text, avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
    
    let reviews = JSON.parse(localStorage.getItem("siteReviews")) || [];
    reviews.push(newReview);
    localStorage.setItem("siteReviews", JSON.stringify(reviews));
    
    document.getElementById("reviewName").value = "";
    document.getElementById("reviewText").value = "";
    alert("Thank you for your review!");
    loadReviews();
}

function loadReviews() {
    const container = document.getElementById("reviewContainer");
    if(!container) return;
    const reviews = JSON.parse(localStorage.getItem("siteReviews")) || [];
    // Remove old dynamic reviews
    document.querySelectorAll(".js-added-review").forEach(el => el.remove());

    reviews.forEach(review => {
        let starsHtml = "";
        for(let i=0; i<review.rating; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
        container.insertAdjacentHTML('beforeend', `
            <div class="review_card js-added-review">
                <div class="card_top">
                    <div class="profile"><div class="profile_image"><img src="${review.avatar}"></div>
                    <div class="name"><strong>${review.name}</strong><div class="like" style="color:orange;">${starsHtml}</div></div></div>
                </div>
                <div class="comment"><p>${review.text}</p></div>
            </div>`);
    });
}

// --- PAYMENT FUNCTION ---
function loadOrder() {
    const orderList = document.getElementById("orderList");
    const finalTotal = document.getElementById("finalTotal");
    const total = localStorage.getItem("cartTotal") || "0.00";

    if (cart.length === 0) {
        orderList.innerHTML = "<p style='text-align:center;'>Your cart is empty.</p>";
        finalTotal.innerText = "0.00";
        if(document.querySelector(".pay-btn")) document.querySelector(".pay-btn").disabled = true;
        return;
    }
    orderList.innerHTML = "";
    cart.forEach((item) => {
        orderList.innerHTML += `
        <div class="order-item">
            <div style="display:flex; align-items:center;">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-info"><h4>${item.name}</h4><p>Size: ${item.size}</p><p>Qty: ${item.quantity}</p></div>
            </div>
            <div class="order-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>`;
    });
    finalTotal.innerText = total;
}

function confirmOrder(e) {
    e.preventDefault();
    if (cart.length === 0) { alert("Cart is empty!"); return; }

    const customerInfo = {
        name: document.getElementById("cusName").value,
        phone: document.getElementById("cusPhone").value,
        address: document.getElementById("cusAddr").value,
        note: document.getElementById("cusNote").value,
        payment: document.getElementById("paymentMethod").value
    };

    const newOrder = {
        id: "#DH" + Math.floor(Math.random() * 1000000),
        customer: customerInfo,
        items: cart,
        total: localStorage.getItem("cartTotal"),
        date: new Date().toLocaleString(),
        status: "Pending"
    };

    let allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    allOrders.push(newOrder);
    localStorage.setItem("allOrders", JSON.stringify(allOrders));

    localStorage.removeItem("myCart");
    localStorage.removeItem("cartTotal");
    alert("Order Successful! ID: " + newOrder.id);
    window.location.href = "index.html";
}
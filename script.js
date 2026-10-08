const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const sidebar = $("#sidebar");
const overlay = $("#overlay");

$("#menuBtn").addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});
$("#closeMenu").addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);
$$(".side-link").forEach(a => a.addEventListener("click", closeMenu));

function closeMenu(){
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

let wallet = Number(localStorage.getItem("gsm_wallet") || 0);
let orders = JSON.parse(localStorage.getItem("gsm_orders") || "[]");

function updateWallet(){
  $("#walletBtn").textContent = `Wallet $${wallet.toFixed(2)}`;
}
updateWallet();

function saveOrders(){
  localStorage.setItem("gsm_orders", JSON.stringify(orders));
}

function renderOrders(){
  const body = $("#orderTable");
  if(!orders.length){
    body.innerHTML = '<tr><td colspan="4" class="empty">No orders yet. Select a service above.</td></tr>';
    return;
  }
  body.innerHTML = orders.slice().reverse().map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${escapeHtml(o.service)}</td>
      <td>$${o.price.toFixed(2)}</td>
      <td><span class="status">${o.status}</span></td>
    </tr>
  `).join("");
}
renderOrders();

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function toast(message){
  const t = $("#toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function openModal(content){
  $("#modalContent").innerHTML = content;
  $("#modal").classList.add("show");
}
function closeModal(){
  $("#modal").classList.remove("show");
}
$("#modalClose").addEventListener("click", closeModal);
$("#modal").addEventListener("click", e => {
  if(e.target.id === "modal") closeModal();
});

function loginModal(){
  openModal(`
    <h2>Login / Register</h2>
    <p>This demo stores data only in your browser. Connect Firebase or your backend for real accounts.</p>
    <form class="modal-form" id="loginForm">
      <input type="email" placeholder="Email address" required>
      <input type="password" placeholder="Password" required>
      <button>Continue</button>
    </form>
  `);
  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    closeModal();
    toast("Demo login successful");
  });
}
$("#loginBtn").addEventListener("click", loginModal);
$("#heroLogin").addEventListener("click", loginModal);

$("#walletBtn").addEventListener("click", () => {
  openModal(`
    <h2>Wallet</h2>
    <p>Your current demo balance is <strong>$${wallet.toFixed(2)}</strong>.</p>
    <form class="modal-form" id="walletForm">
      <input id="addAmount" type="number" min="1" step="0.01" placeholder="Amount to add" required>
      <button>Add Demo Balance</button>
    </form>
  `);
  $("#walletForm").addEventListener("submit", e => {
    e.preventDefault();
    const amount = Number($("#addAmount").value);
    if(amount <= 0) return;
    wallet += amount;
    localStorage.setItem("gsm_wallet", wallet);
    updateWallet();
    closeModal();
    toast(`$${amount.toFixed(2)} added to demo wallet`);
  });
});

$$(".order-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const service = btn.dataset.service;
    const price = Number(btn.dataset.price);

    openModal(`
      <h2>Place Order</h2>
      <p><strong>${escapeHtml(service)}</strong><br>Price: $${price.toFixed(2)}</p>
      <form class="modal-form" id="orderForm">
        <input id="deviceInfo" placeholder="Device / Order information" required>
        <textarea id="orderNote" rows="4" placeholder="Additional notes (optional)"></textarea>
        <button>Submit Order</button>
      </form>
    `);

    $("#orderForm").addEventListener("submit", e => {
      e.preventDefault();

      const order = {
        id: "GST-" + Date.now().toString().slice(-7),
        service,
        price,
        status: "Pending",
        device: $("#deviceInfo").value,
        note: $("#orderNote").value
      };

      orders.push(order);
      saveOrders();
      renderOrders();
      closeModal();
      toast(`Order ${order.id} created`);
      location.hash = "orders";
    });
  });
});

$("#supportBtn").addEventListener("click", () => {
  openModal(`
    <h2>Create Support Case</h2>
    <p>Describe your question or issue.</p>
    <form class="modal-form" id="supportForm">
      <input id="caseSubject" placeholder="Subject" maxlength="100" required>
      <textarea id="caseDescription" rows="6" placeholder="Description" maxlength="2500" required></textarea>
      <button>Create Case</button>
    </form>
  `);

  $("#supportForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = "CASE-" + Date.now().toString().slice(-7);
    closeModal();
    toast(`Support case ${id} created`);
  });
});

$("#serviceSearch").addEventListener("input", e => {
  const query = e.target.value.toLowerCase().trim();
  $$(".service-card").forEach(card => {
    card.style.display = card.dataset.name.includes(query) ? "" : "none";
  });
});

$("#year").textContent = new Date().getFullYear();

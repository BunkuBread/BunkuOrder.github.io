// --- Supabase Setup ---
const SUPABASE_URL = "https://bdwjptewxthnnafobnuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2pwdGV3eHRobm5hZm9ibnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODAzMTUsImV4cCI6MjA2NDY1NjMxNX0.z3r4pZEv27mPFkNfVkmKTHJ-S26gyCrgrbaH4dTcBSI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACTIVEPIECES_WEBHOOK_URL = "https://cloud.activepieces.com/api/v1/webhooks/xgfV2PId0kguctkoS27l2";

// --- DOM Elements ---
const orderTypeRadios = document.querySelectorAll('input[name="order_type"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const boxesInput = document.getElementById('boxesInput');
const boxesSelect = document.getElementById('boxesSelect');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const infoIcon = document.getElementById('infoIcon');
const phoneInput = document.getElementById('phoneInput');
const orderDateInput = document.getElementById('orderDate');
const moreSauceCheckbox = document.getElementById('moreSauce');
const urgentDeliveryDiv = document.getElementById('urgentDeliveryDiv');
const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
const cityInput = document.getElementById('cityInput');
const pickupTimeInput = document.getElementById('pickupTime');

// WhatsApp Modal Elements
const waModal = document.getElementById('whatsappModal');
const waTotal = document.getElementById('waTotal');
const waSendBtn = document.getElementById('waSendBtn');

let deliveryFee = 35;

// --- Phone Number Formatting and Validation ---
function formatPhoneNumber(value) {
  let digits = value.replace(/\D/g, '');
  if (!digits.startsWith('05') || digits.length !== 10) {
    return null;
  }
  return digits.slice(0,3) + ' ' + digits.slice(3,6) + '-' + digits.slice(6);
}
phoneInput.addEventListener('blur', () => {
  const formatted = formatPhoneNumber(phoneInput.value);
  if (formatted) {
    phoneInput.value = formatted;
    phoneInput.classList.remove('input-error');
  } else {
    phoneInput.classList.add('input-error');
  }
});

// --- Responsive Boxes Input ---
function populateBoxesDropdown() {
  boxesSelect.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} box${i > 1 ? 'es' : ''}`;
    boxesSelect.appendChild(option);
  }
}
populateBoxesDropdown();
boxesInput.addEventListener('input', () => {
  boxesSelect.value = boxesInput.value;
  updateTotal();
});
boxesSelect.addEventListener('change', () => {
  boxesInput.value = boxesSelect.value;
  updateTotal();
});

// --- FORM LOGIC ---
function updateFields() {
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  if (orderType === 'pickup') {
    pickupFields.style.display = 'block';
    deliveryFields.style.display = 'none';
    pickupTimeInput.required = true;
    document.getElementsByName('city')[0].required = false;
    document.getElementsByName('area')[0].required = false;
    document.getElementsByName('house_number')[0].required = false;
    document.getElementsByName('license_plate')[0].required = true;
    urgentDeliveryDiv.style.display = 'none';
  } else {
    pickupFields.style.display = 'none';
    deliveryFields.style.display = 'block';
    pickupTimeInput.required = false;
    document.getElementsByName('city')[0].required = true;
    document.getElementsByName('area')[0].required = true;
    document.getElementsByName('house_number')[0].required = true;
    document.getElementsByName('license_plate')[0].required = false;
    urgentDeliveryDiv.style.display = 'none';
  }
  updateTotal();
}
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
updateFields();

// --- INFO ICON TOOLTIP ---
const tooltip = document.createElement('div');
tooltip.className = 'info-tooltip';
tooltip.textContent = 'Each box contains 4 pieces of bread.';
infoIcon.addEventListener('mouseenter', () => {
  const rect = infoIcon.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
  tooltip.style.display = 'block';
  document.body.appendChild(tooltip);
});
infoIcon.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
  if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
});

// --- Price Calculation ---
function updateTotal() {
  let boxes = parseInt(boxesInput.value, 10) || 1;
  if (boxes < 1) boxes = 1;
  if (boxes > 30) boxes = 30;
  boxesInput.value = boxes;
  boxesSelect.value = boxes;
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  const moreSauce = moreSauceCheckbox.checked;
  let total = boxes * 50;
  if (orderType === 'delivery') total += deliveryFee;
  if (moreSauce) total += 5;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '') +
    (moreSauce ? `<br><span class="fee-note">Includes 5 AED for extra sauce</span>` : '');
}
moreSauceCheckbox.addEventListener('change', updateTotal);

// --- Urgent Delivery Logic (not used for post-9am logic, kept for future) ---
orderDateInput.addEventListener('change', checkUrgentDelivery);
cityInput.addEventListener('blur', checkUrgentDelivery);
function checkUrgentDelivery() {
  urgentDeliveryDiv.style.display = 'none';
  urgentDeliveryCheckbox.checked = false;
  urgentDeliveryCheckbox.required = false;
}

// --- ORDER FORM SUBMISSION & WHATSAPP MODAL ---
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  let orderData = {};

  // --- Multi-product: collect all checked products as array ---
  formData.forEach((v, k) => {
    if (k === 'product_type') {
      if (!orderData[k]) orderData[k] = [];
      orderData[k].push(v);
    } else {
      orderData[k] = v;
    }
  });

  // Require at least one product
  if (!orderData['product_type'] || orderData['product_type'].length === 0) {
    alert("Please select at least one product.");
    return false;
  }

  let orderType = orderData['order_type'] || 'pickup';
  let city = (orderData['city'] || '').trim().toLowerCase();
  let selectedDate = new Date(orderData['date']);
  let now = new Date();
  let today = new Date();
  today.setHours(0,0,0,0);
  selectedDate.setHours(0,0,0,0);
  let isToday = selectedDate.getTime() === today.getTime();

  // === If delivery order placed after 9am for today, set to tomorrow ===
  if (orderType === 'delivery' && isToday && now.getHours() >= 9) {
    alert("Since your order was placed after 9 AM, your delivery will be sent out the next day.");
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    orderData['date'] = `${yyyy}-${mm}-${dd}`;
    orderDateInput.value = orderData['date'];
    selectedDate = new Date(orderData['date']);
    isToday = false;
  }

  // Pickup time required for pickup
  if (orderType === 'pickup' && !orderData['pickup_time']) {
    alert("Please enter your preferred pickup time.");
    return false;
  }

  // More sauce
  orderData['more_sauce'] = moreSauceCheckbox.checked ? true : false;

  // Calculate total
  let boxes = parseInt(orderData['boxes'], 10) || 1;
  let total = boxes * 50;
  if (orderType === 'delivery') total += deliveryFee;
  if (orderData['more_sauce']) total += 5;

  orderData['total'] = total;

  // Store product_type as comma-separated string for Supabase (or use array if your DB supports it)
  if (Array.isArray(orderData['product_type'])) {
    orderData['product_type'] = orderData['product_type'].join(',');
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData]);
  if (error) {
    alert('Sorry, there was an error placing your order. Please try again.');
    console.error(error);
    return false;
  }

  // Send to Activepieces
  try {
    await fetch(ACTIVEPIECES_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ...orderData,
        total: total
      })
    });
  } catch (err) {
    console.error('Failed to send to Activepieces:', err);
  }

  // WhatsApp modal
  waTotal.textContent = total;
  waModal.classList.add('show');
  waModal.setAttribute('aria-hidden', 'false');

  waSendBtn.onclick = () => {
    // Build product name(s) for WhatsApp
    let productNames = [];
    if (orderData['product_type']) {
      const arr = orderData['product_type'].split(',');
      if (arr.includes('og_bunku')) productNames.push('OG Bunku');
      if (arr.includes('zaatar_bomb')) productNames.push('Zaatar Bomb');
    }

    let msg = `Hello! I just placed an order on the Bunku Bread website.\n\n`;
    msg += `Name: ${orderData['first_name'] || ''} ${orderData['last_name'] || ''}\n`;
    msg += `Phone: ${orderData['phone'] || ''}\n`;
    msg += `Order Type: ${orderType}\n`;
    if(orderType === 'delivery') {
      msg += `City: ${orderData['city'] || ''}\nArea: ${orderData['area'] || ''}\nHouse Number: ${orderData['house_number'] || ''}\n`;
    } else {
      msg += `Car License Plate: ${orderData['license_plate'] || ''}\nPickup Time: ${orderData['pickup_time'] || ''}\n`;
    }
    msg += `Product(s): ${productNames.join(' & ')}\n`;
    msg += `Boxes: ${boxes}\n`;
    msg += `Extra Sauce: ${orderData['more_sauce'] ? 'Yes' : 'No'}\n`;
    msg += `Special Instructions: ${orderData['special'] || ''}\n`;
    msg += `Date: ${orderData['date'] || ''}\n`;
    msg += `Total: ${total} AED\n\n`;
    msg += `Please find my order details above.\n\n`;

    const waUrl = `https://wa.me/971544588113?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    waModal.classList.remove('show');
    waModal.setAttribute('aria-hidden', 'true');
    document.getElementById('orderForm').reset();
    updateTotal();
  };
});

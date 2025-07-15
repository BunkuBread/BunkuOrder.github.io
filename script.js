// --- Supabase Setup ---
const SUPABASE_URL = "https://bdwjptewxthnnafobnuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2pwdGV3eHRobm5hZm9ibnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODAzMTUsImV4cCI6MjA2NDY1NjMxNX0.z3r4pZEv27mPFkNfVkmKTHJ-S26gyCrgrbaH4dTcBSI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACTIVEPIECES_WEBHOOK_URL = "https://cloud.activepieces.com/api/v1/webhooks/xgfV2PId0kguctkoS27l2";

// --- DOM Elements ---
const orderTypeRadios = document.querySelectorAll('input[name="order_type"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const phoneInput = document.getElementById('phoneInput');
const orderDateInput = document.getElementById('orderDate');
const moreSauceCheckbox = document.getElementById('moreSauce');
const urgentDeliveryDiv = document.getElementById('urgentDeliveryDiv');
const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
const cityInput = document.getElementById('cityInput');
const pickupTimeInput = document.getElementById('pickupTime');
const zaatarBombBoxesInput = document.getElementById('zaatarBombBoxes');
const ogBunkuBoxesInput = document.getElementById('ogBunkuBoxes');

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

// --- Price Calculation ---
function updateTotal() {
  const zaatarBombBoxes = parseInt(zaatarBombBoxesInput.value, 10) || 0;
  const ogBunkuBoxes = parseInt(ogBunkuBoxesInput.value, 10) || 0;
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  const moreSauce = moreSauceCheckbox.checked;
  let total = (zaatarBombBoxes + ogBunkuBoxes) * 50;
  if (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes) > 0) total += deliveryFee;
  if (moreSauce) total += 5;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes) > 0 ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '') +
    (moreSauce ? `<br><span class="fee-note">Includes 5 AED for extra sauce</span>` : '');
}
zaatarBombBoxesInput.addEventListener('input', updateTotal);
ogBunkuBoxesInput.addEventListener('input', updateTotal);
moreSauceCheckbox.addEventListener('change', updateTotal);

// --- Urgent Delivery Logic ---
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
  formData.forEach((v, k) => orderData[k] = v);

  const zaatarBombBoxes = parseInt(zaatarBombBoxesInput.value, 10) || 0;
  const ogBunkuBoxes = parseInt(ogBunkuBoxesInput.value, 10) || 0;

  if (zaatarBombBoxes + ogBunkuBoxes === 0) {
    alert("Please order at least one box of bread.");
    return false;
  }

  const orderType = orderData['order_type'] || 'pickup';
  let now = new Date();
  let selectedDate = new Date(orderData['date']);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  let isToday = selectedDate.getTime() === today.getTime();

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

  if (orderType === 'pickup' && !orderData['pickup_time']) {
    alert("Please enter your preferred pickup time.");
    return false;
  }

  // ✅ >>> FIX: Replace empty string with null for pickup_time
  if (orderData['pickup_time'] === '') {
    orderData['pickup_time'] = null;
  }

  orderData['more_sauce'] = moreSauceCheckbox.checked ? true : false;
  orderData['zaatar_bomb_boxes'] = zaatarBombBoxes;
  orderData['og_bunku_boxes'] = ogBunkuBoxes;

  let total = (zaatarBombBoxes + ogBunkuBoxes) * 50;
  if (orderType === 'delivery') total += deliveryFee;
  if (orderData['more_sauce']) total += 5;
  orderData['total'] = total;

  const { data, error } = await supabase.from('orders').insert([orderData]);
  if (error) {
    alert('Supabase error: ' + error.message);
    console.error(error);
    return false;
  }

  try {
    await fetch(ACTIVEPIECES_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...orderData})
    });
  } catch (err) {
    console.error('Failed to send to Activepieces:', err);
  }

  waTotal.textContent = total;
  waModal.classList.add('show');
  waModal.setAttribute('aria-hidden', 'false');

  waSendBtn.onclick = () => {
    let msg = `Hello! I just placed an order on the Bunku Bread website.\n\n`;
    msg += `Name: ${orderData['first_name'] || ''} ${orderData['last_name'] || ''}\n`;
    msg += `Phone: ${orderData['phone'] || ''}\n`;
    msg += `Order Type: ${orderType}\n`;
    if(orderType === 'delivery') {
      msg += `City: ${orderData['city'] || ''}\nArea: ${orderData['area'] || ''}\nHouse Number: ${orderData['house_number'] || ''}\n`;
    } else {
      msg += `Car License Plate: ${orderData['license_plate'] || ''}\nPickup Time: ${orderData['pickup_time'] || ''}\n`;
    }
    msg += `Product(s):\n`;
    msg += `- Zaatar Bomb: ${zaatarBombBoxes} box(es)\n`;
    msg += `- OG Bunku: ${ogBunkuBoxes} box(es)\n`;
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

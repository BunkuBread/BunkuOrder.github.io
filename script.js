// --- Supabase Setup ---
const SUPABASE_URL = "https://bdwjptewxthnnafobnuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2pwdGV3eHRobm5hZm9ibnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODAzMTUsImV4cCI6MjA2NDY1NjMxNX0.z3r4pZEv27mPFkNfVkmKTHJ-S26gyCrgrbaH4dTcBSI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

let deliveryFee = 35;

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
    document.getElementsByName('city')[0].required = false;
    document.getElementsByName('location')[0].required = false;
    document.getElementsByName('street')[0].required = false;
    document.getElementsByName('villa')[0].required = false;
    document.getElementsByName('license_plate')[0].required = true;
  } else {
    pickupFields.style.display = 'none';
    deliveryFields.style.display = 'block';
    document.getElementsByName('city')[0].required = true;
    document.getElementsByName('location')[0].required = true;
    document.getElementsByName('street')[0].required = true;
    document.getElementsByName('villa')[0].required = true;
    document.getElementsByName('license_plate')[0].required = false;
  }
  updateTotal();
}

function updateTotal() {
  let boxes = parseInt(boxesInput.value, 10) || 1;
  if (boxes < 1) boxes = 1;
  if (boxes > 30) boxes = 30;
  boxesInput.value = boxes;
  boxesSelect.value = boxes;
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  let total = boxes * 50;
  if (orderType === 'delivery') total += deliveryFee;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '');
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

// --- MULTI-STEP FORM LOGIC ---
let orderData = {};

document.getElementById('nextToPayment').addEventListener('click', function() {
  const orderForm = document.getElementById('orderForm');
  if (orderForm.checkValidity()) {
    // Gather all order form data
    const formData = new FormData(orderForm);
    formData.forEach((v, k) => orderData[k] = v);
    // Hide order, show payment
    orderForm.style.display = 'none';
    document.getElementById('paymentForm').style.display = 'flex';
    window.scrollTo({top: 0, behavior: 'smooth'});
  } else {
    orderForm.reportValidity();
  }
});

document.getElementById('paymentForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const paymentData = new FormData(this);
  paymentData.forEach((v, k) => orderData[k] = v);

  // Insert into Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData]);

  if (error) {
    alert('Sorry, there was an error placing your order. Please try again.');
    console.error(error);
    return false;
  }

  alert('Order submitted! We will contact you soon.');
  this.reset();
  // Optionally redirect or reset forms here
  document.getElementById('paymentForm').style.display = 'none';
  document.getElementById('orderForm').style.display = 'flex';
});

// --- OPTIONAL: Add your map/modal and phone validation logic here as before ---

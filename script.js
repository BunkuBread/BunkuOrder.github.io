const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const boxesInput = document.getElementById('boxesInput');
const boxesSelect = document.getElementById('boxesSelect');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const mapModal = document.getElementById('mapModal');
const closeMapModal = document.getElementById('closeMapModal');
const confirmLocation = document.getElementById('confirmLocation');
const locationInput = document.getElementById('locationInput');
const infoIcon = document.getElementById('infoIcon');
const cityInput = document.getElementById('cityInput');
const streetInput = document.getElementById('streetInput');
const locateMeBtn = document.getElementById('locateMeBtn');
const phoneInput = document.getElementById('phoneInput');

let deliveryFee = 35;
let map, marker;

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
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  if (orderType === 'pickup') {
    pickupFields.style.display = 'block';
    deliveryFields.style.display = 'none';
    document.getElementsByName('city')[0].required = false;
    document.getElementsByName('location')[0].required = false;
    document.getElementsByName('street')[0].required = false;
    document.getElementsByName('villa')[0].required = false;
    document.getElementsByName('licensePlate')[0].required = true;
  } else {
    pickupFields.style.display = 'none';
    deliveryFields.style.display = 'block';
    document.getElementsByName('city')[0].required = true;
    document.getElementsByName('location')[0].required = true;
    document.getElementsByName('street')[0].required = true;
    document.getElementsByName('villa')[0].required = true;
    document.getElementsByName('licensePlate')[0].required = false;
  }
  updateTotal();
}
function updateTotal() {
  let boxes = parseInt(boxesInput.value, 10) || 1;
  if (boxes < 1) boxes = 1;
  if (boxes > 30) boxes = 30;
  boxesInput.value = boxes;
  boxesSelect.value = boxes;
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  let total = boxes * 50;
  if (orderType === 'delivery') total += deliveryFee;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '');
}
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
updateFields();

// --- MAP LOGIC ---
// (Same as before, unchanged, omitted for brevity. Use the previous working map code.)

// --- INFO ICON TOOLTIP ---
let infoTooltip;
infoIcon.addEventListener('click', (e) => {
  e.preventDefault();
  if (infoTooltip) {
    infoTooltip.remove();
    infoTooltip = null;
    return;
  }
  infoTooltip = document.createElement('div');
  infoTooltip.className = 'info-tooltip';
  infoTooltip.textContent = 'Each box contains 4 pieces of bread.';
  document.body.appendChild(infoTooltip);
  const rect = infoIcon.getBoundingClientRect();
  infoTooltip.style.position = 'absolute';
  infoTooltip.style.left = rect.left + window.scrollX + rect.width / 2 + 'px';
  infoTooltip.style.top = rect.bottom + window.scrollY + 6 + 'px';
  infoTooltip.style.display = 'block';
});
document.addEventListener('click', (e) => {
  if (
    infoTooltip &&
    !infoIcon.contains(e.target) &&
    !infoTooltip.contains(e.target)
  ) {
    infoTooltip.remove();
    infoTooltip = null;
  }
});
infoIcon.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    infoIcon.click();
  }
});

// --- PHONE VALIDATION (no masking) ---
phoneInput.addEventListener('blur', function() {
  if (phoneInput.value && !/^05\d \d{3}-\d{4}$/.test(phoneInput.value)) {
    phoneInput.classList.add('input-error');
  } else {
    phoneInput.classList.remove('input-error');
  }
});

// --- FORM VALIDATION ---
document.getElementById('orderForm').addEventListener('submit', function(e) {
  let errors = [];
  // Phone validation: 05X XXX-XXXX
  const phoneVal = phoneInput.value.trim();
  if (!/^05\d \d{3}-\d{4}$/.test(phoneVal)) {
    errors.push('Phone number must be in the format 05X 123-4567');
    phoneInput.classList.add('input-error');
  } else {
    phoneInput.classList.remove('input-error');
  }
  // Boxes validation
  let boxes = parseInt(boxesInput.value, 10);
  if (isNaN(boxes) || boxes < 1 || boxes > 30) {
    errors.push('Please select a valid number of boxes.');
    boxesInput.classList.add('input-error');
    boxesSelect.classList.add('input-error');
  } else {
    boxesInput.classList.remove('input-error');
    boxesSelect.classList.remove('input-error');
  }
  // Required fields
  const requiredFields = document.querySelectorAll('#orderForm [required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      errors.push('Please fill all required fields.');
      field.classList.add('input-error');
    } else {
      field.classList.remove('input-error');
    }
  });
  if (errors.length > 0) {
    e.preventDefault();
    alert(errors[0]);
    return false;
  }
  // Success!
  e.preventDefault();
  alert('Order submitted! (Connect to your backend or Supabase to process.)');
});

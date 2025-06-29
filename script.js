// --- Supabase Setup ---
const SUPABASE_URL = "https://bdwjptewxthnnafobnuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2pwdGV3eHRobm5hZm9ibnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODAzMTUsImV4cCI6MjA2NDY1NjMxNX0.z3r4pZEv27mPFkNfVkmKTHJ-S26gyCrgrbaH4dTcBSI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Activepieces Webhook URL ---
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
const locationInput = document.getElementById('locationInput');
const locateMeBtn = document.getElementById('locateMeBtn');
const mapModal = document.getElementById('mapModal');
const closeMapModal = document.getElementById('closeMapModal');
const confirmLocation = document.getElementById('confirmLocation');
const mapDiv = document.getElementById('map');

// --- WhatsApp Modal Elements ---
const waModal = document.getElementById('whatsappModal');
const waTotal = document.getElementById('waTotal');
const waSendBtn = document.getElementById('waSendBtn');

let deliveryFee = 35;
let map = null;
let marker = null;

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

// --- MAP LOGIC ---
locationInput && locationInput.addEventListener('click', () => {
  openMapModal();
});

function openMapModal() {
  mapModal.style.display = 'block';
  setTimeout(() => {
    mapModal.setAttribute('aria-hidden', 'false');
    mapDiv.innerHTML = '';
    let lat = 25.276987, lng = 55.296249;
    if (locationInput.value) {
      const parts = locationInput.value.split(',');
      if (parts.length === 2) {
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      }
    }
    initMap(lat, lng);
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
  }, 10);
}

function closeMapModalFn() {
  mapModal.style.display = 'none';
  mapModal.setAttribute('aria-hidden', 'true');
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
  mapDiv.innerHTML = '';
}
closeMapModal && closeMapModal.addEventListener('click', closeMapModalFn);

window.addEventListener('click', function(e) {
  if (e.target === mapModal) {
    closeMapModalFn();
  }
});

function initMap(lat = 25.276987, lng = 55.296249) {
  mapDiv.innerHTML = '';
  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([lat, lng], {draggable: true}).addTo(map);

  locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  confirmLocation.disabled = false;

  marker.on('dragend', function(e) {
    const newPos = marker.getLatLng();
    locationInput.value = `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`;
    confirmLocation.disabled = false;
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    locationInput.value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
    confirmLocation.disabled = false;
  });

  setTimeout(() => map.invalidateSize(), 200);
}

confirmLocation && confirmLocation.addEventListener('click', () => {
  closeMapModalFn();
});

locateMeBtn && locateMeBtn.addEventListener('click', function() {
  openMapModal();

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setTimeout(() => {
        if (map && marker) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
          locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          confirmLocation.disabled = false;
        }
      }, 200);
    },
    (error) => {
      alert("Unable to get your location. Using default.");
    }
  );
});

// --- ORDER FORM SUBMISSION & WHATSAPP MODAL ---
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Gather order data
  const formData = new FormData(this);
  let orderData = {};
  formData.forEach((v, k) => orderData[k] = v);

  // Calculate total
  let boxes = parseInt(orderData['boxes'], 10) || 1;
  let orderType = orderData['order_type'] || 'pickup';
  let total = boxes * 50;
  if (orderType === 'delivery') total += 35;

  // Save to Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData]);
  if (error) {
    alert('Sorry, there was an error placing your order. Please try again.');
    console.error(error);
    return false;
  }

  // --- SEND TO ACTIVEPIECES ---
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
    // Optionally alert the user or continue anyway
  }

  // Show WhatsApp modal
  waTotal.textContent = total;
  waModal.classList.add('show');
  waModal.setAttribute('aria-hidden', 'false');

  // WhatsApp message
  waSendBtn.onclick = () => {
    // Build message
    let msg = `Hello! I just placed an order on the Bunku Bread website.%0A%0A`;
    msg += `Name: ${orderData['first_name'] || ''} ${orderData['last_name'] || ''}%0A`;
    msg += `Phone: ${orderData['phone'] || ''}%0A`;
    msg += `Order Type: ${orderType}%0A`;
    if(orderType === 'delivery') {
      msg += `City: ${orderData['city'] || ''}%0AStreet: ${orderData['street'] || ''}%0AVilla/Apartment: ${orderData['villa'] || ''}%0A`;
      msg += `Location: ${orderData['location'] || ''}%0A`;
    } else {
      msg += `Car License Plate: ${orderData['license_plate'] || ''}%0A`;
    }
    msg += `Boxes: ${boxes}%0A`;
    msg += `Special Instructions: ${orderData['special'] || ''}%0A`;
    msg += `Date: ${orderData['date'] || ''}%0A`;
    msg += `Total: ${total} AED%0A%0A`;
    msg += `Please find my order details above.%0A%0A`;

    // WhatsApp redirect
    const waUrl = `https://wa.me/971544588113?text=${msg}`;
    window.open(waUrl, '_blank');

    // Hide modal and reset form
    waModal.classList.remove('show');
    waModal.setAttribute('aria-hidden', 'true');
    document.getElementById('orderForm').reset();
    updateTotal();
  };
});

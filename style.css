// --- Supabase Setup ---
const SUPABASE_URL = "https://bdwjptewxthnnafobnuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2pwdGV3eHRobm5hZm9ibnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODAzMTUsImV4cCI6MjA2NDY1NjMxNX0.z3r4pZEv27mPFkNfVkmKTHJ-S26gyCrgrbaH4dTcBSI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
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
// Open map modal on input click
locationInput.addEventListener('click', () => {
  openMapModal();
});

function openMapModal() {
  mapModal.style.display = 'block';
  setTimeout(() => {
    mapModal.setAttribute('aria-hidden', 'false');
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
      map.invalidateSize();
    }, 100);
  }, 10);
}

function closeMapModalFn() {
  mapModal.style.display = 'none';
  mapModal.setAttribute('aria-hidden', 'true');
  if (map) map.remove();
}
closeMapModal.addEventListener('click', closeMapModalFn);

window.addEventListener('click', function(e) {
  if (e.target === mapModal) {
    closeMapModalFn();
  }
});

function initMap(lat = 25.276987, lng = 55.296249) {
  if (map) map.remove();
  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (marker) map.removeLayer(marker);
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

confirmLocation.addEventListener('click', () => {
  closeMapModalFn();
});

// "Locate Me" button
locateMeBtn.addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      openMapModal();
      setTimeout(() => {
        initMap(position.coords.latitude, position.coords.longitude);
        locationInput.value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      }, 100);
    },
    (error) => {
      alert("Unable to get your location. Using default.");
      openMapModal();
    }
  );
});

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

// --- FORM VALIDATION & SUPABASE SUBMIT ---
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  let errors = [];
  
  // Phone validation
  let phoneVal = phoneInput.value.trim();
  let formatted = formatPhoneNumber(phoneVal);
  if (!formatted) {
    errors.push('Phone number must start with 05 and be 10 digits, e.g. 056 399-6650');
    phoneInput.classList.add('input-error');
  } else {
    phoneInput.value = formatted;
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
    alert(errors[0]);
    return false;
  }

  // Gather form data
  const formData = new FormData(this);
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  let boxesCount = Number(formData.get('boxes'));
  let total = boxesCount * 50;
  if (orderType === 'delivery') total += 35;

  const orderData = {
    first_name: formData.get('firstName'),
    last_name: formData.get('lastName'),
    phone: formData.get('phone'),
    order_type: orderType,
    boxes: boxesCount,
    license_plate: formData.get('licensePlate'),
    city: formData.get('city'),
    street: formData.get('street'),
    villa: formData.get('villa'),
    location: formData.get('location'),
    special: formData.get('special'),
    total: total
  };

  // Send to Supabase
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
});

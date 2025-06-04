// Elements
const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const boxesInput = document.getElementById('boxes');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const mapModal = document.getElementById('mapModal');
const openMapBtn = document.getElementById('openMapBtn');
const closeMapModal = document.getElementById('closeMapModal');
const confirmLocation = document.getElementById('confirmLocation');
const locationInput = document.getElementById('locationInput');

let deliveryFee = 35;
let map, marker;

// Show/hide fields based on order type
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

// Update total price
function updateTotal() {
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  let boxes = parseInt(boxesInput.value, 10) || 1;
  if (boxes < 1) boxes = 1;
  if (boxes > 30) boxes = 30;
  boxesInput.value = boxes;
  let total = boxes * 50;
  if (orderType === 'delivery') total += deliveryFee;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '');
}

// Initialize Leaflet map and marker
function initMap() {
  if (map) return; // already initialized

  // Center map on Dubai by default
  map = L.map('map').setView([25.276987, 55.296249], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  marker = L.marker([25.276987, 55.296249], {
    draggable: true,
  }).addTo(map);

  marker.on('dragend', function () {
    const pos = marker.getLatLng();
    locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
  });

  // If locationInput already has a value, set marker there
  if (locationInput.value) {
    const coords = parseCoordsFromUrl(locationInput.value);
    if (coords) {
      marker.setLatLng(coords);
      map.setView(coords, 15);
    }
  }
}

// Parse coordinates from Google Maps URL
function parseCoordsFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get('q');
    if (!q) return null;
    const parts = q.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

// Open modal and initialize map
openMapBtn.addEventListener('click', () => {
  mapModal.style.display = 'block';
  setTimeout(initMap, 100);
});

// Close modal
closeMapModal.addEventListener('click', () => {
  mapModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === mapModal) {
    mapModal.style.display = 'none';
  }
});

// Confirm location button
confirmLocation.addEventListener('click', () => {
  if (!marker) return;
  const pos = marker.getLatLng();
  locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
  mapModal.style.display = 'none';
});

// Form logic
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
boxesInput.addEventListener('input', updateTotal);

updateFields();

// Prevent form submission (demo)
document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Order submitted! (Connect to your backend or Supabase to process.)');
});

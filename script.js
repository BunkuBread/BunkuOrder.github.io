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
const infoIcon = document.getElementById('infoIcon');

let deliveryFee = 35;
let map, marker;

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

// Map logic
function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
}

function initMap() {
  destroyMap();
  // Center on Dubai
  map = L.map('map').setView([25.276987, 55.296249], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Place marker if a location is already chosen
  let initialLatLng = [25.276987, 55.296249];
  if (locationInput.value) {
    const coords = parseCoordsFromUrl(locationInput.value);
    if (coords) initialLatLng = coords;
  }

  marker = L.marker(initialLatLng, { draggable: true }).addTo(map);

  // Update input when marker is dragged
  marker.on('dragend', function () {
    const pos = marker.getLatLng();
    locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
  });

  // Update marker and input when map is clicked
  map.on('click', function (e) {
    marker.setLatLng(e.latlng);
    locationInput.value = `https://maps.google.com/?q=${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
  });

  // Set input value on open
  locationInput.value = `https://maps.google.com/?q=${initialLatLng[0].toFixed(6)},${initialLatLng[1].toFixed(6)}`;
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

// Modal logic
openMapBtn.addEventListener('click', () => {
  mapModal.style.display = 'block';
  setTimeout(() => {
    initMap();
    map.invalidateSize();
  }, 150);
});
closeMapModal.addEventListener('click', () => {
  mapModal.style.display = 'none';
  destroyMap();
});
window.addEventListener('click', (e) => {
  if (e.target === mapModal) {
    mapModal.style.display = 'none';
    destroyMap();
  }
});
confirmLocation.addEventListener('click', () => {
  if (!marker) return;
  const pos = marker.getLatLng();
  locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
  mapModal.style.display = 'none';
  destroyMap();
});

// Info icon tooltip (click to show, click away to hide)
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

// Form logic
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
boxesInput.addEventListener('input', updateTotal);

updateFields();

document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Order submitted! (Connect to your backend or Supabase to process.)');
});

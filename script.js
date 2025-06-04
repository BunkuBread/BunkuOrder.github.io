const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const boxesInput = document.getElementById('boxes');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const mapModal = document.getElementById('mapModal');
const closeMapModal = document.getElementById('closeMapModal');
const confirmLocation = document.getElementById('confirmLocation');
const locationInput = document.getElementById('locationInput');
const infoIcon = document.getElementById('infoIcon');
const cityInput = document.getElementById('cityInput');
const streetInput = document.getElementById('streetInput');

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

// --------- MAP LOGIC ---------
function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
}

function geocodeAndOpenMap() {
  // 1. Try to get city/street from input
  const city = cityInput.value.trim();
  const street = streetInput.value.trim();
  let query = '';
  if (city && street) {
    query = encodeURIComponent(`${street}, ${city}, UAE`);
  } else if (city) {
    query = encodeURIComponent(`${city}, UAE`);
  }

  // 2. Show modal and initialize map after a short delay
  mapModal.style.display = 'block';
  confirmLocation.disabled = true;
  setTimeout(() => {
    destroyMap();
    // Default to Dubai
    let center = [25.276987, 55.296249];
    let zoom = 12;

    if (query) {
      // Use Nominatim to geocode
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            center = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            zoom = 15;
          }
        })
        .catch(() => {})
        .finally(() => {
          showMap(center, zoom);
        });
    } else {
      showMap(center, zoom);
    }
  }, 150);
}

function showMap(center, zoom) {
  map = L.map('map').setView(center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // No marker by default!
  marker = null;
  confirmLocation.disabled = true;

  // Place/move marker on click
  map.on('click', function (e) {
    if (!marker) {
      marker = L.marker(e.latlng, { draggable: true }).addTo(map);
      confirmLocation.disabled = false;
      marker.on('dragend', function () {
        const pos = marker.getLatLng();
        locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
      });
    } else {
      marker.setLatLng(e.latlng);
    }
    const pos = marker.getLatLng();
    locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
  });
}

// Modal logic
locationInput.addEventListener('click', geocodeAndOpenMap);
locationInput.addEventListener('focus', geocodeAndOpenMap);

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

// --------- INFO ICON TOOLTIP ---------
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

// --------- FORM LOGIC ---------
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
boxesInput.addEventListener('input', updateTotal);

updateFields();

document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Order submitted! (Connect to your backend or Supabase to process.)');
});

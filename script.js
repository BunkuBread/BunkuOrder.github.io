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
function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
}

function geocodeAndOpenMap() {
  const city = cityInput.value.trim();
  const street = streetInput.value.trim();
  let query = '';
  if (city && street) {
    query = encodeURIComponent(`${street}, ${city}, UAE`);
  } else if (city) {
    query = encodeURIComponent(`${city}, UAE`);
  }
  mapModal.style.display = 'block';
  confirmLocation.disabled = true;
  setTimeout(() => {
    destroyMap();
    let center = [25.276987, 55.296249];
    let zoom = 12;
    if (query) {
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
          showMap(center, zoom, false);
        });
    } else {
      showMap(center, zoom, false);
    }
  }, 150);
}

function openMapWithCoords(coords) {
  mapModal.style.display = 'block';
  confirmLocation.disabled = true;
  setTimeout(() => {
    destroyMap();
    let center = coords || [25.276987, 55.296249];
    let zoom = 17;
    showMap(center, zoom, true);
  }, 150);
}

function showMap(center, zoom, placeMarker=false) {
  map = L.map('map').setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  marker = null;
  if (placeMarker) {
    marker = L.marker(center, { draggable: true }).addTo(map);
    confirmLocation.disabled = false;
    locationInput.value = `https://maps.google.com/?q=${center[0].toFixed(6)},${center[1].toFixed(6)}`;
    marker.on('dragend', function () {
      const pos = marker.getLatLng();
      locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
    });
  } else {
    confirmLocation.disabled = true;
  }
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

locateMeBtn.addEventListener('click', function(e) {
  e.preventDefault();
  locateMeBtn.textContent = "Locating...";
  mapModal.style.display = 'block';
  confirmLocation.disabled = true;
  setTimeout(() => {
    destroyMap();
    document.getElementById('map').innerHTML = '<div style="text-align:center;padding:100px 0;color:#a0522d;">Getting your location...</div>';
  }, 50);
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    locateMeBtn.textContent = "📍 Locate Me";
    geocodeAndOpenMap();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      locateMeBtn.textContent = "📍 Locate Me";
      setTimeout(() => {
        destroyMap();
        let center = [pos.coords.latitude, pos.coords.longitude];
        let zoom = 17;
        map = L.map('map').setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        marker = L.marker(center, { draggable: true }).addTo(map);
        confirmLocation.disabled = false;
        locationInput.value = `https://maps.google.com/?q=${center[0].toFixed(6)},${center[1].toFixed(6)}`;
        marker.on('dragend', function () {
          const pos = marker.getLatLng();
          locationInput.value = `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
        });
        map.on('click', function (e) {
          marker.setLatLng(e.latlng);
          locationInput.value = `https://maps.google.com/?q=${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
        });
      }, 100);
    },
    function() {
      locateMeBtn.textContent = "📍 Locate Me";
      alert('Unable to retrieve your location.');
      mapModal.style.display = 'none';
    }
  );
});

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

// --- FORM VALIDATION ---
document.getElementById('orderForm').addEventListener('submit', function(e) {
  let errors = [];
  // Phone validation: 05X XXX-XXXX (auto-format if possible)
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
    e.preventDefault();
    alert(errors[0]);
    return false;
  }
  // Success!
  e.preventDefault();
  alert('Order submitted! (Connect to your backend or Supabase to process.)');
});

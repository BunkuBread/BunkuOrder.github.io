// Elements
const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const boxesInput = document.getElementById('boxes');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
let deliveryFee = 35;

function updateFields() {
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  if (orderType === "pickup") {
    pickupFields.style.display = "block";
    deliveryFields.style.display = "none";
    // Remove required from delivery fields
    document.getElementsByName('city')[0].required = false;
    document.getElementsByName('location')[0].required = false;
    document.getElementsByName('street')[0].required = false;
    document.getElementsByName('villa')[0].required = false;
    document.getElementsByName('licensePlate')[0].required = true;
  } else {
    pickupFields.style.display = "none";
    deliveryFields.style.display = "block";
    // Add required to delivery fields
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
  if (orderType === "delivery") total += deliveryFee;
  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML = `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === "delivery" ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : "");
}

orderTypeRadios.forEach(radio => radio.addEventListener('change', updateFields));
boxesInput.addEventListener('input', updateTotal);

// Initialize on page load
updateFields();

// Google Maps GPS autofill
function fillCurrentLocation() {
  const locInput = document.getElementById('locationInput');
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  locInput.value = "Getting your location...";
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      locInput.value = `https://maps.google.com/?q=${lat},${lng}`;
    },
    function() {
      locInput.value = "";
      alert('Unable to retrieve your location.');
    }
  );
}

// Prevent form submission (for demo)
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Order submitted! (Hook up to Supabase or your backend to process orders.)');
});

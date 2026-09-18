let services = [];

async function loadServices() {
  const response = await fetch("/api/services");
  const result = await response.json();
  services = result.services || [];

  const select = document.getElementById("service");

  services.forEach(service => {
    const option = document.createElement("option");

    option.value = service.id;
    option.textContent =
      `${service.name} — ₹${service.price}`;

    select.appendChild(option);
  });
}

loadServices();

document.getElementById("bookingForm").addEventListener("submit", async function(e) {

  e.preventDefault();

  const serviceId = document.getElementById("service").value;
  const service = services.find(s => s.id == serviceId);

  const bookingData = {
    customerName: document.getElementById("customerName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    service: service.name,
    price: service.price,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    notes: document.getElementById("notes").value
  };

  const bookingResponse = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bookingData)
  });

  const bookingResult = await bookingResponse.json();

  if (!bookingResult.success) {
    alert("Unable to create booking.");
    return;
  }

  const orderResponse = await fetch("/api/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: service.price
    })
  });

  const orderResult = await orderResponse.json();

  if (!orderResult.success) {
    alert("Booking saved. Payment setup is not configured yet.");
    localStorage.setItem(
      "booking",
      JSON.stringify(bookingData)
    );

    window.location.href = "success.html";
    return;
  }

  const options = {
    key: "YOUR_RAZORPAY_KEY_ID",
    amount: orderResult.order.amount,
    currency: "INR",
    name: "Lumière Beauty Studio",
    description: service.name,
    order_id: orderResult.order.id,

    prefill: {
      name: bookingData.customerName,
      email: bookingData.email,
      contact: bookingData.phone
    },

    theme: {
      color: "#29221f"
    },

    handler: function(response) {

      localStorage.setItem(
        "booking",
        JSON.stringify({
          ...bookingData,
          paymentId: response.razorpay_payment_id,
          paymentStatus: "Paid"
        })
      );

      window.location.href = "success.html";
    }
  };

  const razorpay = new Razorpay(options);

  razorpay.open();
});
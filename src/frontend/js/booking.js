let services = [];
const adminWhatsAppNumber = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "";

function openAdminWhatsApp(booking, bookingId) {
  const number = adminWhatsAppNumber.replace(/\D/g, "");

  if (!number) {
    return;
  }

  const message = [
    "New KIRUTHIS PARLOUR appointment",
    `Booking ID: ${bookingId || "Pending"}`,
    `Name: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Service: ${booking.service}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Price: INR ${booking.price}`,
    booking.notes ? `Notes: ${booking.notes}` : ""
  ].filter(Boolean).join("\n");

  window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

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

  let orderResult = { success: false };

  try {
    const orderResponse = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: service.price
      })
    });

    if (orderResponse.ok) {
      orderResult = await orderResponse.json();
    }
  } catch (error) {
    console.warn("Payment setup unavailable:", error);
  }

  if (!orderResult.success) {
    alert("Booking saved. Payment setup is not configured yet.");
    openAdminWhatsApp(bookingData, bookingResult.booking?.id);
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

      openAdminWhatsApp(
        { ...bookingData, paymentStatus: "Paid" },
        bookingResult.booking?.id
      );

      window.location.href = "success.html";
    }
  };

  const razorpay = new Razorpay(options);

  razorpay.open();
});
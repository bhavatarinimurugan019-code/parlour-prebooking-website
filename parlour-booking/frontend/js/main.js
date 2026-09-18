async function loadServices() {
  const response = await fetch("/api/services");
  const services = await response.json();

  const container = document.getElementById("serviceList");

  container.innerHTML = services.map(service => `
    <div class="service-card">
      <h3>${service.name}</h3>
      <p>${service.duration} • Professional service</p>
      <div class="price">₹${service.price}</div>
    </div>
  `).join("");
}

async function loadGallery() {
  const response = await fetch("/api/gallery");
  const gallery = await response.json();

  document.getElementById("galleryList").innerHTML =
    gallery.map(image => `
      <img src="${image}" alt="Beauty Studio">
    `).join("");
}

loadServices();
loadGallery();
async function loadServices() {
  const response = await fetch("/api/services");
  const result = await response.json();
  const services = result.services || [];

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
  const result = await response.json();
  const gallery = result.gallery || [];

  document.getElementById("galleryList").innerHTML =
    gallery.map(image => `
      <img src="${image}" alt="Beauty Studio">
    `).join("");
}

loadServices();
loadGallery();
document.addEventListener("DOMContentLoaded", initPage);

function initPage() {
  // If list page element exists, load list
  if (document.getElementById("animalsGrid")) {
    loadAnimalsList();
    return;
  }

  // If detail page element exists, load detail
  if (document.getElementById("detailName")) {
    loadAnimalDetail();
    return;
  }
}

/* =========================
   LIST PAGE (animals.html)
========================= */

function loadAnimalsList() {
  fetch("/api/animals", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const animals = Array.isArray(data) ? data : [];
      renderAnimals(animals);
      updateCount(animals.length);
    })
    .catch((err) => {
      console.log("Error loading animals:", err);
    });
}

function updateCount(total) {
  const el = document.getElementById("resultsCount");
  if (!el) return;

  if (total === 0) el.textContent = "Showing 0 of 0 animals";
  else el.textContent = `Showing 1–${total} of ${total} animals`;
}

function renderAnimals(animals) {
  const grid = document.getElementById("animalsGrid");
  if (!grid) return;

  if (animals.length === 0) {
    grid.innerHTML = `<p style="padding:16px;">No animals found.</p>`;
    return;
  }

  let html = "";

  for (let i = 0; i < animals.length; i++) {
    const a = animals[i];

    const badgeClass = getBadgeClass(a.status);
    const ageText = formatAge(a.age_months);

    html += `
      <article class="card">
        <div class="card__media">
          <img src="${a.image_url}" alt="${a.name}" />
          <button type="button" class="card__close" onclick="deleteAnimal(this)" animalId="${a.animal_id}" aria-label="Delete">×</button>
          <span class="badge ${badgeClass}">${a.status}</span>
        </div>

        <div class="card__body">
          <h3 class="card__title">${a.name}</h3>
          <p class="card__meta">${a.species} • ${a.breed}</p>
          <p class="card__age">Age: ${ageText}</p>

          <div class="card__actions">
            <button type="button" class="btn btn--primary" onclick="viewAnimal(this)" animalId="${a.animal_id}">View</button>
            <button type="button" class="btn btn--ghost" onclick="openEditAnimalDialog(this)" animalId="${a.animal_id}">Edit</button>
          </div>
        </div>
      </article>
    `;
  }

  grid.innerHTML = html;
}

function viewAnimal(btn) {
  var id = btn.getAttribute("animalId");
  location.href = "animal_detail.html?id=" + id;
}

let animalIdToDelete = null;

function deleteAnimal(btn) {
  animalIdToDelete = btn.getAttribute("animalId");
  document.getElementById("deleteOverlay").style.display = "flex";
}

function closeDeleteOverlay() {
  document.getElementById("deleteOverlay").style.display = "none";
  animalIdToDelete = null;
}

function confirmDelete() {
  if (!animalIdToDelete) return;
  
  var api_url = "/api/animals/" + animalIdToDelete;
   
  fetch(api_url, {
    method: "DELETE"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error Encountered");
    }
    return response.json();
  })
  .then(data => {
    location.href = '/animals.html';
  })
  .catch(error => {
    console.log("Error", error);
    closeDeleteOverlay();
  });
}


function openAddAnimalDialog() {
  document.getElementById("addAnimalDialog").showModal();
}

function addAnimalData(event) {
  event.preventDefault();

  var formElement = document.getElementById("addAnimalForm");
  var formdata = new FormData(formElement); // 

  fetch("/api/animals", {
    method: "POST",
    body: formdata, //
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error: POST /api/animals failed");
      return response.json();
    })
    .then((data) => {
      console.log("Created:", data);
      document.getElementById("addAnimalDialog").close();
      location.href = "/animals.html";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function openEditAnimalDialog(btn) {
  const id = btn.getAttribute("animalId");
  if (!id) return;

  // open first (feels snappy), then fill
  document.getElementById("editAnimalDialog").showModal();
  document.getElementById("edit_animal_id").value = id;

  fetch("/api/animals/" + id)
    .then(r => r.json())
    .then(data => {
      // your GET /:id might return [row] array
      const a = Array.isArray(data) ? data[0] : data;
      if (!a) return;

      document.getElementById("edit_name").value = a.name || "";
      document.getElementById("edit_species").value = a.species || a.species_name || "";
      document.getElementById("edit_breed").value = a.breed || a.breed_name || "";
      document.getElementById("edit_gender").value = a.gender || "Unknown";
      document.getElementById("edit_age_months").value = a.age_months ?? 0;
      document.getElementById("edit_status").value = a.status || "Available";
      document.getElementById("edit_temperament").value = a.temperament || "";
      // do NOT set file input value (browser blocks it)
    })
    .catch(err => console.log("Error loading animal detail:", err));
}

function submitEditAnimal(e) {
  e.preventDefault();

  const form = document.getElementById("editAnimalForm");
  const id = document.getElementById("edit_animal_id").value;

  const formData = new FormData(form);

  fetch("/api/animals/" + id, {
    method: "PUT",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      document.getElementById("editAnimalDialog").close();
      loadAnimalsList(); // refresh list
    })
    .catch(err => console.log("Error updating animal:", err));
}





/* DETAIL PAGE (animal_detail.html) */

function loadAnimalDetail() {
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  if (!id) return;

  fetch("/api/animals/" + id, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      // Your backend likely returns an array (rows). Support both array/object.
      var a = Array.isArray(data) ? data[0] : data;
      if (!a) return;

      renderAnimalDetail(a);
    })
    .catch((err) => {
      console.log("Error loading animal detail:", err);
    });
}

function renderAnimalDetail(a) {
  // Texts
  setText("crumbName", a.name);
  setText("detailName", a.name);

  var ageText = formatAge(a.age_months);
  var subtitle = `${a.breed} • ${ageText} • ${a.gender}`;
  setText("detailSubtitle", subtitle);

  // Status pill + badge
  var badgeClass = getBadgeClass(a.status);
  setBadge("detailStatusPill", badgeClass, a.status);
  setBadge("detailStatusBadge", badgeClass, a.status);

  // Image
  var img = document.getElementById("detailImage");
  if (img) {
    img.src = a.image_url;
    img.alt = a.name;
  }

  // Temperament
  setText("detailTemperament", a.temperament || "");

  // Quick info
  setText("quickAge", ageText);
  setText("quickSpecies", a.species);
  setText("quickBreed", a.breed);
  setText("quickGender", a.gender);
  setText("quickStatus", a.status);

  // Update Edit button link on detail page to correct id
  var editLink = document.getElementById("editLink");
    if (editLink) {
    // pick the correct id field from your API response (common possibilities)
    var theId = a.animal_id;

    // if your API doesn’t return an id field, fall back to the URL id:
    if (!theId) {
        var params = new URLSearchParams(location.search);
        theId = params.get("id");
    }

    editLink.setAttribute("animalId", theId);
    }


  // Optional: update breadcrumb species text (2nd link inside .meta)
  var metaSpeciesLink = document.querySelector(".meta a:nth-of-type(2)");
  if (metaSpeciesLink) metaSpeciesLink.textContent = a.species_name;
}

/* =========================
   HELPERS
========================= */

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function setBadge(id, badgeClass, text) {
  var el = document.getElementById(id);
  if (!el) return;

  // remove old badge-- classes
  el.classList.remove("badge--available", "badge--reserved", "badge--adopted");
  el.classList.add(badgeClass);
  el.textContent = text ?? "";
}

function getBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "available") return "badge--available";
  if (s === "reserved") return "badge--reserved";
  if (s === "adopted") return "badge--adopted";
  return "badge--adopted";
}

function formatAge(ageMonths) {
  const m = Number(ageMonths || 0);
  if (m < 12) return `${m} months`;

  const years = Math.floor(m / 12);
  const rem = m % 12;

  if (rem === 0) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years} ${years === 1 ? "year" : "years"} ${rem} months`;
}


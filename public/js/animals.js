document.addEventListener("DOMContentLoaded", initPage);

let currentUser = null;
let animalIdToDelete = null;

/* =========================
   INIT
========================= */
async function initPage() {
  await fetchMe();

  // List page
  if (document.getElementById("animalsGrid")) {
    loadAnimalsList();
    return;
  }

  // Detail page
  if (document.getElementById("detailName")) {
    loadAnimalDetail();
    return;
  }
}

/* =========================
   AUTH STATE HELPERS
========================= */
function isLoggedIn() {
  return !!currentUser;
}

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

/* =========================
   FLASH MESSAGE
========================= */
function showFlash(msg) {
  const el = document.getElementById("flash");
  if (!el) {
    alert(msg);
    return;
  }
  el.textContent = msg;
  el.style.display = "block";

  clearTimeout(window.__flashTimer);
  window.__flashTimer = setTimeout(() => (el.style.display = "none"), 3500);
}

/* =========================
   ADMIN ACCESS DIALOG
========================= */
function openAdminAccessDialog() {
  const dlg = document.getElementById("adminAccessDialog");

  // If dialog not in this page (detail page), fallback
  if (!dlg) {
    showFlash("Admin access required.");
    return;
  }
  dlg.showModal();
}

function closeAdminAccessDialog() {
  const dlg = document.getElementById("adminAccessDialog");
  if (dlg) dlg.close();
}

function needAdminMessage() {
  openAdminAccessDialog();
}

/* =========================
   AUTH UI
========================= */
function openAuthDialog() {
  const msg = document.getElementById("authMsg");
  const dlg = document.getElementById("authDialog");
  if (msg) msg.textContent = "Admin login";
  if (dlg) dlg.showModal();
}

async function fetchMe() {
  try {
    const r = await fetch("/api/auth/me");
    const data = await r.json();
    currentUser = data.user || null;
  } catch {
    currentUser = null;
  }

  refreshNav();
  applyDetailAuthUI();
}

function refreshNav() {
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  const navUser = document.getElementById("navUser");

  // Your Add Animal button id is addAnimalBtn
  const addBtn = document.getElementById("addAnimalBtn");

  // Detail page doesn't have these elements -> just skip
  if (!btnLogin || !btnLogout) return;

  if (currentUser) {
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-flex";

    if (navUser) {
      navUser.style.display = "inline-flex";
      navUser.textContent = `${currentUser.name} (${currentUser.role})`;
    }
  } else {
    btnLogin.style.display = "inline-flex";
    btnLogout.style.display = "none";
    if (navUser) navUser.style.display = "none";
  }

  // Optional: hide Add Animal when not admin (recommended)
  // If you want to keep it visible and show "admin required" popup when clicked,
  // comment out the line below.
  if (addBtn) addBtn.style.display = isAdmin() ? "inline-flex" : "none";
}

async function login(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail")?.value || "";
  const password = document.getElementById("loginPassword")?.value || "";
  const msgEl = document.getElementById("authMsg");

  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    if (msgEl) msgEl.textContent = data.error || "Login failed";
    else showFlash(data.error || "Login failed");
    return;
  }

  currentUser = data.user || null;
  refreshNav();

  document.getElementById("authDialog")?.close();

  // Re-render UI so edit/delete appear now
  if (document.getElementById("animalsGrid")) loadAnimalsList();
  applyDetailAuthUI();
}

// Register is not used anymore, keep as safe no-op so nothing crashes
function registerUser(e) {
  if (e) e.preventDefault();
  showFlash("Registration is disabled. Admin login only.");
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  currentUser = null;
  refreshNav();

  // Re-render UI so edit/delete disappear
  if (document.getElementById("animalsGrid")) loadAnimalsList();
  applyDetailAuthUI();
}

/* =========================
   LIST PAGE
========================= */
function loadAnimalsList() {
  fetch("/api/animals", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const animals = Array.isArray(data) ? data : [];
      renderAnimals(animals);
      updateCount(animals.length);
    })
    .catch((err) => console.log("Error loading animals:", err));
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

  // ✅ requirement: hide edit/delete if NOT logged in
  const showActions = isLoggedIn(); // (only admin can login anyway in your backend)

  let html = "";

  for (let i = 0; i < animals.length; i++) {
    const a = animals[i];
    const badgeClass = getBadgeClass(a.status);
    const ageText = formatAge(a.age_months);

    html += `
      <article class="card">
        <div class="card__media">
          <img src="${a.image_url}" alt="${a.name}" />

          ${
            showActions
              ? `<button type="button" class="card__close" onclick="deleteAnimal(this)" animalId="${a.animal_id}" aria-label="Delete">×</button>`
              : ``
          }

          <span class="badge ${badgeClass}">${a.status}</span>
        </div>

        <div class="card__body">
          <h3 class="card__title">${a.name}</h3>
          <p class="card__meta">${a.species} • ${a.breed}</p>
          <p class="card__age">Age: ${ageText}</p>

          <div class="card__actions">
            <button type="button" class="btn btn--primary" onclick="viewAnimal(this)" animalId="${a.animal_id}">View</button>

            ${
              showActions
                ? `<button type="button" class="btn btn--ghost" onclick="openEditAnimalDialog(this)" animalId="${a.animal_id}">Edit</button>`
                : ``
            }
          </div>
        </div>
      </article>
    `;
  }

  grid.innerHTML = html;
}

function viewAnimal(btn) {
  const id = btn.getAttribute("animalId");
  location.href = "animal_detail.html?id=" + id;
}

/* =========================
   DELETE (ADMIN ONLY)
========================= */
function deleteAnimal(btn) {
  // Extra safety: if someone triggers via console
  if (!isAdmin()) return needAdminMessage();

  animalIdToDelete = btn.getAttribute("animalId");
  document.getElementById("deleteOverlay").style.display = "flex";
}

function closeDeleteOverlay() {
  document.getElementById("deleteOverlay").style.display = "none";
  animalIdToDelete = null;
}

function confirmDelete() {
  if (!animalIdToDelete) return;

  fetch("/api/animals/" + animalIdToDelete, { method: "DELETE" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) needAdminMessage();
        else showFlash(data.error || "Delete failed");
        throw new Error("DELETE failed");
      }
      return data;
    })
    .then(() => {
      closeDeleteOverlay();
      loadAnimalsList();
    })
    .catch((error) => {
      console.log("Error", error);
      closeDeleteOverlay();
    });
}

/* =========================
   ADD (ADMIN ONLY)
========================= */
function openAddAnimalDialog() {
  if (!isAdmin()) return needAdminMessage();
  document.getElementById("addAnimalDialog").showModal();
}

function addAnimalData(event) {
  event.preventDefault();
  if (!isAdmin()) return needAdminMessage();

  const formElement = document.getElementById("addAnimalForm");
  const formdata = new FormData(formElement);

  fetch("/api/animals", { method: "POST", body: formdata })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) needAdminMessage();
        else showFlash(data.error || "Create failed");
        throw new Error("POST failed");
      }
      return data;
    })
    .then(() => {
      document.getElementById("addAnimalDialog").close();
      loadAnimalsList();
    })
    .catch((error) => console.error("Error:", error));
}

/* =========================
   EDIT (ADMIN ONLY)
========================= */
function openEditAnimalDialog(btn) {
  if (!isAdmin()) return needAdminMessage();

  const id = btn.getAttribute("animalId");
  if (!id) return;

  document.getElementById("editAnimalDialog").showModal();
  document.getElementById("edit_animal_id").value = id;

  fetch("/api/animals/" + id)
    .then((r) => r.json())
    .then((data) => {
      const a = Array.isArray(data) ? data[0] : data;
      if (!a) return;

      document.getElementById("edit_name").value = a.name || "";
      document.getElementById("edit_species").value = a.species || "";
      document.getElementById("edit_breed").value = a.breed || "";
      document.getElementById("edit_gender").value = a.gender || "Unknown";
      document.getElementById("edit_age_months").value = a.age_months ?? 0;
      document.getElementById("edit_status").value = a.status || "Available";
      document.getElementById("edit_temperament").value = a.temperament || "";
    })
    .catch((err) => console.log("Error loading animal detail:", err));
}

function submitEditAnimal(e) {
  e.preventDefault();
  if (!isAdmin()) return needAdminMessage();

  const form = document.getElementById("editAnimalForm");
  const id = document.getElementById("edit_animal_id").value;
  const formData = new FormData(form);

  fetch("/api/animals/" + id, { method: "PUT", body: formData })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) needAdminMessage();
        else showFlash(data.error || "Update failed");
        throw new Error("PUT failed");
      }
      return data;
    })
    .then(() => {
      document.getElementById("editAnimalDialog").close();

      // if list page, refresh list; if detail page, refresh detail
      if (document.getElementById("animalsGrid")) loadAnimalsList();
      if (document.getElementById("detailName")) loadAnimalDetail();
    })
    .catch((err) => console.log("Error updating animal:", err));
}

/* =========================
   DETAIL PAGE
========================= */
function loadAnimalDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  fetch("/api/animals/" + id)
    .then((response) => response.json())
    .then((data) => {
      const a = Array.isArray(data) ? data[0] : data;
      if (!a) return;
      renderAnimalDetail(a);

      // ✅ requirement: hide edit on detail page if not logged in
      applyDetailAuthUI();
    })
    .catch((err) => console.log("Error loading animal detail:", err));
}

function applyDetailAuthUI() {
  const editLink = document.getElementById("editLink");
  if (!editLink) return;

  // hide unless logged in (admin)
  editLink.classList.toggle("btn--invisible", !isLoggedIn());
}

function renderAnimalDetail(a) {
  setText("crumbName", a.name);
  setText("detailName", a.name);

  const ageText = formatAge(a.age_months);
  setText("detailSubtitle", `${a.breed} • ${ageText} • ${a.gender}`);

  const badgeClass = getBadgeClass(a.status);
  setBadge("detailStatusPill", badgeClass, a.status);
  setBadge("detailStatusBadge", badgeClass, a.status);

  const img = document.getElementById("detailImage");
  if (img) {
    img.src = a.image_url;
    img.alt = a.name;
  }

  setText("detailTemperament", a.temperament || "");

  setText("quickAge", ageText);
  setText("quickSpecies", a.species);
  setText("quickBreed", a.breed);
  setText("quickGender", a.gender);
  setText("quickStatus", a.status);

  // Set animalId attribute so edit works
  const editLink = document.getElementById("editLink");
  if (editLink) {
    const theId = a.animal_id || new URLSearchParams(location.search).get("id");
    editLink.setAttribute("animalId", theId);
  }
}

/* =========================
   UI HELPERS
========================= */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function setBadge(id, badgeClass, text) {
  const el = document.getElementById(id);
  if (!el) return;
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

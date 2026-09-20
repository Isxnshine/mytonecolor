/* ---------- Shared elements for upload, result, and colour-mode interactions. ---------- */
const $ = (selector) => document.querySelector(selector);
const fileInput = $("#fileInput");
const cameraInput = $("#cameraInput");
const preview = $("#photoPreview");
const placeholder = $("#placeholder");
const replaceBtn = $("#replaceBtn");
const analyzeBtn = $("#analyzeBtn");
const result = $("#result");
const statusText = $("#statusText");
const themeToggle = $("#themeToggle");

/* ---------- Sample analysis profiles used by this interactive prototype. ---------- */
const profiles = [
  { season: "Soft Autumn", description: "โทนอุ่น นุ่มนวล และเป็นธรรมชาติ", undertone: "WARM", contrast: "SOFT", good: ["#7D8770", "#B47857", "#C7A76D", "#76544A", "#A8685E"], avoid: ["#F35A69", "#00A7B5", "#B55FF2", "#202A7D", "#F5F4F5"], goodLabel: "Earthy & warm tones", avoidLabel: "Icy & vivid tones" },
  { season: "Warm Spring", description: "โทนอุ่น สดใส และมีชีวิตชีวา", undertone: "WARM", contrast: "CLEAR", good: ["#EE856B", "#EEB642", "#A8BA70", "#40A6A0", "#F0CCAA"], avoid: ["#3C4669", "#8F8992", "#1E6178", "#B24865", "#131D36"], goodLabel: "Clear & sunny tones", avoidLabel: "Cool & muted tones" },
  { season: "Cool Winter", description: "โทนเย็น คมชัด และโดดเด่น", undertone: "COOL", contrast: "HIGH", good: ["#C5225B", "#216AA2", "#141F42", "#E63D64", "#F4F4F0"], avoid: ["#B99651", "#B46C4C", "#8B8764", "#C3A897", "#A7794E"], goodLabel: "Bold & cool tones", avoidLabel: "Muted & earthy tones" }
];
let hasPhoto = false;

/* Loads a picked photo into the preview, then allows colour analysis. */
function loadPhoto(file) {
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  placeholder.style.display = "none";
  replaceBtn.style.display = "block";
  analyzeBtn.disabled = false;
  hasPhoto = true;
  statusText.textContent = "พร้อมสแกนโทนสีผิวของคุณ";
}

/* Creates the small colour swatches in a palette result card. */
function renderSwatches(target, colors) {
  target.innerHTML = colors.map((color) => '<i style="background:' + color + '"></i>').join("");
}

/* Switches the page between the warm light and warm dark appearances. */
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "เปิดโหมดปกติ" : "เปิดโหมดมืด");
}

/* Collects files from the picker, camera, drag/drop and replacement button. */
fileInput.addEventListener("change", (event) => loadPhoto(event.target.files[0]));
cameraInput.addEventListener("change", (event) => loadPhoto(event.target.files[0]));
replaceBtn.addEventListener("click", () => fileInput.click());
$("#uploadZone").addEventListener("dragover", (event) => event.preventDefault());
$("#uploadZone").addEventListener("drop", (event) => {
  event.preventDefault();
  loadPhoto(event.dataTransfer.files[0]);
});
themeToggle.addEventListener("click", toggleTheme);

/* Simulates analysis and makes the chosen personal palette visible. */
analyzeBtn.addEventListener("click", () => {
  if (!hasPhoto) return;
  analyzeBtn.textContent = "AI กำลังวิเคราะห์...";
  statusText.textContent = "กำลังตรวจจับโทนสีผิว";
  setTimeout(() => {
    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    $("#undertone").textContent = profile.undertone;
    $("#contrast").textContent = profile.contrast;
    $("#season").textContent = profile.season.toUpperCase();
    $("#seasonName").textContent = profile.season;
    $("#resultDescription").textContent = profile.description;
    $("#goodLabel").textContent = profile.goodLabel;
    $("#avoidLabel").textContent = profile.avoidLabel;
    renderSwatches($("#goodSwatches"), profile.good);
    renderSwatches($("#avoidSwatches"), profile.avoid);
    statusText.textContent = "วิเคราะห์เสร็จสมบูรณ์";
    analyzeBtn.innerHTML = 'วิเคราะห์สำเร็จ <span>✓</span>';
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 900);
});

/* Sends the user back to the upload step for another analysis. */
$("#restartBtn").addEventListener("click", () => {
  $("#studio").scrollIntoView({ behavior: "smooth" });
});

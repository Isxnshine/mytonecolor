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
  { season: "Spring", description: "โทนอุ่น สดใส และมีชีวิตชีวา", undertone: "WARM", contrast: "CLEAR", good: ["#FFF2A8","#F8CFD7","#D7E990","#FFF58A","#FFC2C5","#E9B67D","#C86D94","#A7C63B","#F4DF2A","#F58085","#B99769","#75B9C8","#77B85B","#FFB946","#F3795A","#C76B26","#1CAFC2","#338746","#F16D45","#E9473D"], avoid: ["#3C4669","#8F8992","#1E6178","#B24865","#131D36"], goodLabel: "Fresh, clear & sunny tones", avoidLabel: "Cool & muted tones" },
  { season: "Summer", description: "โทนเย็น นุ่มละมุน และดูสงบสะอาด", undertone: "COOL", contrast: "SOFT", good: ["#F3EEE3","#A6D8E6","#A7C495","#F5E7B2","#E7AEBE","#BEB2AA","#6C9EC8","#73A889","#FFD875","#DF829E","#A8938C","#99B4D0","#506E64","#C6C1D7","#B85080","#8C7665","#5277A6","#267E78","#644F87","#9D3E52"], avoid: ["#FF6A4D","#F4C51D","#8BBE43","#171A31","#FFFFFF"], goodLabel: "Soft, cool & smoky tones", avoidLabel: "Warm & vivid tones" },
  { season: "Autumn", description: "โทนอุ่น นุ่มนวล และเป็นธรรมชาติ", undertone: "WARM", contrast: "SOFT", good: ["#F5E9C8","#B4CEC0","#9BA77A","#DED076","#E4B66A","#B58942","#399C99","#67845A","#CFA42B","#D67E3F","#4E4030","#076D6C","#7A6E45","#9D6E2D","#B7643E","#352B20","#6A3644","#2C873E","#E78440","#913828"], avoid: ["#F35A69","#00A7B5","#B55FF2","#202A7D","#F5F4F5"], goodLabel: "Earthy, warm & rich tones", avoidLabel: "Icy & vivid tones" },
  { season: "Winter", description: "โทนเย็น คมชัด และโดดเด่น", undertone: "COOL", contrast: "HIGH", good: ["#F8F7EF","#C5E6EF","#C9C9E6","#F5EF8A","#D8A2B8","#B2AAA6","#85ABC8","#4D9763","#F4E425","#C85A7B","#806C68","#4773AB","#128B7A","#9B7CAF","#B51546","#483B39","#1B275E","#075A62","#563772","#BC1731"], avoid: ["#B99651","#B46C4C","#8B8764","#C3A897","#A7794E"], goodLabel: "Clear, cool & high-contrast tones", avoidLabel: "Muted & earthy tones" },
];
let hasPhoto = false;
let selectedProfile = null;
let activePhotoFile = null;

/*
 * Loads a picked photo into the preview, then allows colour analysis.
 * FileReader is used instead of a temporary object URL because it is more
 * reliable with photos selected from Android and iOS galleries.
 */
async function loadPhoto(file) {
  if (!file) return;
  const isHeic = /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

  if (!file.type.startsWith("image/") && !isHeic) {
    statusText.textContent = "กรุณาเลือกไฟล์รูปภาพ";
    return;
  }

  statusText.textContent = isHeic ? "กำลังแปลงรูป HEIC/HEIF..." : "กำลังเปิดรูปภาพ...";
  let previewFile = file;

  /*
   * Newer iPhone browsers can decode HEIC themselves. Prefer that native path
   * first; if it is unavailable, convert a local copy to JPEG with heic2any.
   */
  if (isHeic) {
    try {
      await canBrowserDecode(file);
    } catch {
      try {
        if (typeof heic2any !== "function") throw new Error("Converter unavailable");
        previewFile = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        if (Array.isArray(previewFile)) [previewFile] = previewFile;
      } catch {
        statusText.textContent = "เปิดรูป HEIC/HEIF ไม่สำเร็จ ลองตั้งค่ากล้องเป็น Most Compatible หรือเลือกรูป JPG";
        return;
      }
    }
  }

  const reader = new FileReader();

  reader.onload = () => {
    preview.onload = () => {
      preview.style.display = "block";
      placeholder.style.display = "none";
      replaceBtn.style.display = "block";
      analyzeBtn.disabled = false;
      hasPhoto = true;
      selectedProfile = null;
      activePhotoFile = file;
      statusText.textContent = "พร้อมสแกนโทนสีผิวของคุณ";
    };
    preview.onerror = () => {
      preview.removeAttribute("src");
      preview.style.display = "none";
      placeholder.style.display = "block";
      replaceBtn.style.display = "none";
      analyzeBtn.disabled = true;
      hasPhoto = false;
      statusText.textContent = "ไม่สามารถเปิดรูปนี้ได้ ลองเลือกรูป JPG หรือ PNG";
    };
    preview.src = reader.result;
  };

  reader.onerror = () => {
    statusText.textContent = "อ่านไฟล์รูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง";
  };
  reader.readAsDataURL(previewFile);
}

/*
 * Checks whether this browser can natively render an HEIC/HEIF file.
 * The temporary URL is immediately released and no image leaves the device.
 */
function canBrowserDecode(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Native HEIC decoding unavailable"));
    };
    image.src = url;
  });
}

/* Creates the seasonal colour-grid swatches in a palette result card. */
function renderSwatches(target, colors) {
  target.innerHTML = colors.map((color) => '<i style="background:' + color + '"></i>').join("");
}

/* Gives the same uploaded photo the same tone instead of choosing randomly. */
function chooseStableProfile(file) {
  const fingerprint = file.name + file.size + file.lastModified;
  let hash = 0;
  for (let index = 0; index < fingerprint.length; index += 1) {
    hash = ((hash << 5) - hash + fingerprint.charCodeAt(index)) | 0;
  }
  return profiles[Math.abs(hash) % profiles.length];
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
    selectedProfile ||= chooseStableProfile(activePhotoFile);
    const profile = selectedProfile;
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

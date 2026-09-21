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
  { season: "Light Spring", description: "โทนอุ่น สว่าง และเบาสบายตา", undertone: "WARM", contrast: "LIGHT", good: ["#FFB5A7", "#FFD670", "#B7D77B", "#89D5D2", "#F6D8C9"], avoid: ["#303957", "#5A3652", "#6B5240", "#202020", "#8C3B42"], goodLabel: "Light & fresh tones", avoidLabel: "Dark & heavy tones" },
  { season: "Warm Spring", description: "โทนอุ่น สดใส และมีชีวิตชีวา", undertone: "WARM", contrast: "CLEAR", good: ["#EE856B", "#EEB642", "#A8BA70", "#40A6A0", "#F0CCAA"], avoid: ["#3C4669", "#8F8992", "#1E6178", "#B24865", "#131D36"], goodLabel: "Clear & sunny tones", avoidLabel: "Cool & muted tones" },
  { season: "Bright Spring", description: "โทนอุ่นสดใส ที่มีความคมชัดเป็นพิเศษ", undertone: "WARM", contrast: "HIGH", good: ["#FF5D56", "#FFD234", "#7FCB4F", "#05A9C4", "#FF8AC0"], avoid: ["#9A8F87", "#756E72", "#5E513D", "#4B5665", "#C4B3AA"], goodLabel: "Vivid & clear tones", avoidLabel: "Dusty & muted tones" },
  { season: "Soft Summer", description: "โทนเย็น นุ่มละมุน และหม่นอย่างมีเสน่ห์", undertone: "COOL", contrast: "SOFT", good: ["#9CA9B8", "#B787A6", "#7C9CAF", "#C6A58C", "#809F96"], avoid: ["#FF6A4D", "#F4C51D", "#8BBE43", "#171A31", "#FFFFFF"], goodLabel: "Soft & smoky tones", avoidLabel: "Warm & vivid tones" },
  { season: "Cool Summer", description: "โทนเย็น สว่าง และดูสงบสะอาด", undertone: "COOL", contrast: "MEDIUM", good: ["#A4B9D4", "#D4A6BD", "#81B4C4", "#BBAED1", "#D9E3E5"], avoid: ["#CE6D43", "#E8B223", "#7B873F", "#743831", "#362821"], goodLabel: "Cool & airy tones", avoidLabel: "Golden & earthy tones" },
  { season: "Light Summer", description: "โทนเย็นอ่อนโยน สว่าง และโปร่งเบา", undertone: "COOL", contrast: "LIGHT", good: ["#B7D8E8", "#E3B8CC", "#C0D397", "#C6B8E0", "#F5E6D0"], avoid: ["#332945", "#6D2F48", "#6B4135", "#425C4F", "#16191E"], goodLabel: "Light & cool tones", avoidLabel: "Deep & saturated tones" },
  { season: "Soft Autumn", description: "โทนอุ่น นุ่มนวล และเป็นธรรมชาติ", undertone: "WARM", contrast: "SOFT", good: ["#7D8770", "#B47857", "#C7A76D", "#76544A", "#A8685E"], avoid: ["#F35A69", "#00A7B5", "#B55FF2", "#202A7D", "#F5F4F5"], goodLabel: "Earthy & warm tones", avoidLabel: "Icy & vivid tones" },
  { season: "Warm Autumn", description: "โทนอุ่นลึก มีมิติ และดูอบอุ่นเป็นธรรมชาติ", undertone: "WARM", contrast: "MEDIUM", good: ["#A65238", "#B18B31", "#617445", "#8E4B38", "#D29C56"], avoid: ["#D4EEF1", "#B1BDE2", "#F1779A", "#C65AFF", "#FFFFFF"], goodLabel: "Rich & earthy tones", avoidLabel: "Icy & cool tones" },
  { season: "Deep Autumn", description: "โทนอุ่นเข้ม หรู และมีน้ำหนักของสี", undertone: "WARM", contrast: "DEEP", good: ["#532E28", "#7C5730", "#596E3A", "#9A3F37", "#AE8041"], avoid: ["#F5B2BC", "#9DE0EC", "#B7A9E2", "#FAF4E9", "#FFEB6C"], goodLabel: "Deep & warm tones", avoidLabel: "Pale & icy tones" },
  { season: "Cool Winter", description: "โทนเย็น คมชัด และโดดเด่น", undertone: "COOL", contrast: "HIGH", good: ["#C5225B", "#216AA2", "#141F42", "#E63D64", "#F4F4F0"], avoid: ["#B99651", "#B46C4C", "#8B8764", "#C3A897", "#A7794E"], goodLabel: "Bold & cool tones", avoidLabel: "Muted & earthy tones" },
  { season: "Bright Winter", description: "โทนเย็นสด สีชัด และเปล่งประกาย", undertone: "COOL", contrast: "HIGH", good: ["#EC1761", "#0078D4", "#2EC4B6", "#7A35BD", "#FFFFFF"], avoid: ["#C0AC8B", "#857B6C", "#B9856B", "#77793E", "#9F8D80"], goodLabel: "Bright & crisp tones", avoidLabel: "Muted & warm tones" },
  { season: "Deep Winter", description: "โทนเย็นเข้ม ลึกลับ และคอนทราสต์สูง", undertone: "COOL", contrast: "DEEP", good: ["#211D43", "#702652", "#004A73", "#284A43", "#A91D3D"], avoid: ["#EAB971", "#D5C29A", "#C48D6A", "#C5D797", "#F7DEC4"], goodLabel: "Deep & cool tones", avoidLabel: "Light & earthy tones" }
];
let hasPhoto = false;

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

// Menangkap elemen-elemen yang dibutuhkan
const dropArea = document.getElementById("dropArea");
const predictForm = document.getElementById("predictForm");
const previewImg = document.getElementById("previewImg");
const waitingToPredicting = document.querySelector(
  ".result-container #waitingToPredicting"
);
const loadingPredict = document.querySelector(".result-container .loading");
const predictionError = document.querySelector(
  ".result-container #predictionError"
);
const result = document.querySelector(".result-container #result");

// Form data untuk mengirim file
const predictFormData = new FormData();

// Mencegah perilaku default drag and drop
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaultBehavior, false);
  document.body.addEventListener(eventName, preventDefaultBehavior, false);
});

// Mencegah perilaku default form submit
["submit"].forEach((eventName) => {
  predictForm.addEventListener(eventName, preventDefaultBehavior, false);
});

// Menambahkan highlight pada area drop ketika item diseret ke atasnya
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlightDropArea, false);
});
// Menghapus highlight pada area drop ketika item dilepas atau keluar
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, removeHighlightDropArea, false);
});

// Fungsi untuk mencegah perilaku default (contoh: mencegah link mengarahkan)
function preventDefaultBehavior(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Fungsi untuk menambahkan highlight pada area drop
function highlightDropArea() {
  dropArea.classList.add("highlight");
}

// Fungsi untuk menghapus highlight pada area drop
function removeHighlightDropArea() {
  dropArea.classList.remove("highlight");
}

// Menangani file yang dijatuhkan ke area drop
dropArea.addEventListener("drop", handleFileDrop, false);
// Menangani perubahan pada input file (pilihan file dari pengguna)
predictForm.elements.skinFile.addEventListener("change", handleFileInputChange);
// Menangani pengiriman form
predictForm.addEventListener("submit", handleSubmitForm);

// Menangani file yang dijatuhkan oleh pengguna
function handleFileDrop(event) {
  const files = event.dataTransfer.files;
  const skinImage = files[0];
  predictFormData.set("image", skinImage, skinImage.name);
  previewFile(skinImage);
}

// Menangani perubahan pada input file
function handleFileInputChange(event) {
  const files = Array.from(event.target.files);
  const skinImage = files[0];
  predictFormData.set("image", skinImage, skinImage.name);
  previewFile(skinImage);
}

// Menangani pengiriman form untuk prediksi
function handleSubmitForm(event) {
  if (!predictFormData.has("image")) {
    alert("Silakan pilih gambar Anda terlebih dahulu");
    return;
  }

  uploadFile(predictFormData);
}

// Menampilkan preview gambar setelah memilih file
function previewFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    previewImg.innerHTML = "";
    const img = document.createElement("img");
    img.src = reader.result;
    previewImg.appendChild(img);
  };
}

// Mengirim file ke server
async function uploadFile(formData) {
  try {
    hideElement(waitingToPredicting);
    hideElement(result);
    showElement(loadingPredict);

    const response = await PredictAPI.predict(formData);

    handleResponse(response);
  } catch (error) {
    console.error(error);
    displayError("Kesalahan jaringan atau server tidak dapat dijangkau");
  } finally {
    hideElement(loadingPredict);
  }
}

// Menangani respons dari server
function handleResponse(response) {
  if (response.status === "fail") {
    displayError(response.message);
  } else {
    showPredictionResult(response);
    showElement(result);
    hideElement(predictionError);
  }
}

// Menampilkan pesan error
function displayError(message) {
  predictionError.textContent = message;
  showElement(predictionError);
}

// Menampilkan hasil prediksi kepada pengguna
function showPredictionResult(response) {
  const { message, data } = response;

  result.innerHTML = `
    <div class="response-message">
      <i class="fas fa-check"></i>
      <span class="message">${message}</span>
    </div>
    <div class="prediction-result">
      <div>
        <div class="result-title">Result:</div>
        <div>${data.result}</div>
      </div>
      <div>
        <div class="result-title">Suggestion:</div>
        <div>${data.suggestion}</div>
      </div>
    </div>
  `;
}

// Fungsi bantu untuk menampilkan elemen
function showElement(element) {
  element.style.display = "block";
}

// Fungsi bantu untuk menyembunyikan elemen
function hideElement(element) {
  element.style.display = "none";
}

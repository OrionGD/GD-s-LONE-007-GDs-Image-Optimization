const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const resizedPreview = document.getElementById('resizedPreview');
const resolutionInput = document.getElementById('resolutionInput');
const aspectRatioCheckbox = document.getElementById('aspectRatioCheckbox');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('formatSelect');
const resizeBtn = document.getElementById('resizeBtn');
const imageInfo = document.getElementById('imageInfo');
const processedImageInfo = document.getElementById('processedImageInfo');

// Brightness & Contrast Sliders
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');

let originalImage = null;
let originalFileName = '';

dropZone.onclick = () => fileInput.click();

dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    handleImageUpload();
});

fileInput.onchange = handleImageUpload;

function handleImageUpload() {
    const file = fileInput.files[0];
    if (!file || !file.type.startsWith('image/')) return alert('Invalid file type');

    originalFileName = file.name.split('.').slice(0, -1).join('.');

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            preview.src = originalImage.src;
            preview.style.display = 'block';
            imageInfo.style.display = 'block';

            imageInfo.innerHTML = `
                <strong>Original Image Info:</strong><br>
                Resolution: ${originalImage.width} x ${originalImage.height} px<br>
                Size: ${(file.size / 1024).toFixed(2)} KB<br>
                Format: ${file.type}
            `;
        };
    };
    reader.readAsDataURL(file);
}

qualitySlider.oninput = () => {
    qualityValue.textContent = qualitySlider.value + '%';
};

brightnessSlider.oninput = () => {
    brightnessValue.textContent = brightnessSlider.value;
};

contrastSlider.oninput = () => {
    contrastValue.textContent = contrastSlider.value;
};

resizeBtn.onclick = () => {
    if (!originalImage) {
        alert('Please upload an image first!');
        return;
    }

    const [widthInput, heightInput] = (resolutionInput.value || '').split('x').map(v => parseInt(v.trim()));
    let width = widthInput || originalImage.width;
    let height = heightInput || originalImage.height;

    if (aspectRatioCheckbox.checked && widthInput) {
        height = Math.round(width * (originalImage.height / originalImage.width));
    }

    const brightness = parseInt(brightnessSlider.value, 10) || 0;
    const contrast = parseInt(contrastSlider.value, 10) || 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // Apply brightness and contrast filters using CSS-like filter property
    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
    ctx.drawImage(originalImage, 0, 0, width, height);

    canvas.toBlob((blob) => {
        const fileName = `processed_${originalFileName}.${formatSelect.value.split('/')[1]}`;
        const url = URL.createObjectURL(blob);

        resizedPreview.src = url;
        resizedPreview.style.display = 'block';

        processedImageInfo.style.display = 'block';
        processedImageInfo.innerHTML = `
            <strong>Processed Image Info:</strong><br>
            Resolution: ${width} x ${height} px<br>
            Format: ${formatSelect.value}<br>
            Quality: ${qualitySlider.value}%<br>
            Brightness: ${brightness}<br>
            Contrast: ${contrast}
        `;

        // Auto-download processed image
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);

        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
        }, 4000); // Download after 4 seconds
    }, formatSelect.value, qualitySlider.value / 100);
};

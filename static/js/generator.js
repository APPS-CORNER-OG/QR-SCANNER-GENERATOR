class QRGenerator {
    constructor() {
        this.form = document.getElementById('qr-generator-form');
        this.textInput = document.getElementById('qr-text');
        this.colorInput = document.getElementById('qr-color');
        this.colorText = document.getElementById('qr-color-text');
        this.bgColorInput = document.getElementById('qr-bg-color');
        this.bgColorText = document.getElementById('qr-bg-color-text');
        this.logoInput = document.getElementById('qr-logo');
        this.animationSelect = document.getElementById('qr-animation');
        this.previewContainer = document.getElementById('qr-preview');
        this.resultContainer = document.getElementById('qr-result');
        this.downloadButton = document.getElementById('download-qr');

        this.qr = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.colorInput.addEventListener('input', (e) => this.updateColorText(e.target, this.colorText));
        this.bgColorInput.addEventListener('input', (e) => this.updateColorText(e.target, this.bgColorText));
        this.colorText.addEventListener('input', (e) => this.updateColorInput(e.target, this.colorInput));
        this.bgColorText.addEventListener('input', (e) => this.updateColorInput(e.target, this.bgColorInput));
        this.downloadButton.addEventListener('click', () => this.downloadQR());
    }

    updateColorText(input, text) {
        text.value = input.value;
    }

    updateColorInput(text, input) {
        if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) {
            input.value = text.value;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const text = this.textInput.value;
        const color = this.colorInput.value;
        const background = this.bgColorInput.value;
        
        // Create QR code
        this.qr = new QRious({
            value: text,
            size: 300,
            foreground: color,
            background: background,
            level: 'H' // High error correction for logo support
        });

        // Clear previous QR code
        this.previewContainer.innerHTML = '';
        
        // Create image from QR code
        const qrImage = new Image();
        qrImage.src = this.qr.toDataURL();
        
        // Handle logo if provided
        if (this.logoInput.files.length > 0) {
            qrImage.onload = () => this.addLogo(qrImage);
        } else {
            this.displayQR(qrImage);
        }
    }

    async addLogo(qrImage) {
        const logo = await this.loadLogo();
        const canvas = document.createElement('canvas');
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        const ctx = canvas.getContext('2d');

        // Draw QR code
        ctx.drawImage(qrImage, 0, 0);

        // Calculate logo size (25% of QR code)
        const logoSize = qrImage.width * 0.25;
        const logoX = (qrImage.width - logoSize) / 2;
        const logoY = (qrImage.height - logoSize) / 2;

        // Draw white background for logo
        ctx.fillStyle = 'white';
        ctx.fillRect(logoX, logoY, logoSize, logoSize);

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        const finalImage = new Image();
        finalImage.src = canvas.toDataURL();
        this.displayQR(finalImage);
    }

    loadLogo() {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const logo = new Image();
                logo.onload = () => resolve(logo);
                logo.src = e.target.result;
            };
            reader.readAsDataURL(this.logoInput.files[0]);
        });
    }

    displayQR(qrImage) {
        // Remove any existing QR code
        this.previewContainer.innerHTML = '';
        
        // Add animation class
        const animationClass = this.getAnimationClass();
        if (animationClass) {
            qrImage.className = animationClass;
        }

        // Display QR code
        this.previewContainer.appendChild(qrImage);
        this.resultContainer.classList.remove('d-none');
    }

    getAnimationClass() {
        const animation = this.animationSelect.value;
        switch (animation) {
            case 'fade': return 'qr-animation-fade';
            case 'scale': return 'qr-animation-scale';
            case 'rotate': return 'qr-animation-rotate';
            default: return '';
        }
    }

    downloadQR() {
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = this.previewContainer.querySelector('img').src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});

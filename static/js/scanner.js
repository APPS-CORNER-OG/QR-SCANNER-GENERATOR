class QRScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.resultContainer = document.getElementById('result-container');
        this.resultText = document.getElementById('result-text');
        this.errorContainer = document.getElementById('error-container');
        this.errorText = document.getElementById('error-text');
        this.copyBtn = document.getElementById('copy-btn');
        this.scanAgainBtn = document.getElementById('scan-again-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.switchCameraBtn = document.getElementById('switch-camera-btn');
        this.scanningOverlay = document.getElementById('scanning-overlay');
        this.shareBtn = document.getElementById('share-btn');

        this.scanning = false;
        this.currentFacingMode = 'environment';
        this.stream = null;
        this.availableDevices = [];
        this.currentDeviceId = null;

        this.initializeEventListeners();
        this.initializeHistory();
    }

    async enumerateDevices() {
        try {
            // First check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            // Request camera permissions first with more specific constraints
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            }).catch(async () => {
                // If environment camera fails, try any camera
                return await navigator.mediaDevices.getUserMedia({ video: true });
            });

            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Available cameras:', this.availableDevices.length);

            if (this.availableDevices.length === 0) {
                throw new Error('No camera devices found');
            }

            // Try to find a back camera
            const backCamera = this.availableDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('environment')
            );

            // Set initial device
            this.currentDeviceId = backCamera ? backCamera.deviceId : this.availableDevices[0].deviceId;

            return true;
        } catch (error) {
            console.error('Error enumerating devices:', error);
            // If permission is denied, throw specific error
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('Camera permission denied');
            }
            throw error; // Propagate other errors
        }
    }

    async getCameraStream() {
        let constraints = {
            video: {
                facingMode: this.currentFacingMode
            }
        };

        // If we have a specific device ID, use it
        if (this.currentDeviceId) {
            constraints.video = {
                deviceId: { exact: this.currentDeviceId }
            };
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Camera stream obtained successfully');
            return stream;
        } catch (error) {
            console.error('Error getting camera stream:', error);

            // If using specific device failed, try with any available camera
            if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                console.log('Attempting to use any available camera...');
                return navigator.mediaDevices.getUserMedia({ 
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                }).catch(() => {
                    // If environment camera fails, try any camera
                    return navigator.mediaDevices.getUserMedia({ video: true });
                });
            }

            throw error;
        }
    }

    async requestCameraPermission() {
        try {
            this.showLoading();
            this.hideError();
            this.hideResult();

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            // First enumerate available devices
            await this.enumerateDevices();

            this.stream = await this.getCameraStream();
            this.video.srcObject = this.stream;
            this.video.setAttribute("playsinline", true);
            await this.video.play();

            // Update switch camera button text and state
            this.updateSwitchCameraButton();

            this.startScanning();
            this.hideLoading();
            this.scanningOverlay.classList.remove('d-none');
        } catch (error) {
            console.error('Camera access error:', error);
            let errorMessage = 'Unable to access camera. ';

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = `
                    Please allow camera access to use the QR scanner:
                    1. Look for the camera icon in your browser's address bar
                    2. Click it and select "Allow"
                    3. Then click "Retry" below
                `;
            } else if (error.message === 'No camera devices found') {
                errorMessage = 'No camera found on your device. Please ensure your device has a camera and try again.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = 'Your camera is being used by another application. Please close other apps using the camera and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Your browser does not support camera access. Please try using a modern browser like Chrome, Firefox, or Safari.';
            }

            this.showError(errorMessage);
            this.hideLoading();
            this.scanningOverlay.classList.add('d-none');
        }
    }

    updateSwitchCameraButton() {
        const buttonText = this.currentFacingMode === 'environment' ? 'Front Camera' : 'Back Camera';
        this.switchCameraBtn.innerHTML = `<i class="bi bi-camera"></i> ${buttonText}`;
        this.switchCameraBtn.disabled = this.availableDevices.length <= 1;
    }

    async switchCamera() {
        if (this.availableDevices.length <= 1) return;

        const currentIndex = this.availableDevices.findIndex(device => device.deviceId === this.currentDeviceId);
        const nextIndex = (currentIndex + 1) % this.availableDevices.length;
        this.currentDeviceId = this.availableDevices[nextIndex].deviceId;
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';

        await this.requestCameraPermission();
    }


    initializeEventListeners() {
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.scanAgainBtn.addEventListener('click', () => this.startScanning());
        this.retryBtn.addEventListener('click', () => this.requestCameraPermission());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        this.shareBtn.addEventListener('click', () => this.shareResult());
    }

    initializeHistory() {
        this.loadScanHistory();
        const refreshHistoryBtn = document.getElementById('refresh-history-btn');
        if (refreshHistoryBtn) {
            refreshHistoryBtn.addEventListener('click', () => this.loadScanHistory());
        }
    }

    async shareResult() {
        const text = this.resultText.textContent;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'QR Code Scan Result',
                    text: text
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.showError('Failed to share the scan result');
                }
            }
        } else {
            await this.copyToClipboard();
        }
    }

    async loadScanHistory() {
        try {
            const response = await fetch('/api/scan-history');
            const history = await response.json();
            this.displayHistory(history);
        } catch (error) {
            console.error('Error loading scan history:', error);
        }
    }

    displayHistory(history) {
        const historyContainer = document.getElementById('history-list');
        if (!historyContainer) return;

        historyContainer.innerHTML = '';
        history.forEach(scan => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-truncate me-3">
                        <small class="text-muted">${new Date(scan.created_at).toLocaleString()}</small>
                        <div>${scan.content}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary copy-history" data-content="${scan.content}">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
            `;

            const copyBtn = item.querySelector('.copy-history');
            copyBtn.addEventListener('click', async () => {
                await navigator.clipboard.writeText(scan.content);
                copyBtn.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
                }, 2000);
            });

            historyContainer.appendChild(item);
        });
    }

    async saveScan(content) {
        try {
            await fetch('/api/scan-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    scan_type: 'text'
                })
            });
            await this.loadScanHistory();
        } catch (error) {
            console.error('Error saving scan:', error);
        }
    }

    async start() {
        await this.requestCameraPermission();
    }

    startScanning() {
        this.scanning = true;
        this.hideError();
        this.hideResult();
        this.scanningOverlay.classList.remove('d-none');
        this.scan();
    }

    scan() {
        if (!this.scanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.canvas.height = this.video.videoHeight;
            this.canvas.width = this.video.videoWidth;
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                this.scanning = false;
                this.scanningOverlay.classList.add('d-none');
                this.showResult(code.data);
            }
        }

        if (this.scanning) {
            requestAnimationFrame(() => this.scan());
        }
    }

    showResult(result) {
        this.resultText.textContent = result;
        this.resultContainer.classList.remove('d-none');
        this.saveScan(result);
    }

    hideResult() {
        this.resultContainer.classList.add('d-none');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorContainer.classList.remove('d-none');
        this.scanningOverlay.classList.add('d-none');
    }

    hideError() {
        this.errorContainer.classList.add('d-none');
    }

    showLoading() {
        this.loadingIndicator.classList.remove('d-none');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('d-none');
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.resultText.textContent);
            this.copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => {
                this.copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            }, 2000);
        } catch (err) {
            this.showError('Failed to copy to clipboard');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scanner = new QRScanner();
    scanner.start();
});
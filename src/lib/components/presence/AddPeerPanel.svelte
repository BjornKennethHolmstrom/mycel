<!--
	Add Peer Panel
	Add a peer by scanning their QR code, or show yours for them to scan.
	Falls back to manual pubkey paste.
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { currentPubkey } from '$lib/stores/app';
	import { onDestroy } from 'svelte';
 import qrcode from 'qrcode-generator';
 import jsQR from 'jsqr';

	interface Props {
		open: boolean;
		onclose: () => void;
		onadd: (pubkey: string, name: string) => void;
	}

	let { open, onclose, onadd }: Props = $props();

	let peerKey = $state('');
	let peerName = $state('');
	let error = $state('');
	let copied = $state(false);
	let showManual = $state(false);
	let scanning = $state(false);
	let qrCanvas: HTMLCanvasElement;
	let videoEl: HTMLVideoElement;
	let stream: MediaStream | null = null;
	let scanInterval: ReturnType<typeof setInterval> | null = null;

	// Generate QR code on canvas when panel opens
	$effect(() => {
		if (open && qrCanvas) {
			let pk = '';
			currentPubkey.subscribe((v) => { pk = v; })();
			if (pk) drawQR(qrCanvas, pk);
		}
		if (!open) {
			stopScanning();
			showManual = false;
			error = '';
			peerKey = '';
			peerName = '';
		}
	});

	onDestroy(() => {
		stopScanning();
	});

	function handleAdd() {
		const key = peerKey.trim();
		if (!key) { error = $t('addPeer.errorEmpty'); return; }
		if (key.startsWith('npub1')) { error = $t('addPeer.errorNpub'); return; }
		if (!/^[0-9a-f]{64}$/i.test(key)) { error = $t('addPeer.errorInvalid'); return; }

		onadd(key, peerName.trim());
		peerKey = '';
		peerName = '';
		error = '';
		onclose();
	}

	async function copyOwnKey() {
		try {
			let pk = '';
			currentPubkey.subscribe((v) => { pk = v; })();
			await navigator.clipboard.writeText(pk);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch { /* clipboard not available */ }
	}

	// === QR Generation ===
	// Minimal QR encoder — renders pubkey as a QR code on canvas
	// Uses the fact that hex pubkeys are alphanumeric and short enough for a simple approach

	function drawQR(canvas: HTMLCanvasElement, data: string) {
		// We'll use a minimal approach: encode as a data URL image via a tiny inline QR lib
		// For production, install 'qrcode' package. This uses a canvas-based approach.
		const size = 200;
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d')!;

		// Simple QR placeholder that works without a library:
		// Create a grid pattern encoding the hex string visually
		// This is NOT a real QR code — replace with proper library
		generateQRToCanvas(ctx, data, size);
	}

 function generateQRToCanvas(ctx: CanvasRenderingContext2D, data: string, size: number) {
     const qr = qrcode(0, 'L');
     qr.addData(data);
     qr.make();

     const modules = qr.getModuleCount();
     const cellSize = size / (modules + 8);
     const offset = (size - modules * cellSize) / 2;

     ctx.fillStyle = '#0a0f0a';
     ctx.fillRect(0, 0, size, size);

     ctx.fillStyle = '#6aad7a';
     for (let r = 0; r < modules; r++) {
         for (let c = 0; c < modules; c++) {
             if (qr.isDark(r, c)) {
                 ctx.fillRect(
                     offset + c * cellSize,
                     offset + r * cellSize,
                     cellSize,
                     cellSize
                 );
             }
         }
     }
 }

	// === QR Scanning ===

	async function startScanning() {
		scanning = true;
		error = '';

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});

			// Wait for video element to be in DOM
			await new Promise(r => setTimeout(r, 100));
			if (!videoEl) { stopScanning(); return; }

			videoEl.srcObject = stream;
			await videoEl.play();

			// Use BarcodeDetector if available (Chrome/Edge), otherwise scan manually
			// @ts-ignore
			if ('BarcodeDetector' in globalThis) {
				// @ts-ignore
				const detector = new BarcodeDetector({ formats: ['qr_code'] });
				scanInterval = setInterval(async () => {
					if (!videoEl || videoEl.readyState < 2) return;
					try {
						const barcodes = await detector.detect(videoEl);
						if (barcodes.length > 0) {
							handleScannedValue(barcodes[0].rawValue);
						}
					} catch { /* detection failed, keep trying */ }
				}, 300);
			} else {
				// Fallback: use canvas-based frame analysis with jsQR if loaded
				const scanCanvas = document.createElement('canvas');
				const scanCtx = scanCanvas.getContext('2d')!;

    scanInterval = setInterval(() => {
        if (!videoEl || videoEl.readyState < 2) return;
        scanCanvas.width = videoEl.videoWidth;
        scanCanvas.height = videoEl.videoHeight;
        scanCtx.drawImage(videoEl, 0, 0);
        const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
            handleScannedValue(code.data);
        }
    }, 300);
			}
		} catch (err) {
			error = $t('addPeer.cameraError');
			scanning = false;
		}
	}

	function handleScannedValue(value: string) {
		const trimmed = value.trim();
		if (/^[0-9a-f]{64}$/i.test(trimmed)) {
			stopScanning();
			peerKey = trimmed;
			showManual = true; // Show the form so they can add a name
		}
	}

	function stopScanning() {
		if (scanInterval) {
			clearInterval(scanInterval);
			scanInterval = null;
		}
		if (stream) {
			stream.getTracks().forEach(t => t.stop());
			stream = null;
		}
		scanning = false;
	}
</script>

{#if open}
	<button class="backdrop" onclick={onclose} aria-label="Close panel"></button>

	<div class="panel">
		<div class="handle-bar">
			<div class="handle"></div>
		</div>

		<!-- Your QR code -->
		<section>
			<h3 class="section-label">{$t('addPeer.yourKey')}</h3>
			<div class="qr-container">
				<canvas bind:this={qrCanvas} class="qr-canvas"></canvas>
			</div>
			<button class="copy-btn" onclick={copyOwnKey}>
				<span class="key-display">{$currentPubkey.slice(0, 16)}…{$currentPubkey.slice(-8)}</span>
				<span class="copy-label">{copied ? $t('addPeer.copied') : $t('addPeer.copy')}</span>
			</button>
			<p class="hint">{$t('addPeer.shareHint')}</p>
		</section>

		<!-- Scan QR -->
		{#if !showManual && !scanning}
			<section>
				<h3 class="section-label">{$t('addPeer.addSomeone')}</h3>
				<div class="scan-actions">
					<button class="scan-btn" onclick={startScanning}>
						{$t('addPeer.scanQR')}
					</button>
					<button class="manual-btn" onclick={() => showManual = true}>
						{$t('addPeer.pasteManually')}
					</button>
				</div>
			</section>
		{/if}

		<!-- Camera view -->
		{#if scanning}
			<section>
				<h3 class="section-label">{$t('addPeer.scanning')}</h3>
				<div class="camera-container">
					<video bind:this={videoEl} class="camera-view" playsinline></video>
					<div class="scan-overlay"></div>
				</div>
				<button class="cancel-btn" onclick={stopScanning}>
					{$t('addPeer.cancelScan')}
				</button>
			</section>
		{/if}

		<!-- Manual entry / scanned key -->
		{#if showManual}
			<section>
				<h3 class="section-label">{$t('addPeer.addSomeone')}</h3>
				<input
					type="text"
					bind:value={peerName}
					placeholder={$t('addPeer.namePlaceholder')}
					class="input"
				/>
				<input
					type="text"
					bind:value={peerKey}
					placeholder={$t('addPeer.keyPlaceholder')}
					class="input mono"
				/>
				{#if error}
					<p class="error">{error}</p>
				{/if}
				<button class="add-btn" onclick={handleAdd}>
					{$t('addPeer.add')}
				</button>
			</section>
		{/if}
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 40;
		border: none;
		cursor: default;
	}

	.panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-height: 85dvh;
		overflow-y: auto;
		background: var(--mycel-surface);
		border-top: 1px solid var(--mycel-border);
		border-radius: 1rem 1rem 0 0;
		padding: 0.5rem 1.25rem 2rem;
		z-index: 50;
		animation: slide-up 0.2s ease-out;
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.handle-bar {
		display: flex;
		justify-content: center;
		padding: 0.5rem 0 1rem;
	}

	.handle {
		width: 2rem;
		height: 3px;
		border-radius: 2px;
		background: var(--mycel-border);
	}

	section {
		margin-bottom: 1.25rem;
	}

	.section-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--mycel-text-dim);
		margin-bottom: 0.5rem;
		font-weight: 400;
	}

	.qr-container {
		display: flex;
		justify-content: center;
		margin-bottom: 0.75rem;
	}

	.qr-canvas {
		width: 160px;
		height: 160px;
		border-radius: 0.5rem;
	}

	.copy-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-bg);
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.copy-btn:hover {
		border-color: var(--mycel-accent);
	}

	.key-display {
		font-family: monospace;
		font-size: 0.6875rem;
		color: var(--mycel-text-dim);
	}

	.copy-label {
		font-size: 0.6875rem;
		color: var(--mycel-accent-bright);
	}

	.hint {
		font-size: 0.625rem;
		color: var(--mycel-text-dim);
		margin-top: 0.375rem;
	}

	.scan-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.scan-btn {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--mycel-accent);
		color: var(--mycel-bg);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.scan-btn:hover {
		background: var(--mycel-accent-bright);
	}

	.manual-btn {
		width: 100%;
		padding: 0.625rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: transparent;
		color: var(--mycel-text-dim);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.manual-btn:hover {
		border-color: var(--mycel-text-dim);
		color: var(--mycel-text);
	}

	.camera-container {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.camera-view {
		width: 100%;
		height: 200px;
		object-fit: cover;
		display: block;
		background: #000;
	}

	.scan-overlay {
		position: absolute;
		inset: 0;
		border: 2px solid var(--mycel-accent);
		border-radius: 0.5rem;
		pointer-events: none;
		box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.3);
	}

	.scan-overlay::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 15%;
		right: 15%;
		height: 2px;
		background: var(--mycel-accent-bright);
		opacity: 0.6;
		animation: scan-line 2s ease-in-out infinite;
	}

	@keyframes scan-line {
		0%, 100% { top: 30%; }
		50% { top: 70%; }
	}

	.cancel-btn {
		width: 100%;
		padding: 0.625rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: transparent;
		color: var(--mycel-text-dim);
		font-size: 0.75rem;
		cursor: pointer;
	}

	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-bg);
		color: var(--mycel-text);
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
		box-sizing: border-box;
	}

	.input::placeholder {
		color: var(--mycel-text-dim);
	}

	.input.mono {
		font-family: monospace;
		font-size: 0.6875rem;
	}

	.error {
		font-size: 0.6875rem;
		color: var(--mycel-urgent);
		margin-bottom: 0.5rem;
	}

	.add-btn {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--mycel-accent);
		color: var(--mycel-bg);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.add-btn:hover {
		background: var(--mycel-accent-bright);
	}
</style>

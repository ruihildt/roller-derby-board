import type Konva from 'konva';
import fixWebmDuration from 'fix-webm-duration';

export class KonvaRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private captureCanvas: HTMLCanvasElement | null = null;
	private isRecording = false;
	private recordingStartTime: number = 0;
	private elapsedTime: number = 0;
	private timeInterval: number | null = null;

	constructor(private stage: Konva.Stage) {}

	startRecording(bounds?: { x: number; y: number; width: number; height: number }) {
		this.recordingStartTime = Date.now();
		this.timeInterval = window.setInterval(() => {
			this.elapsedTime = Date.now() - this.recordingStartTime;
		}, 1000);

		this.captureCanvas = this.getCaptureCanvas(bounds);
		const stream = this.captureCanvas.captureStream(30); // Reduced to 30fps

		const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

		const supportedMimeType = mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

		this.mediaRecorder = new MediaRecorder(stream, {
			mimeType: supportedMimeType || 'video/webm'
		});

		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				this.recordedChunks = [...this.recordedChunks, event.data];
			}
		};

		this.mediaRecorder.start();
		this.isRecording = true;
		this.captureFrame(bounds);
	}

	private getCaptureCanvas(bounds?: { x: number; y: number; width: number; height: number }) {
		const captureCanvas = document.createElement('canvas');

		if (bounds) {
			captureCanvas.width = bounds.width;
			captureCanvas.height = bounds.height;
		} else {
			captureCanvas.width = this.stage.width();
			captureCanvas.height = this.stage.height();
		}

		return captureCanvas;
	}

	private captureFrame(bounds?: { x: number; y: number; width: number; height: number }) {
		if (!this.isRecording || !this.captureCanvas) return;

		const context = this.captureCanvas.getContext('2d')!;
		const stageCanvas = this.stage.toCanvas();

		if (bounds) {
			context.drawImage(
				stageCanvas,
				bounds.x,
				bounds.y,
				bounds.width,
				bounds.height,
				0,
				0,
				bounds.width,
				bounds.height
			);
		} else {
			context.drawImage(stageCanvas, 0, 0);
		}

		requestAnimationFrame(() => this.captureFrame(bounds));
	}

	stopRecording(): Promise<Blob> {
		return new Promise((resolve) => {
			if (!this.mediaRecorder) return;

			if (this.timeInterval) {
				clearInterval(this.timeInterval);
				this.timeInterval = null;
			}

			this.mediaRecorder.onstop = async () => {
				const blob = new Blob(this.recordedChunks, {
					type: 'video/webm'
				});
				const duration = Date.now() - this.recordingStartTime;
				const fixedBlob = await fixWebmDuration(blob, duration);

				this.recordedChunks = [];
				this.isRecording = false;
				this.captureCanvas = null;
				this.elapsedTime = 0;

				resolve(fixedBlob);
			};

			this.mediaRecorder.stop();
		});
	}

	destroy() {
		if (this.isRecording) {
			this.stopRecording();
		}
	}
}

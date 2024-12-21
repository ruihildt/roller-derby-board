import Konva from 'konva';
import fixWebmDuration from 'fix-webm-duration';

export class KonvaRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private captureCanvas: HTMLCanvasElement;
	private isRecording = false;
	private recordingStartTime: number = 0;
	private elapsedTime: number = 0;
	private timeInterval: number | null = null;
	private animation: Konva.Animation;

	constructor(private stage: Konva.Stage) {
		this.captureCanvas = document.createElement('canvas');
		this.animation = new Konva.Animation(() => {
			if (this.isRecording) {
				const stageCanvas = this.stage.toCanvas();
				const ctx = this.captureCanvas.getContext('2d')!;

				// Clear and fill with white background
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, this.captureCanvas.width, this.captureCanvas.height);

				// Draw stage content on top
				ctx.drawImage(stageCanvas, 0, 0);
			}
		}, this.stage.getLayers()[0]);
	}

	startRecording(bounds?: { x: number; y: number; width: number; height: number }) {
		this.recordingStartTime = Date.now();
		this.timeInterval = window.setInterval(() => {
			this.elapsedTime = Date.now() - this.recordingStartTime;
		}, 1000);

		// Set capture canvas dimensions
		this.captureCanvas.width = bounds?.width || this.stage.width();
		this.captureCanvas.height = bounds?.height || this.stage.height();

		// Create media stream from capture canvas
		const stream = this.captureCanvas.captureStream(30);
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
		this.animation.start();
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
				this.elapsedTime = 0;
				this.animation.stop();

				resolve(fixedBlob);
			};

			this.mediaRecorder.stop();
		});
	}

	destroy() {
		if (this.isRecording) {
			this.stopRecording();
		}
		this.animation.stop();
	}
}

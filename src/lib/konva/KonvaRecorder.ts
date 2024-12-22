import Konva from 'konva';
import fixWebmDuration from 'fix-webm-duration';

export class KonvaRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private isRecording = false;
	private recordingStartTime: number = 0;
	private elapsedTime: number = 0;
	private timeInterval: number | null = null;
	private animation: Konva.Animation;
	private layer: Konva.Layer; // Added this line

	constructor(private stage: Konva.Stage) {
		const mergedLayer = new Konva.Layer();

		// Temporarily add to stage to get dimensions
		this.stage.add(mergedLayer);
		// Then remove it right away
		mergedLayer.remove();

		this.animation = new Konva.Animation(() => {
			if (this.isRecording) {
				// Clear the merged layer
				mergedLayer.clear();

				// Draw each layer's content in order
				this.stage.getLayers().forEach((layer) => {
					const layerCanvas = layer.getNativeCanvasElement();
					mergedLayer.getContext().drawImage(layerCanvas, 0, 0);
				});
			}
		}, mergedLayer);

		this.layer = mergedLayer;
	}

	startRecording() {
		this.recordingStartTime = Date.now();
		this.timeInterval = window.setInterval(() => {
			this.elapsedTime = Date.now() - this.recordingStartTime;
		}, 1000);

		const canvas = this.layer.getNativeCanvasElement();
		const stream = canvas.captureStream(60);
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

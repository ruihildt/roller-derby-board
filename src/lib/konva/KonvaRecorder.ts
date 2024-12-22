import Konva from 'konva';
import fixWebmDuration from 'fix-webm-duration';

/**
 * KonvaRecorder handles video recording of Konva canvas animations
 * Supports recording specific areas or full canvas
 */
export class KonvaRecorder {
	// Core recording components
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private isRecording = false;

	// Time tracking for recording duration
	private recordingStartTime: number = 0;
	private elapsedTime: number = 0;
	private timeInterval: number | null = null;

	// Konva specific elements
	private animation: Konva.Animation;
	private layer: Konva.Layer;

	/**
	 * @param stage - The Konva stage to record
	 * @param recordingArea - Optional recording bounds {x, y, width, height}
	 */
	constructor(
		private stage: Konva.Stage,
		private recordingArea?: { x: number; y: number; width: number; height: number }
	) {
		// Create a temporary layer to merge all visible layers for recording
		const mergedLayer = new Konva.Layer();
		this.stage.add(mergedLayer);
		mergedLayer.remove();

		// Animation loop that captures and merges all layers on each frame
		this.animation = new Konva.Animation(() => {
			if (this.isRecording) {
				mergedLayer.clear();
				const tempCanvas = document.createElement('canvas');
				const tempCtx = tempCanvas.getContext('2d')!;

				// Handle recording of specific area
				if (this.recordingArea) {
					// Set dimensions for the cropped area
					tempCanvas.width = this.recordingArea.width;
					tempCanvas.height = this.recordingArea.height;

					// Crop and merge each layer to the specified area
					this.stage.getLayers().forEach((layer) => {
						const layerCanvas = layer.getNativeCanvasElement();
						const area = this.recordingArea as {
							x: number;
							y: number;
							width: number;
							height: number;
						};
						tempCtx.drawImage(
							layerCanvas,
							area.x,
							area.y,
							area.width,
							area.height,
							0,
							0,
							area.width,
							area.height
						);
					});

					mergedLayer.getContext().drawImage(tempCanvas, 0, 0);
				} else {
					// Merge full canvas layers
					this.stage.getLayers().forEach((layer) => {
						const layerCanvas = layer.getNativeCanvasElement();
						mergedLayer.getContext().drawImage(layerCanvas, 0, 0);
					});
				}
			}
		}, mergedLayer);

		this.layer = mergedLayer;
	}

	/**
	 * Initiates video recording of the canvas
	 * Sets up MediaRecorder with optimal codec support
	 */
	startRecording() {
		// Initialize recording time tracking
		this.recordingStartTime = Date.now();
		this.timeInterval = window.setInterval(() => {
			this.elapsedTime = Date.now() - this.recordingStartTime;
		}, 1000);

		const canvas = this.layer.getNativeCanvasElement();

		// Configure canvas dimensions for recording area
		if (this.recordingArea) {
			canvas.width = this.recordingArea.width;
			canvas.height = this.recordingArea.height;
			this.layer.width(this.recordingArea.width);
			this.layer.height(this.recordingArea.height);
		}

		// Setup canvas stream with 30fps
		const stream = canvas.captureStream(30);
		// Define supported video formats in order of preference
		const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
		const supportedMimeType = mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

		// Initialize MediaRecorder with supported format
		this.mediaRecorder = new MediaRecorder(stream, {
			mimeType: supportedMimeType || 'video/webm'
		});

		// Collect video data chunks
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				this.recordedChunks = [...this.recordedChunks, event.data];
			}
		};

		this.mediaRecorder.start();
		this.isRecording = true;
		this.animation.start();
	}

	/**
	 * Stops recording and returns the final video blob
	 * Fixes WebM duration metadata for accurate playback
	 */
	stopRecording(): Promise<Blob> {
		return new Promise((resolve) => {
			if (!this.mediaRecorder) return;

			// Clean up time tracking
			if (this.timeInterval) {
				clearInterval(this.timeInterval);
				this.timeInterval = null;
			}

			this.mediaRecorder.onstop = async () => {
				// Create final video blob and fix duration metadata
				const blob = new Blob(this.recordedChunks, {
					type: 'video/webm'
				});
				const duration = Date.now() - this.recordingStartTime;
				const fixedBlob = await fixWebmDuration(blob, duration);

				// Reset recording state
				this.recordedChunks = [];
				this.isRecording = false;
				this.elapsedTime = 0;
				this.animation.stop();

				resolve(fixedBlob);
			};

			this.mediaRecorder.stop();
		});
	}

	/**
	 * Cleanup method to ensure proper resource disposal
	 */
	destroy() {
		if (this.isRecording) {
			this.stopRecording();
		}
		this.animation.stop();
	}
}

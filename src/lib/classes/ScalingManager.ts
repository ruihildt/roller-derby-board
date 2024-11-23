export class ScalingManager {
	private static instance: ScalingManager;
	private _pixelsPerMeter: number;
	private _canvasWidth: number;
	private _canvasHeight: number;
	private _trackWidthMeters: number;

	private constructor() {
		this._pixelsPerMeter = 0;
		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._trackWidthMeters = 35.1;
	}

	static getInstance(): ScalingManager {
		if (!ScalingManager.instance) {
			ScalingManager.instance = new ScalingManager();
		}
		return ScalingManager.instance;
	}

	updateDimensions(canvas: HTMLCanvasElement, trackWidthMeters: number) {
		this._canvasWidth = canvas.width;
		this._canvasHeight = canvas.height;
		this._trackWidthMeters = trackWidthMeters;
		this._pixelsPerMeter = this._canvasWidth / this._trackWidthMeters;

		// Dispatch event for all subscribers
		window.dispatchEvent(new CustomEvent('scalingUpdate'));
	}

	scaleLength(meters: number): number {
		return meters * this._pixelsPerMeter;
	}

	scalePosition(x: number, y: number): { x: number; y: number } {
		return {
			x: x * this._canvasWidth,
			y: y * this._canvasHeight
		};
	}
}

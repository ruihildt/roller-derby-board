import { BASE_ZOOM, colors, MAX_ZOOM, MIN_ZOOM, ZOOM_INCREMENT } from '$lib/constants';

export class ScalingManager {
	private static instance: ScalingManager;
	private _canvasWidth: number;
	private _canvasHeight: number;
	private _zoomLevel: number;
	private _panX: number;
	private _panY: number;

	private constructor() {
		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._zoomLevel = BASE_ZOOM;
		this._panX = 0;
		this._panY = 0;
	}

	static getInstance(): ScalingManager {
		if (!ScalingManager.instance) {
			ScalingManager.instance = new ScalingManager();
		}
		return ScalingManager.instance;
	}

	setZoom(level: number, centerX: number, centerY: number) {
		const oldZoom = this._zoomLevel;
		this._zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));

		// Calculate the world coordinates of the zoom center
		const worldX = (centerX / oldZoom + this._panX) / this._canvasWidth;
		const worldY = (centerY / oldZoom + this._panY) / this._canvasHeight;

		// Update pan to maintain the center point
		this._panX = worldX * this._canvasWidth - centerX / this._zoomLevel;
		this._panY = worldY * this._canvasHeight - centerY / this._zoomLevel;

		window.dispatchEvent(new CustomEvent('scalingUpdate'));
	}

	applyTransform(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.scale(this._zoomLevel, this._zoomLevel);
		ctx.translate(-this._panX, -this._panY);
	}

	restoreTransform(ctx: CanvasRenderingContext2D) {
		ctx.restore();
	}

	// Add new methods:
	applyTransformToCanvas(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d')!;
		this.applyTransform(ctx);
	}

	clearAndResetCanvas(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = colors.canvasBackground;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Convert screen coordinates to world coordinates
	screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
		return {
			x: screenX / this._zoomLevel + this._panX,
			y: screenY / this._zoomLevel + this._panY
		};
	}

	// Convert world coordinates to screen coordinates
	worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
		return {
			x: (worldX - this._panX) * this._zoomLevel,
			y: (worldY - this._panY) * this._zoomLevel
		};
	}

	transformTouchEvent(event: TouchEvent): TouchEvent {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		const touch = event.touches[0];
		if (touch) {
			const { x, y } = this.screenToWorld(touch.clientX - rect.left, touch.clientY - rect.top);

			const transformedTouch = new Touch({
				identifier: touch.identifier,
				target: touch.target,
				clientX: x,
				clientY: y,
				screenX: touch.screenX,
				screenY: touch.screenY,
				pageX: touch.pageX,
				pageY: touch.pageY,
				radiusX: touch.radiusX,
				radiusY: touch.radiusY,
				rotationAngle: touch.rotationAngle,
				force: touch.force
			});

			return new TouchEvent(event.type, {
				...event,
				touches: [transformedTouch],
				targetTouches: [transformedTouch],
				changedTouches: [transformedTouch]
			});
		}
		return event;
	}

	get zoomLevel(): number {
		return this._zoomLevel;
	}

	setZoomAndPan(zoom: number, panX: number, panY: number) {
		this._zoomLevel = zoom;
		this._panX = panX;
		this._panY = panY;
	}

	get panX(): number {
		return this._panX;
	}

	get panY(): number {
		return this._panY;
	}

	private getCanvasCenter(): { x: number; y: number } {
		return {
			x: this._canvasWidth / 2,
			y: this._canvasHeight / 2
		};
	}

	zoomIn(): void {
		const center = this.getCanvasCenter();
		this.setZoom(this._zoomLevel + ZOOM_INCREMENT, center.x, center.y);
	}

	zoomOut(): void {
		const center = this.getCanvasCenter();
		this.setZoom(this._zoomLevel - ZOOM_INCREMENT, center.x, center.y);
	}

	resetZoom(): void {
		const center = this.getCanvasCenter();
		this.setZoom(BASE_ZOOM, center.x, center.y);
		this._panX = 0;
		this._panY = 0;
	}

	resetView() {
		this._zoomLevel = BASE_ZOOM;
		this._panX = 0;
		this._panY = 0;

		window.dispatchEvent(new CustomEvent('scalingUpdate'));
	}

	setPan(deltaX: number, deltaY: number) {
		this._panX += deltaX * this._zoomLevel;
		this._panY += deltaY * this._zoomLevel;
		window.dispatchEvent(new CustomEvent('scalingUpdate'));
	}
}

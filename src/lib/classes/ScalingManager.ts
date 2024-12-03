import { get } from 'svelte/store';
import { BASE_ZOOM, colors, MAX_ZOOM, MIN_ZOOM, ZOOM_INCREMENT } from '$lib/constants';
import { TransformManager } from './scaling/TransformManager';

import { CoordinateManager } from './scaling/CoordinateManager';
import { viewport } from '$lib/stores/viewport';

export class ScalingManager {
	private transformManager: TransformManager;
	private coordinateManager: CoordinateManager;

	constructor(
		private canvasWidth: number = 0,
		private canvasHeight: number = 0
	) {
		const getState = () => get(viewport);

		this.transformManager = new TransformManager(getState);
		this.coordinateManager = new CoordinateManager(getState);

		viewport.subscribe(() => {
			window.dispatchEvent(new CustomEvent('scalingUpdate'));
		});
	}

	// Public API delegating to specialized managers
	applyTransform(ctx: CanvasRenderingContext2D) {
		this.transformManager.applyTransform(ctx);
	}

	restoreTransform(ctx: CanvasRenderingContext2D) {
		this.transformManager.restoreTransform(ctx);
	}

	screenToWorld(x: number, y: number) {
		return this.coordinateManager.screenToWorld({ x, y });
	}

	worldToScreen(x: number, y: number) {
		return this.coordinateManager.worldToScreen({ x, y });
	}

	setZoom(level: number, centerX: number, centerY: number) {
		const state = get(viewport);
		const oldZoom = state.zoom;
		const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));

		const worldX = (centerX / oldZoom + state.panX) / this.canvasWidth;
		const worldY = (centerY / oldZoom + state.panY) / this.canvasHeight;

		viewport.set({
			zoom: newZoom,
			panX: worldX * this.canvasWidth - centerX / newZoom,
			panY: worldY * this.canvasHeight - centerY / newZoom
		});
	}

	zoomIn() {
		viewport.update((state) => {
			const newZoom = Math.min(state.zoom + ZOOM_INCREMENT, MAX_ZOOM);
			return {
				...state,
				zoom: newZoom,
				panX: state.panX * (newZoom / state.zoom),
				panY: state.panY * (newZoom / state.zoom)
			};
		});
	}

	zoomOut() {
		viewport.update((state) => {
			const newZoom = Math.max(state.zoom - ZOOM_INCREMENT, MIN_ZOOM);
			return {
				...state,
				zoom: newZoom,
				panX: state.panX * (newZoom / state.zoom),
				panY: state.panY * (newZoom / state.zoom)
			};
		});
	}

	resetView() {
		viewport.set({
			zoom: BASE_ZOOM,
			panX: 0,
			panY: 0
		});
	}

	resetZoom() {
		viewport.update((state) => ({
			...state,
			zoom: BASE_ZOOM
		}));
	}

	// Canvas utilities
	clearAndResetCanvas(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = colors.canvasBackground;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Add this method to ScalingManager class
	applyTransformToCanvas(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d')!;
		this.transformManager.applyTransform(ctx);
	}

	// State access
	get zoomLevel(): number {
		return get(viewport).zoom;
	}

	get panX(): number {
		return get(viewport).panX;
	}

	get panY(): number {
		return get(viewport).panY;
	}

	setZoomAndPan(zoom: number, panX: number, panY: number) {
		viewport.set({ zoom, panX, panY });
	}

	setPan(deltaX: number, deltaY: number) {
		viewport.update((state) => ({
			...state,
			panX: state.panX + deltaX * state.zoom,
			panY: state.panY + deltaY * state.zoom
		}));
	}
}

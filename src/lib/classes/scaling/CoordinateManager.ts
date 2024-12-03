import type { ViewportState } from '$lib/stores/viewport';
import type { Point } from '$lib/types';

export class CoordinateManager {
	constructor(private getState: () => ViewportState) {}

	screenToWorld(point: Point): Point {
		const state = this.getState();
		return {
			x: point.x / state.zoom + state.panX,
			y: point.y / state.zoom + state.panY
		};
	}

	worldToScreen(point: Point): Point {
		const state = this.getState();
		return {
			x: (point.x - state.panX) * state.zoom,
			y: (point.y - state.panY) * state.zoom
		};
	}
}

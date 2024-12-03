import { derived } from 'svelte/store';
import { viewport } from './viewport';
import type { Point } from '$lib/types';

export const transformedCoordinates = derived(viewport, ($viewport) => ({
	screenToWorld: (point: Point): Point => ({
		x: point.x / $viewport.zoom + $viewport.panX,
		y: point.y / $viewport.zoom + $viewport.panY
	}),
	worldToScreen: (point: Point): Point => ({
		x: (point.x - $viewport.panX) * $viewport.zoom,
		y: (point.y - $viewport.panY) * $viewport.zoom
	})
}));

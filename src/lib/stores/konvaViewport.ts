import { BASE_ZOOM } from '$lib/constants';
import { writable } from 'svelte/store';

export interface KonvaViewportState {
	zoom: number;
	x: number;
	y: number;
}
export const konvaViewport = writable<KonvaViewportState>({
	zoom: BASE_ZOOM,
	x: 0,
	y: 0
});

import { writable } from 'svelte/store';
import { BASE_ZOOM } from '$lib/constants';

export interface ViewportState {
	zoom: number;
	panX: number;
	panY: number;
}

export const viewport = writable<ViewportState>({
	zoom: BASE_ZOOM,
	panX: 0,
	panY: 0
});

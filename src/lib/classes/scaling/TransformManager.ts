import type { ViewportState } from '$lib/stores/viewport';

export class TransformManager {
	constructor(private getState: () => ViewportState) {}

	applyTransform(ctx: CanvasRenderingContext2D) {
		const state = this.getState();
		ctx.save();
		ctx.scale(state.zoom, state.zoom);
		ctx.translate(-state.panX, -state.panY);
	}

	restoreTransform(ctx: CanvasRenderingContext2D) {
		ctx.restore();
	}
}

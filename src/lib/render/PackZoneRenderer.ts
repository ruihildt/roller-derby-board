import type { PackManager } from '../classes/PackManager';

export class PackZoneRenderer {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCtx: CanvasRenderingContext2D;
	packManager: PackManager;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		highResCanvas: HTMLCanvasElement,
		highResCtx: CanvasRenderingContext2D,
		packManager: PackManager
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCtx;
		this.packManager = packManager;
	}

	drawEngagementZone(ctx: CanvasRenderingContext2D): void {
		const engagementZonePath = this.packManager.engagementZone;
		if (engagementZonePath) {
			// Draw engagement zone (20ft behind and ahead of the pack)
			ctx.fillStyle = 'rgba(144, 238, 144, 0.4)'; // Light green with transparency
			ctx.fill(engagementZonePath, 'evenodd');
		}
	}

	drawEngagementZoneHighRes(): void {
		if (!this.highResCanvas) return;
		this.drawEngagementZone(this.highResCtx);
	}
}

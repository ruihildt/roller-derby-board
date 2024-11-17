import type { PackManager } from './PackManager';
import type { TrackGeometry } from './TrackGeometry';

export class PackZoneRenderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;
	packManager: PackManager;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		trackGeometry: TrackGeometry,
		packManager: PackManager
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.trackGeometry = trackGeometry;
		this.packManager = packManager;
	}

	draw(): void {
		const packPlayers = this.packManager.players.filter((p) => p.isInPack);
		const rearmost = packPlayers.find((p) => p.isRearmost);
		const foremost = packPlayers.find((p) => p.isForemost);

		if (rearmost && foremost) {
			// Draw engagement zone (20ft behind and ahead of the pack)
			const engagementZonePath = this.trackGeometry.createEngagementZonePath(rearmost, foremost);
			this.ctx.fillStyle = 'rgba(144, 238, 144, 0.4)'; // Light green with transparency
			this.ctx.fill(engagementZonePath, 'evenodd');
		}
	}
}

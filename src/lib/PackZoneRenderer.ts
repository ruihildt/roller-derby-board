import type { PackManager } from './PackManager';
import type { TrackGeometry } from './TrackGeometry';

export class PackZoneRenderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;
	packManager: PackManager;
	PIXELS_PER_METER: number;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		trackGeometry: TrackGeometry,
		packManager: PackManager,
		PIXELS_PER_METER: number
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.trackGeometry = trackGeometry;
		this.packManager = packManager;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
	}

	draw(): void {
		const packPlayers = this.packManager.players.filter((p) => p.isInPack);
		const rearmost = packPlayers.find((p) => p.isRearmost);
		const foremost = packPlayers.find((p) => p.isForemost);

		if (rearmost && foremost) {
			const path = this.trackGeometry.createPackZonePath(
				rearmost,
				foremost,
				this.packManager.zones
			);

			this.ctx.fillStyle = 'rgba(255, 192, 203, 0.8)'; // Pink with transparency
			this.ctx.fill(path, 'evenodd');

			// console.log('Pack zone updated');
		}
	}
}

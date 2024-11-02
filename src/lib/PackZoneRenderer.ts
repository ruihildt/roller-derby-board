import type { PackManager } from './PackManager';
import type { Player } from './Player';
import type { TrackGeometry } from './TrackGeometry';

export class PackZoneRenderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;
	packManager: PackManager;
	PIXELS_PER_METER: number;

	private lastRearmost: Player | undefined = undefined;
	private lastForemost: Player | undefined = undefined;

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

		// Subscribe to pack changes
		packManager.addEventListener('packChanged', () => this.draw());
	}

	draw(): void {
		const packPlayers = this.packManager.players.filter((p) => p.isInPack);
		const rearmost = packPlayers.find((p) => p.isRearmost);
		const foremost = packPlayers.find((p) => p.isForemost);

		// Only redraw if pack boundaries changed
		if (rearmost !== this.lastRearmost || foremost !== this.lastForemost) {
			console.log('Pack boundaries changed, redrawing...');
			this.lastRearmost = rearmost;
			this.lastForemost = foremost;

			if (rearmost && foremost) {
				const packZonePath = this.trackGeometry.createPackZonePath(
					rearmost,
					foremost,
					this.packManager.getZones()
				);
				this.ctx.fillStyle = 'rgba(144, 238, 144, 0.2)';
				this.ctx.fill(packZonePath);
			}
		}
	}
}

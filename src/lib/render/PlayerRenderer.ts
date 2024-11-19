import type { PackManager } from '../classes/PackManager';
import type { Player } from '../classes/Player';
import { TrackGeometry } from '../classes/TrackGeometry';

export class PlayerRenderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCanvas: HTMLCanvasElement;
	highResCtx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;
	packManager: PackManager;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		highResCanvas: HTMLCanvasElement,
		highResCtx: CanvasRenderingContext2D,
		trackGeometry: TrackGeometry,
		packManager: PackManager
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCtx;
		this.trackGeometry = trackGeometry;
		this.packManager = packManager;
	}

	drawPlayers(players: Player[]): void {
		for (const player of players) {
			this.drawPlayer(player, this.ctx);
		}
	}

	drawPlayersHighRes(players: Player[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCtx;
		for (const player of players) {
			this.drawPlayer(player, ctx);
		}
	}

	drawPlayer(player: Player, ctx: CanvasRenderingContext2D): void {
		// Draw existing player circle and details
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);

		ctx.fillStyle = player.color;

		ctx.fill();

		ctx.strokeStyle = player.isInPack
			? 'green'
			: player.isInEngagementZone && player.role === 'blocker'
				? 'orange'
				: player.inBounds
					? 'black'
					: 'red';
		ctx.lineWidth = 4;
		ctx.stroke();

		ctx.fillStyle = player.team === 'A' ? 'white' : 'black';
		ctx.font =
			'bold 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(player.role[0].toUpperCase(), player.x, player.y);
	}
}

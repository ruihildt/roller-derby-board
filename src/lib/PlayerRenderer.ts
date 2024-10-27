import type { Player } from './Player';
import { TrackGeometry } from './TrackGeometry';

export class PlayerRenderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCanvas: HTMLCanvasElement;
	highResCtx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		highResCanvas: HTMLCanvasElement,
		highResCtx: CanvasRenderingContext2D,
		trackGeometry: TrackGeometry
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCtx;
		this.trackGeometry = trackGeometry;
	}

	drawPlayers(players: Player[]): void {
		for (const player of players) {
			this.drawPlayer(player, this.ctx);
			if (this.trackGeometry.isPlayerInBounds(player)) {
				this.trackGeometry.drawPerpendicularLine(player);
			}
		}
	}

	drawPackZone(players: Player[]): void {
		const packPlayers = players.filter((p) => p.isInPack);
		const rearmost = packPlayers.find((p) => p.isRearmost);
		const foremost = packPlayers.find((p) => p.isForemost);

		if (rearmost && foremost) {
			const packZonePath = this.trackGeometry.createPackZonePath(rearmost, foremost);
			this.ctx.fillStyle = 'rgba(144, 238, 144, 0.2)'; // Light green with transparency
			this.ctx.fill(packZonePath);
		}
	}

	drawPlayersHighRes(players: Player[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCtx;
		for (const player of players) {
			this.drawPlayer(player, ctx);
			if (this.trackGeometry.isPlayerInBounds(player)) {
				this.trackGeometry.drawPerpendicularLine(player);
			}
		}
	}

	drawPlayer(player: Player, ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);

		if (player.isRearmost) {
			ctx.fillStyle = 'magenta';
		} else if (player.isForemost) {
			ctx.fillStyle = 'cyan';
		} else {
			ctx.fillStyle = player.color;
		}
		ctx.fill();

		ctx.strokeStyle = player.isInPack ? 'pink' : player.inBounds ? 'black' : 'red';
		ctx.lineWidth = 4;
		ctx.stroke();

		ctx.fillStyle = 'white';
		ctx.font = '10px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(player.role[0].toUpperCase(), player.x, player.y);
	}
}

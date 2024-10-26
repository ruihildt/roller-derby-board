import type { Player } from './Player';
import { TrackGeometry } from './TrackGeometry';

export class PlayerRenderer {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	trackGeometry: TrackGeometry;

	constructor(
		canvas: HTMLCanvasElement,
		highResCanvas: HTMLCanvasElement,
		trackGeometry: TrackGeometry
	) {
		this.canvas = canvas;
		this.highResCanvas = highResCanvas;
		this.ctx = canvas.getContext('2d')!;
		this.trackGeometry = trackGeometry;
	}

	drawPlayers(players: Player[]): void {
		for (const player of players) {
			this.drawPlayer(player, this.ctx);
			if (this.trackGeometry.isPlayerInBounds(player)) {
				this.trackGeometry.drawPerpendicularLine({ x: player.x, y: player.y });
			}
		}
	}

	drawPlayersHighRes(players: Player[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCanvas.getContext('2d')!;
		for (const player of players) {
			this.drawPlayer(player, ctx);
			if (this.trackGeometry.isPlayerInBounds(player)) {
				this.trackGeometry.drawPerpendicularLine({ x: player.x, y: player.y }, ctx);
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

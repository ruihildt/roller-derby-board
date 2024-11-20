import type { PackManager } from '../classes/PackManager';
import { PlayerRole, type Player } from '../classes/Player';
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
		// Base circle
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
		ctx.fillStyle = player.color;
		ctx.fill();

		// Draw pivot stripe
		if (player.role === PlayerRole.pivot) {
			ctx.beginPath();
			ctx.rect(player.x - player.radius, player.y - 4, player.radius * 2, 7);
			ctx.fillStyle = player.team === 'A' ? 'deepskyblue' : 'black';
			ctx.fill();
		}

		// Draw jammer star
		if (player.role === PlayerRole.jammer) {
			const starSize = player.radius * 0.8;
			ctx.beginPath();
			for (let i = 0; i < 5; i++) {
				const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
				const x = player.x + Math.cos(angle) * starSize;
				const y = player.y + Math.sin(angle) * starSize;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.closePath();
			ctx.fillStyle = player.team === 'A' ? 'deepskyblue' : 'black';
			ctx.fill();
		}

		// Border drawn last
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
		ctx.strokeStyle = player.isInPack
			? 'green'
			: player.isInEngagementZone && player.role !== PlayerRole.jammer
				? 'orange'
				: player.inBounds
					? 'black'
					: 'red';

		ctx.lineWidth = 4;
		ctx.stroke();
	}
}

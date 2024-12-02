import type { PackManager } from '../classes/PackManager';
import { TeamPlayerRole, type TeamPlayer } from '../classes/TeamPlayer';
import { SkatingOfficial, SkatingOfficialRole } from '../classes/SkatingOfficial';
import { TrackGeometry } from '../classes/TrackGeometry';
import { colors, LINE_WIDTH } from '$lib/constants';

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

	drawPlayers(players: TeamPlayer[]): void {
		for (const player of players) {
			this.drawPlayer(player, this.ctx);
		}
	}

	drawSkatingOfficials(skatingOfficials: SkatingOfficial[]): void {
		const ctx = this.ctx;
		for (const skatingOfficial of skatingOfficials) {
			// Base white circle
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.fillStyle = colors.officialPrimary;
			ctx.fill();

			// Draw 7 vertical stripes
			const stripeCount = 7;
			const stripeWidth = (skatingOfficial.radius * 2) / stripeCount;

			ctx.save();
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.clip();

			for (let i = 0; i < stripeCount; i++) {
				if (i % 2 === 0) {
					ctx.fillStyle = colors.officialSecondary;
					ctx.fillRect(
						skatingOfficial.x - skatingOfficial.radius + i * stripeWidth,
						skatingOfficial.y - skatingOfficial.radius,
						stripeWidth,
						skatingOfficial.radius * 2
					);
				}
			}
			ctx.restore();

			// Inside the if block for jam refs
			if (
				skatingOfficial.role === SkatingOfficialRole.jamRefA ||
				skatingOfficial.role === SkatingOfficialRole.jamRefB
			) {
				const starSize = skatingOfficial.radius * 0.7;
				const outlineSize = starSize + 4; // Slightly larger for outline

				// Draw outline star first
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
					const x = skatingOfficial.x + Math.cos(angle) * outlineSize;
					const y = skatingOfficial.y + Math.sin(angle) * outlineSize;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fillStyle = colors.officialSecondary;
				ctx.fill();

				// Draw main star
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
					const x = skatingOfficial.x + Math.cos(angle) * starSize;
					const y = skatingOfficial.y + Math.sin(angle) * starSize;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fillStyle =
					skatingOfficial.role === SkatingOfficialRole.jamRefA
						? colors.teamAPrimary
						: colors.teamBPrimary;
				ctx.fill();
			}

			// Circle border
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.strokeStyle = colors.officialSecondary;
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	drawSkatingOfficialsHighRes(skatingOfficials: SkatingOfficial[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCtx;
		for (const skatingOfficial of skatingOfficials) {
			// Base white circle
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.fillStyle = colors.officialPrimary;
			ctx.fill();

			// Draw 7 vertical stripes
			const stripeCount = 7;
			const stripeWidth = (skatingOfficial.radius * 2) / stripeCount;

			ctx.save();
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.clip();

			for (let i = 0; i < stripeCount; i++) {
				if (i % 2 === 0) {
					ctx.fillStyle = colors.officialSecondary;
					ctx.fillRect(
						skatingOfficial.x - skatingOfficial.radius + i * stripeWidth,
						skatingOfficial.y - skatingOfficial.radius,
						stripeWidth,
						skatingOfficial.radius * 2
					);
				}
			}
			ctx.restore();

			// Inside the if block for jam refs
			if (
				skatingOfficial.role === SkatingOfficialRole.jamRefA ||
				skatingOfficial.role === SkatingOfficialRole.jamRefB
			) {
				const starSize = skatingOfficial.radius * 0.7;
				const outlineSize = starSize + 4; // Slightly larger for outline

				// Draw outline star first
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
					const x = skatingOfficial.x + Math.cos(angle) * outlineSize;
					const y = skatingOfficial.y + Math.sin(angle) * outlineSize;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fillStyle = 'colors.officialSecondary';
				ctx.fill();

				// Draw main star
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
					const x = skatingOfficial.x + Math.cos(angle) * starSize;
					const y = skatingOfficial.y + Math.sin(angle) * starSize;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fillStyle =
					skatingOfficial.role === SkatingOfficialRole.jamRefA
						? colors.teamAPrimary
						: colors.teamBPrimary;
				ctx.fill();
			}

			// Circle border
			ctx.beginPath();
			ctx.arc(skatingOfficial.x, skatingOfficial.y, skatingOfficial.radius, 0, Math.PI * 2);
			ctx.strokeStyle = colors.officialSecondary;
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	drawPlayersHighRes(players: TeamPlayer[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCtx;
		for (const player of players) {
			this.drawPlayer(player, ctx);
		}
	}

	drawPlayer(player: TeamPlayer, ctx: CanvasRenderingContext2D): void {
		const teamColor = player.team === 'A' ? colors.teamAPrimary : colors.teamBPrimary;

		// Base circle with correct scaling
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
		ctx.fillStyle = teamColor;
		ctx.fill();

		// Draw pivot stripe with scaled dimensions
		if (player.role === TeamPlayerRole.pivot) {
			const stripeHeight = player.radius * 0.5;
			ctx.beginPath();
			ctx.rect(
				player.x - player.radius,
				player.y - stripeHeight / 2,
				player.radius * 2,
				stripeHeight
			);
			ctx.fillStyle = player.team === 'A' ? colors.teamASecondary : colors.teamBSecondary;
			ctx.fill();
		}

		// Draw jammer star with scaled dimensions
		if (player.role === TeamPlayerRole.jammer) {
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
			ctx.fillStyle = player.team === 'A' ? colors.teamASecondary : colors.teamBSecondary;
			ctx.fill();
		}

		// Border with scaled line width
		ctx.beginPath();
		ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
		ctx.strokeStyle = player.isInPack
			? colors.inPack
			: player.isInEngagementZone && player.role !== TeamPlayerRole.jammer
				? colors.inEngagementZone
				: player.inBounds
					? colors.inBounds
					: colors.outOfBounds;

		ctx.lineWidth = LINE_WIDTH;
		ctx.stroke();
	}
}

import { Player } from '$lib/Player';
import type { Point } from '$lib/types';
import { isAngleBetween, distance } from '$lib/utils';

export class PlayerManager {
	canvas: HTMLCanvasElement;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;
	players: Player[];
	selectedPlayer: Player | null;

	constructor(canvas: HTMLCanvasElement, points: Record<string, Point>, PIXELS_PER_METER: number) {
		this.canvas = canvas;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.players = [];
		this.selectedPlayer = null;

		this.initializePlayers();
	}

	initializePlayers(): void {
		// Calculate player radius based on canvas width
		const playerRadius = Math.max(0, Math.floor(this.canvas.width / 70));
		const { I, K, G, E } = this.points;

		// Function to get a random position within the specified area for blockers
		const getRandomBlockerPosition = () => {
			const minX = Math.min(I.x, K.x);
			const maxX = Math.max(G.x, E.x);
			const minY = Math.min(I.y, G.y);
			const maxY = Math.max(K.y, E.y);

			return {
				x: Math.random() * (maxX - minX) + minX,
				y: Math.random() * (maxY - minY) + minY
			};
		};

		// Create 4 blockers for Team A
		for (let i = 0; i < 4; i++) {
			const pos = getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'A', 'blocker', playerRadius));
		}

		// Create 4 blockers for Team B
		for (let i = 0; i < 4; i++) {
			const pos = getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'B', 'blocker', playerRadius));
		}

		// Add jammers
		const jammerPosA = this.getJammerLinePosition();
		const jammerPosB = this.getJammerLinePosition();
		this.players.push(new Player(jammerPosA.x, jammerPosA.y, 'A', 'jammer', playerRadius));
		this.players.push(new Player(jammerPosB.x, jammerPosB.y, 'B', 'jammer', playerRadius));
	}

	getJammerLinePosition(): Point {
		const JAMMER_LINE_OFFSET = -2 * this.PIXELS_PER_METER; // 0.5 meters offset

		const { I, C } = this.points;
		// Calculate a random position along the jammer line
		const t = Math.random();

		// Calculate the direction vector of the jammer line
		const dx = C.x - I.x;
		const dy = C.y - I.y;

		// Normalize the direction vector
		const length = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / length;
		const normalizedDy = dy / length;

		// Calculate the offset perpendicular to the jammer line
		const offsetX = -normalizedDy * JAMMER_LINE_OFFSET;
		const offsetY = normalizedDx * JAMMER_LINE_OFFSET;

		return {
			x: I.x + t * (C.x - I.x) + offsetX,
			y: I.y + t * (C.y - I.y) + offsetY
		};
	}

	isPlayerInBounds(player: Player): boolean {
		// Check if the player is in the turn
		if (this.isPlayerInTurn(player)) {
			return true;
		}

		// Check if the player is in the straightaway
		if (this.isPlayerInStraightaway(player)) {
			return true;
		}

		// If the player is neither in the turn nor in the straightaway, they're out of bounds
		return false;
	}

	isPlayerInTurn(player: Player): boolean {
		const { A, B, G, H, C, D, E, F, I, J, K, L } = this.points;

		// Check right turn
		const inRightTurn = this.isPlayerInSingleTurn(player, A, G, C, D, I, J);

		// Check left turn
		const inLeftTurn = this.isPlayerInSingleTurn(player, B, H, F, E, L, K);

		return inRightTurn || inLeftTurn;
	}

	isPlayerInSingleTurn(
		player: Player,
		centerInner: Point,
		centerOuter: Point,
		innerPoint1: Point,
		innerPoint2: Point,
		outerPoint1: Point,
		outerPoint2: Point
	): boolean {
		const distToInner = distance(player, centerInner);
		const distToOuter = distance(player, centerOuter);

		const innerRadius = distance(centerInner, innerPoint1);
		const outerRadius = distance(centerOuter, outerPoint1);

		// Check if any part of the player is within the turn
		if (distToInner - player.radius >= innerRadius && distToOuter + player.radius <= outerRadius) {
			const angleInner1 = Math.atan2(innerPoint1.y - centerInner.y, innerPoint1.x - centerInner.x);
			const angleInner2 = Math.atan2(innerPoint2.y - centerInner.y, innerPoint2.x - centerInner.x);
			const angleInnerPlayer = Math.atan2(player.y - centerInner.y, player.x - centerInner.x);

			const angleOuter1 = Math.atan2(outerPoint1.y - centerOuter.y, outerPoint1.x - centerOuter.x);
			const angleOuter2 = Math.atan2(outerPoint2.y - centerOuter.y, outerPoint2.x - centerOuter.x);
			const angleOuterPlayer = Math.atan2(player.y - centerOuter.y, player.x - centerOuter.x);

			const inInnerArc = isAngleBetween(angleInnerPlayer, angleInner1, angleInner2);
			const inOuterArc = isAngleBetween(angleOuterPlayer, angleOuter1, angleOuter2);

			return inInnerArc || inOuterArc;
		}

		return false;
	}

	isPlayerInStraightaway(player: Player): boolean {
		const { K, E, I, C, L, F, D, J } = this.points;

		// Check if player is in the top straightaway
		const innerStraight1 = { start: C, end: E };
		const outerStraight1 = { start: I, end: K };
		const inStraightaway1 = this.isPlayerInSingleStraightaway(
			player,
			innerStraight1,
			outerStraight1
		);

		// Check if player is in the bottom straightaway
		const innerStraight2 = { start: F, end: D };
		const outerStraight2 = { start: L, end: J };
		const inStraightaway2 = this.isPlayerInSingleStraightaway(
			player,
			innerStraight2,
			outerStraight2
		);

		return inStraightaway1 || inStraightaway2;
	}

	isPlayerInSingleStraightaway(
		player: Player,
		innerStraight: { start: Point; end: Point },
		outerStraight: { start: Point; end: Point }
	): boolean {
		// Calculate the direction vector of the inner straightaway
		const innerDx = innerStraight.end.x - innerStraight.start.x;
		const innerDy = innerStraight.end.y - innerStraight.start.y;
		const innerLength = Math.sqrt(innerDx * innerDx + innerDy * innerDy);

		// Normalize the inner direction vector
		const innerNormalizedDx = innerDx / innerLength;
		const innerNormalizedDy = innerDy / innerLength;

		// Calculate the perpendicular vector to the inner straight
		const perpDx = -innerNormalizedDy;
		const perpDy = innerNormalizedDx;

		// Calculate the player's position relative to the inner straight start
		const relativeX = player.x - innerStraight.start.x;
		const relativeY = player.y - innerStraight.start.y;

		// Project the player's position onto the inner straightaway direction
		const projectionOnTrack = relativeX * innerNormalizedDx + relativeY * innerNormalizedDy;

		// Calculate the perpendicular distance from the player to the inner straight
		const perpendicularDistance = Math.abs(relativeX * perpDx + relativeY * perpDy);

		// Check if the player is within the length of the straightaway
		const isWithinLength = projectionOnTrack >= 0 && projectionOnTrack <= innerLength;

		// Calculate the width at the player's projection point
		const tRatio = projectionOnTrack / innerLength;
		const widthStart = distance(innerStraight.start, outerStraight.start);
		const widthEnd = distance(innerStraight.end, outerStraight.end);
		const widthAtPlayer = widthStart + (widthEnd - widthStart) * tRatio;

		// Check if the player's center is within the track boundaries, including the player's radius
		const isWithinWidth =
			perpendicularDistance >= player.radius &&
			perpendicularDistance <= widthAtPlayer - player.radius;

		return isWithinLength && isWithinWidth;
	}

	handleMouseDown(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		for (const player of this.players) {
			if (player.containsPoint(x, y)) {
				this.selectedPlayer = player;
				player.isDragging = true;
				player.dragOffsetX = x - player.x;
				player.dragOffsetY = y - player.y;
				break;
			}
		}
	}

	handleMouseMove(event: MouseEvent): void {
		if (this.selectedPlayer && this.selectedPlayer.isDragging) {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			this.selectedPlayer.x = x - this.selectedPlayer.dragOffsetX;
			this.selectedPlayer.y = y - this.selectedPlayer.dragOffsetY;
		}
	}

	handleMouseUp(): void {
		if (this.selectedPlayer) {
			this.selectedPlayer.isDragging = false;
			this.selectedPlayer = null;
		}
	}

	updatePlayers(): void {
		for (const player of this.players) {
			player.update();
			player.inBounds = this.isPlayerInBounds(player);
		}

		if (this.selectedPlayer) {
			this.selectedPlayer.inBounds = this.isPlayerInBounds(this.selectedPlayer);
		}
	}
}

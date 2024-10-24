import { Player } from '$lib/Player';
import { PackManager } from '$lib/PackManager';
import { Renderer } from '$lib/Renderer';
import type { Point } from '$lib/types';

export class PlayerManager {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;
	players: Player[];
	selectedPlayer: Player | null;
	renderer: Renderer;
	playerRadius: number;
	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	packManager: PackManager;

	constructor(
		canvas: HTMLCanvasElement,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer,
		isInitialLoad: boolean
	) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d')!;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.players = [];
		this.selectedPlayer = null;
		this.renderer = renderer;
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;

		this.playerRadius = Math.max(0, Math.floor(this.canvas.width / 70));
		this.packManager = new PackManager(PIXELS_PER_METER, points);

		if (isInitialLoad) {
			this.initializePlayers();
			this.evaluatePack();
			console.log('Initial pack evaluation complete');
		}
	}

	resize(
		canvas: HTMLCanvasElement,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer
	): void {
		// Calculate track center from new points
		const centerX = (points.A.x + points.B.x) / 2;
		const centerY = (points.A.y + points.B.y) / 2;

		// Calculate old track center
		const oldCenterX = (this.points.A.x + this.points.B.x) / 2;
		const oldCenterY = (this.points.A.y + this.points.B.y) / 2;

		// Calculate scale factors relative to track size
		const scaleX = (points.A.x - points.B.x) / (this.points.A.x - this.points.B.x);
		const scaleY = (points.I.y - points.J.y) / (this.points.I.y - this.points.J.y);

		// Update instance properties
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.renderer = renderer;

		// Scale player positions relative to track center
		this.players.forEach((player) => {
			// Translate to origin relative to old center
			const relX = player.x - oldCenterX;
			const relY = player.y - oldCenterY;

			// Scale
			const newX = relX * scaleX;
			const newY = relY * scaleY;

			// Translate back using new center
			player.x = newX + centerX;
			player.y = newY + centerY;

			// Update radius
			player.radius = Math.max(0, Math.floor(canvas.width / 70));
		});

		// Update track areas and pack distance
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;
		this.packManager.PACK_DISTANCE = 3.05 * PIXELS_PER_METER;
	}

	initializePlayers(): void {
		// Create 4 blockers for Team A
		for (let i = 0; i < 4; i++) {
			const pos = this.getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'A', 'blocker', this.playerRadius));
		}

		// Create 4 blockers for Team B
		for (let i = 0; i < 4; i++) {
			const pos = this.getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'B', 'blocker', this.playerRadius));
		}

		// Add jammers
		const jammerPosA = this.getJammerLinePosition();
		const jammerPosB = this.getJammerLinePosition();
		this.players.push(new Player(jammerPosA.x, jammerPosA.y, 'A', 'jammer', this.playerRadius));
		this.players.push(new Player(jammerPosB.x, jammerPosB.y, 'B', 'jammer', this.playerRadius));

		this.players.forEach((player) => {
			player.inBounds = this.isPlayerInBounds(player);
			this.updatePlayerZone(player);
			player.onPositionChange = () => {
				player.inBounds = this.isPlayerInBounds(player);
				this.evaluatePack();
			};
		});
	}

	getRandomBlockerPosition(): Point {
		const ctx = this.canvas.getContext('2d')!;
		let attempts = 0;
		const maxAttempts = 1000; // Adjust this value as needed

		while (attempts < maxAttempts) {
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;

			// Check the center and four points on the circumference
			const pointsToCheck = [
				{ x, y }, // Center
				{ x: x + this.playerRadius, y }, // Right
				{ x: x - this.playerRadius, y }, // Left
				{ x, y: y + this.playerRadius }, // Bottom
				{ x, y: y - this.playerRadius } // Top
			];

			// Check if all points are inside the straight1Area and in bounds
			const allPointsValid = pointsToCheck.every(
				(point) =>
					ctx.isPointInPath(this.straight1Area, point.x, point.y) &&
					this.isPlayerInBounds(new Player(point.x, point.y, 'A', 'blocker', this.playerRadius))
			);

			// Check for collisions with existing players
			const noCollisions = this.players.every(
				(player) => Math.hypot(player.x - x, player.y - y) > this.playerRadius * 2
			);

			if (allPointsValid && noCollisions) {
				return { x, y };
			}

			attempts++;
		}

		throw new Error('Could not find a valid position for the blocker after maximum attempts');
	}

	getJammerLinePosition(): Point {
		const JAMMER_LINE_OFFSET = -2 * this.PIXELS_PER_METER;
		const { I, C } = this.points;
		let attempts = 0;
		const maxAttempts = 1000; // Adjust this value as needed

		while (attempts < maxAttempts) {
			const t = Math.random();
			const dx = C.x - I.x;
			const dy = C.y - I.y;
			const length = Math.sqrt(dx * dx + dy * dy);
			const normalizedDx = dx / length;
			const normalizedDy = dy / length;
			const offsetX = -normalizedDy * JAMMER_LINE_OFFSET;
			const offsetY = normalizedDx * JAMMER_LINE_OFFSET;
			const x = I.x + t * (C.x - I.x) + offsetX;
			const y = I.y + t * (C.y - I.y) + offsetY;

			// Check the center and four points on the circumference
			const pointsToCheck = [
				{ x, y }, // Center
				{ x: x + this.playerRadius, y }, // Right
				{ x: x - this.playerRadius, y }, // Left
				{ x, y: y + this.playerRadius }, // Bottom
				{ x, y: y - this.playerRadius } // Top
			];

			// Check if all points are in bounds
			const allPointsInBounds = pointsToCheck.every((point) =>
				this.isPlayerInBounds(new Player(point.x, point.y, 'A', 'jammer', this.playerRadius))
			);

			// Check for collisions with existing players
			const noCollisions = this.players.every(
				(player) => Math.hypot(player.x - x, player.y - y) > this.playerRadius * 2
			);

			if (allPointsInBounds && noCollisions) {
				return { x, y };
			}

			attempts++;
		}

		throw new Error('Could not find a valid position for the jammer after maximum attempts');
	}

	isPlayerInBounds(player: Player): boolean {
		// TODO Consider using the zones instead, since we're already using them anyway
		// Check the center and four points on the circumference of the player's circle
		const pointsToCheck = [
			{ x: player.x, y: player.y }, // Center
			{ x: player.x + player.radius, y: player.y }, // Right
			{ x: player.x - player.radius, y: player.y }, // Left
			{ x: player.x, y: player.y + player.radius }, // Bottom
			{ x: player.x, y: player.y - player.radius } // Top
		];

		for (const point of pointsToCheck) {
			// Check if the point is inside the outer track path
			const insideOuterTrack = this.ctx.isPointInPath(
				this.renderer.outerTrackPath,
				point.x,
				point.y
			);

			// Check if the point is outside the inner track path
			const outsideInnerTrack = !this.ctx.isPointInPath(
				this.renderer.innerTrackPath,
				point.x,
				point.y
			);

			// If any point is out of bounds, the player is out of bounds
			if (!insideOuterTrack || !outsideInnerTrack) {
				return false;
			}
		}

		// If all points are in bounds, the player is in bounds
		return true;
	}

	isPlayerInStraight1(player: Player): boolean {
		return this.ctx.isPointInPath(this.straight1Area, player.x, player.y);
	}

	isPlayerInStraight2(player: Player): boolean {
		return this.ctx.isPointInPath(this.straight2Area, player.x, player.y);
	}

	isPlayerInTurn1(player: Player): boolean {
		return this.ctx.isPointInPath(this.turn1Area, player.x, player.y);
	}
	isPlayerInTurn2(player: Player): boolean {
		return this.ctx.isPointInPath(this.turn2Area, player.x, player.y);
	}

	updatePlayerZone(player: Player): void {
		const isInZone1 = this.isPlayerInStraight1(player);
		const isInZone2 = this.isPlayerInTurn1(player);
		const isInZone3 = this.isPlayerInStraight2(player);
		const isInZone4 = this.isPlayerInTurn2(player);

		if (isInZone1) {
			player.zone = 1;
		} else if (isInZone2) {
			player.zone = 2;
		} else if (isInZone3) {
			player.zone = 3;
		} else if (isInZone4) {
			player.zone = 4;
		} else {
			player.zone = 0; // Outside track
		}
		console.log(player.role + ' is in ' + player.zone);
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
			this.selectedPlayer.inBounds = this.isPlayerInBounds(this.selectedPlayer);
			this.updatePlayerZone(this.selectedPlayer);
			this.evaluatePack();
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
		}
	}

	evaluatePack(): void {
		this.packManager.updatePlayers(this.players);
	}
}

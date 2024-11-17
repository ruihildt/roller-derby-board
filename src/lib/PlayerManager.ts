import { Player } from '$lib/Player';
import { PackManager } from '$lib/PackManager';
import { Renderer } from '$lib/Renderer';
import type { Point } from '$lib/types';
import { TrackGeometry } from './TrackGeometry';

export class PlayerManager {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;
	players: Player[];
	selectedPlayer: Player | null;
	trackGeometry: TrackGeometry;
	renderer: Renderer;
	playerRadius: number;
	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	startZone: Path2D;
	packManager: PackManager;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer,
		isInitialLoad: boolean
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.players = [];
		this.selectedPlayer = null;
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER);
		this.renderer = renderer;
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;
		this.startZone = this.trackGeometry.startZone;

		this.playerRadius = Math.max(0, Math.floor(this.canvas.width / 70));
		this.packManager = new PackManager(PIXELS_PER_METER, points, this.trackGeometry);

		if (isInitialLoad) {
			this.initializePlayers();
			this.packManager.updatePlayers(this.players);
			console.log('Initial pack evaluation complete');
		}
	}

	resize(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer
	): void {
		// Calculate scale factors based on track dimensions
		const oldTrackWidth = this.points.A.x - this.points.B.x;
		const newTrackWidth = points.A.x - points.B.x;
		const scale = newTrackWidth / oldTrackWidth;

		// Update core properties
		this.canvas = canvas;
		this.ctx = ctx;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.playerRadius = Math.max(0, Math.floor(canvas.width / 70));

		// Update track areas
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;

		// Scale player positions
		this.players.forEach((player) => {
			player.x = player.x * scale;
			player.y = player.y * scale;
			player.radius = this.playerRadius;
		});

		// Update track geometry
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER);
		// Update player coordinates after resize
		for (const player of this.players) {
			this.trackGeometry.updatePlayerCoordinates(player);
		}

		// Update packManager
		this.packManager = new PackManager(PIXELS_PER_METER, points, this.trackGeometry);
		this.packManager.updatePlayers(this.players);
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
		const jammerPosA = this.getRandomJammerPosition();
		this.players.push(new Player(jammerPosA.x, jammerPosA.y, 'A', 'jammer', this.playerRadius));
		const jammerPosB = this.getRandomJammerPosition();
		this.players.push(new Player(jammerPosB.x, jammerPosB.y, 'B', 'jammer', this.playerRadius));

		this.players.forEach((player) => {
			player.inBounds = this.trackGeometry.isPlayerInBounds(player);
			this.trackGeometry.updatePlayerZone(player);
			this.trackGeometry.updatePlayerCoordinates(player);
		});
	}

	getRandomBlockerPosition(): Point {
		const ctx = this.ctx;
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
					ctx.isPointInPath(this.startZone, point.x, point.y) &&
					this.trackGeometry.isPlayerInBounds(
						new Player(point.x, point.y, 'A', 'blocker', this.playerRadius)
					)
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

	getRandomJammerPosition(): Point {
		const ctx = this.ctx;
		let attempts = 0;
		const maxAttempts = 1000;

		const jammerStartZone = this.trackGeometry.createJammerStartZone();

		while (attempts < maxAttempts) {
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;

			const pointsToCheck = [
				{ x, y },
				{ x: x + this.playerRadius, y },
				{ x: x - this.playerRadius, y },
				{ x, y: y + this.playerRadius },
				{ x, y: y - this.playerRadius }
			];

			const allPointsValid = pointsToCheck.every(
				(point) =>
					ctx.isPointInPath(jammerStartZone, point.x, point.y) &&
					this.trackGeometry.isPlayerInBounds(
						new Player(point.x, point.y, 'A', 'jammer', this.playerRadius)
					)
			);

			// Check for collisions with existing players who are jammers
			const noCollisions = this.players.every(
				(player) => Math.hypot(player.x - x, player.y - y) > this.playerRadius * 2
			);

			if (allPointsValid && noCollisions) {
				return { x, y };
			}

			attempts++;
		}

		throw new Error('Could not find a valid position for the jammer after maximum attempts');
	}

	checkCollision(player1: Player, player2: Player): boolean {
		const dx = player2.x - player1.x;
		const dy = player2.y - player1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const collisionThreshold = player1.radius + player2.radius;
		return distance < collisionThreshold;
	}

	handlePush(pusher: Player, target: Player): void {
		const dx = target.x - pusher.x;
		const dy = target.y - pusher.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		const dirX = dx / distance;
		const dirY = dy / distance;

		const pushForce = 1;

		target.x = pusher.x + dirX * (pusher.radius + target.radius + pushForce);
		target.y = pusher.y + dirY * (pusher.radius + target.radius + pushForce);

		target.inBounds = this.trackGeometry.isPlayerInBounds(target);
		this.trackGeometry.updatePlayerZone(target);
		this.trackGeometry.updatePlayerCoordinates(target);
	}

	handleMouseMove(event: MouseEvent): void {
		const player = this.selectedPlayer;
		if (player && player.isDragging) {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			player.x = x - player.dragOffsetX;
			player.y = y - player.dragOffsetY;

			// Check collisions with other players
			this.players.forEach((otherPlayer) => {
				if (otherPlayer !== player && this.checkCollision(player, otherPlayer)) {
					this.handlePush(player, otherPlayer);
				}
			});

			player.inBounds = this.trackGeometry.isPlayerInBounds(player);
			this.trackGeometry.updatePlayerZone(player);
			this.trackGeometry.updatePlayerCoordinates(player);
			this.packManager.updatePlayers(this.players);
		}
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
}

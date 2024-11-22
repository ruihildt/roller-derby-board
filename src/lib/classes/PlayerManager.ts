import { TeamPlayer, PlayerRole } from '$lib/classes/TeamPlayer';
import { PackManager } from '$lib/classes/PackManager';
import { Renderer } from '$lib/render/Renderer';
import type { Point } from '$lib/types';
import { TrackGeometry } from './TrackGeometry';
import { Player } from './Player';
import { SkatingOfficial, SkatingOfficialRole } from './SkatingOfficial';

export class PlayerManager {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;
	players: TeamPlayer[];
	skatingOfficials: SkatingOfficial[];
	selectedPlayer: Player | null;
	trackGeometry: TrackGeometry;
	renderer: Renderer;
	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	startZone: Path2D;
	packManager: PackManager;
	positions: Record<string, Point>;

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
		Player.setCanvasWidth(canvas.width);
		this.players = [];
		this.skatingOfficials = [];
		this.selectedPlayer = null;
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER);
		this.renderer = renderer;
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;
		this.startZone = this.trackGeometry.startZone;

		this.packManager = new PackManager(PIXELS_PER_METER, points, this.trackGeometry);
		this.positions = {
			OPR1: { x: this.canvas.width * 0.317, y: this.canvas.height * 0.04 },
			OPR2: { x: this.canvas.width * 0.54, y: this.canvas.height * 0.04 },
			OPR3: { x: this.canvas.width * 0.63, y: this.canvas.height * 0.03 },
			FPR: { x: this.canvas.width * 0.46, y: this.canvas.height * 0.422 },
			BPR: { x: this.canvas.width * 0.64, y: this.canvas.height * 0.422 },
			JRTeamA: { x: this.canvas.width * 0.66, y: this.canvas.height * 0.333 },
			JRTeamB: { x: this.canvas.width * 0.634, y: this.canvas.height * 0.356 }
		};

		if (isInitialLoad) {
			this.initializeSkatingOfficials();
			this.initializePlayers();
			this.packManager.updatePlayers(this.players);
		}
	}

	resize(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer
	): void {
		Player.setCanvasWidth(canvas.width);

		// Update radius for all players
		[...this.players, ...this.skatingOfficials].forEach((player) => {
			player.radius = Player.playerRadius;
		});

		// Calculate scale factors based on track dimensions
		const oldTrackWidth = this.points.A.x - this.points.B.x;
		const newTrackWidth = points.A.x - points.B.x;
		const scale = newTrackWidth / oldTrackWidth;

		// Update core properties
		this.canvas = canvas;
		this.ctx = ctx;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		Player.setCanvasWidth(canvas.width);

		// Update track areas
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;

		// Scale player positions
		this.players.forEach((player) => {
			player.x = player.x * scale;
			player.y = player.y * scale;
		});

		// Scale official positions
		// Scale skating officials positions
		this.skatingOfficials.forEach((official) => {
			official.x = official.x * scale;
			official.y = official.y * scale;
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
			const role = i < 3 ? PlayerRole.blocker : PlayerRole.pivot;
			const pos = this.getRandomBlockerPosition(role);
			this.players.push(new TeamPlayer(pos.x, pos.y, 'A', role));
		}

		// Create 4 blockers for Team B
		for (let i = 0; i < 4; i++) {
			const role = i < 3 ? PlayerRole.blocker : PlayerRole.pivot;
			const pos = this.getRandomBlockerPosition(role);
			this.players.push(new TeamPlayer(pos.x, pos.y, 'B', role));
		}

		// Add jammers
		const jammerPosA = this.getRandomJammerPosition();
		this.players.push(new TeamPlayer(jammerPosA.x, jammerPosA.y, 'A', PlayerRole.jammer));
		const jammerPosB = this.getRandomJammerPosition();
		this.players.push(new TeamPlayer(jammerPosB.x, jammerPosB.y, 'B', PlayerRole.jammer));

		this.players.forEach((player) => {
			player.inBounds = this.trackGeometry.isPlayerInBounds(player);
			this.trackGeometry.updatePlayerZone(player);
			this.trackGeometry.updatePlayerCoordinates(player);
		});
	}

	initializeSkatingOfficials(): void {
		const positions = this.positions;

		// Add jam refs
		const jamRefTeamA = new SkatingOfficial(
			positions.JRTeamA.x,
			positions.JRTeamA.y,
			SkatingOfficialRole.jamRef
		);

		const jamRefTeamB = new SkatingOfficial(
			positions.JRTeamB.x,
			positions.JRTeamB.y,
			SkatingOfficialRole.jamRef
		);

		this.skatingOfficials.push(jamRefTeamA);
		this.skatingOfficials.push(jamRefTeamB);

		// Add pack refs
		this.skatingOfficials.push(
			new SkatingOfficial(positions.FPR.x, positions.FPR.y, SkatingOfficialRole.backPackRef)
		);
		this.skatingOfficials.push(
			new SkatingOfficial(positions.BPR.x, positions.BPR.y, SkatingOfficialRole.frontPackRef)
		);

		// Add outside pack refs
		this.skatingOfficials.push(
			new SkatingOfficial(positions.OPR1.x, positions.OPR1.y, SkatingOfficialRole.outsidePackRef)
		);
		this.skatingOfficials.push(
			new SkatingOfficial(positions.OPR2.x, positions.OPR2.y, SkatingOfficialRole.outsidePackRef)
		);
		this.skatingOfficials.push(
			new SkatingOfficial(positions.OPR3.x, positions.OPR3.y, SkatingOfficialRole.outsidePackRef)
		);
	}

	getRandomBlockerPosition(role: PlayerRole): Point {
		const ctx = this.ctx;
		let attempts = 0;
		const maxAttempts = 1000; // Adjust this value as needed

		while (attempts < maxAttempts) {
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;

			// Check the center and four points on the circumference
			const pointsToCheck = [
				{ x, y }, // Center
				{ x: x + Player.playerRadius, y }, // Right
				{ x: x - Player.playerRadius, y }, // Left
				{ x, y: y + Player.playerRadius }, // Bottom
				{ x, y: y - Player.playerRadius } // Top
			];

			// Check if all points are inside the straight1Area and in bounds
			const allPointsValid = pointsToCheck.every(
				(point) =>
					ctx.isPointInPath(this.startZone, point.x, point.y) &&
					this.trackGeometry.isPlayerInBounds(new TeamPlayer(point.x, point.y, 'A', role))
			);

			// Check for collisions with existing players
			const noCollisions = this.players.every(
				(player) => Math.hypot(player.x - x, player.y - y) > Player.playerRadius * 2
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
				{ x: x + Player.playerRadius, y },
				{ x: x - Player.playerRadius, y },
				{ x, y: y + Player.playerRadius },
				{ x, y: y - Player.playerRadius }
			];

			const allPointsValid = pointsToCheck.every(
				(point) =>
					ctx.isPointInPath(jammerStartZone, point.x, point.y) &&
					this.trackGeometry.isPlayerInBounds(
						new TeamPlayer(point.x, point.y, 'A', PlayerRole.jammer)
					)
			);

			// Check for collisions with existing players who are jammers
			const noCollisions = this.players.every(
				(player) => Math.hypot(player.x - x, player.y - y) > Player.playerRadius * 2
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

		// Check for chain reactions with ALL entities
		const allEntities = [...this.players, ...this.skatingOfficials];
		allEntities.forEach((otherEntity) => {
			if (
				otherEntity !== target &&
				otherEntity !== pusher &&
				this.checkCollision(target, otherEntity)
			) {
				this.handlePush(target, otherEntity);
			}
		});

		if (target instanceof TeamPlayer) {
			target.inBounds = this.trackGeometry.isPlayerInBounds(target);
			this.trackGeometry.updatePlayerZone(target);
			this.trackGeometry.updatePlayerCoordinates(target);
		}
	}

	handleMouseMove(event: MouseEvent): void {
		const entity = this.selectedPlayer;
		if (entity?.isDragging) {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			entity.x = x - entity.dragOffsetX;
			entity.y = y - entity.dragOffsetY;

			// Check collisions with all entities
			const allEntities = [...this.players, ...this.skatingOfficials];
			allEntities.forEach((otherEntity) => {
				if (otherEntity !== entity && this.checkCollision(entity, otherEntity)) {
					this.handlePush(entity, otherEntity);
				}
			});

			if (entity instanceof TeamPlayer) {
				entity.inBounds = this.trackGeometry.isPlayerInBounds(entity);
				this.trackGeometry.updatePlayerZone(entity);
				this.trackGeometry.updatePlayerCoordinates(entity);
				this.packManager.updatePlayers(this.players);
			}

			// Log position changes for skating officials
			if (entity instanceof SkatingOfficial) {
				console.log(`${entity.role} moved from to (${entity.x}, ${entity.y})`);
			}
		}
	}

	handleMouseDown(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Check all draggable entities in order of priority
		const draggableEntities = [...this.players, ...this.skatingOfficials];

		for (const entity of draggableEntities) {
			if (entity.containsPoint(x, y)) {
				this.selectedPlayer = entity;
				entity.isDragging = true;
				entity.dragOffsetX = x - entity.x;
				entity.dragOffsetY = y - entity.y;
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

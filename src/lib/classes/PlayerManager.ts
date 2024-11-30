import { get } from 'svelte/store';

import { PlayerTeam, TeamPlayer, TeamPlayerRole } from '$lib/classes/TeamPlayer';
import { PackManager } from '$lib/classes/PackManager';
import { Renderer } from '$lib/render/Renderer';
import type { Point } from '$lib/types';
import { TrackGeometry } from './TrackGeometry';
import { Player } from './Player';
import { SkatingOfficial, SkatingOfficialRole } from './SkatingOfficial';
import { boardState, type BoardState } from '$lib/stores/boardState';
import type { Game } from './Game';
import { saveBoardState } from '$lib/utils/boardStateService';

export class PlayerManager {
	private game: Game;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;
	private LINE_WIDTH: number;
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
	jammerStartZone: Path2D;
	packManager: PackManager;
	positions: Record<string, Point>;

	constructor(
		game: Game,
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		PIXELS_PER_METER: number,
		renderer: Renderer,
		isInitialLoad: boolean
	) {
		this.game = game;
		this.canvas = canvas;
		this.ctx = ctx;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.LINE_WIDTH = renderer.LINE_WIDTH;
		Player.setCanvasWidth(canvas.width);
		this.players = [];
		this.skatingOfficials = [];
		this.selectedPlayer = null;
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER, this.LINE_WIDTH);
		this.renderer = renderer;
		this.straight1Area = renderer.straight1Area;
		this.straight2Area = renderer.straight2Area;
		this.turn1Area = renderer.turn1Area;
		this.turn2Area = renderer.turn2Area;
		this.startZone = this.trackGeometry.startZone;
		this.jammerStartZone = this.trackGeometry.createJammerStartZone();

		this.packManager = new PackManager(PIXELS_PER_METER, points, this.trackGeometry);
		this.positions = {
			OPR1: { x: 0.347, y: 0.115 },
			OPR2: { x: 0.535, y: 0.11 },
			OPR3: { x: 0.61, y: 0.11 },
			FPR: { x: 0.46, y: 0.44 },
			BPR: { x: 0.616, y: 0.44 },
			JRTeamA: { x: 0.631, y: 0.359 },
			JRTeamB: { x: 0.61, y: 0.38 }
		};

		if (isInitialLoad) {
			const savedState: BoardState = get(boardState);

			if (savedState?.teamPlayers?.length > 0) {
				this.players = savedState.teamPlayers.map((p) => {
					const absoluteX = p.absolute.x * this.canvas.width;
					const absoluteY = p.absolute.y * this.canvas.height;
					const player = new TeamPlayer(absoluteX, absoluteY, p.team!, p.role);
					player.inBounds = this.trackGeometry.isPlayerInBounds(player);
					this.trackGeometry.updatePlayerZone(player);
					this.trackGeometry.updatePlayerCoordinates(player);
					return player;
				});

				this.skatingOfficials = savedState.skatingOfficials.map((o) => {
					const absoluteX = o.absolute.x * this.canvas.width;
					const absoluteY = o.absolute.y * this.canvas.height;
					return new SkatingOfficial(absoluteX, absoluteY, o.role);
				});

				this.packManager.updatePlayers(this.players);
			} else {
				this.initializeSkatingOfficials();
				this.initializeTeamPlayers();
			}
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
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER, this.LINE_WIDTH);
		// Update player coordinates after resize
		for (const player of this.players) {
			this.trackGeometry.updatePlayerCoordinates(player);
		}

		// Update packManager
		this.packManager = new PackManager(PIXELS_PER_METER, points, this.trackGeometry);
		this.packManager.updatePlayers(this.players);
	}

	addTeamPlayer(x: number, y: number, team: string, role: TeamPlayerRole) {
		const player = new TeamPlayer(x, y, team, role);
		player.inBounds = this.trackGeometry.isPlayerInBounds(player);
		this.trackGeometry.updatePlayerZone(player);
		this.trackGeometry.updatePlayerCoordinates(player);
		this.players.push(player);
		this.packManager.updatePlayers(this.players);
	}

	initializeTeamPlayers(): void {
		// Create 4 blockers for Team A
		for (let i = 0; i < 4; i++) {
			const role = i < 3 ? TeamPlayerRole.blocker : TeamPlayerRole.pivot;
			const pos = this.getRandomBlockerPosition(role);
			this.addTeamPlayer(pos.x, pos.y, 'A', role);
		}

		// Create 4 blockers for Team B
		for (let i = 0; i < 4; i++) {
			const role = i < 3 ? TeamPlayerRole.blocker : TeamPlayerRole.pivot;
			const pos = this.getRandomBlockerPosition(role);
			this.addTeamPlayer(pos.x, pos.y, 'B', role);
		}

		// Add jammers
		const jammerPosA = this.getRandomJammerPosition();
		this.addTeamPlayer(jammerPosA.x, jammerPosA.y, 'A', TeamPlayerRole.jammer);
		const jammerPosB = this.getRandomJammerPosition();
		this.addTeamPlayer(jammerPosB.x, jammerPosB.y, 'B', TeamPlayerRole.jammer);
	}

	initializeSkatingOfficials(): void {
		const positions = {
			OPR1: {
				x: this.positions.OPR1.x * this.canvas.width,
				y: this.positions.OPR1.y * this.canvas.height
			},
			OPR2: {
				x: this.positions.OPR2.x * this.canvas.width,
				y: this.positions.OPR2.y * this.canvas.height
			},
			OPR3: {
				x: this.positions.OPR3.x * this.canvas.width,
				y: this.positions.OPR3.y * this.canvas.height
			},
			FPR: {
				x: this.positions.FPR.x * this.canvas.width,
				y: this.positions.FPR.y * this.canvas.height
			},
			BPR: {
				x: this.positions.BPR.x * this.canvas.width,
				y: this.positions.BPR.y * this.canvas.height
			},
			JRTeamA: {
				x: this.positions.JRTeamA.x * this.canvas.width,
				y: this.positions.JRTeamA.y * this.canvas.height
			},
			JRTeamB: {
				x: this.positions.JRTeamB.x * this.canvas.width,
				y: this.positions.JRTeamB.y * this.canvas.height
			}
		};

		// Add jam refs
		const jamRefTeamA = new SkatingOfficial(
			positions.JRTeamA.x,
			positions.JRTeamA.y,
			SkatingOfficialRole.jamRefA
		);

		const jamRefTeamB = new SkatingOfficial(
			positions.JRTeamB.x,
			positions.JRTeamB.y,
			SkatingOfficialRole.jamRefB
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

	resetPlayers(): void {
		this.players = [];
		this.skatingOfficials = [];
		this.selectedPlayer = null;

		// Update all track zones before initializing new players
		this.straight1Area = this.renderer.straight1Area;
		this.startZone = this.trackGeometry.startZone;
		this.jammerStartZone = this.trackGeometry.createJammerStartZone();

		this.initializeSkatingOfficials();
		this.initializeTeamPlayers();
	}

	loadFromState(state: BoardState): void {
		// Clear existing players
		this.players = [];
		this.skatingOfficials = [];

		// Create new players from state
		state.teamPlayers.forEach((teamPlayer) => {
			const x = teamPlayer.absolute.x * this.canvas.width;
			const y = teamPlayer.absolute.y * this.canvas.height;
			const player = new TeamPlayer(
				x,
				y,
				teamPlayer.team as PlayerTeam,
				teamPlayer.role as TeamPlayerRole
			);
			this.trackGeometry.updatePlayerCoordinates(player);
			player.inBounds = this.trackGeometry.isPlayerInBounds(player);
			this.trackGeometry.updatePlayerZone(player);
			this.players.push(player);
		});

		// Create new skating officials from state
		state.skatingOfficials.forEach((skatingOfficial) => {
			const x = skatingOfficial.absolute.x * this.canvas.width;
			const y = skatingOfficial.absolute.y * this.canvas.height;
			const official = new SkatingOfficial(x, y, skatingOfficial.role as SkatingOfficialRole);
			this.skatingOfficials.push(official);
		});

		// Check track boundaries for each player
		this.players.forEach((player) => {
			player.inBounds = this.trackGeometry.isPlayerInBounds(player);
		});

		// Update pack status
		this.packManager.updatePlayers(this.players);
	}

	getRandomBlockerPosition(role: TeamPlayerRole): Point {
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
					ctx.isPointInPath(this.jammerStartZone, point.x, point.y) &&
					this.trackGeometry.isPlayerInBounds(
						new TeamPlayer(point.x, point.y, 'A', TeamPlayerRole.jammer)
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
			let x = event.clientX - rect.left;
			let y = event.clientY - rect.top;

			// Constrain x and y to keep player fully within canvas bounds
			x = Math.max(
				entity.radius,
				Math.min(this.canvas.width - entity.radius, x - entity.dragOffsetX)
			);
			y = Math.max(
				entity.radius,
				Math.min(this.canvas.height - entity.radius, y - entity.dragOffsetY)
			);

			entity.x = x;
			entity.y = y;

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
			saveBoardState(this.game);
		}
	}

	updatePlayers(): void {
		for (const player of this.players) {
			player.update();
		}
	}
}

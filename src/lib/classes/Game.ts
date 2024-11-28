import type { Point } from '$lib/types';
import { Renderer } from '$lib/render/Renderer';
import { PlayerManager } from '$lib/classes/PlayerManager';
import { PlayerRenderer } from '../render/PlayerRenderer';
import { PackZoneRenderer } from '../render/PackZoneRenderer';
import { Player } from './Player';
import { ScalingManager } from './ScalingManager';
import type { TeamPlayerPosition } from './TeamPlayer';

export class Game {
	private static readonly CANVAS_WIDTH_DIVISOR = 250; // For LINE_WIDTH calculation
	private static readonly TRACK_WIDTH_METERS = 35.1; // Track width in meters
	private static readonly CENTER_POINT_OFFSET = 5.33; // Distance from center in meters
	private static readonly VERTICAL_OFFSET_1 = 3.81; // First vertical offset in meters
	private static readonly VERTICAL_OFFSET_2 = 0.3; // Second vertical offset in meters
	private static readonly OUTER_VERTICAL_OFFSET_1 = 8.38; // First outer vertical offset in meters
	private static readonly OUTER_VERTICAL_OFFSET_2 = 7.78; // Second outer vertical offset in meters

	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCtx: CanvasRenderingContext2D;
	isRecording: boolean;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;
	points: Record<string, Point>;
	scalingManager: ScalingManager;
	renderer: Renderer;
	playerRenderer: PlayerRenderer;
	playerManager: PlayerManager;
	packZoneRenderer: PackZoneRenderer;

	constructor(canvas: HTMLCanvasElement, highResCanvas: HTMLCanvasElement, isRecording: boolean) {
		this.scalingManager = ScalingManager.getInstance();
		this.scalingManager.updateDimensions(canvas, Game.TRACK_WIDTH_METERS);
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCanvas.getContext('2d')!;
		this.isRecording = isRecording;

		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / Game.CANVAS_WIDTH_DIVISOR));
		this.PIXELS_PER_METER = this.canvas.width / Game.TRACK_WIDTH_METERS;

		this.points = this.initializePoints();

		this.renderer = new Renderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.points,
			this.LINE_WIDTH,
			this.PIXELS_PER_METER
		);

		this.playerManager = new PlayerManager(
			this.canvas,
			this.ctx,
			this.points,
			this.PIXELS_PER_METER,
			this.renderer,
			true
		);

		this.playerRenderer = new PlayerRenderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.renderer.trackGeometry,
			this.playerManager.packManager
		);

		this.packZoneRenderer = new PackZoneRenderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.renderer.trackGeometry,
			this.playerManager.packManager
		);

		this.canvas.addEventListener(
			'mousedown',
			this.playerManager.handleMouseDown.bind(this.playerManager)
		);
		this.canvas.addEventListener(
			'mousemove',
			this.playerManager.handleMouseMove.bind(this.playerManager)
		);
		this.canvas.addEventListener(
			'mouseup',
			this.playerManager.handleMouseUp.bind(this.playerManager)
		);
	}

	resize(): void {
		this.scalingManager.updateDimensions(this.canvas, Game.TRACK_WIDTH_METERS);
		this.LINE_WIDTH = Math.max(1, this.canvas.width / Game.CANVAS_WIDTH_DIVISOR);
		this.PIXELS_PER_METER = this.canvas.width / Game.TRACK_WIDTH_METERS;

		const newPoints = this.initializePoints();
		this.points = newPoints;

		// Update renderer with new dimensions
		this.renderer = new Renderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.points,
			this.LINE_WIDTH,
			this.PIXELS_PER_METER
		);

		// Update player renderer with new dimensions
		this.playerRenderer = new PlayerRenderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.renderer.trackGeometry,
			this.playerManager.packManager
		);

		// Add this line to update player radius on resize
		Player.setCanvasWidth(this.canvas.width);

		// Update player manager and maintain existing players
		this.playerManager.resize(
			this.canvas,
			this.ctx,
			this.points,
			this.PIXELS_PER_METER,
			this.renderer
		);

		// Draw the players in their new positions
		this.playerRenderer.drawPlayers(this.playerManager.players);
		this.playerRenderer.drawSkatingOfficials(this.playerManager.skatingOfficials);

		// Update pack zone renderer with new dimensions
		this.packZoneRenderer = new PackZoneRenderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.renderer.trackGeometry,
			this.playerManager.packManager
		);
	}

	initializePoints(): Record<string, Point> {
		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;
		const scale = this.PIXELS_PER_METER;

		return {
			A: { x: centerX + Game.CENTER_POINT_OFFSET * scale, y: centerY },
			B: { x: centerX - Game.CENTER_POINT_OFFSET * scale, y: centerY },
			C: {
				x: centerX + Game.CENTER_POINT_OFFSET * scale,
				y: centerY - Game.VERTICAL_OFFSET_1 * scale
			},
			D: {
				x: centerX + Game.CENTER_POINT_OFFSET * scale,
				y: centerY + Game.VERTICAL_OFFSET_1 * scale
			},
			E: {
				x: centerX - Game.CENTER_POINT_OFFSET * scale,
				y: centerY - Game.VERTICAL_OFFSET_1 * scale
			},
			F: {
				x: centerX - Game.CENTER_POINT_OFFSET * scale,
				y: centerY + Game.VERTICAL_OFFSET_1 * scale
			},
			G: {
				x: centerX + Game.CENTER_POINT_OFFSET * scale,
				y: centerY - Game.VERTICAL_OFFSET_2 * scale
			},
			H: {
				x: centerX - Game.CENTER_POINT_OFFSET * scale,
				y: centerY + Game.VERTICAL_OFFSET_2 * scale
			},
			I: {
				x: centerX + Game.CENTER_POINT_OFFSET * scale,
				y: centerY - Game.OUTER_VERTICAL_OFFSET_1 * scale
			},
			J: {
				x: centerX + Game.CENTER_POINT_OFFSET * scale,
				y: centerY + Game.OUTER_VERTICAL_OFFSET_2 * scale
			},
			K: {
				x: centerX - Game.CENTER_POINT_OFFSET * scale,
				y: centerY - Game.OUTER_VERTICAL_OFFSET_2 * scale
			},
			L: {
				x: centerX - Game.CENTER_POINT_OFFSET * scale,
				y: centerY + Game.OUTER_VERTICAL_OFFSET_1 * scale
			}
		};
	}

	exportTeamPlayers(): string {
		const teamPlayers: TeamPlayerPosition[] = this.playerManager.players.map((player) => {
			return {
				absolute: {
					x: player.x / this.canvas.width, // Store as percentage of track width
					y: player.y / this.canvas.height // Store as percentage of track height
				},
				role: player.role,
				team: player.team
			} as TeamPlayerPosition;
		});

		return JSON.stringify(teamPlayers, null, 2);
	}

	update(): void {
		this.playerManager.updatePlayers();
	}

	draw(): void {
		// 1. Clear and draw background
		this.renderer.draw();
		// 2. Draw engagement zone
		this.packZoneRenderer.drawEngagementZone(this.ctx);
		// 3. Draw track boundaries
		this.renderer.drawTrackBoundaries(this.ctx);
		// 4. Draw all players and officials on top
		this.playerRenderer.drawPlayers(this.playerManager.players);
		this.playerRenderer.drawSkatingOfficials(this.playerManager.skatingOfficials);
	}

	drawHighRes(): void {
		this.renderer.drawHighRes();
		this.packZoneRenderer.drawEngagementZoneHighRes();
		this.renderer.drawTrackBoundariesHighRes();
		this.playerRenderer.drawPlayersHighRes(this.playerManager.players);
		this.playerRenderer.drawSkatingOfficialsHighRes(this.playerManager.skatingOfficials);
	}

	gameLoop(): void {
		this.update();
		this.draw();
		this.drawHighRes();
		requestAnimationFrame(() => this.gameLoop());
	}

	cleanup(): void {
		this.canvas.removeEventListener(
			'mousedown',
			this.playerManager.handleMouseDown.bind(this.playerManager)
		);
		this.canvas.removeEventListener(
			'mousemove',
			this.playerManager.handleMouseMove.bind(this.playerManager)
		);
		this.canvas.removeEventListener(
			'mouseup',
			this.playerManager.handleMouseUp.bind(this.playerManager)
		);
	}
}

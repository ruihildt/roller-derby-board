import type { Point } from '$lib/types';
import { Renderer } from '$lib/render/Renderer';
import { PlayerManager } from '$lib/classes/PlayerManager';
import { PlayerRenderer } from '../render/PlayerRenderer';
import { PackZoneRenderer } from '../render/PackZoneRenderer';

export class Game {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCtx: CanvasRenderingContext2D;
	isRecording: boolean;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;
	points: Record<string, Point>;
	renderer: Renderer;
	playerRenderer: PlayerRenderer;
	playerManager: PlayerManager;
	packZoneRenderer: PackZoneRenderer;

	constructor(canvas: HTMLCanvasElement, highResCanvas: HTMLCanvasElement, isRecording: boolean) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCanvas.getContext('2d')!;
		this.isRecording = isRecording;

		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 250));
		this.PIXELS_PER_METER = Math.floor(this.canvas.width / 29);

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
		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 250));
		this.PIXELS_PER_METER = Math.floor(this.canvas.width / 29);

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
		this.playerRenderer.drawOfficials(this.playerManager.officials);

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
			A: { x: centerX + 5.33 * scale, y: centerY },
			B: { x: centerX - 5.33 * scale, y: centerY },
			C: { x: centerX + 5.33 * scale, y: centerY - 3.81 * scale },
			D: { x: centerX + 5.33 * scale, y: centerY + 3.81 * scale },
			E: { x: centerX - 5.33 * scale, y: centerY - 3.81 * scale },
			F: { x: centerX - 5.33 * scale, y: centerY + 3.81 * scale },
			G: { x: centerX + 5.33 * scale, y: centerY - 0.3 * scale },
			H: { x: centerX - 5.33 * scale, y: centerY + 0.3 * scale },
			I: { x: centerX + 5.33 * scale, y: centerY - 8.38 * scale },
			J: { x: centerX + 5.33 * scale, y: centerY + 7.78 * scale },
			K: { x: centerX - 5.33 * scale, y: centerY - 7.78 * scale },
			L: { x: centerX - 5.33 * scale, y: centerY + 8.38 * scale }
		};
	}

	update(): void {
		this.playerManager.updatePlayers();
	}

	draw(): void {
		this.renderer.draw();
		this.packZoneRenderer.drawEngagementZone(this.ctx);
		this.playerRenderer.drawPlayers(this.playerManager.players);
		this.playerRenderer.drawOfficials(this.playerManager.officials);
	}

	drawHighRes(): void {
		this.renderer.drawHighRes();
		this.packZoneRenderer.drawEngagementZoneHighRes();
		this.playerRenderer.drawPlayersHighRes(this.playerManager.players);
		this.playerRenderer.drawOfficialsHighRes(this.playerManager.officials);
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

import type { Point } from '$lib/types';
import { Renderer } from '$lib/Renderer';
import { PlayerManager } from '$lib/PlayerManager';
import { PlayerRenderer } from './PlayerRenderer';

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

	constructor(canvas: HTMLCanvasElement, highResCanvas: HTMLCanvasElement, isRecording: boolean) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCanvas.getContext('2d')!;
		this.isRecording = isRecording;

		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 330));
		this.PIXELS_PER_METER = Math.floor(this.canvas.width / 33);

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
		this.playerRenderer = new PlayerRenderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.renderer.trackGeometry
		);
		this.playerManager = new PlayerManager(
			this.canvas,
			this.ctx,
			this.points,
			this.PIXELS_PER_METER,
			this.renderer,
			true
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
		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 330));
		this.PIXELS_PER_METER = Math.floor(this.canvas.width / 33);

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
			this.renderer.trackGeometry
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
		this.playerRenderer.drawPlayers(this.playerManager.players);
		this.playerRenderer.drawPackZone(this.playerManager.players);
	}

	drawHighRes(): void {
		this.renderer.drawHighRes();
		this.playerRenderer.drawPlayersHighRes(this.playerManager.players);
		this.playerRenderer.drawPackZone(this.playerManager.players); // TODO Fix this
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

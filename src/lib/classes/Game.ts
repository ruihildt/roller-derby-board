import type { Point } from '$lib/types';
import { Renderer } from '$lib/render/Renderer';
import { PlayerManager } from '$lib/classes/PlayerManager';
import { PlayerRenderer } from '../render/PlayerRenderer';
import { PackZoneRenderer } from '../render/PackZoneRenderer';
import { ScalingManager } from './ScalingManager';
import { boardState } from '$lib/stores/boardState';
import { RenderingPipeline } from '$lib/render/RenderingPipeline';
import {
	CENTER_POINT_OFFSET,
	OUTER_VERTICAL_OFFSET_1,
	OUTER_VERTICAL_OFFSET_2,
	VERTICAL_OFFSET_1,
	VERTICAL_OFFSET_2
} from '$lib/constants';

export class Game {
	private renderingPipeline: RenderingPipeline;

	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCtx: CanvasRenderingContext2D;
	isRecording: boolean;
	points: Record<string, Point>;
	scalingManager: ScalingManager;
	renderer: Renderer;
	playerRenderer: PlayerRenderer;
	playerManager: PlayerManager;
	packZoneRenderer: PackZoneRenderer;

	constructor(canvas: HTMLCanvasElement, highResCanvas: HTMLCanvasElement, isRecording: boolean) {
		this.scalingManager = new ScalingManager(canvas.width, canvas.height);
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCanvas.getContext('2d')!;
		this.isRecording = isRecording;

		this.points = this.initializePoints();

		this.renderer = new Renderer(
			this.canvas,
			this.ctx,
			this.highResCanvas,
			this.highResCtx,
			this.points
		);

		this.playerManager = new PlayerManager(
			this,
			this.canvas,
			this.ctx,
			this.points,
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
			this.playerManager.packManager
		);

		this.renderingPipeline = new RenderingPipeline(
			this.renderer,
			this.playerRenderer,
			this.packZoneRenderer,
			this.scalingManager,
			this.playerManager
		);

		canvas.addEventListener('mousedown', (e) => this.playerManager.handleMouseDown(e));
		canvas.addEventListener('mousemove', (e) => this.playerManager.handleMouseMove(e));
		canvas.addEventListener('mouseup', () => this.playerManager.handleMouseUp());
		canvas.addEventListener('touchstart', (e) => this.playerManager.handleTouchStart(e));
		canvas.addEventListener('touchmove', (e) => this.playerManager.handleTouchMove(e));
		canvas.addEventListener('touchend', (e) => this.playerManager.handleTouchEnd(e));

		boardState.subscribe((state) => {
			if (state.teamPlayers.length > 0) {
				this.playerManager.loadFromState(state);

				if (state.viewSettings) {
					this.scalingManager.setZoomAndPan(
						state.viewSettings.zoom,
						state.viewSettings.panX,
						state.viewSettings.panY
					);
				}

				this.renderingPipeline.render();
			}
		});
	}

	initializePoints(): Record<string, Point> {
		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;

		return {
			A: { x: centerX + CENTER_POINT_OFFSET, y: centerY },
			B: { x: centerX - CENTER_POINT_OFFSET, y: centerY },
			C: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_1
			},
			D: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_1
			},
			E: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_1
			},
			F: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_1
			},
			G: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_2
			},
			H: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_2
			},
			I: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - OUTER_VERTICAL_OFFSET_1
			},
			J: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY + OUTER_VERTICAL_OFFSET_2
			},
			K: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY - OUTER_VERTICAL_OFFSET_2
			},
			L: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + OUTER_VERTICAL_OFFSET_1
			}
		};
	}

	update(): void {
		this.playerManager.updatePlayers();
	}

	gameLoop(): void {
		this.update();
		this.renderingPipeline.render();
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
		this.canvas.removeEventListener(
			'touchstart',
			this.playerManager.handleTouchStart.bind(this.playerManager)
		);
		this.canvas.removeEventListener(
			'touchmove',
			this.playerManager.handleTouchMove.bind(this.playerManager)
		);
		this.canvas.removeEventListener(
			'touchend',
			this.playerManager.handleTouchEnd.bind(this.playerManager)
		);
	}
}

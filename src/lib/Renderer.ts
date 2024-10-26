import type { Player } from '$lib/Player';
import type { Point } from '$lib/types';
import { TrackGeometry } from './TrackGeometry';

export class Renderer {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;
	trackGeometry: TrackGeometry;

	innerTrackPath: Path2D;
	outerTrackPath: Path2D;
	pivotLinePath: Path2D;
	jammerLinePath: Path2D;
	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	trackSurface: Path2D;
	midTrackPath: Path2D;
	constructor(
		canvas: HTMLCanvasElement,
		highResCanvas: HTMLCanvasElement,
		points: Record<string, Point>,
		LINE_WIDTH: number,
		PIXELS_PER_METER: number
	) {
		this.canvas = canvas;
		this.highResCanvas = highResCanvas;
		this.ctx = canvas.getContext('2d')!;
		this.points = points;
		this.LINE_WIDTH = LINE_WIDTH;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.trackGeometry = new TrackGeometry(canvas, this.ctx, this.points, PIXELS_PER_METER);

		this.innerTrackPath = this.trackGeometry.innerTrackPath;
		this.outerTrackPath = this.trackGeometry.outerTrackPath;
		this.pivotLinePath = this.trackGeometry.createPivotLinePath();
		this.jammerLinePath = this.trackGeometry.createJammerLinePath();
		this.straight1Area = this.trackGeometry.createStraight1Path();
		this.straight2Area = this.trackGeometry.createStraight2Path();
		this.turn1Area = this.trackGeometry.createTurn1Path();
		this.turn2Area = this.trackGeometry.createTurn2Path();
		this.trackSurface = this.trackGeometry.createTrackSurfacePath();
		this.midTrackPath = this.trackGeometry.createMidTrackPath();
	}

	draw(players: Player[]): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawTrack(this.ctx);
		this.drawMidTrackLine(this.ctx);
		this.drawPoints(this.ctx);

		for (const player of players) {
			player.draw(this.ctx);

			// Draw perpendicular line if player is on the track
			if (this.isPlayerOnTrack(player)) {
				this.trackGeometry.drawPerpendicularLine({ x: player.x, y: player.y });
			}
		}
	}

	drawHighRes(players: Player[]): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCanvas.getContext('2d')!;
		const scale = 2;

		this.highResCanvas.width = this.canvas.width * scale;
		this.highResCanvas.height = this.canvas.height * scale;

		ctx.scale(scale, scale);

		ctx.clearRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);

		this.drawTrack(ctx);

		for (const player of players) {
			player.draw(ctx);

			// Draw perpendicular line if player is on the track
			if (this.isPlayerOnTrack(player)) {
				this.trackGeometry.drawPerpendicularLine({ x: player.x, y: player.y }, ctx);
			}
		}
	}

	drawTrack(ctx: CanvasRenderingContext2D): void {
		// Fill only the area between outer and inner tracks
		ctx.fillStyle = '#D3D3D3';
		ctx.fill(this.trackSurface, 'evenodd');

		// Draw the inner and outer track lines
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);
	}

	drawPivotLine(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.pivotLinePath);
	}

	drawJammerLine(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.jammerLinePath);
	}

	drawMidTrackLine(ctx: CanvasRenderingContext2D): void {
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 3;
		ctx.stroke(this.midTrackPath);
	}

	drawPoints(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.fillStyle = 'blue';
		ctx.font = '12px Arial';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';

		for (const [label, point] of Object.entries(p)) {
			// Draw point
			ctx.beginPath();
			ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
			ctx.fill();

			// Draw label
			if (label === 'G' || label === 'H') {
				ctx.textAlign = 'right';
				ctx.fillText(label, point.x - 6, point.y);
			} else {
				ctx.textAlign = 'left';
				ctx.fillText(label, point.x + 6, point.y);
			}
		}
	}

	isPlayerOnTrack(player: Player): boolean {
		return this.ctx.isPointInPath(this.trackSurface, player.x, player.y);
	}
}

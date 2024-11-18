import type { Point } from '$lib/types';
import { TrackGeometry } from './TrackGeometry';

export class Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCanvas: HTMLCanvasElement;
	highResCtx: CanvasRenderingContext2D;
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
	tenFeetLines: Path2D;
	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		highResCanvas: HTMLCanvasElement,
		highResCtx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		LINE_WIDTH: number,
		PIXELS_PER_METER: number
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCtx;
		this.points = points;
		this.LINE_WIDTH = LINE_WIDTH;
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.trackGeometry = new TrackGeometry(canvas, ctx, points, PIXELS_PER_METER);

		this.innerTrackPath = this.trackGeometry.innerTrackPath;
		this.outerTrackPath = this.trackGeometry.outerTrackPath;
		this.pivotLinePath = this.trackGeometry.pivotLinePath;
		this.jammerLinePath = this.trackGeometry.jammerLinePath;
		this.straight1Area = this.trackGeometry.straight1Area;
		this.straight2Area = this.trackGeometry.straight2Area;
		this.turn1Area = this.trackGeometry.turn1Area;
		this.turn2Area = this.trackGeometry.turn2Area;
		this.trackSurface = this.trackGeometry.trackSurface;
		this.midTrackPath = this.trackGeometry.midTrackPath;
		this.tenFeetLines = this.trackGeometry.tenFeetLines;
	}

	draw(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawTrack(this.ctx);
		this.drawBranding(this.ctx);
	}

	drawHighRes(): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCtx;
		const scale = 2;

		this.highResCanvas.width = this.canvas.width * scale;
		this.highResCanvas.height = this.canvas.height * scale;

		ctx.scale(scale, scale);

		ctx.clearRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);

		this.drawTrack(ctx);
		this.drawBranding(ctx);
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

		// Draw the 10-foot lines
		ctx.strokeStyle = 'black';
		ctx.lineWidth = this.LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
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
		ctx.fillStyle = 'blue';
		ctx.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';

		for (const [label, point] of Object.entries(this.points)) {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
			ctx.fill();

			if (label === 'G' || label === 'H') {
				ctx.textAlign = 'right';
				ctx.fillText(label, point.x - 6, point.y);
			} else {
				ctx.textAlign = 'left';
				ctx.fillText(label, point.x + 6, point.y);
			}
		}
	}

	private drawBranding(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		ctx.fillStyle = '#333';
		ctx.font = '16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const textX = (this.points.F.x + this.points.D.x) / 2;
		const textY = this.points.D.y + 22;
		ctx.fillText('created with www.rollerderby.click', textX, textY);
		ctx.restore();
	}
}

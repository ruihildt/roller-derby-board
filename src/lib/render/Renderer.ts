import { colors, LINE_WIDTH } from '$lib/constants';
import type { Point } from '$lib/types';
import { TrackGeometry } from '../classes/TrackGeometry';

export class Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCanvas: HTMLCanvasElement;
	highResCtx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	trackGeometry: TrackGeometry;
	private logoImage: HTMLImageElement;

	innerTrackPath: Path2D;
	outerTrackPath: Path2D;
	pivotLinePath: Path2D;
	jammerLinePath: Path2D;
	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	trackSurface: Path2D;
	outerOfficialLanePath: Path2D;
	midTrackPath: Path2D;
	tenFeetLines: Path2D;
	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		highResCanvas: HTMLCanvasElement,
		highResCtx: CanvasRenderingContext2D,
		points: Record<string, Point>
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.highResCanvas = highResCanvas;
		this.highResCtx = highResCtx;
		this.points = points;
		this.trackGeometry = new TrackGeometry(canvas, ctx, points);

		this.logoImage = new Image();
		this.logoImage.src = '/derbyboard-logo.svg';

		this.innerTrackPath = this.trackGeometry.innerTrackPath;
		this.outerTrackPath = this.trackGeometry.outerTrackPath;
		this.pivotLinePath = this.trackGeometry.pivotLinePath;
		this.jammerLinePath = this.trackGeometry.jammerLinePath;
		this.straight1Area = this.trackGeometry.straight1Area;
		this.straight2Area = this.trackGeometry.straight2Area;
		this.turn1Area = this.trackGeometry.turn1Area;
		this.turn2Area = this.trackGeometry.turn2Area;
		this.trackSurface = this.trackGeometry.trackSurface;
		this.outerOfficialLanePath = this.trackGeometry.outerOfficialLanePath;
		this.midTrackPath = this.trackGeometry.midTrackPath;
		this.tenFeetLines = this.trackGeometry.tenFeetLines;
	}

	drawTrack(ctx: CanvasRenderingContext2D): void {
		// Fill only the area between outer and inner tracks
		ctx.fillStyle = colors.trackSurface;
		ctx.fill(this.trackSurface, 'evenodd');

		// Draw the inner and outer track lines
		ctx.strokeStyle = colors.trackBoundaries;
		ctx.lineWidth = LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw official lane dotted line
		ctx.save();
		ctx.setLineDash([1, 10]);
		ctx.lineWidth = LINE_WIDTH / 3;
		ctx.strokeStyle = colors.officialLane;
		ctx.stroke(this.outerOfficialLanePath);
		ctx.setLineDash([]);
		ctx.restore();

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);

		// Draw the 10-feet lines
		ctx.strokeStyle = colors.tenFeetLines;
		ctx.lineWidth = LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
	}
	drawTrackBoundaries(ctx: CanvasRenderingContext2D): void {
		// Draw the inner and outer track lines
		ctx.strokeStyle = colors.trackBoundaries;
		ctx.lineWidth = LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);

		// Draw the 10-foot lines
		ctx.strokeStyle = colors.tenFeetLines;
		ctx.lineWidth = LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
	}

	drawTrackBoundariesHighRes(): void {
		if (!this.highResCanvas) return;
		const ctx = this.highResCtx;

		// Draw the inner and outer track lines
		ctx.strokeStyle = colors.trackBoundaries;
		ctx.lineWidth = LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);

		// Draw the 10-foot lines
		ctx.strokeStyle = colors.tenFeetLines;
		ctx.lineWidth = LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
	}

	drawPivotLine(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = LINE_WIDTH;
		ctx.stroke(this.pivotLinePath);
	}

	drawJammerLine(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = LINE_WIDTH;
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

	drawBranding(ctx: CanvasRenderingContext2D): void {
		if (!this.logoImage.complete) return;

		// Save the current context state
		ctx.save();

		// Reset any transformations to draw in screen coordinates
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		const sizeMultiplier = 0.5;
		const width = this.logoImage.width * sizeMultiplier;
		const height = this.logoImage.height * sizeMultiplier;

		// Position at bottom right with padding
		const padding = 40;
		const scale = ctx === this.highResCtx ? 2 : 1;

		// For highRes, we need to:
		// 1. Scale the width and height
		// 2. Position relative to the scaled canvas dimensions
		const scaledWidth = width * scale;
		const scaledHeight = height * scale;
		const x = ctx.canvas.width - scaledWidth - padding * scale;
		const y = ctx.canvas.height - scaledHeight - padding * scale;

		ctx.drawImage(this.logoImage, x, y, scaledWidth, scaledHeight);

		// Restore the context state
		ctx.restore();
	}
}

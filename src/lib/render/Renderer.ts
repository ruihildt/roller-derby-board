import { ScalingManager } from '$lib/classes/ScalingManager';
import type { Point } from '$lib/types';
import { TrackGeometry } from '../classes/TrackGeometry';

export class Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	highResCanvas: HTMLCanvasElement;
	highResCtx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;
	trackGeometry: TrackGeometry;
	private logoImage: HTMLImageElement;
	scalingManager: ScalingManager;

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
		this.scalingManager = ScalingManager.getInstance();

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
		ctx.fillStyle = '#D3D3D3';
		ctx.fill(this.trackSurface, 'evenodd');

		// Draw the inner and outer track lines
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw official lane dotted line
		ctx.save();
		ctx.setLineDash([1, 10]);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke(this.outerOfficialLanePath);
		ctx.setLineDash([]);
		ctx.restore();

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);

		// Draw the 10-foot lines
		ctx.strokeStyle = 'black';
		ctx.lineWidth = this.LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
	}
	drawTrackBoundaries(ctx: CanvasRenderingContext2D): void {
		// Draw the inner and outer track lines
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw official lane dotted line
		ctx.save();
		ctx.setLineDash([1, 10]);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke(this.outerOfficialLanePath);
		ctx.setLineDash([]);
		ctx.restore();

		// Draw pivot and jammer lines
		this.drawPivotLine(ctx);
		this.drawJammerLine(ctx);

		// Draw the 10-foot lines
		ctx.strokeStyle = 'black';
		ctx.lineWidth = this.LINE_WIDTH / 2;
		ctx.stroke(this.tenFeetLines);
	}

	drawTrackBoundariesHighRes(): void {
		if (!this.highResCanvas) return;
		const ctx = this.highResCtx;

		// Draw the inner and outer track lines
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = this.LINE_WIDTH;
		ctx.stroke(this.innerTrackPath);
		ctx.stroke(this.outerTrackPath);

		// Draw official lane dotted line
		ctx.save();
		ctx.setLineDash([1, 10]);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke(this.outerOfficialLanePath);
		ctx.setLineDash([]);
		ctx.restore();

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

	drawBranding(ctx: CanvasRenderingContext2D): void {
		if (!this.logoImage.complete) return;

		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;

		const sizeMultiplier = 0.5;
		const baseScale = (this.PIXELS_PER_METER / 35) * sizeMultiplier;
		const width = this.logoImage.width * baseScale;
		const height = this.logoImage.height * baseScale;

		ctx.save();
		ctx.drawImage(this.logoImage, centerX - width / 2, centerY - height / 2, width, height);
		ctx.restore();
	}
}

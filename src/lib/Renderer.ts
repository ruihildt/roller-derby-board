import type { Player } from '$lib/Player';
import type { Point } from '$lib/types';

export class Renderer {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;

	innerTrackPath: Path2D;
	outerTrackPath: Path2D;
	pivotLinePath: Path2D;
	jammerLinePath: Path2D;
	blockerStartAreaPath: Path2D;
	trackSurfacePath: Path2D;
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

		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurfacePath = this.createTrackSurfacePath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
		this.blockerStartAreaPath = this.createblockerStartAreaPath();
		this.midTrackPath = this.createMidTrackPath();
	}

	private createTrackSurfacePath(): Path2D {
		const trackSurface = new Path2D();
		trackSurface.addPath(this.outerTrackPath);
		trackSurface.addPath(this.innerTrackPath);
		return trackSurface;
	}

	private createInnerTrackPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.C.x, p.C.y);
		path.lineTo(p.E.x, p.E.y);
		path.arc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.D.x, p.D.y);
		path.arc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);

		return path;
	}

	private createOuterTrackPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.K.x, p.K.y);
		path.arc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.J.x, p.J.y);
		path.arc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), Math.PI / 2, -Math.PI / 2, true);

		return path;
	}

	private createPivotLinePath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.C.x, p.C.y);

		return path;
	}

	private createJammerLinePath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.K.x, p.K.y);
		path.lineTo(p.E.x, p.E.y);

		return path;
	}

	private createblockerStartAreaPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.C.x, p.C.y);
		path.lineTo(p.E.x, p.E.y);
		path.lineTo(p.K.x, p.K.y);
		path.closePath();

		return path;
	}

	private createMidTrackPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		const midYStartTop = (p.C.y + p.I.y) / 2;
		const midYEndTop = (p.E.y + p.K.y) / 2;
		const midYStartBottom = (p.D.y + p.J.y) / 2;
		// const midYEndBottom = (p.F.y + p.L.y) / 2;
		const midRadiusTop = (Math.abs(p.C.y - p.A.y) + Math.abs(p.I.y - p.G.y)) / 2;
		const midRadiusBottom = (Math.abs(p.D.y - p.A.y) + Math.abs(p.J.y - p.G.y)) / 2;

		path.moveTo(p.C.x, midYStartTop);
		path.lineTo(p.E.x, midYEndTop);
		path.arc(p.H.x, (p.B.y + p.H.y) / 2, midRadiusBottom, -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.D.x, midYStartBottom);
		path.arc(p.G.x, (p.G.y + p.A.y) / 2, midRadiusTop, Math.PI / 2, -Math.PI / 2, true);

		return path;
	}

	draw(players: Player[]): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawTrack(this.ctx);
		// this.drawMidTrackLine(this.ctx);

		for (const player of players) {
			player.draw(this.ctx);
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
		}
	}

	drawTrack(ctx: CanvasRenderingContext2D): void {
		// Fill only the area between outer and inner tracks
		ctx.fillStyle = '#D3D3D3';
		ctx.fill(this.trackSurfacePath, 'evenodd');

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
}

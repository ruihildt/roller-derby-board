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

		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
		this.straight1Area = this.createStraight1Path();
		this.straight2Area = this.createStraight2Path();
		this.turn1Area = this.createTurn1Path();
		this.turn2Area = this.createTurn2Path();
		this.midTrackPath = this.createMidTrackPath();
	}

	createTrackSurfacePath(): Path2D {
		const trackSurface = new Path2D();
		trackSurface.addPath(this.outerTrackPath);
		trackSurface.addPath(this.innerTrackPath);
		return trackSurface;
	}

	createInnerTrackPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.C.x, p.C.y);
		path.lineTo(p.E.x, p.E.y);
		path.arc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.D.x, p.D.y);
		path.arc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);

		return path;
	}

	createOuterTrackPath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.K.x, p.K.y);
		path.arc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.J.x, p.J.y);
		path.arc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), Math.PI / 2, -Math.PI / 2, true);

		return path;
	}

	createPivotLinePath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.C.x, p.C.y);

		return path;
	}

	createJammerLinePath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.K.x, p.K.y);
		path.lineTo(p.E.x, p.E.y);

		return path;
	}

	createStraight1Path(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.C.x, p.C.y);
		path.lineTo(p.E.x, p.E.y);
		path.lineTo(p.K.x, p.K.y);
		path.closePath();

		return path;
	}

	createStraight2Path(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.D.x, p.D.y);
		path.lineTo(p.J.x, p.J.y);
		path.lineTo(p.L.x, p.L.y);
		path.lineTo(p.F.x, p.F.y);
		path.closePath();

		return path;
	}

	createTurn1Path(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.K.x, p.K.y);
		path.lineTo(p.E.x, p.E.y);
		path.arc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);
		path.lineTo(p.F.x, p.F.y);
		path.arc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), Math.PI / 2, -Math.PI / 2, false);
		path.closePath();

		return path;
	}

	createTurn2Path(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.I.x, p.I.y);
		path.lineTo(p.C.x, p.C.y);
		path.arc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);
		path.lineTo(p.D.x, p.D.y);
		path.arc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), -Math.PI / 2, Math.PI / 2, false);
		path.closePath();

		return path;
	}

	createMidTrackPath(): Path2D {
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
		this.drawMidTrackLine(this.ctx);
		this.drawPoints(this.ctx);

		for (const player of players) {
			player.draw(this.ctx);

			// Draw perpendicular line if player is on the track
			if (this.isPlayerOnTrack(player)) {
				this.drawPerpendicularLine({ x: player.x, y: player.y });
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
				this.drawPerpendicularLine({ x: player.x, y: player.y }, ctx);
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

	drawPerpendicularLine(point: Point, ctx: CanvasRenderingContext2D = this.ctx): void {
		const p = this.points;
		let startPoint: Point, endPoint: Point;

		// Check if the point is on the curved section or straight section
		if (point.x <= p.B.x || point.x >= p.A.x) {
			// Curved section
			const innerCenter = point.x >= p.A.x ? p.A : p.B;
			const outerCenter = point.x >= p.A.x ? p.G : p.H;

			const innerRadius = Math.abs(p.C.y - p.A.y);
			const outerRadius = Math.abs(p.I.y - p.G.y);

			const angleInner = Math.atan2(point.y - innerCenter.y, point.x - innerCenter.x);
			const angleOuter = Math.atan2(point.y - outerCenter.y, point.x - outerCenter.x);

			startPoint = {
				x: innerCenter.x + innerRadius * Math.cos(angleInner),
				y: innerCenter.y + innerRadius * Math.sin(angleInner)
			};
			endPoint = {
				x: outerCenter.x + outerRadius * Math.cos(angleOuter),
				y: outerCenter.y + outerRadius * Math.sin(angleOuter)
			};
		} else {
			// Straight section
			let innerStart: Point, innerEnd: Point, outerStart: Point, outerEnd: Point;

			if (point.y < this.canvas.height / 2) {
				// Top straightaway
				innerStart = p.C;
				innerEnd = p.E;
				outerStart = p.I;
				outerEnd = p.K;
			} else {
				// Bottom straightaway
				innerStart = p.D;
				innerEnd = p.F;
				outerStart = p.J;
				outerEnd = p.L;
			}

			const innerSlope = (innerEnd.y - innerStart.y) / (innerEnd.x - innerStart.x);
			const outerSlope = (outerEnd.y - outerStart.y) / (outerEnd.x - outerStart.x);

			startPoint = {
				x: point.x,
				y: innerStart.y + innerSlope * (point.x - innerStart.x)
			};
			endPoint = {
				x: point.x,
				y: outerStart.y + outerSlope * (point.x - outerStart.x)
			};
		}

		// Ensure startPoint and endPoint are defined
		if (!startPoint || !endPoint) {
			console.error('Failed to calculate perpendicular line points');
			return;
		}

		// Draw the perpendicular line
		ctx.beginPath();
		ctx.moveTo(startPoint.x, startPoint.y);
		ctx.lineTo(endPoint.x, endPoint.y);
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

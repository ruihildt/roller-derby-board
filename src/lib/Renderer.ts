import type { Player } from '$lib/Player';
import type { Point } from '$lib/types';

export class Renderer {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;

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
	}

	draw(players: Player[]): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawGrid(this.ctx);
		this.drawTrack(this.ctx);
		this.drawMidTrackLine(this.ctx);

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

		this.drawGrid(ctx);
		this.drawTrack(ctx);
		this.drawMidTrackLine(ctx);

		for (const player of players) {
			player.draw(ctx);
		}

		ctx.fillStyle = 'black';
		ctx.font = '24px Arial';
		ctx.fillText('HD', 100, 100);
	}

	drawGrid(ctx: CanvasRenderingContext2D): void {
		const scale = this.PIXELS_PER_METER;
		const gridSize = scale; // 1 meter grid

		ctx.strokeStyle = '#ccc'; // Light gray color for the grid
		ctx.lineWidth = 0.5;

		// Draw vertical lines
		for (let x = 0; x <= this.canvas.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.canvas.height);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = 0; y <= this.canvas.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.canvas.width, y);
			ctx.stroke();
		}
	}

	drawTrack(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.lineWidth = this.LINE_WIDTH;

		// Set fill style for grey color
		ctx.fillStyle = '#D3D3D3';

		// Fill area between straight lines
		ctx.beginPath();
		ctx.moveTo(p.C.x, p.C.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.lineTo(p.K.x, p.K.y);
		ctx.lineTo(p.I.x, p.I.y);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(p.D.x, p.D.y);
		ctx.lineTo(p.F.x, p.F.y);
		ctx.lineTo(p.L.x, p.L.y);
		ctx.lineTo(p.J.x, p.J.y);
		ctx.closePath();
		ctx.fill();

		// Fill area between arcs
		ctx.beginPath();
		ctx.arc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);
		ctx.arc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), -Math.PI / 2, Math.PI / 2, false);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.arc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);
		ctx.arc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), Math.PI / 2, -Math.PI / 2, false);
		ctx.closePath();
		ctx.fill();

		// Draw inside arcs
		ctx.strokeStyle = 'blue';
		this.drawArc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true, ctx);

		// Draw inside straight lines
		ctx.strokeStyle = 'green';
		ctx.beginPath();
		ctx.moveTo(p.C.x, p.C.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.moveTo(p.D.x, p.D.y);
		ctx.lineTo(p.F.x, p.F.y);
		ctx.stroke();

		// Draw outside arcs
		ctx.strokeStyle = 'red';
		this.drawArc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), -Math.PI / 2, Math.PI / 2, true, ctx);

		// Draw outside straight lines
		ctx.strokeStyle = 'purple';
		ctx.beginPath();
		ctx.moveTo(p.I.x, p.I.y);
		ctx.lineTo(p.K.x, p.K.y);
		ctx.moveTo(p.J.x, p.J.y);
		ctx.lineTo(p.L.x, p.L.y);
		ctx.stroke();

		// Draw pivot line
		ctx.strokeStyle = 'orange';
		this.drawPivotLine(ctx);

		// Draw jammer line
		ctx.strokeStyle = 'cyan';
		this.drawJammerLine(ctx);

		// Draw points
		this.drawPoints(ctx);
	}

	drawArc(
		x: number,
		y: number,
		radius: number,
		startAngle: number,
		endAngle: number,
		clockwise: boolean,
		ctx: CanvasRenderingContext2D
	): void {
		ctx.beginPath();
		ctx.arc(x, y, radius, startAngle, endAngle, clockwise);
		ctx.stroke();
	}

	drawPivotLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.beginPath();
		ctx.moveTo(p.I.x, p.I.y);
		ctx.lineTo(p.C.x, p.C.y);
		ctx.stroke();
	}

	drawJammerLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.beginPath();
		ctx.moveTo(p.K.x, p.K.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.stroke();
	}

	drawPoints(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.fillStyle = 'black';
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

	drawMidTrackLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 3;

		// Calculate the exact midpoints for straight sections
		const midYStartTop = (p.C.y + p.I.y) / 2;
		const midYEndTop = (p.E.y + p.K.y) / 2;
		const midYStartBottom = (p.D.y + p.J.y) / 2;
		const midYEndBottom = (p.F.y + p.L.y) / 2;

		// Draw straight sections
		ctx.beginPath();
		ctx.moveTo(p.C.x, midYStartTop);
		ctx.lineTo(p.E.x, midYEndTop);
		ctx.moveTo(p.D.x, midYStartBottom);
		ctx.lineTo(p.F.x, midYEndBottom);
		ctx.stroke();

		// Draw curved sections
		const midRadiusTop = (Math.abs(p.C.y - p.A.y) + Math.abs(p.I.y - p.G.y)) / 2;
		const midRadiusBottom = (Math.abs(p.D.y - p.A.y) + Math.abs(p.J.y - p.G.y)) / 2;

		this.drawArc(p.G.x, (p.G.y + p.A.y) / 2, midRadiusTop, Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.H.x, (p.B.y + p.H.y) / 2, midRadiusBottom, -Math.PI / 2, Math.PI / 2, true, ctx);
	}

	// drawPackBoundaries() {
	// Visualize pack boundaries on the track
	// This is a placeholder and needs to be implemented based on how you want to represent the pack
	// }
}

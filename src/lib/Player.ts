import type { Point } from './types';

export class Player {
	x: number;
	y: number;
	tX: number;
	tY: number;
	team: string;
	role: string;
	color: string;
	radius: number;
	speed: number;
	zone: number;
	direction: number;
	inBounds: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;
	isDragging: boolean;
	dragOffsetX: number;
	dragOffsetY: number;

	constructor(x: number, y: number, team: string, role: string, radius: number) {
		this.x = x;
		this.y = y;
		this.tX = x;
		this.tY = y;
		this.team = team;
		this.role = role;
		this.color = team === 'A' ? 'teal' : 'orange';
		this.radius = radius;
		this.speed = 0;
		this.zone = 0;
		this.direction = 0;
		this.inBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isDragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
	}

	containsPoint(x: number, y: number): boolean {
		const dx = this.x - x;
		const dy = this.y - y;
		return dx * dx + dy * dy <= this.radius * this.radius;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

		if (this.isRearmost) {
			ctx.fillStyle = 'magenta';
		} else if (this.isForemost) {
			ctx.fillStyle = 'cyan';
		} else {
			ctx.fillStyle = this.color;
		}
		ctx.fill();

		ctx.strokeStyle = this.isInPack ? 'pink' : this.inBounds ? 'black' : 'red';
		ctx.lineWidth = 4;
		ctx.stroke();

		// Draw role indicator
		ctx.fillStyle = 'white';
		ctx.font = '10px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.role[0].toUpperCase(), this.x, this.y);
	}

	update(): void {
		// Update player position based on speed and direction
		this.x += Math.cos(this.direction) * this.speed;
		this.y += Math.sin(this.direction) * this.speed;
	}

	onPositionChange: (() => void) | null = null;

	updatePosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
		if (this.onPositionChange) {
			this.onPositionChange();
		}
	}

	updateTrackCoordinates(points: Record<string, Point>, canvasHeight: number): void {
		const p = points;
		let startPoint: Point, endPoint: Point;

		if (this.x <= p.B.x || this.x >= p.A.x) {
			// Curved section logic
			const innerCenter = this.x >= p.A.x ? p.A : p.B;
			const outerCenter = this.x >= p.A.x ? p.G : p.H;
			const innerRadius = Math.abs(p.C.y - p.A.y);
			const outerRadius = Math.abs(p.I.y - p.G.y);
			const angle = Math.atan2(this.y - innerCenter.y, this.x - innerCenter.x);

			startPoint = {
				x: innerCenter.x + innerRadius * Math.cos(angle),
				y: innerCenter.y + innerRadius * Math.sin(angle)
			};
			endPoint = {
				x: outerCenter.x + outerRadius * Math.cos(angle),
				y: outerCenter.y + outerRadius * Math.sin(angle)
			};
		} else {
			// Straight section logic
			const [innerStart, innerEnd, outerStart, outerEnd] =
				this.y < canvasHeight / 2 ? [p.C, p.E, p.I, p.K] : [p.D, p.F, p.J, p.L];

			const innerSlope = (innerEnd.y - innerStart.y) / (innerEnd.x - innerStart.x);
			const outerSlope = (outerEnd.y - outerStart.y) / (outerEnd.x - outerStart.x);

			startPoint = {
				x: this.x,
				y: innerStart.y + innerSlope * (this.x - innerStart.x)
			};
			endPoint = {
				x: this.x,
				y: outerStart.y + outerSlope * (this.x - outerStart.x)
			};
		}

		// Calculate midpoint
		this.tX = (startPoint.x + endPoint.x) / 2;
		this.tY = (startPoint.y + endPoint.y) / 2;
	}
}

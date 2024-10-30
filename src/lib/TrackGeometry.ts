import type { Point } from './types';
import type { Player } from './Player';

export class TrackGeometry {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	PIXELS_PER_METER: number;

	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	innerTrackPath: Path2D;
	outerTrackPath: Path2D;
	trackSurface: Path2D;
	midTrackPath: Path2D;
	pivotLinePath: Path2D;
	jammerLinePath: Path2D;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>,
		PIXELS_PER_METER: number
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.points = points;
		this.PIXELS_PER_METER = PIXELS_PER_METER;

		this.straight1Area = this.createStraight1Path();
		this.straight2Area = this.createStraight2Path();
		this.turn1Area = this.createTurn1Path();
		this.turn2Area = this.createTurn2Path();
		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.midTrackPath = this.createMidTrackPath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
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

	createTrackSurfacePath(): Path2D {
		const trackSurface = new Path2D();
		trackSurface.addPath(this.outerTrackPath);
		trackSurface.addPath(this.innerTrackPath);
		return trackSurface;
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

	// Add a resize method to TrackGeometry class
	resize(newPoints: Record<string, Point>): void {
		this.points = newPoints;

		// Recreate all path geometries with new points
		this.straight1Area = this.createStraight1Path();
		this.straight2Area = this.createStraight2Path();
		this.turn1Area = this.createTurn1Path();
		this.turn2Area = this.createTurn2Path();
		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.midTrackPath = this.createMidTrackPath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
	}

	isPlayerInBounds(player: Player): boolean {
		// TODO Consider using the zones instead, since we're already using them anyway
		// Check the center and four points on the circumference of the player's circle
		const pointsToCheck = [
			{ x: player.x, y: player.y }, // Center
			{ x: player.x + player.radius, y: player.y }, // Right
			{ x: player.x - player.radius, y: player.y }, // Left
			{ x: player.x, y: player.y + player.radius }, // Bottom
			{ x: player.x, y: player.y - player.radius } // Top
		];

		for (const point of pointsToCheck) {
			// Check if the point is inside the outer track path
			const insideOuterTrack = this.ctx.isPointInPath(this.outerTrackPath, point.x, point.y);

			// Check if the point is outside the inner track path
			const outsideInnerTrack = !this.ctx.isPointInPath(this.innerTrackPath, point.x, point.y);

			// If any point is out of bounds, the player is out of bounds
			if (!insideOuterTrack || !outsideInnerTrack) {
				return false;
			}
		}

		// If all points are in bounds, the player is in bounds
		return true;
	}

	isPlayerInStraight1(player: Player): boolean {
		return this.ctx.isPointInPath(this.straight1Area, player.x, player.y);
	}

	isPlayerInStraight2(player: Player): boolean {
		return this.ctx.isPointInPath(this.straight2Area, player.x, player.y);
	}

	isPlayerInTurn1(player: Player): boolean {
		return this.ctx.isPointInPath(this.turn1Area, player.x, player.y);
	}
	isPlayerInTurn2(player: Player): boolean {
		return this.ctx.isPointInPath(this.turn2Area, player.x, player.y);
	}

	updatePlayerZone(player: Player): void {
		const isInZone1 = this.isPlayerInStraight1(player);
		const isInZone2 = this.isPlayerInTurn1(player);
		const isInZone3 = this.isPlayerInStraight2(player);
		const isInZone4 = this.isPlayerInTurn2(player);

		if (isInZone1) {
			player.zone = 1;
		} else if (isInZone2) {
			player.zone = 2;
		} else if (isInZone3) {
			player.zone = 3;
		} else if (isInZone4) {
			player.zone = 4;
		} else {
			player.zone = 0; // Outside track
		}
		// console.log(player.role + ' is in ' + player.zone);
	}

	createPackZonePath(rearmost: Player, foremost: Player, zones: number[]): Path2D {
		const path = new Path2D();
		// const p = this.points;

		console.log(rearmost.startPoint, rearmost.endPoint);
		console.log(foremost.startPoint, foremost.endPoint);
		console.log(zones);

		// Show the zone sequence

		// First point as rearmost.startPoint
		// move to rearmost.endPoint
		//

		return path;
	}

	updatePlayerCoordinates(player: Player): void {
		const p = this.points;
		const { x, y } = player;

		let startPoint: Point, endPoint: Point;

		if (x <= p.B.x || x >= p.A.x) {
			// Curved section logic
			const innerCenter = x >= p.A.x ? p.A : p.B;
			const outerCenter = x >= p.A.x ? p.G : p.H;
			const innerRadius = Math.abs(p.C.y - p.A.y);
			const outerRadius = Math.abs(p.I.y - p.G.y);
			const angle = Math.atan2(y - innerCenter.y, x - innerCenter.x);

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
				y < this.canvas.height / 2 ? [p.C, p.E, p.I, p.K] : [p.D, p.F, p.J, p.L];

			const innerSlope = (innerEnd.y - innerStart.y) / (innerEnd.x - innerStart.x);
			const outerSlope = (outerEnd.y - outerStart.y) / (outerEnd.x - outerStart.x);

			startPoint = {
				x: x,
				y: innerStart.y + innerSlope * (x - innerStart.x)
			};
			endPoint = {
				x: x,
				y: outerStart.y + outerSlope * (x - outerStart.x)
			};
		}

		player.startPoint = startPoint;
		player.endPoint = endPoint;
	}

	drawPerpendicularLine(player: Player): void {
		const { startPoint, endPoint } = player;

		this.ctx.beginPath();
		this.ctx.moveTo(startPoint.x, startPoint.y);
		this.ctx.lineTo(endPoint.x, endPoint.y);
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	}
}

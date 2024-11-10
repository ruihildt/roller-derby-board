import type { Point } from './types';
import type { Player } from './Player';

type StraightKey = 1 | 3;
type TurnKey = 2 | 4;
type Straight = {
	innerStart: Point;
	outerStart: Point;
	innerEnd: Point;
	outerEnd: Point;
};

type Turn = {
	innerStart: Point;
	outerStart: Point;
	innerEnd: Point;
	outerEnd: Point;
	centerInner: Point;
	centerOuter: Point;
};

type Zones = {
	1: Straight;
	2: Turn;
	3: Straight;
	4: Turn;
};

export class TrackGeometry {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	points: Record<string, Point>;
	zones: Zones;
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
		this.PIXELS_PER_METER = PIXELS_PER_METER;
		this.points = points;
		this.zones = {
			1: {
				innerStart: { x: points.C.x, y: points.C.y },
				outerStart: { x: points.I.x, y: points.I.y },
				innerEnd: { x: points.E.x, y: points.E.y },
				outerEnd: { x: points.K.x, y: points.K.y }
			},
			2: {
				innerStart: { x: points.E.x, y: points.E.y },
				outerStart: { x: points.K.x, y: points.K.y },
				innerEnd: { x: points.F.x, y: points.F.y },
				outerEnd: { x: points.L.x, y: points.L.y },
				centerInner: { x: points.B.x, y: points.B.y },
				centerOuter: { x: points.H.x, y: points.H.y }
			},
			3: {
				innerStart: { x: points.F.x, y: points.F.y },
				outerStart: { x: points.L.x, y: points.L.y },
				innerEnd: { x: points.D.x, y: points.D.y },
				outerEnd: { x: points.J.x, y: points.J.y }
			},
			4: {
				innerStart: { x: points.D.x, y: points.D.y },
				outerStart: { x: points.J.x, y: points.J.y },
				innerEnd: { x: points.C.x, y: points.C.y },
				outerEnd: { x: points.I.x, y: points.I.y },
				centerInner: { x: points.A.x, y: points.A.y },
				centerOuter: { x: points.G.x, y: points.G.y }
			}
		};

		this.straight1Area = this.createStraightPath(1);
		this.straight2Area = this.createStraightPath(3);
		this.turn1Area = this.createTurnPath(2);
		this.turn2Area = this.createTurnPath(4);
		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.midTrackPath = this.createMidTrackPath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
	}

	createInnerTrackPath(): Path2D {
		const path = new Path2D();
		const zones = this.zones;

		path.moveTo(zones[1].innerStart.x, zones[1].innerStart.y);
		path.lineTo(zones[1].innerEnd.x, zones[1].innerEnd.y);
		path.arc(
			zones[2].centerInner.x,
			zones[2].centerInner.y,
			Math.abs(zones[2].innerStart.y - zones[2].centerInner.y),
			-Math.PI / 2,
			Math.PI / 2,
			true
		);
		path.lineTo(zones[3].innerEnd.x, zones[3].innerEnd.y);
		path.arc(
			zones[4].centerInner.x,
			zones[4].centerInner.y,
			Math.abs(zones[4].innerEnd.y - zones[4].centerInner.y),
			Math.PI / 2,
			-Math.PI / 2,
			true
		);

		return path;
	}

	createOuterTrackPath(): Path2D {
		const path = new Path2D();
		const zones = this.zones;

		path.moveTo(zones[1].outerStart.x, zones[1].outerStart.y);
		path.lineTo(zones[1].outerEnd.x, zones[1].outerEnd.y);
		path.arc(
			zones[2].centerOuter.x,
			zones[2].centerOuter.y,
			Math.abs(zones[2].outerStart.y - zones[2].centerOuter.y),
			-Math.PI / 2,
			Math.PI / 2,
			true
		);
		path.lineTo(zones[3].outerEnd.x, zones[3].outerEnd.y);
		path.arc(
			zones[4].centerOuter.x,
			zones[4].centerOuter.y,
			Math.abs(zones[4].outerStart.y - zones[4].centerOuter.y),
			Math.PI / 2,
			-Math.PI / 2,
			true
		);

		return path;
	}

	createTrackSurfacePath(): Path2D {
		const trackSurface = new Path2D();
		trackSurface.addPath(this.outerTrackPath);
		trackSurface.addPath(this.innerTrackPath);
		return trackSurface;
	}

	createStraightPath(straight: StraightKey): Path2D {
		const path = new Path2D();
		const zone = this.zones[straight];

		path.moveTo(zone.outerStart.x, zone.outerStart.y);
		path.lineTo(zone.innerStart.x, zone.innerStart.y);
		path.lineTo(zone.innerEnd.x, zone.innerEnd.y);
		path.lineTo(zone.outerEnd.x, zone.outerEnd.y);
		path.closePath();

		return path;
	}

	createTurnPath(turnKey: TurnKey): Path2D {
		const path = new Path2D();
		const turn = this.zones[turnKey];
		const isFirstTurn = turnKey === 2;

		path.moveTo(turn.outerStart.x, turn.outerStart.y);
		path.lineTo(turn.innerStart.x, turn.innerStart.y);
		path.arc(
			turn.centerInner.x,
			turn.centerInner.y,
			Math.abs(turn.innerStart.y - turn.centerInner.y),
			isFirstTurn ? -Math.PI / 2 : Math.PI / 2,
			isFirstTurn ? Math.PI / 2 : -Math.PI / 2,
			true
		);
		path.lineTo(turn.innerEnd.x, turn.innerEnd.y);
		path.arc(
			turn.centerOuter.x,
			turn.centerOuter.y,
			Math.abs(turn.outerStart.y - turn.centerOuter.y),
			isFirstTurn ? Math.PI / 2 : -Math.PI / 2,
			isFirstTurn ? -Math.PI / 2 : Math.PI / 2,
			false
		);
		path.closePath();

		return path;
	}

	createStraightZone(points: {
		innerStart: Point;
		outerStart: Point;
		innerEnd: Point;
		outerEnd: Point;
	}): Path2D {
		const path = new Path2D();

		path.moveTo(points.innerStart.x, points.innerStart.y);
		path.lineTo(points.innerEnd.x, points.innerEnd.y);
		path.lineTo(points.outerEnd.x, points.outerEnd.y);
		path.lineTo(points.outerStart.x, points.outerStart.y);
		path.closePath();

		return path;
	}

	createTurnZone(points: {
		innerStart: Point;
		outerStart: Point;
		innerEnd: Point;
		outerEnd: Point;
		centerInner: Point;
		centerOuter: Point;
	}): Path2D {
		const path = new Path2D();

		// Calculate angles for inner arc
		const innerStartAngle = Math.atan2(
			points.innerStart.y - points.centerInner.y,
			points.innerStart.x - points.centerInner.x
		);
		const innerEndAngle = Math.atan2(
			points.innerEnd.y - points.centerInner.y,
			points.innerEnd.x - points.centerInner.x
		);

		// Calculate angles for outer arc
		const outerStartAngle = Math.atan2(
			points.outerStart.y - points.centerOuter.y,
			points.outerStart.x - points.centerOuter.x
		);
		const outerEndAngle = Math.atan2(
			points.outerEnd.y - points.centerOuter.y,
			points.outerEnd.x - points.centerOuter.x
		);

		// Start from outerStart, draw line to innerStart
		path.moveTo(points.outerStart.x, points.outerStart.y);
		path.lineTo(points.innerStart.x, points.innerStart.y);

		// Draw inner arc
		path.arc(
			points.centerInner.x,
			points.centerInner.y,
			Math.hypot(
				points.innerStart.x - points.centerInner.x,
				points.innerStart.y - points.centerInner.y
			),
			innerStartAngle,
			innerEndAngle,
			true // Ensure the arc direction is correct
		);

		// Draw line to outerEnd
		path.lineTo(points.outerEnd.x, points.outerEnd.y);

		// Draw outer arc
		path.arc(
			points.centerOuter.x,
			points.centerOuter.y,
			Math.hypot(
				points.outerStart.x - points.centerOuter.x,
				points.outerStart.y - points.centerOuter.y
			),
			outerEndAngle,
			outerStartAngle,
			false // Ensure the arc direction is correct
		);

		path.closePath();

		return path;
	}

	createStraightTurnZone(packZones: number[], rearmost: Player, foremost: Player): Path2D {
		const path = new Path2D();
		// Create a straight segment from the rearmost innerPoint/outerPoint to the packZone 1 innerEnd/outerEnd
		// Create a turn segment from the packZone 1 innerEnd + outerEnd to the foremost innerPoint/outerPoint
		// Add the two created zone to the path

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
		this.straight1Area = this.createStraightPath(1);
		this.straight2Area = this.createStraightPath(3);
		this.turn1Area = this.createTurnPath(2);
		this.turn2Area = this.createTurnPath(4);
		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.midTrackPath = this.createMidTrackPath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
	}

	isPlayerInBounds(player: Player): boolean {
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

	createPackZonePath(rearmost: Player, foremost: Player, packZones: number[]): Path2D {
		console.log(packZones);

		const singleZone = packZones.length === 1;
		const dualZone = packZones.length === 2;

		if (singleZone) {
			const zone = packZones[0];

			// for the straights
			if (zone === 1 || zone === 3) {
				return this.createStraightZone({
					innerStart: rearmost.innerPoint,
					outerStart: rearmost.outerPoint,
					innerEnd: foremost.innerPoint,
					outerEnd: foremost.outerPoint
				});
			}

			if (zone === 2) {
				return this.createTurnZone({
					innerStart: rearmost.innerPoint,
					outerStart: rearmost.outerPoint,
					innerEnd: foremost.innerPoint,
					outerEnd: foremost.outerPoint,
					centerInner: { x: this.points.B.x, y: this.points.B.y },
					centerOuter: { x: this.points.H.x, y: this.points.H.y }
				});
			}

			if (zone === 4 || zone === 0) {
				return this.createTurnZone({
					innerStart: rearmost.innerPoint,
					outerStart: rearmost.outerPoint,
					innerEnd: foremost.innerPoint,
					outerEnd: foremost.outerPoint,
					centerInner: { x: this.points.A.x, y: this.points.A.y },
					centerOuter: { x: this.points.G.x, y: this.points.G.y }
				});
			}
		}

		if (dualZone) {
			const zone1 = packZones[0];
			const zone2 = packZones[1];

			// it can either be straight > curve or curve > straight
			// if straight > curve
		}

		const path = new Path2D();

		return path;
	}

	updatePlayerCoordinates(player: Player): void {
		const p = this.points;
		const { x, y } = player;

		if (x <= p.B.x || x >= p.A.x) {
			// Curved section logic
			const innerCenter = x >= p.A.x ? p.A : p.B;
			const outerCenter = x >= p.A.x ? p.G : p.H;
			const innerRadius = Math.abs(p.C.y - p.A.y);
			const outerRadius = Math.abs(p.I.y - p.G.y);
			const angle = Math.atan2(y - innerCenter.y, x - innerCenter.x);

			player.innerPoint = {
				x: innerCenter.x + innerRadius * Math.cos(angle),
				y: innerCenter.y + innerRadius * Math.sin(angle)
			};
			player.outerPoint = {
				x: outerCenter.x + outerRadius * Math.cos(angle),
				y: outerCenter.y + outerRadius * Math.sin(angle)
			};
		} else {
			// Straight section logic
			const [innerStart, innerEnd, outerStart, outerEnd] =
				y < this.canvas.height / 2 ? [p.C, p.E, p.I, p.K] : [p.D, p.F, p.J, p.L];

			const innerSlope = (innerEnd.y - innerStart.y) / (innerEnd.x - innerStart.x);
			const outerSlope = (outerEnd.y - outerStart.y) / (outerEnd.x - outerStart.x);

			player.innerPoint = {
				x: x,
				y: innerStart.y + innerSlope * (x - innerStart.x)
			};
			player.outerPoint = {
				x: x,
				y: outerStart.y + outerSlope * (x - outerStart.x)
			};
		}
	}

	drawPerpendicularLine(player: Player): void {
		const { innerPoint, outerPoint } = player;

		this.ctx.beginPath();
		this.ctx.moveTo(innerPoint.x, innerPoint.y);
		this.ctx.lineTo(outerPoint.x, outerPoint.y);
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	}
}

import type { Point } from './types';
import { Player } from './Player';

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
		const zone = this.zones[straight];
		return this.createStraightSegment(
			zone.innerStart,
			zone.outerStart,
			zone.innerEnd,
			zone.outerEnd
		);
	}

	createTurnPath(turnKey: TurnKey): Path2D {
		const turn = this.zones[turnKey];
		return this.createTurnSegment(
			turn.innerStart,
			turn.outerStart,
			turn.innerEnd,
			turn.outerEnd,
			turnKey
		);
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
		const path = new Path2D();

		// Handle each zone sequentially
		packZones.forEach((zone, index) => {
			const isFirstZone = index === 0;
			const isLastZone = index === packZones.length - 1;

			// Cast zone to the appropriate type based on whether it's odd or even
			const zoneKey = zone % 2 === 1 ? (zone as StraightKey) : (zone as TurnKey);

			// Determine start and end points for this zone segment
			const startPoints = isFirstZone
				? { inner: rearmost.innerPoint, outer: rearmost.outerPoint }
				: { inner: this.zones[zoneKey].innerStart, outer: this.zones[zoneKey].outerStart };

			// Inside createPackZonePath method, modify the endPoints determination:
			const endPoints = isLastZone
				? { inner: foremost.innerPoint, outer: foremost.outerPoint }
				: { inner: this.zones[zoneKey].innerEnd, outer: this.zones[zoneKey].outerEnd };

			// Create zone segment based on zone type
			if (zone % 2 === 1) {
				// Straight zone
				const straightZone = this.createStraightSegment(
					startPoints.inner,
					startPoints.outer,
					endPoints.inner,
					endPoints.outer
				);
				path.addPath(straightZone);
			} else {
				// Turn zone
				const turnZone = this.createTurnSegment(
					startPoints.inner,
					startPoints.outer,
					endPoints.inner,
					endPoints.outer,
					zone as TurnKey
				);
				path.addPath(turnZone);
			}
		});

		return path;
	}

	createEngagementZonePath(rearmost: Player, foremost: Player): Path2D {
		// Get the point 6.1 meters ahead on the midtrack
		const engagementZonePoint = this.getPointAheadOnMidtrack(foremost, 6.1);

		// Create a dummy player at the engagement zone point to get proper inner/outer points
		const dummyPlayer = {
			x: engagementZonePoint.x,
			y: engagementZonePoint.y,
			innerPoint: { x: 0, y: 0 },
			outerPoint: { x: 0, y: 0 }
		} as Player;

		// Calculate proper inner/outer points
		this.updatePlayerCoordinates(dummyPlayer);

		// Create a path from foremost player to engagement zone point
		const packZones = this.getZonesBetweenPoints(
			{ x: foremost.x, y: foremost.y },
			engagementZonePoint
		);

		return this.createPackZonePath(foremost, dummyPlayer, packZones);
	}

	getPointBehindOnMidtrack(startPoint: Player, distanceInMeters: number): Point {
		const distanceInPixels = distanceInMeters * this.PIXELS_PER_METER;
		const zone = this.determineZone(startPoint.x, startPoint.y);

		if (zone === 1 || zone === 3) {
			const isZone1 = zone === 1;
			const { innerStart, outerStart, innerEnd, outerEnd } = this.zones[zone];
			const straightStart = isZone1 ? innerStart.x : innerStart.x;
			const distanceToStart = Math.abs(startPoint.x - straightStart);

			if (distanceInPixels > distanceToStart) {
				const remainingDistance = distanceInPixels - distanceToStart;
				const centerPoint = isZone1
					? {
							x: this.zones[4].centerOuter.x,
							y: (this.zones[4].centerInner.y + this.zones[4].centerOuter.y) / 2
						}
					: {
							x: this.zones[2].centerOuter.x,
							y: (this.zones[2].centerInner.y + this.zones[2].centerOuter.y) / 2
						};

				const turnEnd = isZone1 ? this.zones[4].innerEnd : this.zones[2].innerEnd;
				const turnEndOuter = isZone1 ? this.zones[4].outerEnd : this.zones[2].outerEnd;

				const radius = Math.hypot(
					turnEnd.x - centerPoint.x,
					(turnEnd.y + turnEndOuter.y) / 2 - centerPoint.y
				);

				const angleChange = remainingDistance / radius;
				const startAngle = Math.atan2(
					(turnEnd.y + turnEndOuter.y) / 2 - centerPoint.y,
					turnEnd.x - centerPoint.x
				);
				const newAngle = startAngle + angleChange;

				return {
					x: centerPoint.x + radius * Math.cos(newAngle),
					y: centerPoint.y + radius * Math.sin(newAngle)
				};
			}

			const midY = isZone1
				? (innerStart.y + outerStart.y) / 2 +
					((innerEnd.y + outerEnd.y) / 2 - (innerStart.y + outerStart.y) / 2) *
						((startPoint.x - innerStart.x) / (innerEnd.x - innerStart.x))
				: (innerStart.y + outerStart.y) / 2 +
					((innerEnd.y + outerEnd.y) / 2 - (innerStart.y + outerStart.y) / 2) *
						((startPoint.x - innerStart.x) / (innerEnd.x - innerStart.x));

			const newX = isZone1 ? startPoint.x + distanceInPixels : startPoint.x - distanceInPixels;

			return { x: newX, y: midY };
		}

		// Handle turns (zones 2 and 4)
		const centerPoint = zone === 2 ? this.zones[2].centerOuter : this.zones[4].centerOuter;

		const startPointOnMidtrack = {
			x: (startPoint.innerPoint.x + startPoint.outerPoint.x) / 2,
			y: (startPoint.innerPoint.y + startPoint.outerPoint.y) / 2
		};

		const radius = Math.hypot(
			startPointOnMidtrack.x - centerPoint.x,
			startPointOnMidtrack.y - centerPoint.y
		);

		const currentAngle = Math.atan2(
			startPointOnMidtrack.y - centerPoint.y,
			startPointOnMidtrack.x - centerPoint.x
		);

		const prevZone = zone === 2 ? 1 : 3;
		const turnStart = this.zones[prevZone].innerEnd;
		const turnStartAngle = Math.atan2(turnStart.y - centerPoint.y, turnStart.x - centerPoint.x);

		const angleDiff = zone === 2 ? currentAngle - turnStartAngle : turnStartAngle - currentAngle;
		const distanceToTurnStart = Math.abs(angleDiff * radius);

		if (distanceToTurnStart < distanceInPixels) {
			// Project on the previous straight
			const remainingDistance = distanceInPixels - distanceToTurnStart;
			const straightZone = this.zones[prevZone];
			const midY = (straightZone.innerEnd.y + straightZone.outerEnd.y) / 2;
			const newX =
				zone === 2
					? straightZone.innerEnd.x + remainingDistance
					: straightZone.innerEnd.x - remainingDistance;

			return { x: newX, y: midY };
		}

		const angleChange = distanceInPixels / radius;
		const newAngle = currentAngle + angleChange;

		return {
			x: centerPoint.x + radius * Math.cos(newAngle),
			y: centerPoint.y + radius * Math.sin(newAngle)
		};
	}

	getPointAheadOnMidtrack(startPoint: Player, distanceInMeters: number): Point {
		const distanceInPixels = distanceInMeters * this.PIXELS_PER_METER;
		const zone = this.determineZone(startPoint.x, startPoint.y);

		if (zone === 1 || zone === 3) {
			const isZone1 = zone === 1;
			const { innerStart, outerStart, innerEnd, outerEnd } = this.zones[zone];
			const straightEnd = isZone1 ? innerEnd.x : innerEnd.x;
			const distanceToEnd = Math.abs(straightEnd - startPoint.x);

			if (distanceInPixels > distanceToEnd) {
				const remainingDistance = distanceInPixels - distanceToEnd;
				const centerPoint = isZone1
					? {
							x: this.zones[2].centerOuter.x,
							y: (this.zones[2].centerInner.y + this.zones[2].centerOuter.y) / 2
						}
					: {
							x: this.zones[4].centerOuter.x,
							y: (this.zones[4].centerInner.y + this.zones[4].centerOuter.y) / 2
						};

				const radius = Math.hypot(
					straightEnd - centerPoint.x,
					((isZone1 ? innerEnd.y : innerEnd.y) + (isZone1 ? outerEnd.y : outerEnd.y)) / 2 -
						centerPoint.y
				);

				const angleChange = remainingDistance / radius;
				const startAngle = isZone1 ? -Math.PI / 2 : Math.PI / 2;
				const newAngle = startAngle - angleChange;

				return {
					x: centerPoint.x + radius * Math.cos(newAngle),
					y: centerPoint.y + radius * Math.sin(newAngle)
				};
			}

			const midY = isZone1
				? (innerStart.y + outerStart.y) / 2 +
					((innerEnd.y + outerEnd.y) / 2 - (innerStart.y + outerStart.y) / 2) *
						((startPoint.x - innerStart.x) / (innerEnd.x - innerStart.x))
				: (innerStart.y + outerStart.y) / 2 +
					((innerEnd.y + outerEnd.y) / 2 - (innerStart.y + outerStart.y) / 2) *
						((startPoint.x - innerStart.x) / (innerEnd.x - innerStart.x));

			const newX = isZone1 ? startPoint.x - distanceInPixels : startPoint.x + distanceInPixels;

			return { x: newX, y: midY };
		}

		// Handle turns (zones 2 and 4)
		const centerPoint = zone === 2 ? this.zones[2].centerOuter : this.zones[4].centerOuter;

		// Calculate midpoint between inner and outer points as the true starting point
		const startPointOnMidtrack = {
			x: (startPoint.innerPoint.x + startPoint.outerPoint.x) / 2,
			y: (startPoint.innerPoint.y + startPoint.outerPoint.y) / 2
		};

		const radius = Math.hypot(
			startPointOnMidtrack.x - centerPoint.x,
			startPointOnMidtrack.y - centerPoint.y
		);

		const currentAngle = Math.atan2(
			startPointOnMidtrack.y - centerPoint.y,
			startPointOnMidtrack.x - centerPoint.x
		);

		// Calculate angular distance to turn end
		const nextZone = zone === 2 ? 3 : 1;
		const turnEnd = this.zones[nextZone].innerStart;
		const turnEndAngle = Math.atan2(turnEnd.y - centerPoint.y, turnEnd.x - centerPoint.x);

		// Calculate distance to turn end along arc
		const angleDiff = zone === 2 ? turnEndAngle - currentAngle : currentAngle - turnEndAngle;
		const distanceToTurnEnd = Math.abs(angleDiff * radius);

		// If distance to end is greater than requested distance, stay in turn
		if (distanceToTurnEnd >= distanceInPixels) {
			const angleChange = distanceInPixels / radius;
			const newAngle = currentAngle - angleChange;

			return {
				x: centerPoint.x + radius * Math.cos(newAngle),
				y: centerPoint.y + radius * Math.sin(newAngle)
			};
		}

		// Project remaining distance into next straight
		const remainingDistance = distanceInPixels - distanceToTurnEnd;
		const straightZone = this.zones[nextZone];
		const midY = (straightZone.innerStart.y + straightZone.outerStart.y) / 2;
		const newX =
			zone === 2
				? straightZone.innerStart.x + remainingDistance
				: straightZone.innerStart.x - remainingDistance;

		return { x: newX, y: midY };
	}

	private getZonesBetweenPoints(start: Point, end: Point): number[] {
		const zones: number[] = [];
		const startZone = this.determineZone(start.x, start.y);
		const endZone = this.determineZone(end.x, end.y);

		if (startZone === endZone) {
			zones.push(startZone);
			return zones;
		}

		let currentZone = startZone;
		zones.push(currentZone);

		while (currentZone !== endZone) {
			currentZone = currentZone === 4 ? 1 : currentZone + 1;
			zones.push(currentZone);
		}

		return zones;
	}

	private determineZone(x: number, y: number): number {
		if (this.ctx.isPointInPath(this.straight1Area, x, y)) return 1;
		if (this.ctx.isPointInPath(this.turn1Area, x, y)) return 2;
		if (this.ctx.isPointInPath(this.straight2Area, x, y)) return 3;
		if (this.ctx.isPointInPath(this.turn2Area, x, y)) return 4;
		return 0;
	}

	private createStraightSegment(
		innerStart: Point,
		outerStart: Point,
		innerEnd: Point,
		outerEnd: Point
	): Path2D {
		const path = new Path2D();
		path.moveTo(innerStart.x, innerStart.y);
		path.lineTo(innerEnd.x, innerEnd.y);
		path.lineTo(outerEnd.x, outerEnd.y);
		path.lineTo(outerStart.x, outerStart.y);
		path.closePath();
		return path;
	}

	private createTurnSegment(
		innerStart: Point,
		outerStart: Point,
		innerEnd: Point,
		outerEnd: Point,
		turnKey: TurnKey
	): Path2D {
		const path = new Path2D();
		const { centerInner, centerOuter } = this.zones[turnKey];
		const innerRadius = Math.hypot(innerStart.x - centerInner.x, innerStart.y - centerInner.y);
		const outerRadius = Math.hypot(outerStart.x - centerOuter.x, outerStart.y - centerOuter.y);

		path.moveTo(outerStart.x, outerStart.y);
		path.lineTo(innerStart.x, innerStart.y);
		path.arc(
			centerInner.x,
			centerInner.y,
			innerRadius,
			Math.atan2(innerStart.y - centerInner.y, innerStart.x - centerInner.x),
			Math.atan2(innerEnd.y - centerInner.y, innerEnd.x - centerInner.x),
			true
		);
		path.lineTo(outerEnd.x, outerEnd.y);
		path.arc(
			centerOuter.x,
			centerOuter.y,
			outerRadius,
			Math.atan2(outerEnd.y - centerOuter.y, outerEnd.x - centerOuter.x),
			Math.atan2(outerStart.y - centerOuter.y, outerStart.x - centerOuter.x),
			false
		);
		path.closePath();
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

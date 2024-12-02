import type { Point } from '../types';
import { Player } from './Player';
import type { TeamPlayer } from './TeamPlayer';

import {
	CLOCKWISE,
	COUNTER_CLOCKWISE,
	HALF_PI,
	TENFEET,
	TENFEETLINE,
	THIRTYFEET,
	TRACK_SCALE,
	TURNSEGMENT,
	TWENTYFEET
} from '$lib/constants';

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
	jammerLinePoints: Record<string, Point>;

	straight1Area: Path2D;
	straight2Area: Path2D;
	turn1Area: Path2D;
	turn2Area: Path2D;
	startZone: Path2D;
	innerTrackPath: Path2D;
	outerTrackPath: Path2D;
	trackSurface: Path2D;
	outerOfficialLanePath: Path2D;
	midTrackPath: Path2D;
	pivotLinePath: Path2D;
	jammerLinePath: Path2D;
	tenFeetLines: Path2D;

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		points: Record<string, Point>
	) {
		this.canvas = canvas;
		this.ctx = ctx;

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
		this.jammerLinePoints = this.createJammerLinePoints();

		this.straight1Area = this.createStraightPath(1);
		this.straight2Area = this.createStraightPath(3);
		this.turn1Area = this.createTurnPath(2);
		this.turn2Area = this.createTurnPath(4);
		this.startZone = this.createStartZonePath();
		this.innerTrackPath = this.createInnerTrackPath();
		this.outerTrackPath = this.createOuterTrackPath();
		this.trackSurface = this.createTrackSurfacePath();
		this.outerOfficialLanePath = this.createOuterOfficialLanePath();
		this.midTrackPath = this.createMidTrackPath();
		this.pivotLinePath = this.createPivotLinePath();
		this.jammerLinePath = this.createJammerLinePath();
		this.tenFeetLines = this.create10FeetLines();
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
			-HALF_PI,
			HALF_PI,
			CLOCKWISE
		);
		path.lineTo(zones[3].innerEnd.x, zones[3].innerEnd.y);
		path.arc(
			zones[4].centerInner.x,
			zones[4].centerInner.y,
			Math.abs(zones[4].innerEnd.y - zones[4].centerInner.y),
			HALF_PI,
			-HALF_PI,
			CLOCKWISE
		);
		path.closePath();

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
			-HALF_PI,
			HALF_PI,
			CLOCKWISE
		);
		path.lineTo(zones[3].outerEnd.x, zones[3].outerEnd.y);
		path.arc(
			zones[4].centerOuter.x,
			zones[4].centerOuter.y,
			Math.abs(zones[4].outerStart.y - zones[4].centerOuter.y),
			HALF_PI,
			-HALF_PI,
			CLOCKWISE
		);
		path.closePath();

		return path;
	}

	createTrackSurfacePath(): Path2D {
		const trackSurface = new Path2D();
		trackSurface.addPath(this.outerTrackPath);
		trackSurface.addPath(this.innerTrackPath);
		return trackSurface;
	}

	createOuterOfficialLanePath(): Path2D {
		const path = new Path2D();
		const zones = this.zones;
		const officialLaneDistance = TENFEET;

		// Calculate angle for straight 1
		const angle1 = Math.atan2(
			zones[1].outerEnd.y - zones[1].outerStart.y,
			zones[1].outerEnd.x - zones[1].outerStart.x
		);

		// Calculate parallel offset points for zone 1
		const start1X = zones[1].outerStart.x - officialLaneDistance * Math.sin(angle1);
		const start1Y = zones[1].outerStart.y + officialLaneDistance * Math.cos(angle1);
		const end1X = zones[1].outerEnd.x - officialLaneDistance * Math.sin(angle1);
		const end1Y = zones[1].outerEnd.y + officialLaneDistance * Math.cos(angle1);

		path.moveTo(start1X, start1Y);
		path.lineTo(end1X, end1Y);
		path.arc(
			zones[2].centerOuter.x,
			zones[2].centerOuter.y,
			Math.abs(zones[2].outerStart.y - zones[2].centerOuter.y) + officialLaneDistance,
			-HALF_PI,
			HALF_PI,
			CLOCKWISE
		);
		path.lineTo(zones[3].outerEnd.x, zones[3].outerEnd.y + officialLaneDistance);
		path.arc(
			zones[4].centerOuter.x,
			zones[4].centerOuter.y,
			Math.abs(zones[4].outerStart.y - zones[4].centerOuter.y) + officialLaneDistance,
			HALF_PI,
			-HALF_PI,
			CLOCKWISE
		);
		path.lineTo(start1X, start1Y);

		return path;
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
		const midRadiusTop = (Math.abs(p.C.y - p.A.y) + Math.abs(p.I.y - p.G.y)) / 2;
		const midRadiusBottom = (Math.abs(p.D.y - p.A.y) + Math.abs(p.J.y - p.G.y)) / 2;

		path.moveTo(p.C.x, midYStartTop);
		path.lineTo(p.E.x, midYEndTop);
		path.arc(p.H.x, (p.B.y + p.H.y) / 2, midRadiusBottom, -HALF_PI, HALF_PI, CLOCKWISE);
		path.lineTo(p.D.x, midYStartBottom);
		path.arc(p.G.x, (p.G.y + p.A.y) / 2, midRadiusTop, HALF_PI, -HALF_PI, CLOCKWISE);

		return path;
	}

	createStartZonePath(): Path2D {
		const path = new Path2D();
		const p = this.points;
		const { innerPoint: jammerInner, outerPoint: jammerOuter } = this.jammerLinePoints;

		// Create path from jammer line to pivot line
		path.moveTo(jammerInner.x, jammerInner.y);
		path.lineTo(jammerOuter.x, jammerOuter.y);
		path.lineTo(p.K.x, p.K.y);
		path.lineTo(p.E.x, p.E.y);
		path.closePath();

		return path;
	}

	createJammerStartZone(): Path2D {
		// Get jammer line points
		const { innerPoint: jammerInner, outerPoint: jammerOuter } = this.jammerLinePoints;

		// Calculate points 3 meters behind jammer line
		const backDistance = 3 * TRACK_SCALE;
		const angle =
			Math.atan2(jammerOuter.y - jammerInner.y, jammerOuter.x - jammerInner.x) + Math.PI / 2;

		const backInner = {
			x: jammerInner.x + backDistance * Math.cos(angle),
			y: jammerInner.y + backDistance * Math.sin(angle)
		};

		const backOuter = {
			x: jammerOuter.x + backDistance * Math.cos(angle),
			y: jammerOuter.y + backDistance * Math.sin(angle)
		};

		// Create jammer start zone path
		const jammerStartZone = new Path2D();
		jammerStartZone.moveTo(jammerInner.x, jammerInner.y);
		jammerStartZone.lineTo(jammerOuter.x, jammerOuter.y);
		jammerStartZone.lineTo(backOuter.x, backOuter.y);
		jammerStartZone.lineTo(backInner.x, backInner.y);
		jammerStartZone.closePath();

		return jammerStartZone;
	}

	createJammerLinePath(): Path2D {
		const path = new Path2D();
		const { innerPoint, outerPoint } = this.jammerLinePoints;

		// Draw the full jammer line from inner to outer track
		path.moveTo(innerPoint.x, innerPoint.y);
		path.lineTo(outerPoint.x, outerPoint.y);

		return path;
	}

	createJammerLinePoints(): { innerPoint: Point; outerPoint: Point } {
		const p = this.points;

		// Create a dummy player at the pivot line
		const dummyPlayer = {
			x: p.K.x,
			y: (p.K.y + p.E.y) / 2,
			innerPoint: { x: 0, y: 0 },
			outerPoint: { x: 0, y: 0 }
		} as Player;

		// Move dummy player thirty feet forward
		dummyPlayer.x = p.K.x + THIRTYFEET;
		this.updatePlayerCoordinates(dummyPlayer);

		return {
			innerPoint: { x: dummyPlayer.innerPoint.x, y: dummyPlayer.innerPoint.y },
			outerPoint: { x: dummyPlayer.outerPoint.x, y: dummyPlayer.outerPoint.y }
		};
	}

	createPivotLinePath(): Path2D {
		const path = new Path2D();
		const p = this.points;

		path.moveTo(p.K.x, p.K.y);
		path.lineTo(p.E.x, p.E.y);

		return path;
	}

	create10FeetLines(): Path2D {
		const path = new Path2D();

		path.addPath(this.drawStraight1TenFeetLines());
		path.addPath(this.drawStraight2TenFeetLines());
		path.addPath(this.drawTurn1TenFeetLines());
		path.addPath(this.drawTurn2TenFeetLines());

		return path;
	}

	drawStraight2TenFeetLines(): Path2D {
		const path = new Path2D();
		const p = this.points;

		// Create a dummy player to use updatePlayerCoordinates
		const dummyPlayer = {
			x: p.D.x,
			y: (p.D.y + p.J.y) / 2,
			innerPoint: { x: 0, y: 0 },
			outerPoint: { x: 0, y: 0 }
		} as Player;

		[0, TENFEET, TWENTYFEET, THIRTYFEET].forEach((distance) => {
			dummyPlayer.x = p.D.x - distance;
			this.updatePlayerCoordinates(dummyPlayer);

			// Calculate the midpoint between inner and outer points
			const midX = (dummyPlayer.innerPoint.x + dummyPlayer.outerPoint.x) / 2;
			const midY = (dummyPlayer.innerPoint.y + dummyPlayer.outerPoint.y) / 2;

			// Calculate the angle of the perpendicular line
			const angle = Math.atan2(
				dummyPlayer.outerPoint.y - dummyPlayer.innerPoint.y,
				dummyPlayer.outerPoint.x - dummyPlayer.innerPoint.x
			);

			// Draw line centered on midpoint
			path.moveTo(midX - TENFEETLINE * Math.cos(angle), midY - TENFEETLINE * Math.sin(angle));
			path.lineTo(midX + TENFEETLINE * Math.cos(angle), midY + TENFEETLINE * Math.sin(angle));
		});

		return path;
	}

	drawStraight1TenFeetLines(): Path2D {
		const path = new Path2D();
		const p = this.points;

		// Create a dummy player to use updatePlayerCoordinates
		const dummyPlayer = {
			x: p.E.x,
			y: (p.E.y + p.K.y) / 2,
			innerPoint: { x: 0, y: 0 },
			outerPoint: { x: 0, y: 0 }
		} as Player;

		[TENFEET, TWENTYFEET].forEach((distance) => {
			dummyPlayer.x = p.E.x + distance;
			this.updatePlayerCoordinates(dummyPlayer);

			// Calculate the midpoint between inner and outer points
			const midX = (dummyPlayer.innerPoint.x + dummyPlayer.outerPoint.x) / 2;
			const midY = (dummyPlayer.innerPoint.y + dummyPlayer.outerPoint.y) / 2;

			// Calculate the angle of the perpendicular line
			const angle = Math.atan2(
				dummyPlayer.outerPoint.y - dummyPlayer.innerPoint.y,
				dummyPlayer.outerPoint.x - dummyPlayer.innerPoint.x
			);

			// Draw line centered on midpoint
			path.moveTo(midX - TENFEETLINE * Math.cos(angle), midY - TENFEETLINE * Math.sin(angle));
			path.lineTo(midX + TENFEETLINE * Math.cos(angle), midY + TENFEETLINE * Math.sin(angle));
		});

		return path;
	}

	drawTurn1TenFeetLines(): Path2D {
		const path = new Path2D();
		const p = this.points;

		// Calculate and draw E1 through E5 points and their circles
		const radiusEF = Math.hypot(p.E.x - p.B.x, p.E.y - p.B.y);
		let currentAngle = Math.atan2(p.E.y - p.B.y, p.E.x - p.B.x);

		const points = [];
		for (let i = 1; i <= 5; i++) {
			const point = {
				x: p.B.x + radiusEF * Math.cos(currentAngle - TURNSEGMENT / radiusEF),
				y: p.B.y + radiusEF * Math.sin(currentAngle - TURNSEGMENT / radiusEF)
			};
			points.push(point);

			// Create dummy player at current point to find midtrack intersection
			const dummyPlayer = {
				x: point.x,
				y: point.y,
				innerPoint: { x: 0, y: 0 },
				outerPoint: { x: 0, y: 0 }
			} as Player;
			this.updatePlayerCoordinates(dummyPlayer);

			// Calculate midtrack intersection point
			const midX = (dummyPlayer.innerPoint.x + dummyPlayer.outerPoint.x) / 2;
			const midY = (dummyPlayer.innerPoint.y + dummyPlayer.outerPoint.y) / 2;

			// Draw segment of lineLength from midtrack point
			const angle = Math.atan2(
				dummyPlayer.outerPoint.y - dummyPlayer.innerPoint.y,
				dummyPlayer.outerPoint.x - dummyPlayer.innerPoint.x
			);
			path.moveTo(midX - TENFEETLINE * Math.cos(angle), midY - TENFEETLINE * Math.sin(angle));
			path.lineTo(midX + TENFEETLINE * Math.cos(angle), midY + TENFEETLINE * Math.sin(angle));

			currentAngle = Math.atan2(point.y - p.B.y, point.x - p.B.x);
		}
		// TODO according to the track guide, the final segment will measure slightly more than 2.15 meters
		// Since there is nor precise indication, I have not implemented it
		// Source: https://static.wftda.com/resources/wftda-regulation-track-layout-guide.pdf
		return path;
	}

	drawTurn2TenFeetLines(): Path2D {
		const path = new Path2D();
		const p = this.points;

		// Calculate and draw E1 through E5 points and their circles
		const radiusDC = Math.hypot(p.D.x - p.A.x, p.D.y - p.A.y);
		let currentAngle = Math.atan2(p.D.y - p.A.y, p.D.x - p.A.x);

		const points = [];
		for (let i = 1; i <= 5; i++) {
			const point = {
				x: p.A.x + radiusDC * Math.cos(currentAngle - TURNSEGMENT / radiusDC),
				y: p.A.y + radiusDC * Math.sin(currentAngle - TURNSEGMENT / radiusDC)
			};
			points.push(point);

			// Create dummy player at current point to find midtrack intersection
			const dummyPlayer = {
				x: point.x,
				y: point.y,
				innerPoint: { x: 0, y: 0 },
				outerPoint: { x: 0, y: 0 }
			} as Player;
			this.updatePlayerCoordinates(dummyPlayer);

			// Calculate midtrack intersection point
			const midX = (dummyPlayer.innerPoint.x + dummyPlayer.outerPoint.x) / 2;
			const midY = (dummyPlayer.innerPoint.y + dummyPlayer.outerPoint.y) / 2;

			// Draw segment of lineLength from midtrack point
			const angle = Math.atan2(
				dummyPlayer.outerPoint.y - dummyPlayer.innerPoint.y,
				dummyPlayer.outerPoint.x - dummyPlayer.innerPoint.x
			);
			path.moveTo(midX - TENFEETLINE * Math.cos(angle), midY - TENFEETLINE * Math.sin(angle));
			path.lineTo(midX + TENFEETLINE * Math.cos(angle), midY + TENFEETLINE * Math.sin(angle));

			currentAngle = Math.atan2(point.y - p.A.y, point.x - p.A.x);
		}
		// TODO according to the track guide, the final segment will measure slightly more than 2.15 meters
		// Since there is nor precise indication, I have not implemented it
		// Source: https://static.wftda.com/resources/wftda-regulation-track-layout-guide.pdf
		return path;
	}

	isPlayerInBounds(player: TeamPlayer): boolean {
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

	updatePlayerZone(player: TeamPlayer): void {
		player.zone = this.determineZone(player.x, player.y);
	}

	createPackZonePath(rearmost: TeamPlayer, foremost: TeamPlayer): Path2D {
		const zoneSequence = this.determineZoneSequence(
			{ x: rearmost.x, y: rearmost.y },
			{ x: foremost.x, y: foremost.y }
		);
		return this.createZonePath(rearmost, foremost, zoneSequence);
	}

	createEngagementZonePath(rearmost: TeamPlayer, foremost: TeamPlayer): Path2D {
		const points = this.calculateEngagementZonePoints(rearmost, foremost);
		const zoneSequence = this.determineZoneSequence(points.backward, points.forward);
		return this.createZonePath(
			this.createDummyPlayer(points.backward),
			this.createDummyPlayer(points.forward),
			zoneSequence
		);
	}

	private createZonePath(start: TeamPlayer, end: TeamPlayer, zones: number[]): Path2D {
		const path = new Path2D();

		zones.forEach((zone, index) => {
			const isFirstZone = index === 0;
			const isLastZone = index === zones.length - 1;
			const zoneKey = zone % 2 === 1 ? (zone as StraightKey) : (zone as TurnKey);

			const startPoints = isFirstZone
				? { inner: start.innerPoint, outer: start.outerPoint }
				: { inner: this.zones[zoneKey].innerStart, outer: this.zones[zoneKey].outerStart };

			const endPoints = isLastZone
				? { inner: end.innerPoint, outer: end.outerPoint }
				: { inner: this.zones[zoneKey].innerEnd, outer: this.zones[zoneKey].outerEnd };

			const zonePath =
				zone % 2 === 1
					? this.createStraightSegment(
							startPoints.inner,
							startPoints.outer,
							endPoints.inner,
							endPoints.outer
						)
					: this.createTurnSegment(
							startPoints.inner,
							startPoints.outer,
							endPoints.inner,
							endPoints.outer,
							zone as TurnKey
						);

			path.addPath(zonePath);
		});

		return path;
	}

	private determineZoneSequence(startPoint: Point, endPoint: Point): number[] {
		const startZone = this.determineZone(startPoint.x, startPoint.y);
		const endZone = this.determineZone(endPoint.x, endPoint.y);

		// Early return if invalid zones
		if (startZone === 0 || endZone === 0) {
			return [];
		}

		const zones = new Set<number>();
		let currentZone = startZone;
		let iterations = 0;
		const MAX_ITERATIONS = 4;

		while (currentZone !== endZone && iterations < MAX_ITERATIONS) {
			zones.add(currentZone);
			currentZone = (currentZone % 4) + 1;
			iterations++;
		}
		zones.add(endZone);

		return Array.from(zones);
	}

	private calculateEngagementZonePoints(rearmost: TeamPlayer, foremost: TeamPlayer) {
		return {
			forward: this.getPointAheadOnMidtrack(foremost),
			backward: this.getPointBehindOnMidtrack(rearmost)
		};
	}

	getPointBehindOnMidtrack(startPoint: TeamPlayer): Point {
		const zone = this.determineZone(startPoint.x, startPoint.y);

		if (zone === 1 || zone === 3) {
			const isZone1 = zone === 1;
			const { innerStart, outerStart, innerEnd, outerEnd } = this.zones[zone];
			const straightStart = isZone1 ? innerStart.x : innerStart.x;
			const distanceToStart = Math.abs(startPoint.x - straightStart);

			if (TWENTYFEET > distanceToStart) {
				const remainingDistance = TWENTYFEET - distanceToStart;
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

			const newX = isZone1 ? startPoint.x + TWENTYFEET : startPoint.x - TWENTYFEET;

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

		if (distanceToTurnStart < TWENTYFEET) {
			// Project on the previous straight
			const remainingDistance = TWENTYFEET - distanceToTurnStart;
			const straightZone = this.zones[prevZone];
			const midY = (straightZone.innerEnd.y + straightZone.outerEnd.y) / 2;
			const newX =
				zone === 2
					? straightZone.innerEnd.x + remainingDistance
					: straightZone.innerEnd.x - remainingDistance;

			return { x: newX, y: midY };
		}

		const angleChange = TWENTYFEET / radius;
		const newAngle = currentAngle + angleChange;

		return {
			x: centerPoint.x + radius * Math.cos(newAngle),
			y: centerPoint.y + radius * Math.sin(newAngle)
		};
	}

	getPointAheadOnMidtrack(startPoint: TeamPlayer): Point {
		const zone = this.determineZone(startPoint.x, startPoint.y);

		if (zone === 1 || zone === 3) {
			const isZone1 = zone === 1;
			const { innerStart, outerStart, innerEnd, outerEnd } = this.zones[zone];
			const straightEnd = isZone1 ? innerEnd.x : innerEnd.x;
			const distanceToEnd = Math.abs(straightEnd - startPoint.x);

			if (TWENTYFEET > distanceToEnd) {
				const remainingDistance = TWENTYFEET - distanceToEnd;
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
				const startAngle = isZone1 ? -HALF_PI : HALF_PI;
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

			const newX = isZone1 ? startPoint.x - TWENTYFEET : startPoint.x + TWENTYFEET;

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
		if (distanceToTurnEnd >= TWENTYFEET) {
			const angleChange = TWENTYFEET / radius;
			const newAngle = currentAngle - angleChange;

			return {
				x: centerPoint.x + radius * Math.cos(newAngle),
				y: centerPoint.y + radius * Math.sin(newAngle)
			};
		}

		// Project remaining distance into next straight
		const remainingDistance = TWENTYFEET - distanceToTurnEnd;
		const straightZone = this.zones[nextZone];
		const midY = (straightZone.innerStart.y + straightZone.outerStart.y) / 2;
		const newX =
			zone === 2
				? straightZone.innerStart.x + remainingDistance
				: straightZone.innerStart.x - remainingDistance;

		return { x: newX, y: midY };
	}

	private createDummyPlayer(point: Point): TeamPlayer {
		const dummy = {
			x: point.x,
			y: point.y,
			innerPoint: { x: 0, y: 0 },
			outerPoint: { x: 0, y: 0 }
		} as TeamPlayer;
		this.updatePlayerCoordinates(dummy);
		return dummy;
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
			CLOCKWISE
		);
		path.lineTo(outerEnd.x, outerEnd.y);
		path.arc(
			centerOuter.x,
			centerOuter.y,
			outerRadius,
			Math.atan2(outerEnd.y - centerOuter.y, outerEnd.x - centerOuter.x),
			Math.atan2(outerStart.y - centerOuter.y, outerStart.x - centerOuter.x),
			COUNTER_CLOCKWISE
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

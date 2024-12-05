import Konva from 'konva';
import {
	LINE_WIDTH,
	TENFEET,
	TENFEETLINE,
	TEN_FEET_LINE_WIDTH,
	THIRTYFEET,
	TURNSEGMENT,
	TWENTYFEET,
	colors
} from '../constants';
import type { Point } from '$lib/types';

type Zone = {
	innerStart: Point;
	outerStart: Point;
	innerEnd: Point;
	outerEnd: Point;
};

enum ZoneType {
	STRAIGHT = 'straight',
	TURN = 'turn'
}

type Turn = Zone & {
	type: ZoneType.TURN;
	centerInner: Point;
	centerOuter: Point;
};

type Straight = Zone & {
	type: ZoneType.STRAIGHT;
};

type ZoneKey = 1 | 2 | 3 | 4;
type TurnKey = 2 | 4;
type StraightKey = 1 | 3;

type Zones = {
	1: Straight;
	2: Turn;
	3: Straight;
	4: Turn;
};

export class KonvaTrackGeometry {
	private zones: Zones;
	private trackLinesGroup: Konva.Group;
	private trackZoneGroup: Konva.Group;
	private zonesGroup: Konva.Group;
	private straight1Shape: Konva.Path;
	private straight2Shape: Konva.Path;
	private turn1Shape: Konva.Path;
	private turn2Shape: Konva.Path;

	constructor(points: Record<string, Point>) {
		this.zones = {
			1: {
				type: ZoneType.STRAIGHT,
				innerStart: { x: points.C.x, y: points.C.y },
				outerStart: { x: points.I.x, y: points.I.y },
				innerEnd: { x: points.E.x, y: points.E.y },
				outerEnd: { x: points.K.x, y: points.K.y }
			},
			2: {
				type: ZoneType.TURN,
				innerStart: { x: points.E.x, y: points.E.y },
				outerStart: { x: points.K.x, y: points.K.y },
				innerEnd: { x: points.F.x, y: points.F.y },
				outerEnd: { x: points.L.x, y: points.L.y },
				centerInner: { x: points.B.x, y: points.B.y },
				centerOuter: { x: points.H.x, y: points.H.y }
			},
			3: {
				type: ZoneType.STRAIGHT,
				innerStart: { x: points.F.x, y: points.F.y },
				outerStart: { x: points.L.x, y: points.L.y },
				innerEnd: { x: points.D.x, y: points.D.y },
				outerEnd: { x: points.J.x, y: points.J.y }
			},
			4: {
				type: ZoneType.TURN,
				innerStart: { x: points.D.x, y: points.D.y },
				outerStart: { x: points.J.x, y: points.J.y },
				innerEnd: { x: points.C.x, y: points.C.y },
				outerEnd: { x: points.I.x, y: points.I.y },
				centerInner: { x: points.A.x, y: points.A.y },
				centerOuter: { x: points.G.x, y: points.G.y }
			}
		};

		this.zonesGroup = new Konva.Group();

		// First create and add zone paths
		// Needed because paths need to be on the stage to do hit detection
		this.straight1Shape = this.createStraightPath(1);
		this.straight2Shape = this.createStraightPath(3);
		this.turn1Shape = this.createTurnPath(2);
		this.turn2Shape = this.createTurnPath(4);
		this.zonesGroup.add(this.straight1Shape);
		this.zonesGroup.add(this.straight2Shape);
		this.zonesGroup.add(this.turn1Shape);
		this.zonesGroup.add(this.turn2Shape);

		this.trackLinesGroup = new Konva.Group();

		// Create all surface that can be drawn
		this.trackZoneGroup = new Konva.Group();
		const trackSurface = this.createTrackSurfacePath();
		this.trackZoneGroup.add(trackSurface);

		// Now create all track paths
		const boundaries = this.createBoundariesPath();
		const pivotLine = this.createPivotLinePath();
		const jammerLine = this.createJammerLinePath();
		const straight1TenFeetLines = this.drawStraight1TenFeetLines();
		const straight2TenFeetLines = this.drawStraight2TenFeetLines();
		const turn1TenFeetLines = this.drawTurn1TenFeetLines();
		const turn2TenFeetLines = this.drawTurn2TenFeetLines();
		this.trackLinesGroup.add(boundaries);
		this.trackLinesGroup.add(pivotLine);
		this.trackLinesGroup.add(straight1TenFeetLines);
		this.trackLinesGroup.add(straight2TenFeetLines);
		this.trackLinesGroup.add(turn1TenFeetLines);
		this.trackLinesGroup.add(turn2TenFeetLines);
		this.trackLinesGroup.add(jammerLine);

		// this.drawPoints(points);
	}

	addToLayer(layer: Konva.Layer) {
		layer.add(this.trackZoneGroup);
		layer.add(this.trackLinesGroup);
	}
	private drawPoints(points: Record<string, Point>) {
		Object.entries(points).forEach(([label, point]) => {
			// Point marker
			const circle = new Konva.Circle({
				x: point.x,
				y: point.y,
				radius: 5,
				fill: 'red',
				stroke: 'black',
				strokeWidth: 1
			});

			// Point label
			const text = new Konva.Text({
				x: point.x + 10,
				y: point.y + 10,
				text: label,
				fontSize: 16,
				fill: 'black'
			});

			this.trackLinesGroup.add(circle);
			this.trackLinesGroup.add(text);
		});
	}

	// private drawJammerLinePoint() {
	// 	const point = this.createJammerLinePoint();
	// 	// Point marker
	// 	const circle = new Konva.Circle({
	// 		x: point.x,
	// 		y: point.y,
	// 		radius: 5,
	// 		fill: 'red',
	// 		stroke: 'black',
	// 		strokeWidth: 1
	// 	});

	// 	// Point label
	// 	const text = new Konva.Text({
	// 		x: point.x + 10,
	// 		y: point.y + 10,
	// 		text: 'JLP',
	// 		fontSize: 16,
	// 		fill: 'black'
	// 	});

	// 	this.trackLinesGroup.add(circle);
	// 	this.trackLinesGroup.add(text);
	// }

	createStraightPath(straightKey: StraightKey): Konva.Path {
		const zone = this.zones[straightKey];
		return new Konva.Path({
			data: `
            M ${zone.innerStart.x} ${zone.innerStart.y}
            L ${zone.innerEnd.x} ${zone.innerEnd.y}
            L ${zone.outerEnd.x} ${zone.outerEnd.y}
            L ${zone.outerStart.x} ${zone.outerStart.y}
            Z
        `,
			fill: colors.trackSurface,
			listening: false,
			visible: false
		});
	}

	createTurnPath(turnKey: TurnKey): Konva.Path {
		const turn = this.zones[turnKey];
		const innerRadius = Math.hypot(
			turn.innerStart.x - turn.centerInner.x,
			turn.innerStart.y - turn.centerInner.y
		);
		const outerRadius = Math.hypot(
			turn.outerStart.x - turn.centerOuter.x,
			turn.outerStart.y - turn.centerOuter.y
		);

		return new Konva.Path({
			data: `
            M ${turn.outerStart.x} ${turn.outerStart.y}
            L ${turn.innerStart.x} ${turn.innerStart.y}
            A ${innerRadius} ${innerRadius} 0 0 0 ${turn.innerEnd.x} ${turn.innerEnd.y}
            L ${turn.outerEnd.x} ${turn.outerEnd.y}
            A ${outerRadius} ${outerRadius} 0 0 1 ${turn.outerStart.x} ${turn.outerStart.y}
            Z
        `,
			fill: colors.trackSurface,
			listening: false,
			visible: false
		});
	}

	private createOuterTrackPath(): Konva.Path {
		const zones = this.zones;
		const radius = Math.abs(zones[2].outerStart.y - zones[2].centerOuter.y);

		return new Konva.Path({
			data: `
            M ${zones[1].outerStart.x} ${zones[1].outerStart.y}
            L ${zones[1].outerEnd.x} ${zones[1].outerEnd.y}
            A ${radius} ${radius} 0 0 0 ${zones[2].outerEnd.x} ${zones[2].outerEnd.y}
            L ${zones[3].outerEnd.x} ${zones[3].outerEnd.y}
            A ${radius} ${radius} 0 0 0 ${zones[4].outerEnd.x} ${zones[4].outerEnd.y}
            Z
        `,
			listening: false
		});
	}

	private createInnerTrackPath(): Konva.Path {
		const zones = this.zones;
		const innerRadius = Math.abs(zones[2].innerStart.y - zones[2].centerInner.y);

		return new Konva.Path({
			data: `
            M ${zones[1].innerStart.x} ${zones[1].innerStart.y}
            L ${zones[1].innerEnd.x} ${zones[1].innerEnd.y}
            A ${innerRadius} ${innerRadius} 0 0 0 ${zones[2].innerEnd.x} ${zones[2].innerEnd.y}
            L ${zones[3].innerEnd.x} ${zones[3].innerEnd.y}
            A ${innerRadius} ${innerRadius} 0 0 0 ${zones[4].innerEnd.x} ${zones[4].innerEnd.y}
        `,
			listening: false
		});
	}

	private createTrackSurfacePath(): Konva.Path {
		return new Konva.Path({
			data: this.createOuterTrackPath().data() + ' ' + this.createInnerTrackPath().data(),
			fill: colors.trackSurface,
			fillRule: 'evenodd',
			listening: false
		});
	}

	private createPivotLinePath(): Konva.Path {
		const zone = this.zones[1];
		return new Konva.Path({
			data: `M ${zone.outerEnd.x} ${zone.outerEnd.y} L ${zone.innerEnd.x} ${zone.innerEnd.y}`,
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});
	}

	private createJammerLinePoint(): Point {
		const zone = this.zones[1];
		const midW = {
			x: (zone.outerEnd.x + zone.innerEnd.x) / 2,
			y: (zone.outerEnd.y + zone.innerEnd.y) / 2
		};
		const midX = {
			x: (zone.outerStart.x + zone.innerStart.x) / 2,
			y: (zone.outerStart.y + zone.innerStart.y) / 2
		};
		const directionWX = Math.atan2(midX.y - midW.y, midX.x - midW.x);
		const x = midW.x + THIRTYFEET * Math.cos(directionWX);
		const y = midW.y + THIRTYFEET * Math.sin(directionWX);
		return { x, y };
	}

	private createJammerLinePath(): Konva.Path {
		const zone = this.zones[1];
		const midW = {
			x: (zone.outerEnd.x + zone.innerEnd.x) / 2,
			y: (zone.outerEnd.y + zone.innerEnd.y) / 2
		};
		const midX = {
			x: (zone.outerStart.x + zone.innerStart.x) / 2,
			y: (zone.outerStart.y + zone.innerStart.y) / 2
		};
		const directionWX = Math.atan2(midX.y - midW.y, midX.x - midW.x);
		const x = midW.x + THIRTYFEET * Math.cos(directionWX);
		const y = midW.y + THIRTYFEET * Math.sin(directionWX);
		const { innerProjection, outerProjection } = this.projectPointToBoundaries({ x, y }, 1);

		return new Konva.Path({
			data: `M ${innerProjection.x} ${innerProjection.y} L ${outerProjection.x} ${outerProjection.y}`,
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});
	}

	private createBoundariesPath(): Konva.Path {
		return new Konva.Path({
			data: this.createOuterTrackPath().data() + ' ' + this.createInnerTrackPath().data(),
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});
	}

	private drawStraight1TenFeetLines(): Konva.Path {
		const zone = this.zones[1];
		const distances = [TENFEET, TWENTYFEET];
		let pathData = '';

		const midW = {
			x: (zone.outerEnd.x + zone.innerEnd.x) / 2,
			y: (zone.outerEnd.y + zone.innerEnd.y) / 2
		};
		const midX = {
			x: (zone.outerStart.x + zone.innerStart.x) / 2,
			y: (zone.outerStart.y + zone.innerStart.y) / 2
		};
		const directionWX = Math.atan2(midX.y - midW.y, midX.x - midW.x);
		const angleEC = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		distances.forEach((distance) => {
			const x = midW.x + distance * Math.cos(directionWX);
			const y = midW.y + distance * Math.sin(directionWX);
			pathData += `M ${x - TENFEETLINE * Math.sin(angleEC)} ${y + TENFEETLINE * Math.cos(angleEC)}`;
			pathData += `L ${x + TENFEETLINE * Math.sin(angleEC)} ${y - TENFEETLINE * Math.cos(angleEC)}`;
		});

		return new Konva.Path({
			data: pathData,
			stroke: colors.tenFeetLines,
			strokeWidth: TEN_FEET_LINE_WIDTH,
			listening: false
		});
	}

	private drawStraight2TenFeetLines(): Konva.Path {
		const zone = this.zones[3];
		let pathData = '';

		const midZ = {
			x: (zone.innerEnd.x + zone.outerEnd.x) / 2,
			y: (zone.innerEnd.y + zone.outerEnd.y) / 2
		};
		const midY = {
			x: (zone.innerStart.x + zone.outerStart.x) / 2,
			y: (zone.innerStart.y + zone.outerStart.y) / 2
		};
		const directionZY = Math.atan2(midY.y - midZ.y, midY.x - midZ.x);
		const angleDF = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		[0, TENFEET, TWENTYFEET, THIRTYFEET].forEach((distance) => {
			const x = midZ.x + distance * Math.cos(directionZY);
			const y = midZ.y + distance * Math.sin(directionZY);
			pathData += `M ${x - TENFEETLINE * Math.sin(angleDF)} ${y + TENFEETLINE * Math.cos(angleDF)}`;
			pathData += `L ${x + TENFEETLINE * Math.sin(angleDF)} ${y - TENFEETLINE * Math.cos(angleDF)}`;
		});

		return new Konva.Path({
			data: pathData,
			stroke: colors.tenFeetLines,
			strokeWidth: TEN_FEET_LINE_WIDTH,
			listening: false
		});
	}

	private drawTurn1TenFeetLines(): Konva.Path {
		const zone = this.zones[2];
		const radiusInner = Math.hypot(
			zone.innerStart.x - zone.centerInner.x,
			zone.innerStart.y - zone.centerInner.y
		);

		let currentAngle = Math.atan2(
			zone.innerStart.y - zone.centerInner.y,
			zone.innerStart.x - zone.centerInner.x
		);

		const pathSegments = [];

		for (let i = 1; i <= 5; i++) {
			const angleChange = TURNSEGMENT / radiusInner;
			const point = {
				x: zone.centerInner.x + radiusInner * Math.cos(currentAngle - angleChange),
				y: zone.centerInner.y + radiusInner * Math.sin(currentAngle - angleChange)
			};

			const { innerProjection, outerProjection } = this.projectPointToBoundaries(point, 2);
			const midX = (innerProjection.x + outerProjection.x) / 2;
			const midY = (innerProjection.y + outerProjection.y) / 2;
			const angle = Math.atan2(
				outerProjection.y - innerProjection.y,
				outerProjection.x - innerProjection.x
			);

			pathSegments.push(`
            M ${midX - TENFEETLINE * Math.cos(angle)} ${midY - TENFEETLINE * Math.sin(angle)}
            L ${midX + TENFEETLINE * Math.cos(angle)} ${midY + TENFEETLINE * Math.sin(angle)}
        `);

			currentAngle -= angleChange;
		}

		return new Konva.Path({
			data: pathSegments.join(' '),
			stroke: colors.tenFeetLines,
			strokeWidth: TEN_FEET_LINE_WIDTH,
			listening: false
		});
	}

	private drawTurn2TenFeetLines(): Konva.Path {
		const zone = this.zones[4];
		const radiusDC = Math.hypot(
			zone.innerStart.x - zone.centerInner.x,
			zone.innerStart.y - zone.centerInner.y
		);

		let currentAngle = Math.atan2(
			zone.innerStart.y - zone.centerInner.y,
			zone.innerStart.x - zone.centerInner.x
		);

		const pathSegments = [];

		for (let i = 1; i <= 5; i++) {
			const point = {
				x: zone.centerInner.x + radiusDC * Math.cos(currentAngle - TURNSEGMENT / radiusDC),
				y: zone.centerInner.y + radiusDC * Math.sin(currentAngle - TURNSEGMENT / radiusDC)
			};

			const { innerProjection, outerProjection } = this.projectPointToBoundaries(point, 4);
			const midX = (innerProjection.x + outerProjection.x) / 2;
			const midY = (innerProjection.y + outerProjection.y) / 2;
			const angle = Math.atan2(
				outerProjection.y - innerProjection.y,
				outerProjection.x - innerProjection.x
			);

			pathSegments.push(`
            M ${midX - TENFEETLINE * Math.cos(angle)} ${midY - TENFEETLINE * Math.sin(angle)}
            L ${midX + TENFEETLINE * Math.cos(angle)} ${midY + TENFEETLINE * Math.sin(angle)}
        `);

			currentAngle -= TURNSEGMENT / radiusDC;
		}

		return new Konva.Path({
			data: pathSegments.join(' '),
			stroke: colors.tenFeetLines,
			strokeWidth: TEN_FEET_LINE_WIDTH,
			listening: false
		});
	}

	projectPointToBoundaries(
		point: Point,
		zone: ZoneKey
	): { innerProjection: Point; outerProjection: Point } {
		// Use existing turn projection for zones 2 and 4
		if (zone === 2 || zone === 4) {
			return this.projectPointToBoundariesInTurn(point, zone);
		}

		// Use existing straight projection for zones 1 and 3
		return this.projectPointToBoundariesInStraight(point, zone);
	}

	private projectPointToBoundariesInStraight(
		point: Point,
		straightKey: StraightKey
	): {
		innerProjection: Point;
		outerProjection: Point;
	} {
		const zone = this.zones[straightKey];

		// Calculate angle perpendicular to inner track line
		const angleInner = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		// Define perpendicular line through our point
		const perpendicularPoint = {
			x: point.x - 100 * Math.sin(angleInner),
			y: point.y + 100 * Math.cos(angleInner)
		};

		// Common variables for intersection
		const x1 = point.x;
		const y1 = point.y;
		const x2 = perpendicularPoint.x;
		const y2 = perpendicularPoint.y;

		// Inner track intersection
		const innerX3 = zone.innerEnd.x;
		const innerY3 = zone.innerEnd.y;
		const innerX4 = zone.innerStart.x;
		const innerY4 = zone.innerStart.y;

		// Outer track intersection
		const outerX3 = zone.outerEnd.x;
		const outerY3 = zone.outerEnd.y;
		const outerX4 = zone.outerStart.x;
		const outerY4 = zone.outerStart.y;

		const innerDenominator = (x1 - x2) * (innerY3 - innerY4) - (y1 - y2) * (innerX3 - innerX4);
		const outerDenominator = (x1 - x2) * (outerY3 - outerY4) - (y1 - y2) * (outerX3 - outerX4);

		const innerT =
			((x1 - innerX3) * (innerY3 - innerY4) - (y1 - innerY3) * (innerX3 - innerX4)) /
			innerDenominator;
		const outerT =
			((x1 - outerX3) * (outerY3 - outerY4) - (y1 - outerY3) * (outerX3 - outerX4)) /
			outerDenominator;

		return {
			innerProjection: {
				x: x1 + innerT * (x2 - x1),
				y: y1 + innerT * (y2 - y1)
			},
			outerProjection: {
				x: x1 + outerT * (x2 - x1),
				y: y1 + outerT * (y2 - y1)
			}
		};
	}

	private projectPointToBoundariesInTurn(
		point: Point,
		turnKey: TurnKey
	): { innerProjection: Point; outerProjection: Point } {
		const zone = this.zones[turnKey];

		// Calculate angle from point to both centers
		const angleToInnerCenter = Math.atan2(
			point.y - zone.centerInner.y,
			point.x - zone.centerInner.x
		);

		const angleToOuterCenter = Math.atan2(
			point.y - zone.centerOuter.y,
			point.x - zone.centerOuter.x
		);

		// Calculate radii
		const innerRadius = Math.hypot(
			zone.innerStart.x - zone.centerInner.x,
			zone.innerStart.y - zone.centerInner.y
		);

		const outerRadius = Math.hypot(
			zone.outerStart.x - zone.centerOuter.x,
			zone.outerStart.y - zone.centerOuter.y
		);

		// Project points onto the arcs
		return {
			innerProjection: {
				x: zone.centerInner.x + innerRadius * Math.cos(angleToInnerCenter),
				y: zone.centerInner.y + innerRadius * Math.sin(angleToInnerCenter)
			},
			outerProjection: {
				x: zone.centerOuter.x + outerRadius * Math.cos(angleToOuterCenter),
				y: zone.centerOuter.y + outerRadius * Math.sin(angleToOuterCenter)
			}
		};
	}

	private determineZone(point: Point): ZoneKey | 0 {
		if (this.straight1Shape.intersects({ x: point.x, y: point.y })) {
			console.log('straight1');
			return 1;
		}
		if (this.turn1Shape.intersects({ x: point.x, y: point.y })) {
			console.log('turn1');
			return 2;
		}
		if (this.straight2Shape.intersects({ x: point.x, y: point.y })) {
			console.log('straight2');
			return 3;
		}
		if (this.turn2Shape.intersects({ x: point.x, y: point.y })) {
			console.log('turn2');
			return 4;
		}
		console.log('no zone');
		return 0;
	}
}

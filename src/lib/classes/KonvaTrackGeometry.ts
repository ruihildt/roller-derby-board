import Konva from 'konva';
import {
	LINE_WIDTH,
	TENFEET,
	TENFEETLINE,
	THIRTYFEET,
	TRACK_SCALE,
	TWENTYFEET,
	colors
} from '../constants';
import type { Point } from '$lib/types';

interface Zone {
	innerStart: Point;
	outerStart: Point;
	innerEnd: Point;
	outerEnd: Point;
	centerInner?: Point;
	centerOuter?: Point;
}

interface Zones {
	[key: number]: Zone;
}

export class KonvaTrackGeometry {
	private trackGroup: Konva.Group;
	private zones: Zones;

	constructor(points: Record<string, Point>) {
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

		this.trackGroup = new Konva.Group();

		// Track surface and boundaries
		const trackSurface = new Konva.Path({
			data: this.createTrackSurfacePath(points),
			fill: colors.trackSurface,
			fillRule: 'evenodd',
			listening: false
		});

		const boundaries = new Konva.Path({
			data: this.createBoundariesPath(points),
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});

		const tenFeetLines = new Konva.Path({
			data: this.drawStraight1TenFeetLines() + ' ' + this.drawStraight2TenFeetLines(),
			stroke: colors.tenFeetLines,
			strokeWidth: TRACK_SCALE / 14,
			listening: false
		});

		// Pivot and Jammer lines
		const pivotLine = new Konva.Path({
			data: this.createPivotLinePath(points),
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});

		// Jammer line
		const jammerLine = new Konva.Path({
			data: this.createJammerLinePath(),
			stroke: colors.trackBoundaries,
			strokeWidth: LINE_WIDTH,
			listening: false
		});

		// Add all elements to track group
		this.trackGroup.add(trackSurface);
		this.trackGroup.add(boundaries);
		this.trackGroup.add(pivotLine);
		this.trackGroup.add(tenFeetLines);
		this.trackGroup.add(jammerLine);
		this.drawPoints(points);
	}

	addToLayer(layer: Konva.Layer) {
		layer.add(this.trackGroup);
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

			this.trackGroup.add(circle);
			this.trackGroup.add(text);
		});
	}

	private createOuterTrackPath(points: Record<string, Point>): string {
		const radius = Math.abs(points.K.y - points.H.y);

		let path = `M ${points.I.x} ${points.I.y}`;
		path += `L ${points.K.x} ${points.K.y}`;
		path += `A ${radius} ${radius} 0 0 0 ${points.L.x} ${points.L.y}`;
		path += `L ${points.J.x} ${points.J.y}`;
		path += `A ${radius} ${radius} 0 0 0 ${points.I.x} ${points.I.y}`;

		return path;
	}

	private createInnerTrackPath(points: Record<string, Point>): string {
		const innerRadius = Math.abs(points.E.y - points.B.y);

		let path = `M ${points.C.x} ${points.C.y}`;
		path += `L ${points.E.x} ${points.E.y}`;
		path += `A ${innerRadius} ${innerRadius} 0 0 0 ${points.F.x} ${points.F.y}`;
		path += `L ${points.D.x} ${points.D.y}`;
		path += `A ${innerRadius} ${innerRadius} 0 0 0 ${points.C.x} ${points.C.y}`;

		return path;
	}

	private createTrackSurfacePath(points: Record<string, Point>): string {
		return this.createOuterTrackPath(points) + ' ' + this.createInnerTrackPath(points);
	}

	private createPivotLinePath(points: Record<string, Point>): string {
		return `M ${points.K.x} ${points.K.y} L ${points.E.x} ${points.E.y}`;
	}

	private createJammerLinePath(): string {
		const zone = this.zones[1];

		// Calculate midpoint W between K and E
		const midW = {
			x: (zone.outerEnd.x + zone.innerEnd.x) / 2,
			y: (zone.outerEnd.y + zone.innerEnd.y) / 2
		};

		// Calculate midpoint X between I and C
		const midX = {
			x: (zone.outerStart.x + zone.innerStart.x) / 2,
			y: (zone.outerStart.y + zone.innerStart.y) / 2
		};

		// Calculate the direction from W to X for positioning
		const directionWX = Math.atan2(midX.y - midW.y, midX.x - midW.x);

		// Calculate the position along the WX line at 30 feet
		const distance = THIRTYFEET;
		const x = midW.x + distance * Math.cos(directionWX);
		const y = midW.y + distance * Math.sin(directionWX);

		const { innerPoint, outerPoint } = this.projectPointToBoundaries({ x, y });

		// Calculate and draw the line
		let path = '';
		path += `M ${innerPoint.x} ${innerPoint.y}`;
		path += `L ${outerPoint.x} ${outerPoint.y}`;

		return path;
	}

	private createBoundariesPath(points: Record<string, Point>): string {
		return this.createOuterTrackPath(points) + ' ' + this.createInnerTrackPath(points);
	}

	private drawStraight1TenFeetLines(): string {
		const zone = this.zones[1];
		let path = '';

		// Calculate midpoint W between K and E
		const midW = {
			x: (zone.outerEnd.x + zone.innerEnd.x) / 2,
			y: (zone.outerEnd.y + zone.innerEnd.y) / 2
		};

		// Calculate midpoint X between I and C
		const midX = {
			x: (zone.outerStart.x + zone.innerStart.x) / 2,
			y: (zone.outerStart.y + zone.innerStart.y) / 2
		};

		// Calculate the direction from W to X for positioning
		const directionWX = Math.atan2(midX.y - midW.y, midX.x - midW.x);

		// Calculate the angle of the line from E to C for perpendicular orientation
		const angleEC = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		// Distances for the marks
		const distances = [TENFEET, TWENTYFEET];

		distances.forEach((distance) => {
			// Calculate the position along the WX line
			const x = midW.x + distance * Math.cos(directionWX);
			const y = midW.y + distance * Math.sin(directionWX);

			// Draw line centered on the calculated position, perpendicular to EC
			path += `M ${x - TENFEETLINE * Math.sin(angleEC)} ${y + TENFEETLINE * Math.cos(angleEC)}`;
			path += `L ${x + TENFEETLINE * Math.sin(angleEC)} ${y - TENFEETLINE * Math.cos(angleEC)}`;
		});

		return path;
	}

	private drawStraight2TenFeetLines(): string {
		const zone = this.zones[3];
		let path = '';

		// Calculate midpoint Z between D and J
		const midZ = {
			x: (zone.innerEnd.x + zone.outerEnd.x) / 2,
			y: (zone.innerEnd.y + zone.outerEnd.y) / 2
		};

		// Calculate midpoint Y between F and L
		const midY = {
			x: (zone.innerStart.x + zone.outerStart.x) / 2,
			y: (zone.innerStart.y + zone.outerStart.y) / 2
		};

		// Calculate the direction from Z to Y for positioning
		const directionZY = Math.atan2(midY.y - midZ.y, midY.x - midZ.x);

		// Calculate the angle of the line from D to F for perpendicular orientation
		const angleDF = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		// Distances for the marks
		const distances = [0, TENFEET, TWENTYFEET, THIRTYFEET];

		distances.forEach((distance) => {
			// Calculate the position along the ZY line
			const x = midZ.x + distance * Math.cos(directionZY);
			const y = midZ.y + distance * Math.sin(directionZY);

			// Draw line centered on the calculated position, perpendicular to DF
			path += `M ${x - TENFEETLINE * Math.sin(angleDF)} ${y + TENFEETLINE * Math.cos(angleDF)}`;
			path += `L ${x + TENFEETLINE * Math.sin(angleDF)} ${y - TENFEETLINE * Math.cos(angleDF)}`;
		});

		return path;
	}

	private projectPointToBoundaries(point: Point): {
		innerPoint: Point;
		outerPoint: Point;
	} {
		const zone = this.zones[1];

		// Calculate angle perpendicular to EC
		const angleEC = Math.atan2(
			zone.innerStart.y - zone.innerEnd.y,
			zone.innerStart.x - zone.innerEnd.x
		);

		// Define perpendicular line through our point
		const perpendicularPoint = {
			x: point.x - 100 * Math.sin(angleEC),
			y: point.y + 100 * Math.cos(angleEC)
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

		const innerDenominator = (x1 - x2) * (innerY3 - innerY4) - (y1 - y2) * (innerX3 - innerX4);
		const innerT =
			((x1 - innerX3) * (innerY3 - innerY4) - (y1 - innerY3) * (innerX3 - innerX4)) /
			innerDenominator;

		// Outer track intersection
		const outerX3 = zone.outerEnd.x;
		const outerY3 = zone.outerEnd.y;
		const outerX4 = zone.outerStart.x;
		const outerY4 = zone.outerStart.y;

		const outerDenominator = (x1 - x2) * (outerY3 - outerY4) - (y1 - y2) * (outerX3 - outerX4);
		const outerT =
			((x1 - outerX3) * (outerY3 - outerY4) - (y1 - outerY3) * (outerX3 - outerX4)) /
			outerDenominator;

		return {
			innerPoint: {
				x: x1 + innerT * (x2 - x1),
				y: y1 + innerT * (y2 - y1)
			},
			outerPoint: {
				x: x1 + outerT * (x2 - x1),
				y: y1 + outerT * (y2 - y1)
			}
		};
	}

	private determineZone(point: Point): number {
		// For straight section 1 (zone 1)
		if (point.x >= this.zones[1].innerStart.x && point.x <= this.zones[1].innerEnd.x) {
			return 1;
		}
		// For turn 1 (zone 2)
		else if (point.x >= this.zones[2].innerStart.x) {
			return 2;
		}
		// For straight section 2 (zone 3)
		else if (point.x >= this.zones[3].innerEnd.x && point.x <= this.zones[3].innerStart.x) {
			return 3;
		}
		// For turn 2 (zone 4)
		else {
			return 4;
		}
	}
}

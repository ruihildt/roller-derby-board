import Konva from 'konva';
import { colors, LINE_WIDTH } from '$lib/constants';
import { KonvaPlayer } from './KonvaPlayer';
import type { KonvaTrackGeometry } from './KonvaTrackGeometry';

export enum TeamPlayerRole {
	jammer = 'jammer',
	blocker = 'blocker',
	pivot = 'pivot'
}

export enum TeamPlayerTeam {
	A = 'A',
	B = 'B'
}

export type TeamPlayerPosition = {
	absolute: { x: number; y: number };
	role: TeamPlayerRole;
	team: TeamPlayerTeam;
};

export class KonvaTeamPlayer extends KonvaPlayer {
	public starShape?: Konva.Star;
	public pivotStripeGroup?: Konva.Group;
	team: TeamPlayerTeam;
	role: TeamPlayerRole;
	zone: number;
	isInBounds: boolean;
	isInEngagementZone: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;

	protected get circle(): Konva.Circle {
		return this.getBaseCircle();
	}

	constructor(
		x: number,
		y: number,
		layer: Konva.Layer,
		team: TeamPlayerTeam,
		role: TeamPlayerRole,
		trackGeometry: KonvaTrackGeometry
	) {
		super(x, y, layer, trackGeometry);

		this.team = team;
		this.role = role;
		this.zone = 0;
		this.isInBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;

		const circle = this.circle;
		circle.fill(team === 'A' ? colors.teamAPrimary : colors.teamBPrimary);
		circle.stroke(colors.outOfBounds);

		if (this.role === TeamPlayerRole.jammer) {
			this.starShape = new Konva.Star({
				x,
				y,
				numPoints: 5,
				innerRadius: circle.radius() * 0.33,
				outerRadius: circle.radius() * 0.9,
				fill: team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
				listening: false
			});
			layer.add(this.starShape);
		}

		if (this.role === TeamPlayerRole.pivot) {
			this.pivotStripeGroup = new Konva.Group({
				clipFunc: (ctx) => {
					ctx.beginPath();
					ctx.arc(0, 0, circle.radius() * 0.890027, 0, Math.PI * 2);
					ctx.closePath();
				},
				x,
				y
			});

			const stripeWidth = circle.radius() * 1.8;
			const stripeHeight = circle.radius() * 0.47;
			const stripe = new Konva.Rect({
				x: -stripeWidth / 2,
				y: -stripeHeight / 2,
				width: stripeWidth,
				height: stripeHeight,
				fill: team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
				listening: false
			});

			this.pivotStripeGroup.add(stripe);
			layer.add(this.pivotStripeGroup);
		}

		this.group.on('dragmove', () => {
			const pos = this.getPosition();
			this.starShape?.position(pos);
			this.pivotStripeGroup?.position(pos);
			this.updateInBounds(trackGeometry);
		});

		this.updateInBounds(trackGeometry);
	}

	updateInBounds(trackGeometry: KonvaTrackGeometry): void {
		const pos = this.getPosition();
		const radius = this.circle.radius();
		const strokeWidth = this.circle.strokeWidth();
		const checkRadius = radius + strokeWidth - LINE_WIDTH * 0.9;

		for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
			const checkX = pos.x + checkRadius * Math.cos(angle);
			const checkY = pos.y + checkRadius * Math.sin(angle);

			const zoneKey = trackGeometry.determineZone({ x: checkX, y: checkY });
			if (zoneKey === 0) {
				this.isInBounds = false;
				this.circle.stroke(colors.outOfBounds);
				return;
			}
		}

		this.isInBounds = true;
		this.circle.stroke(colors.inBounds);
	}

	updateEngagementZoneStatus(isInEngagementZone: boolean) {
		this.isInEngagementZone = isInEngagementZone;

		if (this.isInBounds) {
			if (this.isInPack) {
				this.circle.stroke(colors.inPack);
			} else if (isInEngagementZone) {
				this.circle.stroke(colors.inEngagementZone);
			} else {
				this.circle.stroke(colors.playerDefault);
			}
		} else {
			this.circle.stroke(colors.outOfBounds);
		}
	}

	destroy() {
		super.destroy();
		this.starShape?.destroy();
		this.pivotStripeGroup?.destroy();
	}
}

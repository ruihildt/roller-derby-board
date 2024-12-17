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

/**
 * Represents a team player on the derby track with specific role and team affiliation
 * Handles team-specific visual elements and status updates
 */
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
		super(x, y, layer);

		this.team = team;
		this.role = role;
		this.zone = 0;
		this.isInBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;

		const circle = this.circle;
		circle.fill(team === TeamPlayerTeam.A ? colors.teamAPrimary : colors.teamBPrimary);
		circle.stroke(colors.outOfBounds);

		// Sets up role-specific visual elements (star for jammer, stripe for pivot)
		if (this.role === TeamPlayerRole.jammer) {
			this.setupJammerStar(x, y, layer);
		}
		if (this.role === TeamPlayerRole.pivot) {
			this.setupPivotStripe(x, y, layer);
		}

		// Sets up event handlers for player movement and updates
		this.group.on('dragmove', () => {
			const pos = this.getPosition();
			this.starShape?.position(pos);
			this.pivotStripeGroup?.position(pos);
			this.updateInBounds(trackGeometry);
		});

		this.updateInBounds(trackGeometry);
	}

	/**
	 * Creates and configures the jammer star
	 */
	private setupJammerStar(x: number, y: number, layer: Konva.Layer): void {
		this.starShape = new Konva.Star({
			x,
			y,
			numPoints: 5,
			innerRadius: this.circle.radius() * 0.33,
			outerRadius: this.circle.radius() * 0.9,
			fill: this.team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
			listening: false
		});
		layer.add(this.starShape);
	}

	/**
	 * Creates and configures the pivot stripe
	 */
	private setupPivotStripe(x: number, y: number, layer: Konva.Layer): void {
		this.pivotStripeGroup = new Konva.Group({
			clipFunc: (ctx) => {
				ctx.beginPath();
				ctx.arc(0, 0, this.circle.radius() * 0.890027, 0, Math.PI * 2);
				ctx.closePath();
			},
			x,
			y
		});

		const stripeWidth = this.circle.radius() * 1.8;
		const stripeHeight = this.circle.radius() * 0.47;
		const stripe = new Konva.Rect({
			x: -stripeWidth / 2,
			y: -stripeHeight / 2,
			width: stripeWidth,
			height: stripeHeight,
			fill: this.team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
			listening: false
		});

		this.pivotStripeGroup.add(stripe);
		layer.add(this.pivotStripeGroup);
	}

	/**
	 * Updates the player's in-bounds status and visual appearance
	 */
	protected updateInBounds(trackGeometry: KonvaTrackGeometry): void {
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

	/**
	 * Updates the player's engagement zone status and visual appearance
	 */
	protected updateEngagementZoneStatus(isInEngagementZone: boolean): void {
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

	destroy(): void {
		super.destroy();
		this.starShape?.destroy();
		this.pivotStripeGroup?.destroy();
	}
}

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
		this.trackGeometry = trackGeometry;

		this.zone = 0;
		this.isInBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;

		// Set fill and stroke colors based on team
		this.circle.fill(team === 'A' ? colors.teamAPrimary : colors.teamBPrimary);
		this.circle.stroke(colors.outOfBounds);

		// Add star for jammers
		if (this.role === TeamPlayerRole.jammer) {
			this.starShape = new Konva.Star({
				x: x,
				y: y,
				numPoints: 5,
				innerRadius: this.circle.radius() * 0.33,
				outerRadius: this.circle.radius() * 0.9,
				fill: team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
				listening: false
			});

			layer.add(this.starShape);

			this.circle.on('dragmove', () => {
				this.starShape?.position({
					x: this.circle.x(),
					y: this.circle.y()
				});
			});
		}

		// Add stripe for pivots
		if (this.role === TeamPlayerRole.pivot) {
			// Create clipping group
			this.pivotStripeGroup = new Konva.Group({
				clipFunc: (ctx) => {
					ctx.beginPath();
					ctx.arc(0, 0, this.circle.radius() * 0.890027, 0, Math.PI * 2);
					ctx.closePath();
				},
				x: x,
				y: y
			});

			// Add stripe inside group with relative positioning
			const stripeWidth = this.circle.radius() * 1.8;
			const stripeHeight = this.circle.radius() * 0.47;
			const stripe = new Konva.Rect({
				x: -stripeWidth / 2,
				y: -stripeHeight / 2,
				width: stripeWidth,
				height: stripeHeight,
				fill: team === TeamPlayerTeam.A ? colors.teamASecondary : colors.teamBSecondary,
				listening: false
			});

			// Add stripe to group and group to layer
			this.pivotStripeGroup.add(stripe);
			layer.add(this.pivotStripeGroup);

			// Update group position on drag
			this.circle.on('dragmove', () => {
				this.pivotStripeGroup?.position({
					x: this.circle.x(),
					y: this.circle.y()
				});
			});
		}
	}

	updateInBounds(trackGeometry: KonvaTrackGeometry): void {
		const playerX = this.circle.x();
		const playerY = this.circle.y();
		const radius = this.circle.radius();
		const strokeWidth = this.circle.strokeWidth();
		const checkRadius = radius + strokeWidth - LINE_WIDTH * 0.9; // Adjust here for strictness

		// Check multiple points around the circle's circumference
		for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
			const checkX = playerX + checkRadius * Math.cos(angle);
			const checkY = playerY + checkRadius * Math.sin(angle);

			const zoneKey = trackGeometry.determineZone({ x: checkX, y: checkY });
			if (zoneKey === 0) {
				this.isInBounds = false;
				this.circle.stroke(colors.outOfBounds);
				return;
			}
		}

		// If we get here, player is in bounds
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

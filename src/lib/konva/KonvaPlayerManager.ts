import Konva from 'konva';

import { KonvaTeamPlayer, TeamPlayerRole, TeamPlayerTeam } from './KonvaTeamPlayer';
import { KonvaSkatingOfficial, SkatingOfficialRole } from './KonvaSkatingOfficial';
import type { KonvaTrackGeometry, Point, Zone } from './KonvaTrackGeometry';
import { KonvaPlayer } from './KonvaPlayer';

export class KonvaPlayerManager {
	private layer: Konva.Layer;
	private trackGeometry: KonvaTrackGeometry;

	private teamPlayers: KonvaTeamPlayer[] = [];
	private skatingOfficials: KonvaSkatingOfficial[] = [];

	constructor(layer: Konva.Layer, trackGeometry: KonvaTrackGeometry) {
		this.layer = layer;
		this.trackGeometry = trackGeometry;
	}

	addTeamPlayer(x: number, y: number, team: TeamPlayerTeam, role: TeamPlayerRole) {
		const player = new KonvaTeamPlayer(x, y, this.layer, team, role, this.trackGeometry);
		this.teamPlayers.push(player);
		return player;
	}

	addSkatingOfficial(x: number, y: number, role: SkatingOfficialRole) {
		const official = new KonvaSkatingOfficial(x, y, this.layer, role, this.trackGeometry);
		this.skatingOfficials.push(official);
		return official;
	}

	getBlockers() {
		return this.teamPlayers.filter(
			(player) => player.role === TeamPlayerRole.blocker || player.role === TeamPlayerRole.pivot
		);
	}

	addInitialLineup() {
		const zone1 = this.trackGeometry.zones[1];

		// Add Team A players
		for (let i = 0; i < 3; i++) {
			const pos = this.getRandomValidPosition(zone1);
			this.addTeamPlayer(pos.x, pos.y, TeamPlayerTeam.A, TeamPlayerRole.blocker);
		}
		const pivotPosA = this.getRandomValidPosition(zone1);
		this.addTeamPlayer(pivotPosA.x, pivotPosA.y, TeamPlayerTeam.A, TeamPlayerRole.pivot);

		// Add Team B players
		for (let i = 0; i < 3; i++) {
			const pos = this.getRandomValidPosition(zone1);
			this.addTeamPlayer(pos.x, pos.y, TeamPlayerTeam.B, TeamPlayerRole.blocker);
		}
		const pivotPosB = this.getRandomValidPosition(zone1);
		this.addTeamPlayer(pivotPosB.x, pivotPosB.y, TeamPlayerTeam.B, TeamPlayerRole.pivot);

		// Zone 4 - Jammers starting positions
		const zone4 = this.trackGeometry.zones[4];
		const jammersX = (zone4.innerStart.x + zone4.outerStart.x) / 2;
		const jammersY = (zone4.innerStart.y + zone4.outerStart.y) / 2;

		this.addTeamPlayer(jammersX, jammersY, TeamPlayerTeam.A, TeamPlayerRole.jammer);
		this.addTeamPlayer(jammersX + 30, jammersY, TeamPlayerTeam.B, TeamPlayerRole.jammer);

		// Update inBounds status for all players
		this.teamPlayers.forEach((player) => {
			player.updateInBounds(this.trackGeometry);
		});
	}

	private isPositionValid(x: number, y: number): boolean {
		const minDistance = KonvaPlayer.PLAYER_RADIUS * 2.2; // Add some buffer
		return !this.teamPlayers.some((player) => {
			const dx = player.circle.x() - x;
			const dy = player.circle.y() - y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance < minDistance;
		});
	}
	private getRandomValidPosition(zone: Zone, maxAttempts: number = 50): { x: number; y: number } {
		// Add buffer for player radius and stroke width
		const buffer = KonvaPlayer.PLAYER_RADIUS + KonvaPlayer.STROKE_WIDTH;

		const minX = Math.min(zone.innerStart.x, zone.innerEnd.x) + buffer;
		const maxX = Math.max(zone.outerStart.x, zone.outerEnd.x) - buffer;
		const minY = Math.min(zone.innerStart.y, zone.outerStart.y) + buffer;
		const maxY = Math.max(zone.innerEnd.y, zone.outerEnd.y) - buffer;

		for (let i = 0; i < maxAttempts; i++) {
			const x = minX + Math.random() * (maxX - minX);
			const y = minY + Math.random() * (maxY - minY);

			if (this.isPositionValid(x, y) && this.isFullyInBounds(x, y)) {
				return { x, y };
			}
		}
		// Fallback to a safe position if no valid spot found
		return { x: minX, y: minY };
	}

	private isFullyInBounds(x: number, y: number): boolean {
		const radius = KonvaPlayer.PLAYER_RADIUS + KonvaPlayer.STROKE_WIDTH;

		// First check if center point is in start zone
		if (!this.isPointInStartZone({ x, y })) {
			return false;
		}

		// Check multiple points around the circle's circumference
		for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
			const checkX = x + radius * Math.cos(angle);
			const checkY = y + radius * Math.sin(angle);

			// Check both zone and start zone path
			if (!this.isPointInStartZone({ x: checkX, y: checkY })) {
				return false;
			}
		}
		return true;
	}

	// Add this method to KonvaTrackGeometry class
	isPointInStartZone(point: Point): boolean {
		return this.trackGeometry.isPointInPath(this.trackGeometry.startZonePath, point);
	}
}

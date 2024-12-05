import Konva from 'konva';

import { KonvaTeamPlayer, TeamPlayerRole, TeamPlayerTeam } from './KonvaTeamPlayer';
import { KonvaSkatingOfficial, SkatingOfficialRole } from './KonvaSkatingOfficial';
import type { KonvaTrackGeometry } from './KonvaTrackGeometry';

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
		const player = new KonvaTeamPlayer(x, y, this.layer, team, role);
		this.teamPlayers.push(player);
		return player;
	}

	addSkatingOfficial(x: number, y: number, role: SkatingOfficialRole) {
		const official = new KonvaSkatingOfficial(x, y, this.layer, role);
		this.skatingOfficials.push(official);
		return official;
	}

	getAllPlayers() {
		return [...this.skatingOfficials, ...this.teamPlayers];
	}

	addInitialLineup() {
		// Zone 1 - Blockers and Pivots starting positions
		const zone1 = this.trackGeometry.zones[1];
		const blockersX = (zone1.innerStart.x + zone1.outerStart.x) / 2;
		const blockersY = (zone1.innerStart.y + zone1.outerStart.y) / 2;

		// Team A Blockers in Zone 1
		this.addTeamPlayer(blockersX, blockersY, TeamPlayerTeam.A, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 30, blockersY, TeamPlayerTeam.A, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 60, blockersY, TeamPlayerTeam.A, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 90, blockersY, TeamPlayerTeam.A, TeamPlayerRole.pivot);

		// Team B Blockers in Zone 1
		this.addTeamPlayer(blockersX, blockersY + 40, TeamPlayerTeam.B, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 30, blockersY + 40, TeamPlayerTeam.B, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 60, blockersY + 40, TeamPlayerTeam.B, TeamPlayerRole.blocker);
		this.addTeamPlayer(blockersX + 90, blockersY + 40, TeamPlayerTeam.B, TeamPlayerRole.pivot);

		// Zone 4 - Jammers starting positions
		const zone4 = this.trackGeometry.zones[4];
		const jammersX = (zone4.innerStart.x + zone4.outerStart.x) / 2;
		const jammersY = (zone4.innerStart.y + zone4.outerStart.y) / 2;

		this.addTeamPlayer(jammersX, jammersY, TeamPlayerTeam.A, TeamPlayerRole.jammer);
		this.addTeamPlayer(jammersX + 30, jammersY, TeamPlayerTeam.B, TeamPlayerRole.jammer);
	}
}

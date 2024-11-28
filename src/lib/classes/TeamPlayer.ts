import { Player } from './Player';

export enum TeamPlayerRole {
	jammer = 'jammer',
	blocker = 'blocker',
	pivot = 'pivot'
}

export enum PlayerTeam {
	jammer = 'A',
	blocker = 'B'
}

export type TeamPlayerPosition = {
	position: { x: number; y: number };
	role: TeamPlayerRole;
	team: PlayerTeam;
};

export class TeamPlayer extends Player {
	team: string;
	role: TeamPlayerRole;
	zone: number;
	inBounds: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;
	isInEngagementZone: boolean;

	constructor(x: number, y: number, team: string, role: TeamPlayerRole) {
		super(x, y);
		this.team = team;
		this.role = role;
		this.zone = 0;
		this.inBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;
	}
}

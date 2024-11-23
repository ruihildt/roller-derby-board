import { Player } from './Player';

export enum PlayerRole {
	jammer = 'jammer',
	blocker = 'blocker',
	pivot = 'pivot'
}

export class TeamPlayer extends Player {
	team: string;
	role: PlayerRole;
	zone: number;
	inBounds: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;
	isInEngagementZone: boolean;

	constructor(x: number, y: number, team: string, role: PlayerRole) {
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

import { Skater } from './Skater';

export enum PlayerRole {
	jammer = 'jammer',
	blocker = 'blocker',
	pivot = 'pivot'
}

export class Player extends Skater {
	team: string;
	role: PlayerRole;
	color: string;
	zone: number;
	inBounds: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;
	isInEngagementZone: boolean;

	constructor(x: number, y: number, team: string, role: PlayerRole, radius: number) {
		super(x, y, radius);
		this.team = team;
		this.role = role;
		this.color = team === 'A' ? 'rebeccapurple' : 'yellow';
		this.zone = 0;
		this.inBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;
	}
}

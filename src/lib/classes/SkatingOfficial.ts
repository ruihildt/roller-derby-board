import { Player } from './Player';

export enum OfficialRole {
	jamRef = 'jamRef',
	backPackRef = 'backPackRef',
	frontPackRef = 'frontPackRef',
	outsidePackRef = 'outsidePackRef',
	alternate = 'alternate'
}

export class Official extends Player {
	role: OfficialRole;

	constructor(x: number, y: number, role: OfficialRole) {
		super(x, y);
		this.role = role;
	}
}

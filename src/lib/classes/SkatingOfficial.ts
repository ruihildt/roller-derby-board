import { Player } from './Player';

export enum SkatingOfficialRole {
	jamRef = 'jamRef',
	backPackRef = 'backPackRef',
	frontPackRef = 'frontPackRef',
	outsidePackRef = 'outsidePackRef',
	alternate = 'alternate'
}

export class SkatingOfficial extends Player {
	role: SkatingOfficialRole;

	constructor(x: number, y: number, role: SkatingOfficialRole) {
		super(x, y);
		this.role = role;
	}
}

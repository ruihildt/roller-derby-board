import { Skater } from './Skater';

export enum OfficialRole {
	jamRef = 'jamRef',
	backPackRef = 'backPackRef',
	frontPackRef = 'frontPackRef',
	outsidePackRef = 'outsidePackRef',
	alternate = 'alternate'
}

export class Official extends Skater {
	role: OfficialRole;

	constructor(x: number, y: number, role: OfficialRole) {
		super(x, y);
		this.role = role;
	}
}

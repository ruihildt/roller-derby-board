import Konva from 'konva';
import { colors } from '$lib/constants';

import { KonvaPlayer } from './KonvaPlayer';

export enum SkatingOfficialRole {
	jamRefA = 'jamRefA',
	jamRefB = 'jamRefB',
	backPackRef = 'backPackRef',
	frontPackRef = 'frontPackRef',
	outsidePackRef = 'outsidePackRef',
	alternate = 'alternate'
}

export class KonvaSkatingOfficial extends KonvaPlayer {
	role: SkatingOfficialRole;

	constructor(x: number, y: number, layer: Konva.Layer, role: SkatingOfficialRole) {
		super(x, y, layer);
		this.role = role;

		this.circle.fill(colors.officialPrimary);
		this.circle.stroke(colors.officialSecondary);
	}
}

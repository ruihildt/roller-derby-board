import Konva from 'konva';
import { colors } from '$lib/constants';

import { KonvaPlayer } from './KonvaPlayer';
import type { KonvaTrackGeometry } from './KonvaTrackGeometry';

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

	constructor(
		x: number,
		y: number,
		layer: Konva.Layer,
		role: SkatingOfficialRole,
		trackGeometry: KonvaTrackGeometry
	) {
		super(x, y, layer, trackGeometry);
		this.role = role;

		this.circle.fill(colors.officialPrimary);
		this.circle.stroke(colors.officialSecondary);
	}
}

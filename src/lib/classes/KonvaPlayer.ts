import Konva from 'konva';
import { TRACK_SCALE } from '$lib/constants';

export class KonvaPlayer {
	static readonly PLAYER_RADIUS = TRACK_SCALE / 2.2;
	circle: Konva.Circle;

	constructor(x: number, y: number, layer: Konva.Layer) {
		this.circle = new Konva.Circle({
			x: x,
			y: y,
			radius: KonvaPlayer.PLAYER_RADIUS,
			draggable: true
		});

		layer.add(this.circle);
		layer.batchDraw();
	}
}

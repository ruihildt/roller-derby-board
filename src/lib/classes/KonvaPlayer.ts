import Konva from 'konva';
import { TRACK_SCALE } from '$lib/constants';

export class KonvaPlayer {
	static readonly PLAYER_RADIUS = TRACK_SCALE / 2.2;
	static readonly STROKE_WIDTH = TRACK_SCALE / 10;
	circle: Konva.Circle;

	constructor(x: number, y: number, layer: Konva.Layer) {
		this.circle = new Konva.Circle({
			x: x,
			y: y,
			radius: KonvaPlayer.PLAYER_RADIUS,
			draggable: true,
			strokeWidth: KonvaPlayer.STROKE_WIDTH
		});

		this.circle.on('dragmove', () => {
			const players = layer.find('Circle') as Konva.Circle[];
			const currentPlayer = this.circle;

			players.forEach((otherPlayer) => {
				if (otherPlayer === currentPlayer) return;

				const dx = otherPlayer.x() - currentPlayer.x();
				const dy = otherPlayer.y() - currentPlayer.y();
				const distance = Math.sqrt(dx * dx + dy * dy);

				const totalRadius = KonvaPlayer.PLAYER_RADIUS * 2 + KonvaPlayer.STROKE_WIDTH;

				if (distance < totalRadius) {
					const dirX = dx / distance;
					const dirY = dy / distance;
					const pushForce = 0.1;

					otherPlayer.x(currentPlayer.x() + dirX * (totalRadius + pushForce));
					otherPlayer.y(currentPlayer.y() + dirY * (totalRadius + pushForce));

					otherPlayer.fire('dragmove');
				}
			});

			layer.batchDraw();
		});

		layer.add(this.circle);
		layer.batchDraw();
	}
}

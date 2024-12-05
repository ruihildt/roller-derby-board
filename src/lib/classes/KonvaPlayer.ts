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

		this.circle.on('dragmove', () => {
			const players = layer.find('Circle');
			const currentPlayer = this.circle;

			players.forEach((otherPlayer) => {
				if (otherPlayer === currentPlayer) return;

				const dx = otherPlayer.x() - currentPlayer.x();
				const dy = otherPlayer.y() - currentPlayer.y();
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < KonvaPlayer.PLAYER_RADIUS * 2) {
					// Using the same push force logic as PlayerManager
					const dirX = dx / distance;
					const dirY = dy / distance;
					const pushForce = 1;

					otherPlayer.x(currentPlayer.x() + dirX * (KonvaPlayer.PLAYER_RADIUS * 2 + pushForce));
					otherPlayer.y(currentPlayer.y() + dirY * (KonvaPlayer.PLAYER_RADIUS * 2 + pushForce));

					// Trigger chain reaction
					otherPlayer.fire('dragmove');
				}
			});

			layer.batchDraw();
		});

		layer.add(this.circle);
		layer.batchDraw();
	}
}

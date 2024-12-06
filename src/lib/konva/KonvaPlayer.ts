import Konva from 'konva';
import { TRACK_SCALE } from '$lib/constants';
import { KonvaTeamPlayer } from './KonvaTeamPlayer';
import { KonvaTrackGeometry } from './KonvaTrackGeometry';

export class KonvaPlayer {
	static readonly PLAYER_RADIUS = TRACK_SCALE / 2.2;
	static readonly STROKE_WIDTH = TRACK_SCALE / 10;
	protected trackGeometry: KonvaTrackGeometry;
	circle: Konva.Circle;

	constructor(x: number, y: number, layer: Konva.Layer, trackGeometry: KonvaTrackGeometry) {
		this.trackGeometry = trackGeometry;
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

			if (this instanceof KonvaTeamPlayer) {
				this.updateInBounds(this.trackGeometry);
			}

			// Draw new projections points and clear them
			layer.find('.projectionPoint').forEach((node) => node.destroy());
			this.drawProjections(this.trackGeometry, layer);

			layer.batchDraw();
		});

		layer.add(this.circle);
		layer.batchDraw();
	}

	distanceTo(other: KonvaPlayer): number {
		const dx = this.circle.x() - other.circle.x();
		const dy = this.circle.y() - other.circle.y();
		return Math.sqrt(dx * dx + dy * dy);
	}

	getNode(): Konva.Circle {
		return this.circle;
	}

	drawProjections(trackGeometry: KonvaTrackGeometry, layer: Konva.Layer) {
		const position = {
			x: this.circle.x(),
			y: this.circle.y()
		};

		const currentZone = trackGeometry.determineZone(position);

		if (currentZone !== 0) {
			const { innerProjection, outerProjection } = trackGeometry.projectPointToBoundaries(
				position,
				currentZone
			);

			// Draw inner projection point
			const innerPoint = new Konva.Circle({
				x: innerProjection.x,
				y: innerProjection.y,
				radius: 5,
				fill: 'purple',
				name: 'projectionPoint'
			});

			// Draw outer projection point
			const outerPoint = new Konva.Circle({
				x: outerProjection.x,
				y: outerProjection.y,
				radius: 5,
				fill: 'purple',
				name: 'projectionPoint'
			});

			layer.add(innerPoint);
			layer.add(outerPoint);
			layer.batchDraw();
		}
	}
}

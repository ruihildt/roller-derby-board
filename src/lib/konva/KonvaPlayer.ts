import Konva from 'konva';
import { TRACK_SCALE } from '$lib/constants';
import { KonvaTeamPlayer } from './KonvaTeamPlayer';
import { KonvaTrackGeometry } from './KonvaTrackGeometry';

interface PlayerGroupConfig {
	x: number;
	y: number;
	draggable: boolean;
	name?: string;
}

interface PlayerCircleConfig {
	x: number;
	y: number;
	radius: number;
	strokeWidth: number;
	listening: boolean;
	name: string;
}

export class KonvaPlayer {
	static readonly PLAYER_RADIUS = TRACK_SCALE / 2.4;
	static readonly STROKE_WIDTH = TRACK_SCALE / 10;
	protected trackGeometry: KonvaTrackGeometry;

	group: Konva.Group;

	constructor(x: number, y: number, layer: Konva.Layer, trackGeometry: KonvaTrackGeometry) {
		this.trackGeometry = trackGeometry;

		const groupConfig: PlayerGroupConfig = {
			x,
			y,
			draggable: true,
			name: 'playerGroup'
		};

		this.group = new Konva.Group(groupConfig);

		const circleConfig: PlayerCircleConfig = {
			x: 0,
			y: 0,
			radius: KonvaPlayer.PLAYER_RADIUS,
			strokeWidth: KonvaPlayer.STROKE_WIDTH,
			listening: true,
			name: 'baseCircle'
		};

		const circle = new Konva.Circle(circleConfig);
		this.group.add(circle);

		this.group.on('dragmove', () => {
			const players = layer
				.find('Group')
				.filter((node) => node instanceof Konva.Group) as Konva.Group[];
			const currentGroup = this.group;

			players.forEach((otherGroup) => {
				if (otherGroup === currentGroup) return;

				const dx = otherGroup.x() - currentGroup.x();
				const dy = otherGroup.y() - currentGroup.y();
				const distance = Math.sqrt(dx * dx + dy * dy);

				const totalRadius = KonvaPlayer.PLAYER_RADIUS * 2 + KonvaPlayer.STROKE_WIDTH;

				if (distance < totalRadius) {
					const dirX = dx / distance;
					const dirY = dy / distance;
					const pushForce = 0.1;

					otherGroup.x(currentGroup.x() + dirX * (totalRadius + pushForce));
					otherGroup.y(currentGroup.y() + dirY * (totalRadius + pushForce));

					otherGroup.fire('dragmove');
				}
			});

			if (this instanceof KonvaTeamPlayer) {
				this.updateInBounds(this.trackGeometry);
			}

			layer.batchDraw();
		});

		layer.add(this.group);
		layer.batchDraw();
	}

	protected getBaseCircle(): Konva.Circle {
		return this.group.findOne('.baseCircle') as Konva.Circle;
	}

	distanceTo(other: KonvaPlayer): number {
		const dx = this.group.x() - other.group.x();
		const dy = this.group.y() - other.group.y();
		return Math.sqrt(dx * dx + dy * dy);
	}

	getNode(): Konva.Group {
		return this.group;
	}

	destroy() {
		this.group.destroy();
	}
}

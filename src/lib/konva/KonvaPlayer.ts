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
	static readonly PUSH_FORCE = 0.1;

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

		this.group.on('dragmove', () => this.handleDragMove(layer));

		layer.add(this.group);
		layer.batchDraw();
	}

	protected handleDragMove(layer: Konva.Layer): void {
		this.handleCollisions(layer);

		if (this instanceof KonvaTeamPlayer) {
			this.updateInBounds(this.trackGeometry);
		}

		layer.batchDraw();
	}

	protected handleCollisions(layer: Konva.Layer): void {
		const players = this.getOtherPlayers(layer);
		players.forEach((player) => this.checkAndResolveCollision(player));
	}

	protected getOtherPlayers(layer: Konva.Layer): KonvaPlayer[] {
		return layer
			.find('Group')
			.filter((node) => node instanceof Konva.Group && node !== this.group)
			.map((group) => (group as Konva.Group).getAttr('player')) as KonvaPlayer[];
	}

	protected checkAndResolveCollision(otherPlayer: KonvaPlayer): void {
		const distance = this.distanceToPlayer(otherPlayer);
		const totalRadius = KonvaPlayer.PLAYER_RADIUS * 2 + KonvaPlayer.STROKE_WIDTH;

		if (distance < totalRadius) {
			this.pushOtherPlayer(otherPlayer, distance, totalRadius);
		}
	}

	protected pushOtherPlayer(otherPlayer: KonvaPlayer, distance: number, totalRadius: number): void {
		const dx = otherPlayer.group.x() - this.group.x();
		const dy = otherPlayer.group.y() - this.group.y();
		const dirX = dx / distance;
		const dirY = dy / distance;

		otherPlayer.group.x(this.group.x() + dirX * (totalRadius + KonvaPlayer.PUSH_FORCE));
		otherPlayer.group.y(this.group.y() + dirY * (totalRadius + KonvaPlayer.PUSH_FORCE));

		otherPlayer.group.fire('dragmove');
	}

	protected getBaseCircle(): Konva.Circle {
		return this.group.findOne('.baseCircle') as Konva.Circle;
	}

	distanceToPlayer(other: KonvaPlayer): number {
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

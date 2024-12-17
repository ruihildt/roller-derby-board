import Konva from 'konva';
import { TRACK_SCALE } from '$lib/constants';
import { type Point } from './KonvaTrackGeometry';

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

/**
 * Represents a player on the derby track using Konva
 * Handles player movement, collisions and basic visual representation
 */
export class KonvaPlayer {
	static readonly PLAYER_RADIUS = TRACK_SCALE / 2.4;
	static readonly STROKE_WIDTH = TRACK_SCALE / 10;
	static readonly PUSH_FORCE = 0.1;

	group: Konva.Group;

	/**
	 * Creates a new player instance
	 * @param x - Initial x position
	 * @param y - Initial y position
	 * @param layer - Konva layer to add the player to
	 * @param trackGeometry - Track geometry for bounds checking
	 */
	constructor(x: number, y: number, layer: Konva.Layer) {
		const groupConfig: PlayerGroupConfig = {
			x,
			y,
			draggable: true,
			name: 'playerGroup'
		};

		this.group = new Konva.Group(groupConfig);
		this.group.setAttr('player', this);

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

	/**
	 * Handles player movement and collisions during drag
	 */
	protected handleDragMove(layer: Konva.Layer): void {
		this.handleCollisions(layer);

		layer.batchDraw();
	}

	/**
	 * Processes collisions with other players
	 */
	private handleCollisions(layer: Konva.Layer): void {
		const players = this.getOtherPlayers(layer);
		players.forEach((player) => this.checkAndResolveCollision(player));
	}

	/**
	 * Retrieves all other players in the layer
	 */
	private getOtherPlayers(layer: Konva.Layer): KonvaPlayer[] {
		return layer
			.find('Group')
			.filter((node) => node instanceof Konva.Group && node !== this.group)
			.map((group) => (group as Konva.Group).getAttr('player')) as KonvaPlayer[];
	}

	private checkAndResolveCollision(otherPlayer: KonvaPlayer): void {
		const distance = this.distanceTo(otherPlayer);
		const totalRadius = KonvaPlayer.PLAYER_RADIUS * 2 + KonvaPlayer.STROKE_WIDTH;

		if (distance < totalRadius) {
			this.pushOtherPlayer(otherPlayer, distance, totalRadius);
		}
	}

	private pushOtherPlayer(otherPlayer: KonvaPlayer, distance: number, totalRadius: number): void {
		const currentPos = this.getPosition();
		const otherPos = otherPlayer.getPosition();

		const dx = otherPos.x - currentPos.x;
		const dy = otherPos.y - currentPos.y;
		const dirX = dx / distance;
		const dirY = dy / distance;

		otherPlayer.setPosition({
			x: currentPos.x + dirX * (totalRadius + KonvaPlayer.PUSH_FORCE),
			y: currentPos.y + dirY * (totalRadius + KonvaPlayer.PUSH_FORCE)
		});

		otherPlayer.group.fire('dragmove');
	}

	/**
	 * Gets the current position of the player
	 */
	getPosition(): Point {
		return {
			x: this.group.x(),
			y: this.group.y()
		};
	}

	/**
	 * Sets the player's position
	 */
	setPosition(position: Point): void {
		this.group.position(position);
	}

	/**
	 * Moves the player to a new position and handles collisions
	 */
	moveTo(position: Point): void {
		this.setPosition(position);
		const layer = this.group.getLayer();
		if (layer) {
			this.handleDragMove(layer);
		}
	}

	/**
	 * Calculates distance to another player
	 */
	distanceTo(other: KonvaPlayer): number {
		const currentPos = this.getPosition();
		const otherPos = other.getPosition();
		const dx = currentPos.x - otherPos.x;
		const dy = currentPos.y - otherPos.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Returns the base circle shape representing the player
	 * Used by child classes to access and modify the player's visual representation
	 */
	protected getBaseCircle(): Konva.Circle {
		return this.group.findOne('.baseCircle') as Konva.Circle;
	}

	/**
	 * Returns the Konva group node representing this player
	 */
	getNode(): Konva.Group {
		return this.group;
	}

	/**
	 * Removes the player from the layer and cleans up resources
	 */
	destroy() {
		this.group.destroy();
	}
}

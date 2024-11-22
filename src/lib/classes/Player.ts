export class Player {
	private static _playerRadius: number = 0;

	static setCanvasWidth(width: number) {
		this._playerRadius = Math.max(0, Math.floor(width / 70));
	}

	static get playerRadius(): number {
		return this._playerRadius;
	}

	x: number;
	y: number;
	innerPoint: { x: number; y: number };
	outerPoint: { x: number; y: number };
	radius: number;
	speed: number;
	direction: number;
	isDragging: boolean;
	dragOffsetX: number;
	dragOffsetY: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.innerPoint = { x, y };
		this.outerPoint = { x, y };
		this.radius = Player.playerRadius;
		this.speed = 0;
		this.direction = 0;
		this.isDragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
	}

	containsPoint(x: number, y: number): boolean {
		const dx = this.x - x;
		const dy = this.y - y;
		return dx * dx + dy * dy <= this.radius * this.radius;
	}

	update(): void {
		this.x += Math.cos(this.direction) * this.speed;
		this.y += Math.sin(this.direction) * this.speed;
	}
}

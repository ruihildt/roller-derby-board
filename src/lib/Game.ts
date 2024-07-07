import { Player } from '$lib/Player';
import type { Point } from '$lib/types';
import { isAngleBetween, distance } from '$lib/utils';

export class Game {
	canvas: HTMLCanvasElement;
	highResCanvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	isRecording: boolean;
	LINE_WIDTH: number;
	PIXELS_PER_METER: number;
	points: Record<string, Point>;
	players: Player[];
	selectedPlayer: Player | null;

	constructor(canvas: HTMLCanvasElement, highResCanvas: HTMLCanvasElement, isRecording: boolean) {
		this.canvas = canvas;
		this.highResCanvas = highResCanvas;
		this.ctx = canvas.getContext('2d')!;
		this.isRecording = isRecording;

		// Calculate LINE_WIDTH and PIXELS_PER_METER based on canvas width
		this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 330));
		this.PIXELS_PER_METER = Math.floor(this.canvas.width / 33);
		// Calculate player radius based on canvas width
		const playerRadius = Math.max(0, Math.floor(this.canvas.width / 70));

		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;
		const scale = this.PIXELS_PER_METER;

		this.points = {
			A: { x: centerX + 5.33 * scale, y: centerY },
			B: { x: centerX - 5.33 * scale, y: centerY },
			C: { x: centerX + 5.33 * scale, y: centerY - 3.81 * scale },
			D: { x: centerX + 5.33 * scale, y: centerY + 3.81 * scale },
			E: { x: centerX - 5.33 * scale, y: centerY - 3.81 * scale },
			F: { x: centerX - 5.33 * scale, y: centerY + 3.81 * scale },
			G: { x: centerX + 5.33 * scale, y: centerY - 0.3 * scale },
			H: { x: centerX - 5.33 * scale, y: centerY + 0.3 * scale },
			I: { x: centerX + 5.33 * scale, y: centerY - 8.38 * scale },
			J: { x: centerX + 5.33 * scale, y: centerY + 7.78 * scale },
			K: { x: centerX - 5.33 * scale, y: centerY - 7.78 * scale },
			L: { x: centerX - 5.33 * scale, y: centerY + 8.38 * scale }
		};

		this.players = [];
		this.initializePlayers(playerRadius);

		this.selectedPlayer = null;
		this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
		this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
		this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

		// this.pack = new Pack();
	}

	initializePlayers(radius: number): void {
		const { I, K, G, E } = this.points;

		// Function to get a random position within the specified area for blockers
		const getRandomBlockerPosition = () => {
			const minX = Math.min(I.x, K.x);
			const maxX = Math.max(G.x, E.x);
			const minY = Math.min(I.y, G.y);
			const maxY = Math.max(K.y, E.y);

			return {
				x: Math.random() * (maxX - minX) + minX,
				y: Math.random() * (maxY - minY) + minY
			};
		};

		// Create 4 blockers for Team A
		for (let i = 0; i < 4; i++) {
			const pos = getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'A', 'blocker', radius));
		}

		// Create 4 blockers for Team B
		for (let i = 0; i < 4; i++) {
			const pos = getRandomBlockerPosition();
			this.players.push(new Player(pos.x, pos.y, 'B', 'blocker', radius));
		}

		// Add jammers
		const jammerPosA = this.getJammerLinePosition();
		const jammerPosB = this.getJammerLinePosition();
		this.players.push(new Player(jammerPosA.x, jammerPosA.y, 'A', 'jammer', radius));
		this.players.push(new Player(jammerPosB.x, jammerPosB.y, 'B', 'jammer', radius));
	}

	getJammerLinePosition(): Point {
		const JAMMER_LINE_OFFSET = -2 * this.PIXELS_PER_METER; // 0.5 meters offset

		const { I, C } = this.points;
		// Calculate a random position along the jammer line
		const t = Math.random();

		// Calculate the direction vector of the jammer line
		const dx = C.x - I.x;
		const dy = C.y - I.y;

		// Normalize the direction vector
		const length = Math.sqrt(dx * dx + dy * dy);
		const normalizedDx = dx / length;
		const normalizedDy = dy / length;

		// Calculate the offset perpendicular to the jammer line
		const offsetX = -normalizedDy * JAMMER_LINE_OFFSET;
		const offsetY = normalizedDx * JAMMER_LINE_OFFSET;

		return {
			x: I.x + t * (C.x - I.x) + offsetX,
			y: I.y + t * (C.y - I.y) + offsetY
		};
	}

	isPlayerInBounds(player: Player): boolean {
		// Check if the player is in the turn
		if (this.isPlayerInTurn(player)) {
			return true;
		}

		// Check if the player is in the straightaway
		if (this.isPlayerInStraightaway(player)) {
			return true;
		}

		// If the player is neither in the turn nor in the straightaway, they're out of bounds
		return false;
	}

	isPlayerInTurn(player: Player): boolean {
		const { A, B, G, H, C, D, E, F, I, J, K, L } = this.points;

		// Check right turn
		const inRightTurn = this.isPlayerInSingleTurn(player, A, G, C, D, I, J);

		// Check left turn
		const inLeftTurn = this.isPlayerInSingleTurn(player, B, H, F, E, L, K);

		return inRightTurn || inLeftTurn;
	}

	isPlayerInSingleTurn(
		player: Player,
		centerInner: Point,
		centerOuter: Point,
		innerPoint1: Point,
		innerPoint2: Point,
		outerPoint1: Point,
		outerPoint2: Point
	): boolean {
		const distToInner = distance(player, centerInner);
		const distToOuter = distance(player, centerOuter);

		const innerRadius = distance(centerInner, innerPoint1);
		const outerRadius = distance(centerOuter, outerPoint1);

		if (distToInner >= innerRadius && distToOuter <= outerRadius) {
			const angleInner1 = Math.atan2(innerPoint1.y - centerInner.y, innerPoint1.x - centerInner.x);
			const angleInner2 = Math.atan2(innerPoint2.y - centerInner.y, innerPoint2.x - centerInner.x);
			const angleInnerPlayer = Math.atan2(player.y - centerInner.y, player.x - centerInner.x);

			const angleOuter1 = Math.atan2(outerPoint1.y - centerOuter.y, outerPoint1.x - centerOuter.x);
			const angleOuter2 = Math.atan2(outerPoint2.y - centerOuter.y, outerPoint2.x - centerOuter.x);
			const angleOuterPlayer = Math.atan2(player.y - centerOuter.y, player.x - centerOuter.x);

			const inInnerArc = isAngleBetween(angleInnerPlayer, angleInner1, angleInner2);
			const inOuterArc = isAngleBetween(angleOuterPlayer, angleOuter1, angleOuter2);

			return inInnerArc || inOuterArc;
		}

		return false;
	}

	isPlayerInStraightaway(player: Player): boolean {
		const { K, E, I, C, L, F, D, J } = this.points;

		// Define both quadrilaterals
		const quad1 = [K, E, C, I];
		const quad2 = [L, F, D, J];

		// Check if the player is in either quadrilateral
		return this.isPointInQuad(player, quad1) || this.isPointInQuad(player, quad2);
	}

	isPointInQuad(point: Point, quad: Array<Point>): boolean {
		let inside = false;
		for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
			const xi = quad[i].x,
				yi = quad[i].y;
			const xj = quad[j].x,
				yj = quad[j].y;

			const intersect =
				yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}
		return inside;
	}

	handleMouseDown(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		for (const player of this.players) {
			if (player.containsPoint(x, y)) {
				this.selectedPlayer = player;
				player.isDragging = true;
				player.dragOffsetX = x - player.x;
				player.dragOffsetY = y - player.y;
				break;
			}
		}
	}

	handleMouseMove(event: MouseEvent): void {
		if (this.selectedPlayer && this.selectedPlayer.isDragging) {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			this.selectedPlayer.x = x - this.selectedPlayer.dragOffsetX;
			this.selectedPlayer.y = y - this.selectedPlayer.dragOffsetY;
		}
	}

	handleMouseUp(): void {
		if (this.selectedPlayer) {
			this.selectedPlayer.isDragging = false;
			this.selectedPlayer = null;
		}
	}

	update(): void {
		for (const player of this.players) {
			player.update();
			player.inBounds = this.isPlayerInBounds(player);
		}

		if (this.selectedPlayer) {
			this.selectedPlayer.inBounds = this.isPlayerInBounds(this.selectedPlayer);
		}
		// Add more game logic here
	}

	draw(): void {
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Set background color to a lighter shade
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw the grid
		this.drawGrid(this.ctx);

		// Draw the track
		this.drawTrack(this.ctx);

		// Draw midtrack line
		this.drawMidTrackLine(this.ctx);

		// Draw players
		for (const player of this.players) {
			player.draw(this.ctx);
		}

		// this.drawPackBoundaries();
	}

	drawHighRes(): void {
		if (!this.highResCanvas) return;

		const ctx = this.highResCanvas.getContext('2d')!;
		const scale = 2; // Increase this for higher resolution

		// Set canvas size
		this.highResCanvas.width = this.canvas.width * scale;
		this.highResCanvas.height = this.canvas.height * scale;

		// Scale the context
		ctx.scale(scale, scale);

		// Clear the canvas
		ctx.clearRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);

		// Set background color
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(0, 0, this.highResCanvas.width, this.highResCanvas.height);

		// Draw the grid
		this.drawGrid(ctx);

		// Draw the track
		this.drawTrack(ctx);

		// Draw midtrack line
		this.drawMidTrackLine(ctx);

		// Draw players
		for (const player of this.players) {
			player.draw(ctx);
		}

		// Optionally, add any additional high-resolution elements here
		// For example, you could add text overlays, statistics, etc.
		ctx.fillStyle = 'black';
		ctx.font = '24px Arial';
		ctx.fillText('HD', 100, 100);
	}

	drawGrid(ctx: CanvasRenderingContext2D): void {
		const scale = this.PIXELS_PER_METER;
		const gridSize = scale; // 1 meter grid

		ctx.strokeStyle = '#ccc'; // Light gray color for the grid
		ctx.lineWidth = 0.5;

		// Draw vertical lines
		for (let x = 0; x <= this.canvas.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.canvas.height);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = 0; y <= this.canvas.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.canvas.width, y);
			ctx.stroke();
		}
	}

	drawTrack(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.lineWidth = this.LINE_WIDTH;

		// Set fill style for grey color
		ctx.fillStyle = '#D3D3D3';

		// Fill area between straight lines
		ctx.beginPath();
		ctx.moveTo(p.C.x, p.C.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.lineTo(p.K.x, p.K.y);
		ctx.lineTo(p.I.x, p.I.y);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(p.D.x, p.D.y);
		ctx.lineTo(p.F.x, p.F.y);
		ctx.lineTo(p.L.x, p.L.y);
		ctx.lineTo(p.J.x, p.J.y);
		ctx.closePath();
		ctx.fill();

		// Fill area between arcs
		ctx.beginPath();
		ctx.arc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);
		ctx.arc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), -Math.PI / 2, Math.PI / 2, false);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.arc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);
		ctx.arc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), Math.PI / 2, -Math.PI / 2, false);
		ctx.closePath();
		ctx.fill();

		// Draw inside arcs
		ctx.strokeStyle = 'blue';
		this.drawArc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true, ctx);

		// Draw inside straight lines
		ctx.strokeStyle = 'green';
		ctx.beginPath();
		ctx.moveTo(p.C.x, p.C.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.moveTo(p.D.x, p.D.y);
		ctx.lineTo(p.F.x, p.F.y);
		ctx.stroke();

		// Draw outside arcs
		ctx.strokeStyle = 'red';
		this.drawArc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), -Math.PI / 2, Math.PI / 2, true, ctx);

		// Draw outside straight lines
		ctx.strokeStyle = 'purple';
		ctx.beginPath();
		ctx.moveTo(p.I.x, p.I.y);
		ctx.lineTo(p.K.x, p.K.y);
		ctx.moveTo(p.J.x, p.J.y);
		ctx.lineTo(p.L.x, p.L.y);
		ctx.stroke();

		// Draw pivot line
		ctx.strokeStyle = 'orange';
		this.drawPivotLine(ctx);

		// Draw jammer line
		ctx.strokeStyle = 'cyan';
		this.drawJammerLine(ctx);

		// Draw points
		this.drawPoints(ctx);
	}

	drawArc(
		x: number,
		y: number,
		radius: number,
		startAngle: number,
		endAngle: number,
		clockwise: boolean,
		ctx: CanvasRenderingContext2D
	): void {
		ctx.beginPath();
		ctx.arc(x, y, radius, startAngle, endAngle, clockwise);
		ctx.stroke();
	}

	drawPivotLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.beginPath();
		ctx.moveTo(p.I.x, p.I.y);
		ctx.lineTo(p.C.x, p.C.y);
		ctx.stroke();
	}

	drawJammerLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.beginPath();
		ctx.moveTo(p.K.x, p.K.y);
		ctx.lineTo(p.E.x, p.E.y);
		ctx.stroke();
	}

	drawPoints(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.fillStyle = 'black';
		ctx.font = '12px Arial';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';

		for (const [label, point] of Object.entries(p)) {
			// Draw point
			ctx.beginPath();
			ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
			ctx.fill();

			// Draw label
			if (label === 'G' || label === 'H') {
				ctx.textAlign = 'right';
				ctx.fillText(label, point.x - 6, point.y);
			} else {
				ctx.textAlign = 'left';
				ctx.fillText(label, point.x + 6, point.y);
			}
		}
	}

	drawMidTrackLine(ctx: CanvasRenderingContext2D): void {
		const p = this.points;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 3;

		// Calculate the exact midpoints for straight sections
		const midYStartTop = (p.C.y + p.I.y) / 2;
		const midYEndTop = (p.E.y + p.K.y) / 2;
		const midYStartBottom = (p.D.y + p.J.y) / 2;
		const midYEndBottom = (p.F.y + p.L.y) / 2;

		// Draw straight sections
		ctx.beginPath();
		ctx.moveTo(p.C.x, midYStartTop);
		ctx.lineTo(p.E.x, midYEndTop);
		ctx.moveTo(p.D.x, midYStartBottom);
		ctx.lineTo(p.F.x, midYEndBottom);
		ctx.stroke();

		// Draw curved sections
		const midRadiusTop = (Math.abs(p.C.y - p.A.y) + Math.abs(p.I.y - p.G.y)) / 2;
		const midRadiusBottom = (Math.abs(p.D.y - p.A.y) + Math.abs(p.J.y - p.G.y)) / 2;

		this.drawArc(p.G.x, (p.G.y + p.A.y) / 2, midRadiusTop, Math.PI / 2, -Math.PI / 2, true, ctx);
		this.drawArc(p.H.x, (p.B.y + p.H.y) / 2, midRadiusBottom, -Math.PI / 2, Math.PI / 2, true, ctx);
	}

	// drawPackBoundaries() {
	// Visualize pack boundaries on the track
	// This is a placeholder and needs to be implemented based on how you want to represent the pack
	// }

	gameLoop(): void {
		this.update();
		this.draw();
		this.drawHighRes();
		requestAnimationFrame(() => this.gameLoop());
	}
}

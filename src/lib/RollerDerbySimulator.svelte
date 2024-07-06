<script lang="ts">
	import { onMount } from 'svelte';

	type Point = {
		x: number;
		y: number;
	};

	class Player {
		x: number;
		y: number;
		team: string;
		role: string;
		color: string;
		radius: number;
		speed: number;
		direction: number;
		inBounds: boolean;
		isDragging: boolean;
		dragOffsetX: number;
		dragOffsetY: number;

		constructor(x: number, y: number, team: string, role: string, radius: number) {
			this.x = x;
			this.y = y;
			this.team = team;
			this.role = role;
			this.color = team === 'A' ? 'red' : 'blue';
			this.radius = radius;
			this.speed = 0;
			this.direction = 0;
			this.inBounds = false;
			this.isDragging = false;
			this.dragOffsetX = 0;
			this.dragOffsetY = 0;
		}

		containsPoint(x: number, y: number): boolean {
			const dx = this.x - x;
			const dy = this.y - y;
			return dx * dx + dy * dy <= this.radius * this.radius;
		}

		draw(ctx: CanvasRenderingContext2D): void {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.strokeStyle = this.inBounds ? 'green' : 'black'; // Modify this line
			ctx.lineWidth = 2; // Add this line to make the border more visible
			ctx.stroke();

			// Draw role indicator
			ctx.fillStyle = 'white';
			ctx.font = '10px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(this.role[0].toUpperCase(), this.x, this.y);
		}

		update(): void {
			// Update player position based on speed and direction
			this.x += Math.cos(this.direction) * this.speed;
			this.y += Math.sin(this.direction) * this.speed;
		}
	}

	// class Pack {
	// 	constructor() {
	// 		this.members = [];
	// 		this.frontBoundary = 0;
	// 		this.rearBoundary = 0;
	// 	}

	// 	update(allPlayers) {
	// 		this.determinePack(allPlayers);
	// 		this.calculateBoundaries();
	// 	}

	// 	determinePack(allPlayers) {
	// 		const blockers = allPlayers.filter((player) => player.role === 'blocker');
	// 		blockers.sort((a, b) => a.trackPosition - b.trackPosition);

	// 		let largestGroup = [];
	// 		let currentGroup = [];

	// 		for (let i = 0; i < blockers.length; i++) {
	// 			if (
	// 				currentGroup.length === 0 ||
	// 				this.isInProximity(blockers[i], currentGroup[currentGroup.length - 1])
	// 			) {
	// 				currentGroup.push(blockers[i]);
	// 			} else {
	// 				if (currentGroup.length > largestGroup.length) {
	// 					largestGroup = [...currentGroup];
	// 				}
	// 				currentGroup = [blockers[i]];
	// 			}
	// 		}

	// 		if (currentGroup.length > largestGroup.length) {
	// 			largestGroup = currentGroup;
	// 		}

	// 		this.members = largestGroup;
	// 	}

	// 	isInProximity(player1, player2) {
	// 		const proximityThreshold = 30;
	// 		const distance = Math.sqrt(
	// 			Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2)
	// 		);
	// 		return distance <= proximityThreshold;
	// 	}

	// 	calculateBoundaries() {
	// 		if (this.members.length > 0) {
	// 			this.frontBoundary = Math.max(...this.members.map((p) => p.trackPosition));
	// 			this.rearBoundary = Math.min(...this.members.map((p) => p.trackPosition));
	// 		} else {
	// 			this.frontBoundary = this.rearBoundary = 0;
	// 		}
	// 	}

	// 	isInPack(player) {
	// 		return (
	// 			player.trackPosition >= this.rearBoundary && player.trackPosition <= this.frontBoundary
	// 		);
	// 	}
	// }

	class Game {
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;
		LINE_WIDTH: number;
		PIXELS_PER_METER: number;
		points: Record<string, Point>;
		players: Player[];
		selectedPlayer: Player | null;

		constructor(canvas: HTMLCanvasElement) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d')!;

			// Calculate LINE_WIDTH and PIXELS_PER_METER based on canvas width
			this.LINE_WIDTH = Math.max(1, Math.floor(this.canvas.width / 300));
			this.PIXELS_PER_METER = Math.floor(this.canvas.width / 30);
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
			const distToInner = this.distance(player, centerInner);
			const distToOuter = this.distance(player, centerOuter);

			const innerRadius = this.distance(centerInner, innerPoint1);
			const outerRadius = this.distance(centerOuter, outerPoint1);

			if (distToInner >= innerRadius && distToOuter <= outerRadius) {
				const angleInner1 = Math.atan2(
					innerPoint1.y - centerInner.y,
					innerPoint1.x - centerInner.x
				);
				const angleInner2 = Math.atan2(
					innerPoint2.y - centerInner.y,
					innerPoint2.x - centerInner.x
				);
				const angleInnerPlayer = Math.atan2(player.y - centerInner.y, player.x - centerInner.x);

				const angleOuter1 = Math.atan2(
					outerPoint1.y - centerOuter.y,
					outerPoint1.x - centerOuter.x
				);
				const angleOuter2 = Math.atan2(
					outerPoint2.y - centerOuter.y,
					outerPoint2.x - centerOuter.x
				);
				const angleOuterPlayer = Math.atan2(player.y - centerOuter.y, player.x - centerOuter.x);

				const inInnerArc = this.isAngleBetween(angleInnerPlayer, angleInner1, angleInner2);
				const inOuterArc = this.isAngleBetween(angleOuterPlayer, angleOuter1, angleOuter2);

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

		isAngleBetween(angle: number, start: number, end: number): boolean {
			const normalizeDifference = (a: number) => (a + 2 * Math.PI) % (2 * Math.PI);
			const normalizedAngle = normalizeDifference(angle - start);
			const normalizedEnd = normalizeDifference(end - start);

			return normalizedAngle <= normalizedEnd;
		}

		distance(point1: Point, point2: Point): number {
			return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
		}

		handleMouseDown(event: MouseEvent): void {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			for (let player of this.players) {
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
			for (let player of this.players) {
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
			this.drawGrid();

			// Draw the track
			this.drawTrack();

			// Draw midtrack line
			this.drawMidTrackLine();

			// Draw players
			for (let player of this.players) {
				player.draw(this.ctx);
			}

			// this.drawPackBoundaries();
		}

		drawGrid(): void {
			const ctx = this.ctx;
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

		drawTrack(): void {
			const p = this.points;
			const ctx = this.ctx;

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
			this.drawArc(p.A.x, p.A.y, Math.abs(p.C.y - p.A.y), Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(p.B.x, p.B.y, Math.abs(p.E.y - p.B.y), -Math.PI / 2, Math.PI / 2, true);

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
			this.drawArc(p.G.x, p.G.y, Math.abs(p.I.y - p.G.y), Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(p.H.x, p.H.y, Math.abs(p.K.y - p.H.y), -Math.PI / 2, Math.PI / 2, true);

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
			this.drawPivotLine();

			// Draw jammer line
			ctx.strokeStyle = 'cyan';
			this.drawJammerLine();

			// Draw points
			this.drawPoints();
		}

		drawArc(
			x: number,
			y: number,
			radius: number,
			startAngle: number,
			endAngle: number,
			clockwise: boolean
		): void {
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, startAngle, endAngle, clockwise);
			this.ctx.stroke();
		}

		drawPivotLine(): void {
			const p = this.points;
			const ctx = this.ctx;

			ctx.beginPath();
			ctx.moveTo(p.I.x, p.I.y);
			ctx.lineTo(p.C.x, p.C.y);
			ctx.stroke();
		}

		drawJammerLine(): void {
			const p = this.points;
			const ctx = this.ctx;

			ctx.beginPath();
			ctx.moveTo(p.K.x, p.K.y);
			ctx.lineTo(p.E.x, p.E.y);
			ctx.stroke();
		}

		drawPoints(): void {
			const p = this.points;
			const ctx = this.ctx;

			ctx.fillStyle = 'black';
			ctx.font = '12px Arial';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';

			for (let [label, point] of Object.entries(p)) {
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

		drawMidTrackLine(): void {
			const ctx = this.ctx;
			const scale = this.PIXELS_PER_METER;
			const p = this.points;

			// Transform points to canvas coordinates
			const transformPoint = (point: Point): Point => ({
				x: point.x * scale + this.canvas.width / 2,
				y: -point.y * scale + this.canvas.height / 2
			});

			const tp = Object.fromEntries(
				Object.entries(p).map(([key, value]) => [key, transformPoint(value)])
			);

			ctx.strokeStyle = 'pink';
			ctx.lineWidth = 3;

			// Draw straight sections
			const midYStart = (tp.C.y + tp.I.y) / 2;
			const midYEnd = (tp.E.y + tp.K.y) / 2;

			ctx.beginPath();
			ctx.moveTo(tp.C.x, midYStart);
			ctx.lineTo(tp.E.x, midYEnd);
			ctx.moveTo(tp.D.x, this.canvas.height - midYEnd);
			ctx.lineTo(tp.F.x, this.canvas.height - midYStart);
			ctx.stroke();

			// Draw curved sections
			const midRadius = Math.abs((tp.C.y + tp.I.y) / 2 - tp.A.y);

			this.drawArc(tp.G.x, (tp.G.y + tp.A.y) / 2, midRadius, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(tp.H.x, (tp.B.y + tp.H.y) / 2, midRadius, -Math.PI / 2, Math.PI / 2, true);
		}

		// drawPackBoundaries() {
		// Visualize pack boundaries on the track
		// This is a placeholder and needs to be implemented based on how you want to represent the pack
		// }

		gameLoop(): void {
			this.update();
			this.draw();
			requestAnimationFrame(() => this.gameLoop());
		}
	}

	let canvas: HTMLCanvasElement;
	let game: Game;

	onMount(() => {
		if (canvas) {
			const resizeCanvas = () => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				game = new Game(canvas);
				game.gameLoop();
			};

			window.addEventListener('resize', resizeCanvas);
			resizeCanvas();

			return () => {
				window.removeEventListener('resize', resizeCanvas);
				if (game) {
					canvas.removeEventListener('mousedown', game.handleMouseDown);
					canvas.removeEventListener('mousemove', game.handleMouseMove);
					canvas.removeEventListener('mouseup', game.handleMouseUp);
				}
			};
		}
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block; /* Removes default inline spacing */
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
	}

	/* Ensure the body and html elements don't have margins or padding */
	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>

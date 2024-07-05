<script>
	import { onMount } from 'svelte';

	// Constants for track dimensions
	const LINE_WIDTH = 3;

	const CANVAS_WIDTH = 1000;
	const CANVAS_HEIGHT = 600;
	const PIXELS_PER_METER = 30;

	// class Player {
	// 	constructor(x, y, team, role) {
	// 		this.x = x;
	// 		this.y = y;
	// 		this.vx = 0;
	// 		this.vy = 0;
	// 		this.team = team;
	// 		this.role = role;
	// 		this.angle = 0;
	// 		this.speed = 2;
	// 		this.turnSpeed = 0.1;
	// 		this.trackPosition = 0;
	// 		this.inPlay = true;
	// 	}

	// 	update() {
	// 		this.x += this.vx;
	// 		this.y += this.vy;
	// 	}

	// 	draw(ctx) {
	// 		ctx.fillStyle = this.team === 'A' ? 'red' : 'blue';
	// 		ctx.beginPath();
	// 		ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
	// 		ctx.fill();
	// 	}

	// 	moveForward() {
	// 		this.vx = Math.cos(this.angle) * this.speed;
	// 		this.vy = Math.sin(this.angle) * this.speed;
	// 	}

	// 	turn(direction) {
	// 		this.angle += direction * this.turnSpeed;
	// 	}
	// }

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
		constructor(canvas) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');

			const centerX = CANVAS_WIDTH / 2;
			const centerY = CANVAS_HEIGHT / 2;
			const scale = PIXELS_PER_METER;

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

			// this.players = [];
			// this.pack = new Pack();

			// this.initializePlayers();
		}

		// initializePlayers() {
		// 	this.players.push(new Player(100, 100, 'A', 'jammer'));
		// 	this.players.push(new Player(150, 150, 'A', 'blocker'));
		// 	this.players.push(new Player(200, 200, 'B', 'jammer'));
		// 	this.players.push(new Player(250, 250, 'B', 'blocker'));
		// }

		// update() {
		// 	for (let player of this.players) {
		// 		player.update();
		// 	}

		// 	this.pack.update(this.players);

		// 	for (let player of this.players) {
		// 		player.inPlay = this.isPlayerInPlay(player);
		// 	}

		// Check for collisions, scoring, etc.
		// }

		// isPlayerInPlay(player) {
		// 	if (player.role === 'jammer') {
		// 		return true; // Jammers are always in play
		// 	}
		// 	return (
		// 		this.pack.isInPack(player) ||
		// 		(player.trackPosition >= this.pack.rearBoundary - 20 &&
		// 			player.trackPosition <= this.pack.frontBoundary + 20)
		// 	);
		// }

		draw() {
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

			// // Draw players
			// for (let player of this.players) {
			// 	player.draw(this.ctx);
			// }

			this.drawPackBoundaries();
		}

		drawGrid() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;
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

		drawTrack() {
			const p = this.points;

			const ctx = this.ctx;
			ctx.lineWidth = LINE_WIDTH;

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
			this.drawPivotLine(p);

			// Draw jammer line
			ctx.strokeStyle = 'cyan';
			this.drawJammerLine(p);

			// Draw points
			this.drawPoints(p);
		}

		drawArc(x, y, radius, startAngle, endAngle, clockwise) {
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, startAngle, endAngle, clockwise);
			this.ctx.stroke();
		}

		drawPivotLine(p) {
			const ctx = this.ctx;
			ctx.beginPath();
			ctx.moveTo(p.I.x, p.I.y);
			ctx.lineTo(p.C.x, p.C.y);
			ctx.stroke();
		}

		drawJammerLine(p) {
			const ctx = this.ctx;
			ctx.beginPath();
			ctx.moveTo(p.K.x, p.K.y);
			ctx.lineTo(p.E.x, p.E.y);
			ctx.stroke();
		}

		drawPoints(p) {
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

		drawMidTrackLine() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;
			const p = this.points;

			// Transform points to canvas coordinates
			const transformPoint = (point) => ({
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

		drawPositionMarkers() {
			// TODO
		}

		drawPackBoundaries() {
			// Visualize pack boundaries on the track
			// This is a placeholder and needs to be implemented based on how you want to represent the pack
		}

		gameLoop() {
			// this.update();
			this.draw();
			requestAnimationFrame(() => this.gameLoop());
		}
	}

	let canvas;

	onMount(() => {
		if (canvas) {
			canvas.width = CANVAS_WIDTH;
			canvas.height = CANVAS_HEIGHT;
			const game = new Game(canvas);
			game.gameLoop();
		}
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		border: 1px solid black;
		max-width: 100%;
		height: auto;
	}
</style>

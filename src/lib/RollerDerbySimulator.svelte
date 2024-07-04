<script>
	import { onMount } from 'svelte';

	// Constants for track dimensions
	const PIXELS_PER_METER = 30; // Reduce this value to fit the track on the canvas
	const LINE_WIDTH = 2;

	class Player {
		constructor(x, y, team, role) {
			this.x = x;
			this.y = y;
			this.vx = 0;
			this.vy = 0;
			this.team = team;
			this.role = role;
			this.angle = 0;
			this.speed = 2;
			this.turnSpeed = 0.1;
			this.trackPosition = 0;
			this.inPlay = true;
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
		}

		draw(ctx) {
			ctx.fillStyle = this.team === 'A' ? 'red' : 'blue';
			ctx.beginPath();
			ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
			ctx.fill();
		}

		moveForward() {
			this.vx = Math.cos(this.angle) * this.speed;
			this.vy = Math.sin(this.angle) * this.speed;
		}

		turn(direction) {
			this.angle += direction * this.turnSpeed;
		}
	}

	class Pack {
		constructor() {
			this.members = [];
			this.frontBoundary = 0;
			this.rearBoundary = 0;
		}

		update(allPlayers) {
			this.determinePack(allPlayers);
			this.calculateBoundaries();
		}

		determinePack(allPlayers) {
			const blockers = allPlayers.filter((player) => player.role === 'blocker');
			blockers.sort((a, b) => a.trackPosition - b.trackPosition);

			let largestGroup = [];
			let currentGroup = [];

			for (let i = 0; i < blockers.length; i++) {
				if (
					currentGroup.length === 0 ||
					this.isInProximity(blockers[i], currentGroup[currentGroup.length - 1])
				) {
					currentGroup.push(blockers[i]);
				} else {
					if (currentGroup.length > largestGroup.length) {
						largestGroup = [...currentGroup];
					}
					currentGroup = [blockers[i]];
				}
			}

			if (currentGroup.length > largestGroup.length) {
				largestGroup = currentGroup;
			}

			this.members = largestGroup;
		}

		isInProximity(player1, player2) {
			const proximityThreshold = 30;
			const distance = Math.sqrt(
				Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2)
			);
			return distance <= proximityThreshold;
		}

		calculateBoundaries() {
			if (this.members.length > 0) {
				this.frontBoundary = Math.max(...this.members.map((p) => p.trackPosition));
				this.rearBoundary = Math.min(...this.members.map((p) => p.trackPosition));
			} else {
				this.frontBoundary = this.rearBoundary = 0;
			}
		}

		isInPack(player) {
			return (
				player.trackPosition >= this.rearBoundary && player.trackPosition <= this.frontBoundary
			);
		}
	}

	class Game {
		constructor(canvas) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.players = [];
			this.pack = new Pack();

			this.points = {
				A: { x: 5.33, y: 0 },
				B: { x: -5.33, y: 0 },
				C: { x: 5.33, y: 3.81 },
				D: { x: 5.33, y: -3.81 },
				E: { x: -5.33, y: 3.81 },
				F: { x: -5.33, y: -3.81 },
				G: { x: 5.33, y: 0.3 },
				H: { x: -5.33, y: -0.3 },
				I: { x: 5.33, y: 8.38 }, // 0.3 + 8.08
				J: { x: 5.33, y: -7.78 }, // 0.3 - 8.08
				K: { x: -5.33, y: 7.78 }, // -0.3 + 8.08
				L: { x: -5.33, y: -8.38 } // -0.3 - 8.08
			};

			this.initializePlayers();
		}

		initializePlayers() {
			this.players.push(new Player(100, 100, 'A', 'jammer'));
			this.players.push(new Player(150, 150, 'A', 'blocker'));
			this.players.push(new Player(200, 200, 'B', 'jammer'));
			this.players.push(new Player(250, 250, 'B', 'blocker'));
		}

		update() {
			for (let player of this.players) {
				player.update();
			}

			this.pack.update(this.players);

			for (let player of this.players) {
				player.inPlay = this.isPlayerInPlay(player);
			}

			// Check for collisions, scoring, etc.
		}

		isPlayerInPlay(player) {
			if (player.role === 'jammer') {
				return true; // Jammers are always in play
			}
			return (
				this.pack.isInPack(player) ||
				(player.trackPosition >= this.pack.rearBoundary - 20 &&
					player.trackPosition <= this.pack.frontBoundary + 20)
			);
		}

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

			// Draw players
			for (let player of this.players) {
				player.draw(this.ctx);
			}

			this.drawPackBoundaries();
		}

		drawGrid() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;
			const gridSize = 1; // 1 meter grid

			ctx.save();
			ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			ctx.scale(scale, -scale); // Flip the y-axis to match the coordinate system

			ctx.strokeStyle = '#ccc'; // Light gray color for the grid
			ctx.lineWidth = 0.5 / scale;

			// Draw vertical lines
			for (let x = -20; x <= 20; x += gridSize) {
				ctx.beginPath();
				ctx.moveTo(x, -20);
				ctx.lineTo(x, 20);
				ctx.stroke();
			}

			// Draw horizontal lines
			for (let y = -20; y <= 20; y += gridSize) {
				ctx.beginPath();
				ctx.moveTo(-20, y);
				ctx.lineTo(20, y);
				ctx.stroke();
			}

			// Draw x and y axes
			ctx.strokeStyle = '#000'; // Black color for axes
			ctx.lineWidth = 1 / scale;

			ctx.beginPath();
			ctx.moveTo(-20, 0);
			ctx.lineTo(20, 0);
			ctx.moveTo(0, -20);
			ctx.lineTo(0, 20);
			ctx.stroke();

			ctx.restore();
		}

		drawTrack() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;
			const p = this.points;

			ctx.save();
			ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			ctx.scale(scale, -scale);

			ctx.lineWidth = LINE_WIDTH / scale;

			// Draw inside arcs
			ctx.strokeStyle = 'blue';
			this.drawArc(p.A.x, p.A.y, p.C.y, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(p.B.x, p.B.y, p.E.y, -Math.PI / 2, Math.PI / 2, true);

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
			this.drawArc(p.G.x, p.G.y, p.I.y - p.G.y, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(p.H.x, p.H.y, p.K.y - p.H.y, -Math.PI / 2, Math.PI / 2, true);

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

			ctx.restore();
		}

		drawPoints() {
			const ctx = this.ctx;

			ctx.fillStyle = 'black';
			ctx.font = '0.85px Arial';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';

			for (let [label, point] of Object.entries(this.points)) {
				// Draw point
				ctx.beginPath();
				ctx.arc(point.x, point.y, 0.1, 0, Math.PI * 2);
				ctx.fill();

				// Draw label
				ctx.save();

				if (label === 'G' || label === 'H') {
					ctx.textAlign = 'right';
					ctx.translate(point.x - 0.2, point.y);
				} else {
					ctx.textAlign = 'left';
					ctx.translate(point.x + 0.2, point.y);
				}

				ctx.scale(1, -1);
				ctx.fillText(label, 0, 0);

				ctx.restore();
			}
		}

		drawArc(x, y, radius, startAngle, endAngle, clockwise) {
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, startAngle, endAngle, clockwise);
			this.ctx.stroke();
		}

		drawPivotLine() {
			const ctx = this.ctx;
			const p = this.points;
			ctx.beginPath();
			ctx.moveTo(p.I.x, p.I.y);
			ctx.lineTo(p.C.x, p.C.y);
			ctx.stroke();
		}

		drawJammerLine() {
			const ctx = this.ctx;
			const p = this.points;
			ctx.beginPath();
			ctx.moveTo(p.K.x, p.K.y);
			ctx.lineTo(p.E.x, p.E.y);
			ctx.stroke();
		}

		drawMidTrackLine() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;
			const p = this.points;

			ctx.save();
			ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			ctx.scale(scale, -scale);

			ctx.strokeStyle = 'pink';
			ctx.lineWidth = 3 / scale;

			// Draw straight sections
			const midYStart = (p.C.y + p.I.y) / 2;
			const midYEnd = (p.E.y + p.K.y) / 2;

			ctx.beginPath();
			ctx.moveTo(p.C.x, midYStart);
			ctx.lineTo(p.E.x, midYEnd);
			ctx.moveTo(p.D.x, -midYEnd);
			ctx.lineTo(p.F.x, -midYStart);
			ctx.stroke();

			// Draw curved sections
			const midRadius = (p.C.y + (p.I.y - p.G.y)) / 2;

			this.drawArc(p.G.x, (p.G.y + p.A.y) / 2, midRadius, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(p.H.x, (p.B.y + p.H.y) / 2, midRadius, -Math.PI / 2, Math.PI / 2, true);

			ctx.restore();
		}

		drawPositionMarkers() {
			// TODO
		}

		drawPackBoundaries() {
			// Visualize pack boundaries on the track
			// This is a placeholder and needs to be implemented based on how you want to represent the pack
		}

		gameLoop() {
			this.update();
			this.draw();
			requestAnimationFrame(() => this.gameLoop());
		}
	}

	let canvas;

	onMount(() => {
		if (canvas) {
			canvas.width = 1200; // Increase the width
			canvas.height = 800; // Increase the height
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

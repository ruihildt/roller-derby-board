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

			ctx.save();
			ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			ctx.scale(scale, -scale); // Flip the y-axis to match the coordinate system

			ctx.lineWidth = LINE_WIDTH / scale;

			// Draw inside arcs
			ctx.strokeStyle = 'blue';
			this.drawArc(5.33, 0, 3.81, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(-5.33, 0, 3.81, -Math.PI / 2, Math.PI / 2, true);

			// Draw inside straight lines
			ctx.strokeStyle = 'green';
			ctx.beginPath();
			ctx.moveTo(5.33, 3.81);
			ctx.lineTo(-5.33, 3.81);
			ctx.moveTo(5.33, -3.81);
			ctx.lineTo(-5.33, -3.81);
			ctx.stroke();

			// Draw outside arcs
			ctx.strokeStyle = 'red';
			this.drawArc(5.33, 0.3, 8.08, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(-5.33, -0.3, 8.08, -Math.PI / 2, Math.PI / 2, true);

			// Draw outside straight lines
			ctx.strokeStyle = 'purple';
			ctx.beginPath();
			ctx.moveTo(5.33, 0.3 + 8.08);
			ctx.lineTo(-5.33, -0.3 + 8.08);
			ctx.moveTo(5.33, 0.3 - 8.08);
			ctx.lineTo(-5.33, -0.3 - 8.08);
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
			const points = [
				{ x: 5.33, y: 0, label: 'A' },
				{ x: -5.33, y: 0, label: 'B' },
				{ x: 5.33, y: 3.81, label: 'C' },
				{ x: 5.33, y: -3.81, label: 'D' },
				{ x: -5.33, y: 3.81, label: 'E' },
				{ x: -5.33, y: -3.81, label: 'F' },
				{ x: 5.33, y: 0.3, label: 'G' },
				{ x: -5.33, y: -0.3, label: 'H' },
				{ x: 5.33, y: 0.3 + 8.08, label: 'I' },
				{ x: 5.33, y: 0.3 - 8.08, label: 'J' },
				{ x: -5.33, y: -0.3 + 8.08, label: 'K' },
				{ x: -5.33, y: -0.3 - 8.08, label: 'L' }
			];

			ctx.fillStyle = 'black';
			ctx.font = '0.85px Arial';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';

			for (let point of points) {
				// Draw point
				ctx.beginPath();
				ctx.arc(point.x, point.y, 0.1, 0, Math.PI * 2);
				ctx.fill();

				// Draw label with coordinates
				const label = `${point.label}`;

				// Save the current transformation state
				ctx.save();

				// Check if the point is G or H
				if (point.label === 'G' || point.label === 'H') {
					ctx.textAlign = 'right';
					ctx.translate(point.x - 0.2, point.y);
				} else {
					ctx.textAlign = 'left';
					ctx.translate(point.x + 0.2, point.y);
				}

				// Scale the y-axis to flip the text
				ctx.scale(1, -1);

				// Draw the text at the origin (0, 0) of the transformed context
				ctx.fillText(label, 0, 0);

				// Restore the transformation state
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
			ctx.beginPath();
			ctx.moveTo(5.33, 0.3 + 8.08);
			ctx.lineTo(5.33, 3.81);
			ctx.stroke();
		}

		drawJammerLine() {
			const ctx = this.ctx;
			ctx.beginPath();
			ctx.moveTo(-5.33, -0.3 + 8.08);
			ctx.lineTo(-5.33, 3.81);
			ctx.stroke();
		}

		drawMidTrackLine() {
			const ctx = this.ctx;
			const scale = PIXELS_PER_METER;

			ctx.save();
			ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			ctx.scale(scale, -scale); // Flip the y-axis to match the coordinate system

			ctx.strokeStyle = 'pink';
			ctx.lineWidth = 3 / scale;

			// Draw straight sections
			const innerYStart = 3.81;
			const outerYStart = 8.08 + 0.3;
			const innerYEnd = 3.81;
			const outerYEnd = 8.08 - 0.3;
			const midYStart = (innerYStart + outerYStart) / 2;
			const midYEnd = (innerYEnd + outerYEnd) / 2;

			ctx.beginPath();
			ctx.moveTo(5.33, midYStart);
			ctx.lineTo(-5.33, midYEnd);
			ctx.moveTo(5.33, -midYEnd);
			ctx.lineTo(-5.33, -midYStart);
			ctx.stroke();

			// Draw curved sections
			const innerRadius = 3.81;
			const outerRadius = 8.08;
			const midRadius = (innerRadius + outerRadius) / 2;

			this.drawArc(5.33, 0.15, midRadius, Math.PI / 2, -Math.PI / 2, true);
			this.drawArc(-5.33, -0.15, midRadius, -Math.PI / 2, Math.PI / 2, true);

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

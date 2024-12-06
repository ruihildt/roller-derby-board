import Konva from 'konva';
import { colors, TENFEET } from '$lib/constants';
import { KonvaTeamPlayer, TeamPlayerRole } from './KonvaTeamPlayer';
import { KonvaTrackGeometry, ZoneType } from './KonvaTrackGeometry';
import type { KonvaPlayerManager } from './KonvaPlayerManager';

export class KonvaPackManager {
	private engagementZoneShape: Konva.Shape;
	private backwardPoint: Konva.Circle;
	private forwardPoint: Konva.Circle;
	private zones: number[] = [];
	constructor(
		private playerManager: KonvaPlayerManager,
		private playersLayer: Konva.Layer,
		private engagementZoneLayer: Konva.Layer,
		private trackGeometry: KonvaTrackGeometry
	) {
		playersLayer.on('dragmove dragend touchmove touchend', () => {
			this.playerManager.getBlockers().forEach((player) => {
				player.updateInBounds(this.trackGeometry);
			});
			this.determinePack();
		});

		// Initialize engagement zone shape
		this.engagementZoneShape = new Konva.Shape({
			fill: colors.engagementZone,
			listening: false
		});
		this.engagementZoneLayer.add(this.engagementZoneShape);

		// Initialize debug point markers
		this.backwardPoint = new Konva.Circle({
			radius: 5,
			fill: 'red',
			listening: false
		});

		this.forwardPoint = new Konva.Circle({
			radius: 5,
			fill: 'blue',
			listening: false
		});

		this.engagementZoneLayer.add(this.backwardPoint);
		this.engagementZoneLayer.add(this.forwardPoint);
	}

	determinePack() {
		const blockers = this.playerManager.getBlockers();

		const inBoundsBlockers = blockers.filter(
			(p) => p.isInBounds && (p.role === TeamPlayerRole.blocker || p.role === TeamPlayerRole.pivot)
		);

		const groups = this.groupBlockers(inBoundsBlockers);
		const validGroups = groups.filter(this.isValidGroup);

		const maxSize = Math.max(...validGroups.map((g) => g.length), 0);
		const largestGroups = validGroups.filter((g) => g.length === maxSize);

		if (largestGroups.length === 1) {
			const packGroup = largestGroups[0];
			this.updatePackStatus(blockers, packGroup);
			this.updateRearAndForemostPlayers(packGroup);
			this.updateEngagementZone(packGroup);
		} else {
			blockers.forEach((p) => p.updatePackStatus(false));
			this.engagementZoneShape.hide();
		}

		this.engagementZoneLayer.batchDraw();
		this.playersLayer.batchDraw();
	}

	private isValidGroup(group: KonvaTeamPlayer[]): boolean {
		return group.some((p) => p.team === 'A') && group.some((p) => p.team === 'B');
	}

	private groupBlockers(blockers: KonvaTeamPlayer[]): KonvaTeamPlayer[][] {
		const groups: KonvaTeamPlayer[][] = [];
		const ungrouped = [...blockers];

		while (ungrouped.length > 0) {
			const group = [ungrouped.pop()!];
			let i = 0;
			while (i < group.length) {
				const current = group[i];
				const currentNode = current.getNode();

				for (let j = ungrouped.length - 1; j >= 0; j--) {
					const targetNode = ungrouped[j].getNode();
					const dx = currentNode.x() - targetNode.x();
					const dy = currentNode.y() - targetNode.y();
					if (Math.sqrt(dx * dx + dy * dy) <= TENFEET) {
						group.push(ungrouped.splice(j, 1)[0]);
					}
				}
				i++;
			}
			groups.push(group);
		}
		return groups;
	}

	private updatePackStatus(teamPlayers: KonvaTeamPlayer[], packGroup: KonvaTeamPlayer[]) {
		teamPlayers.forEach((player) => {
			player.updatePackStatus(packGroup.includes(player));
		});
	}

	private updateEngagementZone(packGroup: KonvaTeamPlayer[]) {
		const rearmost = packGroup.find((p) => p.isRearmost);
		const foremost = packGroup.find((p) => p.isForemost);

		if (!rearmost || !foremost) {
			this.engagementZoneShape.hide();
			this.backwardPoint.hide();
			this.forwardPoint.hide();
			return;
		}

		// Get extended engagement zone points
		const { backward, forward } = this.calculateEngagementZonePoints(rearmost, foremost);

		// Update debug point markers
		this.backwardPoint.position({
			x: backward.x,
			y: backward.y
		});
		this.forwardPoint.position({
			x: forward.x,
			y: forward.y
		});
		this.backwardPoint.show();
		this.forwardPoint.show();

		// Get extended engagement zone points
		const { backward: rearPoint, forward: forePoint } = this.calculateEngagementZonePoints(
			rearmost,
			foremost
		);

		// Update sceneFunc to use extended points instead of player positions
		this.engagementZoneShape.sceneFunc((context, shape) => {
			const rearZone = this.trackGeometry.determineZone(rearPoint);
			const foreZone = this.trackGeometry.determineZone(forePoint);

			if (!rearZone || !foreZone) return;

			// Store zones for pack definition
			this.zones = this.getZonesBetween(rearZone, foreZone);

			// Project points to track boundaries
			const rear = this.trackGeometry.projectPointToBoundaries(rearPoint, rearZone);
			const fore = this.trackGeometry.projectPointToBoundaries(forePoint, foreZone);

			// Draw the engagement zone path
			context.beginPath();
			context.moveTo(rear.innerProjection.x, rear.innerProjection.y);

			// Draw inner boundary path
			if (rearZone === foreZone) {
				const zone = this.trackGeometry.zones[rearZone as keyof typeof this.trackGeometry.zones];
				if (zone.type === ZoneType.TURN) {
					// Handle turn zone
					const innerRadius = Math.hypot(
						zone.innerStart.x - zone.centerInner.x,
						zone.innerStart.y - zone.centerInner.y
					);
					const outerRadius = Math.hypot(
						zone.outerStart.x - zone.centerOuter.x,
						zone.outerStart.y - zone.centerOuter.y
					);

					const startAngle = Math.atan2(
						rear.innerProjection.y - zone.centerInner.y,
						rear.innerProjection.x - zone.centerInner.x
					);
					const endAngle = Math.atan2(
						fore.innerProjection.y - zone.centerInner.y,
						fore.innerProjection.x - zone.centerInner.x
					);

					// Draw inner arc
					context.arc(
						zone.centerInner.x,
						zone.centerInner.y,
						innerRadius,
						startAngle,
						endAngle,
						true
					);

					// Draw to outer boundary
					context.lineTo(fore.outerProjection.x, fore.outerProjection.y);

					// Draw outer arc
					context.arc(
						zone.centerOuter.x,
						zone.centerOuter.y,
						outerRadius,
						endAngle,
						startAngle,
						false
					);
				} else {
					// Straight zone
					context.lineTo(fore.innerProjection.x, fore.innerProjection.y);
					context.lineTo(fore.outerProjection.x, fore.outerProjection.y);
					context.lineTo(rear.outerProjection.x, rear.outerProjection.y);
				}
			} else {
				// Multi-zone logic
				this.zones.forEach((zoneNumber, index) => {
					const zone =
						this.trackGeometry.zones[zoneNumber as keyof typeof this.trackGeometry.zones];
					if (zone.type === ZoneType.TURN) {
						const innerRadius = Math.hypot(
							zone.innerStart.x - zone.centerInner.x,
							zone.innerStart.y - zone.centerInner.y
						);
						const startAngle = Math.atan2(
							(index === 0 ? rear.innerProjection.y : zone.innerStart.y) - zone.centerInner.y,
							(index === 0 ? rear.innerProjection.x : zone.innerStart.x) - zone.centerInner.x
						);
						const endAngle = Math.atan2(
							(index === this.zones.length - 1 ? fore.innerProjection.y : zone.innerEnd.y) -
								zone.centerInner.y,
							(index === this.zones.length - 1 ? fore.innerProjection.x : zone.innerEnd.x) -
								zone.centerInner.x
						);
						context.arc(
							zone.centerInner.x,
							zone.centerInner.y,
							innerRadius,
							startAngle,
							endAngle,
							true
						);
					} else {
						context.lineTo(
							index === this.zones.length - 1 ? fore.innerProjection.x : zone.innerEnd.x,
							index === this.zones.length - 1 ? fore.innerProjection.y : zone.innerEnd.y
						);
					}
				});

				context.lineTo(fore.outerProjection.x, fore.outerProjection.y);

				// Draw outer boundary path in reverse
				this.zones.reverse().forEach((zoneNumber, index) => {
					const zone =
						this.trackGeometry.zones[zoneNumber as keyof typeof this.trackGeometry.zones];
					if (zone.type === ZoneType.TURN) {
						const outerRadius = Math.hypot(
							zone.outerStart.x - zone.centerOuter.x,
							zone.outerStart.y - zone.centerOuter.y
						);
						const startAngle = Math.atan2(
							(index === 0 ? fore.outerProjection.y : zone.outerEnd.y) - zone.centerOuter.y,
							(index === 0 ? fore.outerProjection.x : zone.outerEnd.x) - zone.centerOuter.x
						);
						const endAngle = Math.atan2(
							(index === this.zones.length - 1 ? rear.outerProjection.y : zone.outerStart.y) -
								zone.centerOuter.y,
							(index === this.zones.length - 1 ? rear.outerProjection.x : zone.outerStart.x) -
								zone.centerOuter.x
						);
						context.arc(
							zone.centerOuter.x,
							zone.centerOuter.y,
							outerRadius,
							startAngle,
							endAngle,
							false
						);
					} else {
						context.lineTo(
							index === this.zones.length - 1 ? rear.outerProjection.x : zone.outerStart.x,
							index === this.zones.length - 1 ? rear.outerProjection.y : zone.outerStart.y
						);
					}
				});
			}

			context.closePath();
			context.fillStrokeShape(shape);
		});

		this.engagementZoneShape.show();
		this.engagementZoneLayer.batchDraw();
	}

	private getZonesBetween(start: number, end: number): number[] {
		const zones = [1, 2, 3, 4];
		const startIdx = zones.indexOf(start);
		const endIdx = zones.indexOf(end);

		if (startIdx === endIdx) return [start];

		if (startIdx < endIdx) {
			return zones.slice(startIdx, endIdx + 1);
		} else {
			return [...zones.slice(startIdx), ...zones.slice(0, endIdx + 1)];
		}
	}

	private updateRearAndForemostPlayers(packGroup: KonvaTeamPlayer[]): void {
		// Reset all players
		packGroup.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
		});

		const packBlockers = packGroup.filter((player) => player.isInPack);
		if (packBlockers.length < 2) return;

		let zones = [
			...new Set(
				packBlockers.map((p) => {
					const point = { x: p.getNode().x(), y: p.getNode().y() };
					return this.trackGeometry.determineZone(point);
				})
			)
		];

		// Sort zones based on special cases involving zone 4
		if (zones.includes(4)) {
			if (zones.includes(1) && zones.includes(2)) {
				zones.sort();
				zones = [4, 1, 2];
			} else if (zones.includes(1) && zones.includes(3)) {
				zones = [3, 4, 1];
			} else if (zones.includes(2) && zones.includes(3)) {
				zones = [2, 3, 4];
			} else if (zones.includes(1)) {
				zones = [4, 1];
			} else if (zones.includes(3)) {
				zones = [3, 4];
			}
		} else {
			zones.sort();
		}

		this.zones = zones;

		const firstZone = zones[0];
		const lastZone = zones[zones.length - 1];

		const firstZoneBlockers = packBlockers.filter((p) => {
			const point = { x: p.getNode().x(), y: p.getNode().y() };
			return this.trackGeometry.determineZone(point) === firstZone;
		});
		const lastZoneBlockers = packBlockers.filter((p) => {
			const point = { x: p.getNode().x(), y: p.getNode().y() };
			return this.trackGeometry.determineZone(point) === lastZone;
		});

		if (firstZoneBlockers.length > 0) {
			const rearmost = this.findRearmost(firstZoneBlockers, firstZone);
			rearmost.isRearmost = true;
		}

		if (lastZoneBlockers.length > 0) {
			const foremost = this.findForemost(lastZoneBlockers, lastZone);
			foremost.isForemost = true;
		}
	}

	private findRearmost(blockers: KonvaTeamPlayer[], zone: number): KonvaTeamPlayer {
		if (zone === 1) {
			return blockers.reduce((rear, player) =>
				player.getNode().x() > rear.getNode().x() ? player : rear
			);
		}
		if (zone === 2) {
			const turn = this.trackGeometry.zones[2];
			return this.getPlayerByAngle(blockers, turn.centerInner.x, turn.centerInner.y, 'max');
		}
		if (zone === 3) {
			return blockers.reduce((rear, player) =>
				player.getNode().x() < rear.getNode().x() ? player : rear
			);
		}
		// zone 4
		const turn = this.trackGeometry.zones[4];
		return this.getPlayerByAngle(blockers, turn.centerInner.x, turn.centerInner.y, 'max');
	}

	private findForemost(blockers: KonvaTeamPlayer[], zone: number): KonvaTeamPlayer {
		if (zone === 1) {
			return blockers.reduce((fore, player) =>
				player.getNode().x() < fore.getNode().x() ? player : fore
			);
		}
		if (zone === 2) {
			const turn = this.trackGeometry.zones[2];
			return this.getPlayerByAngle(blockers, turn.centerInner.x, turn.centerInner.y, 'min');
		}
		if (zone === 3) {
			return blockers.reduce((fore, player) =>
				player.getNode().x() > fore.getNode().x() ? player : fore
			);
		}
		// zone 4
		const turn = this.trackGeometry.zones[4];
		return this.getPlayerByAngle(blockers, turn.centerInner.x, turn.centerInner.y, 'min');
	}

	private calculateEngagementZonePoints(rearmost: KonvaTeamPlayer, foremost: KonvaTeamPlayer) {
		const rearPoint = { x: rearmost.getNode().x(), y: rearmost.getNode().y() };
		const forePoint = { x: foremost.getNode().x(), y: foremost.getNode().y() };

		// Get 20ft behind rearmost player
		const backwardPoint = this.trackGeometry.getPointBehindOnMidtrack(rearPoint);

		// Get 20ft ahead of foremost player
		const forwardPoint = this.trackGeometry.getPointAheadOnMidtrack(forePoint);

		return {
			backward: backwardPoint,
			forward: forwardPoint
		};
	}

	private getPlayerByAngle(
		blockers: KonvaTeamPlayer[],
		centerX: number,
		centerY: number,
		type: 'min' | 'max'
	): KonvaTeamPlayer {
		return blockers.reduce((selected, player) => {
			const currentAngle = Math.atan2(
				player.getNode().x() - centerX,
				-(player.getNode().y() - centerY)
			);
			const selectedAngle = Math.atan2(
				selected.getNode().x() - centerX,
				-(selected.getNode().y() - centerY)
			);
			const normalizedCurrent = (currentAngle + 2 * Math.PI) % (2 * Math.PI);
			const normalizedSelected = (selectedAngle + 2 * Math.PI) % (2 * Math.PI);

			return type === 'max'
				? normalizedCurrent > normalizedSelected
					? player
					: selected
				: normalizedCurrent < normalizedSelected
					? player
					: selected;
		});
	}
}

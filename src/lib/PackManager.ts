import { Player } from './Player';
import type { Point } from './types';
import { distance } from './utils';

export class PackManager {
	players: Player[];
	PACK_DISTANCE: number;
	points: Record<string, Point>;
	zones: number[];

	constructor(pixelsPerMeter: number, points: Record<string, Point>) {
		this.players = [];
		this.PACK_DISTANCE = 3.05 * pixelsPerMeter;
		this.points = points;
		this.zones = [];
	}

	updatePlayers(players: Player[]) {
		this.players = players;
		this.determinePack();
	}

	determinePack() {
		// Reset all players first
		this.players.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
		});

		// console.log('Determining pack...');
		const inBoundsBlockers = this.players.filter((p) => p.inBounds && p.role === 'blocker');
		// console.log('In-bounds blockers:', inBoundsBlockers.length);
		const groups = this.groupBlockers(inBoundsBlockers);
		const validGroups = groups.filter(this.isValidGroup);

		if (validGroups.length === 0) {
			// No valid groups, no pack
			this.players.forEach((p) => {
				p.isInPack = false;
			});
			return;
		}

		// Find the size of the largest group(s)
		const maxSize = Math.max(...validGroups.map((g) => g.length));
		const largestGroups = validGroups.filter((g) => g.length === maxSize);

		if (largestGroups.length === 1) {
			// Single largest group, this is the pack
			const packGroup = largestGroups[0];
			this.updatePlayerPackStatus(packGroup);
			this.updateRearAndForemostPlayers(packGroup);
			// console.log('Valid pack found:', packGroup);
		} else {
			// Multiple largest groups of equal size, no pack
			this.players.forEach((p) => (p.isInPack = false));
		}
	}

	isValidGroup(group: Player[]): boolean {
		return group.some((p) => p.team === 'A') && group.some((p) => p.team === 'B');
	}

	groupBlockers(blockers: Player[]): Player[][] {
		const groups: Player[][] = [];
		const ungrouped = [...blockers];

		while (ungrouped.length > 0) {
			const group = [ungrouped.pop()!];
			let i = 0;
			while (i < group.length) {
				const current = group[i];
				for (let j = ungrouped.length - 1; j >= 0; j--) {
					if (distance(current, ungrouped[j]) <= this.PACK_DISTANCE) {
						group.push(ungrouped.splice(j, 1)[0]);
					}
				}
				i++;
			}
			groups.push(group);
		}

		return groups;
	}

	updatePlayerPackStatus(packGroup: Player[]) {
		this.players.forEach((player) => {
			player.isInPack = packGroup.includes(player);
		});
	}

	updateRearAndForemostPlayers(packGroup: Player[]): void {
		// Reset all players
		this.players.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
		});

		const packBlockers = packGroup.filter((player) => player.isInPack);
		if (packBlockers.length < 2) return;

		// Get unique zones in ascending order
		let zones = [...new Set(packBlockers.map((p) => p.zone))].sort((a, b) => a - b);
		this.zones = zones;

		// If we have zone 4 and zone 1, add 5 (virtual zone 1) to maintain sequence
		if (zones.includes(4) && zones.includes(1)) {
			zones = zones.filter((z) => z !== 1).concat(5);
		}

		const firstZone = zones[0];
		const lastZone = zones[zones.length - 1];

		// Map zone 5 back to 1 for filtering
		const firstZoneBlockers = packBlockers.filter((p) => p.zone === firstZone);
		const lastZoneBlockers = packBlockers.filter((p) => p.zone === (lastZone === 5 ? 1 : lastZone));

		if (firstZoneBlockers.length > 0) {
			const rearmost = this.findRearmost(firstZoneBlockers, firstZone);
			rearmost.isRearmost = true;
		}

		if (lastZoneBlockers.length > 0) {
			const foremost = this.findForemost(lastZoneBlockers, lastZone === 5 ? 1 : lastZone);
			foremost.isForemost = true;
		}
	}

	findRearmost(blockers: Player[], zone: number): Player {
		if (zone === 1) {
			return blockers.reduce((rear, player) => (player.x > rear.x ? player : rear));
		}
		if (zone === 2) {
			const turnCenterX = (this.points.B.x + this.points.H.x) / 2;
			const turnCenterY = (this.points.B.y + this.points.H.y) / 2;
			return this.getPlayerByAngle(blockers, turnCenterX, turnCenterY, 'max');
		}
		if (zone === 3) {
			return blockers.reduce((rear, player) => (player.x < rear.x ? player : rear));
		}
		// zone 4
		const turnCenterX = (this.points.A.x + this.points.G.x) / 2;
		const turnCenterY = (this.points.A.y + this.points.G.y) / 2;
		return this.getPlayerByAngle(blockers, turnCenterX, turnCenterY, 'max');
	}

	findForemost(blockers: Player[], zone: number): Player {
		if (zone === 1) {
			return blockers.reduce((fore, player) => (player.x < fore.x ? player : fore));
		}
		if (zone === 2) {
			const turnCenterX = (this.points.B.x + this.points.H.x) / 2;
			const turnCenterY = (this.points.B.y + this.points.H.y) / 2;
			return this.getPlayerByAngle(blockers, turnCenterX, turnCenterY, 'min');
		}
		if (zone === 3) {
			return blockers.reduce((fore, player) => (player.x > fore.x ? player : fore));
		}
		// zone 4
		const turnCenterX = (this.points.A.x + this.points.G.x) / 2;
		const turnCenterY = (this.points.A.y + this.points.G.y) / 2;
		return this.getPlayerByAngle(blockers, turnCenterX, turnCenterY, 'min');
	}

	getPlayerByAngle(
		blockers: Player[],
		centerX: number,
		centerY: number,
		type: 'min' | 'max'
	): Player {
		return blockers.reduce((selected, player) => {
			const currentAngle = Math.atan2(player.x - centerX, -(player.y - centerY));
			const selectedAngle = Math.atan2(selected.x - centerX, -(selected.y - centerY));
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

	getZones(): number[] {
		return this.zones;
	}
}

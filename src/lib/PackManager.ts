import { Player } from './Player';
import type { Point } from './types';
import { distance } from './utils';

export class PackManager {
	players: Player[];
	PACK_DISTANCE: number;
	points: Record<string, Point>;

	constructor(pixelsPerMeter: number, points: Record<string, Point>) {
		this.players = [];
		this.PACK_DISTANCE = 3.05 * pixelsPerMeter;
		this.points = points;
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

		console.log('Determining pack...');
		const inBoundsBlockers = this.players.filter((p) => p.inBounds && p.role === 'blocker');
		console.log('In-bounds blockers:', inBoundsBlockers.length);
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
			console.log('Valid pack found:', packGroup);
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
		// Reset all players first
		this.players.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
		});

		// Only consider blockers in the pack that are in zone 1 or 3
		const packBlockers = packGroup.filter(
			(player) =>
				player.isInPack && player.role === 'blocker' && (player.zone === 1 || player.zone === 3)
		);

		if (packBlockers.length < 2) return;

		// Group blockers by zone
		const zone1Blockers = packBlockers.filter((p) => p.zone === 1);
		const zone3Blockers = packBlockers.filter((p) => p.zone === 3);

		// Handle zone 1
		if (zone1Blockers.length >= 2) {
			const rearmost = zone1Blockers.reduce((rearmost, player) =>
				player.x > rearmost.x ? player : rearmost
			);
			const foremost = zone1Blockers.reduce((foremost, player) =>
				player.x < foremost.x ? player : foremost
			);
			rearmost.isRearmost = true;
			foremost.isForemost = true;
		}

		// Handle zone 3
		if (zone3Blockers.length >= 2) {
			const rearmost = zone3Blockers.reduce((rearmost, player) =>
				player.x < rearmost.x ? player : rearmost
			);
			const foremost = zone3Blockers.reduce((foremost, player) =>
				player.x > foremost.x ? player : foremost
			);
			rearmost.isRearmost = true;
			foremost.isForemost = true;
		}
	}
}

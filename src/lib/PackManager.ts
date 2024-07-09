import { Player } from './Player';
import { distance } from './utils';

export class PackManager {
	players: Player[];
	PACK_DISTANCE: number;

	constructor(pixelsPerMeter: number) {
		this.players = [];
		this.PACK_DISTANCE = 3.05 * pixelsPerMeter;
	}

	updatePlayers(players: Player[]) {
		this.players = players;
		this.determinePack();
	}

	determinePack() {
		const inBoundsBlockers = this.players.filter((p) => p.inBounds && p.role === 'blocker');
		const groups = this.groupBlockers(inBoundsBlockers);
		const validGroups = groups.filter(this.isValidGroup);

		if (validGroups.length === 0) {
			// No valid groups, no pack
			this.players.forEach((p) => (p.isInPack = false));
			return;
		}

		// Find the size of the largest group(s)
		const maxSize = Math.max(...validGroups.map((g) => g.length));
		const largestGroups = validGroups.filter((g) => g.length === maxSize);

		if (largestGroups.length === 1) {
			// Single largest group, this is the pack
			this.updatePlayerPackStatus(largestGroups[0]);
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
}

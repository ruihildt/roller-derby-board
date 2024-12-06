import Konva from 'konva';
import { TENFEET } from '$lib/constants';
import { KonvaTeamPlayer, TeamPlayerRole } from './KonvaTeamPlayer';
import { KonvaTrackGeometry } from './KonvaTrackGeometry';
import type { KonvaPlayerManager } from './KonvaPlayerManager';

export class KonvaPackManager {
	constructor(
		private playerManager: KonvaPlayerManager,
		private layer: Konva.Layer,
		private trackGeometry: KonvaTrackGeometry
	) {
		layer.on('dragmove dragend touchmove touchend', () => {
			this.playerManager.getBlockers().forEach((player) => {
				player.updateInBounds(this.trackGeometry);
			});
			this.determinePack();
		});
	}

	determinePack() {
		const blockers = this.playerManager.getBlockers();

		const inBoundsBlockers = blockers.filter(
			(p) => p.isInBounds && (p.role === TeamPlayerRole.blocker || p.role === TeamPlayerRole.pivot)
		);

		const groups = this.groupBlockers(inBoundsBlockers);
		const validGroups = groups.filter(this.isValidGroup);

		console.log({ validGroups });

		const maxSize = Math.max(...validGroups.map((g) => g.length), 0);
		const largestGroups = validGroups.filter((g) => g.length === maxSize);

		console.log({ largestGroups });

		if (largestGroups.length === 1) {
			const packGroup = largestGroups[0];
			this.updatePackStatus(blockers, packGroup);
		} else {
			blockers.forEach((p) => p.updatePackStatus(false));
		}

		this.layer.batchDraw();
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

	// private updateEngagementZone(packGroup: KonvaTeamPlayer[]) {
	// 	// Create or update engagement zone shape
	// 	const shape = new Konva.Shape({
	// 		sceneFunc: (context, shape) => {
	// 			// Draw engagement zone logic here
	// 		},
	// 		fill: 'rgba(144, 238, 144, 0.4)',
	// 		listening: false
	// 	});
	// 	this.layer.add(shape);
	// }
}

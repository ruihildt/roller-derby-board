import { TeamPlayer, TeamPlayerRole } from './TeamPlayer';
import { TrackGeometry } from './TrackGeometry';
import type { Point } from '../types';
import { distance } from '../utils/utils';

export class PackManager extends EventTarget {
	players: TeamPlayer[];
	PACK_DISTANCE: number;
	points: Record<string, Point>;
	zones: number[];
	trackGeometry: TrackGeometry;
	engagementZone: Path2D | null;

	constructor(pixelsPerMeter: number, points: Record<string, Point>, trackGeometry: TrackGeometry) {
		super();
		this.players = [];
		this.PACK_DISTANCE = 3.05 * pixelsPerMeter;
		this.points = points;
		this.zones = [];
		this.trackGeometry = trackGeometry;
		this.engagementZone = null;
	}

	updatePlayers(players: TeamPlayer[]) {
		this.players = players;
		this.determinePack();
	}

	determinePack() {
		// Reset all players pack related properties
		this.players.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
			player.isInPack = false;
			player.isInEngagementZone = false;
		});

		const inBoundsBlockers = this.players.filter(
			(p) => p.inBounds && p.role !== TeamPlayerRole.jammer
		);
		const groups = this.groupBlockers(inBoundsBlockers);
		const validGroups = groups.filter(this.isValidGroup);

		// Find the size of the largest group(s)
		const maxSize = Math.max(...validGroups.map((g) => g.length));
		const largestGroups = validGroups.filter((g) => g.length === maxSize);

		if (largestGroups.length === 1) {
			// Single largest group, this is the pack
			const packGroup = largestGroups[0];
			this.updatePlayerPackStatus(packGroup);
			this.updateRearAndForemostPlayers(packGroup);
			this.updatePlayerEngagementZoneStatus(packGroup);
		} else {
			// Multiple largest groups of equal size, no pack
			this.players.forEach((p) => (p.isInPack = false));
		}
	}

	isValidGroup(group: TeamPlayer[]): boolean {
		return group.some((p) => p.team === 'A') && group.some((p) => p.team === 'B');
	}

	groupBlockers(blockers: TeamPlayer[]): TeamPlayer[][] {
		const groups: TeamPlayer[][] = [];
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

	updatePlayerPackStatus(packGroup: TeamPlayer[]) {
		this.players.forEach((player) => {
			player.isInPack = packGroup.includes(player);
		});
	}

	updatePlayerEngagementZoneStatus(packGroup: TeamPlayer[]) {
		const rearmost = packGroup.find((p) => p.isRearmost);
		const foremost = packGroup.find((p) => p.isForemost);

		// First, set all players to not in engagement zone
		this.players.forEach((p) => (p.isInEngagementZone = false));

		// If no rearmost or foremost player, return early
		if (!rearmost || !foremost) {
			return;
		}

		this.engagementZone = this.trackGeometry.createEngagementZonePath(rearmost, foremost);

		// Only check in-bounds players for engagement zone
		this.players
			.filter((player) => player.inBounds)
			.forEach((player) => {
				player.isInEngagementZone = this.trackGeometry.ctx.isPointInPath(
					this.engagementZone!,
					player.x,
					player.y
				);
			});
	}

	updateRearAndForemostPlayers(packGroup: TeamPlayer[]): void {
		// Reset all players
		this.players.forEach((player) => {
			player.isRearmost = false;
			player.isForemost = false;
		});

		const packBlockers = packGroup.filter((player) => player.isInPack);
		if (packBlockers.length < 2) return;

		// Helper function to compare zones in circular order

		let zones = [...new Set(packBlockers.map((p) => p.zone))];

		// Sort zones based on special cases involving zone 4
		if (zones.includes(4)) {
			// Case 1: Pack zones containing 1, 2, 4
			if (zones.includes(1) && zones.includes(2)) {
				zones.sort();
				zones = [4, 1, 2];
			}
			// Case 2: Pack zones containing 1, 3, 4
			else if (zones.includes(1) && zones.includes(3)) {
				zones = [3, 4, 1];
			}
			// Case 3: Pack zones containing 2, 3, 4
			else if (zones.includes(2) && zones.includes(3)) {
				zones = [2, 3, 4];
			}
			// Case 4: Pack zones containing 1
			else if (zones.includes(1)) {
				zones = [4, 1];
			}
			// Case 4: Pack zones containing 1
			else if (zones.includes(3)) {
				zones = [3, 4];
			}
		} else {
			// No zone 4 involved, sort sequentially
			zones.sort();
		}

		this.zones = zones;

		const firstZone = zones[0];
		const lastZone = zones[zones.length - 1];

		const firstZoneBlockers = packBlockers.filter((p) => p.zone === firstZone);
		const lastZoneBlockers = packBlockers.filter((p) => p.zone === lastZone);

		if (firstZoneBlockers.length > 0) {
			const rearmost = this.findRearmost(firstZoneBlockers, firstZone);
			rearmost.isRearmost = true;
		}

		if (lastZoneBlockers.length > 0) {
			const foremost = this.findForemost(lastZoneBlockers, lastZone);
			foremost.isForemost = true;
		}
	}

	findRearmost(blockers: TeamPlayer[], zone: number): TeamPlayer {
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

	findForemost(blockers: TeamPlayer[], zone: number): TeamPlayer {
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
		blockers: TeamPlayer[],
		centerX: number,
		centerY: number,
		type: 'min' | 'max'
	): TeamPlayer {
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

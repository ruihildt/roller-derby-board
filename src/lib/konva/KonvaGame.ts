import {
	CENTER_POINT_OFFSET,
	OUTER_VERTICAL_OFFSET_1,
	OUTER_VERTICAL_OFFSET_2,
	VERTICAL_OFFSET_1,
	VERTICAL_OFFSET_2
} from '$lib/constants';

import Konva from 'konva';
import { KonvaPlayerManager } from './KonvaPlayerManager';
import { KonvaTrackGeometry, type Point } from './KonvaTrackGeometry';

export class KonvaGame {
	private stage: Konva.Stage;
	private trackLayer: Konva.Layer;
	private playersLayer: Konva.Layer;
	private width: number;
	private height: number;
	private playerManager: KonvaPlayerManager;

	constructor(containerId: string, width: number, height: number) {
		// Initialize basic properties first
		this.width = width;
		this.height = height;

		// Create main stage
		this.stage = new Konva.Stage({
			container: containerId,
			width: this.width,
			height: this.height,
			draggable: true,
			pixelRatio: window.devicePixelRatio
		});

		// 3. Create track geometry (depends on points)
		const trackGeometry = new KonvaTrackGeometry(this.initializePoints());

		// 4. Create and setup layers
		this.trackLayer = new Konva.Layer();
		this.playersLayer = new Konva.Layer();
		trackGeometry.addToLayer(this.trackLayer);
		this.stage.add(this.trackLayer);
		this.stage.add(this.playersLayer);

		// 5. Setup interaction features
		this.setupZoom();

		// 6. Initialize player management (depends on layers and geometry)
		this.playerManager = new KonvaPlayerManager(this.playersLayer, trackGeometry);
		this.playerManager.addInitialLineup();
		this.playersLayer.batchDraw();

		// Add window resize handler
		// We keep the center point before resize the center after resize
		window.addEventListener('resize', () => {
			// Get current center point
			const centerX = this.stage.width() / 2;
			const centerY = this.stage.height() / 2;

			// Get current scale and position
			const oldScale = this.stage.scaleX();
			const oldPosition = this.stage.position();

			// Calculate relative position of center in world coordinates
			const worldX = (centerX - oldPosition.x) / oldScale;
			const worldY = (centerY - oldPosition.y) / oldScale;

			// Update stage size
			this.stage.width(window.innerWidth);
			this.stage.height(window.innerHeight);

			// Calculate new center
			const newCenterX = this.stage.width() / 2;
			const newCenterY = this.stage.height() / 2;

			// Set new position to maintain world point at center
			this.stage.position({
				x: newCenterX - worldX * oldScale,
				y: newCenterY - worldY * oldScale
			});

			this.stage.batchDraw();
		});
	}

	private initializePoints(): Record<string, Point> {
		const centerX = this.width / 2;
		const centerY = this.height / 2;

		return {
			A: { x: centerX + CENTER_POINT_OFFSET, y: centerY },
			B: { x: centerX - CENTER_POINT_OFFSET, y: centerY },
			C: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_1
			},
			D: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_1
			},
			E: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_1
			},
			F: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_1
			},
			G: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - VERTICAL_OFFSET_2
			},
			H: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + VERTICAL_OFFSET_2
			},
			I: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY - OUTER_VERTICAL_OFFSET_1
			},
			J: {
				x: centerX + CENTER_POINT_OFFSET,
				y: centerY + OUTER_VERTICAL_OFFSET_2
			},
			K: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY - OUTER_VERTICAL_OFFSET_2
			},
			L: {
				x: centerX - CENTER_POINT_OFFSET,
				y: centerY + OUTER_VERTICAL_OFFSET_1
			}
		};
	}

	private setupZoom() {
		this.stage.on('wheel', (e) => {
			e.evt.preventDefault();

			const oldScale = this.stage.scaleX();
			const pointer = this.stage.getPointerPosition();

			if (!pointer) return;

			const mousePointTo = {
				x: (pointer.x - this.stage.x()) / oldScale,
				y: (pointer.y - this.stage.y()) / oldScale
			};

			const direction = e.evt.deltaY > 0 ? -1 : 1;
			const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

			this.stage.scale({ x: newScale, y: newScale });

			const newPos = {
				x: pointer.x - mousePointTo.x * newScale,
				y: pointer.y - mousePointTo.y * newScale
			};

			this.stage.position(newPos);
			this.stage.batchDraw();
		});
	}
}

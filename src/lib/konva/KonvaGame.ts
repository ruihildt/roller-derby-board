import Konva from 'konva';

import {
	BASE_ZOOM,
	CENTER_POINT_OFFSET,
	MAX_ZOOM,
	MIN_ZOOM,
	OUTER_VERTICAL_OFFSET_1,
	OUTER_VERTICAL_OFFSET_2,
	VERTICAL_OFFSET_1,
	VERTICAL_OFFSET_2,
	ZOOM_INCREMENT
} from '$lib/constants';
import { konvaViewport } from '$lib/stores/konvaViewport';

import { KonvaTrackGeometry, type Point } from './KonvaTrackGeometry';
import { KonvaPlayerManager } from './KonvaPlayerManager';
import { KonvaPackManager } from './KonvaPackManager';

export class KonvaGame {
	private width: number;
	private height: number;

	private stage: Konva.Stage;
	private trackSurfaceLayer: Konva.Layer;
	private trackLinesLayer: Konva.Layer;
	private playersLayer: Konva.Layer;
	private engagementZoneLayer: Konva.Layer;

	private playerManager!: KonvaPlayerManager;
	private packManager!: KonvaPackManager;

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
			pixelRatio: window.devicePixelRatio,
			x: this.width / 2,
			y: this.height / 2
		});

		// Create track geometry (depends on points)
		const trackGeometry = new KonvaTrackGeometry(this.initializePoints());

		// Create a separate layer for track lines
		this.trackSurfaceLayer = new Konva.Layer();
		this.trackLinesLayer = new Konva.Layer();
		this.engagementZoneLayer = new Konva.Layer();
		this.playersLayer = new Konva.Layer();

		// Add in correct order:
		// 1. Track surface (bottom)
		trackGeometry.addTrackSurfaceToLayer(this.trackSurfaceLayer);
		this.stage.add(this.trackSurfaceLayer);

		// 2. Engagement zone (middle)
		this.stage.add(this.engagementZoneLayer);

		// 3. Track lines (over engagement zone)
		trackGeometry.addTrackLinesToLayer(this.trackLinesLayer);
		this.stage.add(this.trackLinesLayer);

		// 4. Players (top)
		this.stage.add(this.playersLayer);

		// Setup interaction features
		this.setupZoom();

		this.playerManager = new KonvaPlayerManager(this.playersLayer, trackGeometry);
		this.packManager = new KonvaPackManager(
			this.playerManager,
			this.playersLayer,
			this.engagementZoneLayer,
			trackGeometry
		);
		this.playerManager.addInitialLineup();
		this.packManager.determinePack();
		this.playersLayer.batchDraw();

		// Add window resize handler
		window.addEventListener('resize', this.handleResize);
	}

	destroy() {
		window.removeEventListener('resize', this.handleResize);
		this.trackSurfaceLayer.destroy();
		this.trackLinesLayer.destroy();
		this.engagementZoneLayer.destroy();
		this.playersLayer.destroy();
		this.stage.destroy();
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

	private handleResize = () => {
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
	};

	private setupZoom() {
		konvaViewport.subscribe((state) => {
			this.stage.scale({ x: state.zoom, y: state.zoom });
			this.stage.position({ x: state.x, y: state.y });
			this.stage.batchDraw();
		});
	}

	zoomIn() {
		const newScale = Math.min(this.stage.scaleX() + ZOOM_INCREMENT, MAX_ZOOM);
		this.updateZoom(newScale);
	}

	zoomOut() {
		const newScale = Math.max(this.stage.scaleX() - ZOOM_INCREMENT, MIN_ZOOM);
		this.updateZoom(newScale);
	}

	resetZoom() {
		konvaViewport.set({
			zoom: BASE_ZOOM,
			x: 0,
			y: 0
		});
	}

	private updateZoom(newScale: number) {
		const oldScale = this.stage.scaleX();

		// Get current center point
		const centerX = this.stage.width() / 2;
		const centerY = this.stage.height() / 2;

		// Get current position relative to center
		const relativeX = (centerX - this.stage.x()) / oldScale;
		const relativeY = (centerY - this.stage.y()) / oldScale;

		// Calculate new position to maintain the same center point
		const newX = centerX - relativeX * newScale;
		const newY = centerY - relativeY * newScale;

		konvaViewport.set({
			zoom: newScale,
			x: newX,
			y: newY
		});
	}
}

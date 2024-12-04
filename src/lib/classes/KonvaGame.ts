import {
	CENTER_POINT_OFFSET,
	OUTER_VERTICAL_OFFSET_1,
	OUTER_VERTICAL_OFFSET_2,
	VERTICAL_OFFSET_1,
	VERTICAL_OFFSET_2
} from '$lib/constants';
import type { Point } from '$lib/types';
import Konva from 'konva';
import { KonvaTrackGeometry } from './KonvaTrackGeometry';

export class KonvaGame {
	private stage: Konva.Stage;
	private trackLayer: Konva.Layer;
	private playersLayer: Konva.Layer;
	private width: number;
	private height: number;

	constructor(containerId: string, width: number, height: number) {
		this.width = width;
		this.height = height;

		this.stage = new Konva.Stage({
			container: containerId,
			width: this.width,
			height: this.height,
			draggable: true,
			pixelRatio: window.devicePixelRatio
		});

		this.trackLayer = new Konva.Layer();
		const trackGeometry = new KonvaTrackGeometry(this.initializePoints());
		trackGeometry.addToLayer(this.trackLayer);

		this.playersLayer = new Konva.Layer();

		this.stage.add(this.trackLayer);
		this.stage.add(this.playersLayer);

		this.setupZoom();
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

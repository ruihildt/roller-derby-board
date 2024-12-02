import type { PlayerManager } from '$lib/classes/PlayerManager';
import type { ScalingManager } from '$lib/classes/ScalingManager';
import type { PackZoneRenderer } from './PackZoneRenderer';
import type { PlayerRenderer } from './PlayerRenderer';
import type { Renderer } from './Renderer';

export class RenderingPipeline {
	constructor(
		private renderer: Renderer,
		private playerRenderer: PlayerRenderer,
		private packZoneRenderer: PackZoneRenderer,
		private scalingManager: ScalingManager,
		private playerManager: PlayerManager
	) {}

	render() {
		// Execute both rendering pipelines
		this.renderNormal();
		this.renderHighRes();
	}

	private renderNormal() {
		// Clear and reset canvas
		this.scalingManager.clearAndResetCanvas(this.renderer.canvas);

		// Start transform
		this.scalingManager.applyTransformToCanvas(this.renderer.canvas);

		// Draw game elements
		this.renderer.drawTrack(this.renderer.ctx);
		this.packZoneRenderer.drawEngagementZone(this.renderer.ctx);
		this.renderer.drawTrackBoundaries(this.renderer.ctx);

		this.playerRenderer.drawPlayers(this.playerManager.players);
		this.playerRenderer.drawSkatingOfficials(this.playerManager.skatingOfficials);
		this.renderer.drawBranding(this.renderer.ctx);

		// End transform
		this.scalingManager.restoreTransform(this.renderer.ctx);
	}

	private renderHighRes() {
		if (!this.renderer.highResCanvas) return;

		const ctx = this.renderer.highResCtx;
		const scale = 2;

		// Set up high resolution canvas
		this.renderer.highResCanvas.width = this.renderer.canvas.width * scale;
		this.renderer.highResCanvas.height = this.renderer.canvas.height * scale;

		ctx.scale(scale, scale);

		// Clear and reset high res canvas
		this.scalingManager.clearAndResetCanvas(this.renderer.highResCanvas);
		this.scalingManager.applyTransformToCanvas(this.renderer.highResCanvas);

		// Draw all elements in high resolution
		this.renderer.drawTrack(ctx);
		this.packZoneRenderer.drawEngagementZoneHighRes();
		this.playerRenderer.drawPlayersHighRes(this.playerManager.players);
		this.playerRenderer.drawSkatingOfficialsHighRes(this.playerManager.skatingOfficials);
		this.renderer.drawBranding(ctx);

		this.scalingManager.restoreTransform(ctx);
	}
}

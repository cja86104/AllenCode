// @ts-check
import LayerStack from './LayerStack.jsx';
import StepTabs from './StepTabs.jsx';
import Provenance from './Provenance.jsx';
import { layerTimeline } from './layerTimeline.js';

/** @typedef {import('./layerTimeline.js').StepId} StepId */

/** The narrowest the steps and provenance may be on a desktop, in px: "02 Transformation" needs it. */
const CONTROLS_MIN_PX = 480;

/**
 * A chapter's stage in C (Living Source Phase 4): the layer stack, its three steps under it and the code's
 * provenance under them, one column the stack's width.
 * @param {{ excerpt: import('../../content/excerpts/index.js').Excerpt, screen: import('./LayerStack.jsx').Screen, progress: number,
 *   flat: boolean, view: StepId, width: number, phone: boolean, onPick: (step: StepId) => void }} props
 */
export default function LayerStage({ excerpt, screen, progress, flat, view, width, phone, onPick }) {
  const current = flat ? view : layerTimeline(progress).step;
  return (
    <div data-layer-stage style={{ width }} className="space-y-4">
      <LayerStack excerpt={excerpt} screen={screen} progress={progress} flat={flat} view={view} width={width} />
      {/* Never narrower than the steps' words need on a desktop (a portrait screen makes a narrow stack). */}
      <div style={phone ? undefined : { minWidth: CONTROLS_MIN_PX }} className="space-y-4">
        <StepTabs current={current} onPick={onPick} phone={phone} />
        <Provenance excerpt={excerpt} />
      </div>
    </div>
  );
}

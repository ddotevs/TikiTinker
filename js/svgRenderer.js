// SVG Renderer - Generates SVG elements from the TikiModel
// Orchestrates feature library and patterns into rendered layers

import { FeatureLibrary } from './featureLibrary.js';
import { Patterns } from './patterns.js';

export class SvgRenderer {
    constructor(model) {
        this.model = model;
    }

    renderFace(layer) {
        layer.innerHTML = '';
        const m = this.model;
        const b = m.svgBounds;

        if (m.view === 'front') {
            this._renderFrontFace(layer, b);
        } else {
            this._renderSideFace(layer, b);
        }
    }

    renderFeatures(layer) {
        layer.innerHTML = '';
        const m = this.model;
        const b = m.svgBounds;

        if (m.view === 'side') return; // Side view only shows profile

        const cx = b.x + b.width / 2;
        const eyeY = m.fracToY(m.guides.eyeline);
        const noseY = m.fracToY(m.guides.noseline);
        const mouthY = m.fracToY(m.guides.mouthline);

        // Eyebrows (above eyes)
        const browY = eyeY - b.height * 0.05;
        const brows = FeatureLibrary.eyebrows(
            m.features.brows.type, cx, browY, b.width, b.height,
            m.features.brows, m.stage
        );
        brows.forEach(d => {
            if (d) this._path(layer, d, m.stage >= 2 ? 'feature-fill' : 'feature-path');
        });

        // Eyes
        const eyes = FeatureLibrary.eyes(
            m.features.eyes.type, cx, eyeY, b.width, b.height,
            m.features.eyes, m.stage
        );
        eyes.forEach(eye => {
            if (eye.outline) this._path(layer, eye.outline, 'feature-path');
            if (eye.fill) this._path(layer, eye.fill, 'feature-fill');
        });

        // Nose
        const nose = FeatureLibrary.nose(
            m.features.nose.type, cx, noseY, b.width, b.height,
            m.features.nose, m.stage
        );
        if (nose) {
            if (nose.outline) this._path(layer, nose.outline, 'feature-path');
            if (nose.nostrils) this._path(layer, nose.nostrils, 'feature-fill');
        }

        // Mouth
        const mouth = FeatureLibrary.mouth(
            m.features.mouth.type, cx, mouthY, b.width, b.height,
            m.features.mouth, m.stage
        );
        if (mouth) {
            if (mouth.outline) this._path(layer, mouth.outline, 'feature-path');
            if (mouth.fill) this._path(layer, mouth.fill, 'feature-fill');
        }

        // Teeth (only stage 2+)
        if (m.stage >= 2 && m.features.teeth.type !== 'none') {
            const teethY = mouthY + b.height * 0.01;
            const teeth = FeatureLibrary.teeth(
                m.features.teeth.type, cx, teethY, b.width, b.height,
                m.features.teeth, m.features.mouth.width
            );
            teeth.forEach(d => {
                if (d) this._path(layer, d, 'feature-path');
            });
        }

        // Tongue (only stage 2+)
        if (m.stage >= 2 && m.features.tongue.type !== 'none') {
            const tongueY = mouthY + b.height * 0.04;
            const tongue = FeatureLibrary.tongue(
                m.features.tongue.type, cx, tongueY, b.width, b.height,
                m.features.tongue
            );
            if (tongue) this._path(layer, tongue, 'feature-fill');
        }
    }

    renderDecorations(layer) {
        layer.innerHTML = '';
        const m = this.model;
        const b = m.svgBounds;

        if (m.view === 'side') return;

        const cx = b.x + b.width / 2;
        const crownH = b.height * m.guides.eyeline * 0.7;

        // Crown patterns
        const crownPaths = Patterns.crown(
            m.decorations.crown, cx, b.y, b.width, crownH, m.stage
        );
        crownPaths.forEach(d => {
            this._path(layer, d, 'decoration-path');
        });

        // Filler patterns (positioned on cheeks, between nose and face edge)
        const fillerY = m.fracToY((m.guides.noseline + m.guides.mouthline) / 2);
        const fillerPaths = Patterns.filler(
            m.decorations.filler, cx, fillerY, b.width, b.height, m.stage
        );
        fillerPaths.forEach(d => {
            this._path(layer, d, 'decoration-path');
        });
    }

    _renderFrontFace(layer, bounds) {
        const outline = FeatureLibrary.faceOutline(bounds, this.model.stage);
        this._path(layer, outline, 'face-outline');

        // Stage 1: add angular removal areas
        if (this.model.stage === 1) {
            this._renderBlockInAreas(layer, bounds);
        }
    }

    _renderSideFace(layer, bounds) {
        const profile = FeatureLibrary.sideProfile(bounds, this.model, this.model.stage);
        this._path(layer, profile, 'face-outline');

        if (this.model.stage === 1) {
            this._renderSideBlockIn(layer, bounds);
        }
    }

    _renderBlockInAreas(layer, bounds) {
        const { x, y, width: w, height: h } = bounds;
        const cx = x + w / 2;
        const eyeY = this.model.fracToY(this.model.guides.eyeline);
        const noseY = this.model.fracToY(this.model.guides.noseline);

        // Eye socket removal triangles
        const socketW = w * 0.35;
        [-1, 1].forEach(side => {
            const sx = cx + side * w * 0.15;
            const d = `M ${sx} ${eyeY - h * 0.05}
                L ${sx + side * socketW * 0.4} ${eyeY}
                L ${sx} ${eyeY + h * 0.04} Z`;
            this._path(layer, d, 'removal-area');
        });

        // Nose bridge V-cut
        const d = `M ${cx - w * 0.04} ${eyeY + h * 0.02}
            L ${cx} ${noseY - h * 0.02}
            L ${cx + w * 0.04} ${eyeY + h * 0.02} Z`;
        this._path(layer, d, 'removal-area');
    }

    _renderSideBlockIn(layer, bounds) {
        const { x, y, width: w, height: h } = bounds;
        // Show the waste wood as a rectangle behind the profile
        const waste = `M ${x + w * 0.1} ${y}
            L ${x + w * 0.3} ${y}
            L ${x + w * 0.3} ${y + h}
            L ${x + w * 0.1} ${y + h} Z`;
        this._path(layer, waste, 'removal-area');
    }

    _path(parent, d, className) {
        if (!d) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        parent.appendChild(path);
    }
}

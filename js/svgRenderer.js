// SVG Renderer - Generates SVG elements from the TikiModel
// Handles containment, feature interaction, and layer rendering

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

        // Always render a clip path matching the log boundary.
        // NOTHING can exceed this — you can't add wood.
        this._updateClipPath(b);

        if (m.view === 'front') {
            const outline = FeatureLibrary.faceOutline(b, m.stage);
            this._path(layer, outline, 'face-outline');
        } else {
            const paths = FeatureLibrary.sideProfile(b, m, m.stage);
            if (Array.isArray(paths)) {
                this._path(layer, paths[0], 'face-outline');
                if (paths[1]) {
                    const cls = m.stage === 1 ? 'removal-area' : 'feature-path';
                    this._path(layer, paths[1], cls);
                }
            } else {
                this._path(layer, paths, 'face-outline');
            }
        }
    }

    _updateClipPath(bounds) {
        const svg = document.getElementById('tiki-canvas');
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }

        let clipPath = defs.querySelector('#log-clip');
        if (!clipPath) {
            clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPath.setAttribute('id', 'log-clip');
            defs.appendChild(clipPath);
        }
        clipPath.innerHTML = '';

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', bounds.x);
        rect.setAttribute('y', bounds.y);
        rect.setAttribute('width', bounds.width);
        rect.setAttribute('height', bounds.height);
        clipPath.appendChild(rect);

        // Apply clip to feature and decoration layers
        document.getElementById('layer-features').setAttribute('clip-path', 'url(#log-clip)');
        document.getElementById('layer-decorations').setAttribute('clip-path', 'url(#log-clip)');
    }

    renderFeatures(layer) {
        layer.innerHTML = '';
        const m = this.model;
        const b = m.svgBounds;

        if (m.view === 'side') return;

        const cx = b.x + b.width / 2;
        const browY = m.fracToY(m.guides.browline);
        const eyeY = m.fracToY(m.guides.eyeline);
        const noseY = m.fracToY(m.guides.noseline);
        const mouthY = m.fracToY(m.guides.mouthline);

        // Brow ridge (the signature tiki feature)
        const browPaths = FeatureLibrary.browRidge(
            m.features.brows.type, cx, browY, eyeY,
            b.width, b.height, m.features.brows, m.stage
        );
        browPaths.forEach(p => this._path(layer, p.d, p.cls));

        // Eyes
        const eyePaths = FeatureLibrary.eyes(
            m.features.eyes.type, cx, eyeY, b.width, b.height,
            m.features.eyes, m.stage
        );
        eyePaths.forEach(p => this._path(layer, p.d, p.cls));

        // Nose
        const nosePaths = FeatureLibrary.nose(
            m.features.nose.type, cx, noseY, b.width, b.height,
            m.features.nose, m.stage
        );
        nosePaths.forEach(p => this._path(layer, p.d, p.cls));

        // Nasolabial folds (smile lines from nose to mouth)
        const foldPaths = FeatureLibrary.nasolabialFolds(cx, noseY, mouthY, b.width, m.stage);
        foldPaths.forEach(p => this._path(layer, p.d, p.cls));

        // Mouth
        const mouthPaths = FeatureLibrary.mouth(
            m.features.mouth.type, cx, mouthY, b.width, b.height,
            m.features.mouth, m.stage
        );
        mouthPaths.forEach(p => this._path(layer, p.d, p.cls));

        // Teeth (stage 2+)
        if (m.stage >= 2 && m.features.teeth.type !== 'none') {
            const teethY = mouthY + b.height * 0.005;
            const teethPaths = FeatureLibrary.teeth(
                m.features.teeth.type, cx, teethY, b.width, b.height,
                m.features.teeth, m.features.mouth
            );
            teethPaths.forEach(p => this._path(layer, p.d, p.cls));
        }

        // Tongue (stage 2+)
        if (m.stage >= 2 && m.features.tongue.type !== 'none') {
            const tongueY = mouthY + b.height * 0.04;
            const tonguePaths = FeatureLibrary.tongue(
                m.features.tongue.type, cx, tongueY, b.width, b.height,
                m.features.tongue
            );
            tonguePaths.forEach(p => this._path(layer, p.d, p.cls));
        }
    }

    renderDecorations(layer) {
        layer.innerHTML = '';
        const m = this.model;
        const b = m.svgBounds;

        if (m.view === 'side') return;

        const cx = b.x + b.width / 2;
        const crownBottom = m.fracToY(m.guides.browline);
        const crownH = crownBottom - b.y;

        // Crown patterns
        const crownPaths = Patterns.crown(
            m.decorations.crown, cx, b.y, b.width, crownH, m.stage
        );
        crownPaths.forEach(d => this._path(layer, d, 'decoration-path'));

        // Filler patterns (on cheeks)
        const fillerY = m.fracToY((m.guides.eyeline + m.guides.noseline) / 2);
        const fillerPaths = Patterns.filler(
            m.decorations.filler, cx, fillerY, b.width, b.height, m.stage
        );
        fillerPaths.forEach(d => this._path(layer, d, 'decoration-path'));
    }

    _path(parent, d, className) {
        if (!d) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        parent.appendChild(path);
    }
}

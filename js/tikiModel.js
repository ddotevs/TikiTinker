// TikiModel - Parametric face data model
// Manages proportions, feature selections, dimensions, and feature interaction

const PHI = 1.618;

export class TikiModel {
    constructor() {
        this.log = {
            diameter: 4,
            height: 8,
            unit: 'in'
        };

        // Guideline positions as fractions of total height (0 = top, 1 = bottom)
        // These are DRAGGABLE - user can reposition features freely
        this.guides = {
            crownTop: 0.0,
            browline: 0.28,
            eyeline: 0.38,
            noseline: 0.55,
            mouthline: 0.72,
            chinline: 0.90,
            bottom: 1.0
        };

        this.features = {
            eyes: { type: 'tiki-almond', pupil: 50, angle: 0, spacing: 50, scale: 50 },
            brows: { type: 'angry', thickness: 60, connected: true },
            nose: { type: 'tiki-wide', width: 50, nostril: 50, lipDist: 30, scale: 50 },
            mouth: { type: 'open', width: 60, scale: 50 },
            teeth: { type: 'normal', size: 50, count: 6 },
            tongue: { type: 'none', direction: 'center', shape: 'round' }
        };

        this.decorations = {
            crown: 'radiating',
            filler: 'none'
        };

        this.view = 'front'; // 'front' or 'side'
        this.stage = 3; // 1, 2, or 3 — default to detail view

        this.overlays = {
            grid: false,
            guides: true,
            ratio: false
        };

        // Drag state
        this.dragging = null; // which guide is being dragged
    }

    get circumference() {
        return Math.PI * this.log.diameter;
    }

    get radius() {
        return this.log.diameter / 2;
    }

    get faceWidth() {
        return this.log.diameter;
    }

    get faceHeight() {
        return this.log.height;
    }

    // SVG coordinate mapping — face fills most of the viewBox
    get svgBounds() {
        const padding = 40;
        const aspect = this.faceWidth / this.faceHeight;
        let svgW, svgH;

        if (aspect > (400 - padding * 2) / (600 - padding * 2)) {
            svgW = 400 - padding * 2;
            svgH = svgW / aspect;
        } else {
            svgH = 600 - padding * 2;
            svgW = svgH * aspect;
        }

        return {
            x: (400 - svgW) / 2,
            y: (600 - svgH) / 2,
            width: svgW,
            height: svgH
        };
    }

    fracToY(frac) {
        const b = this.svgBounds;
        return b.y + frac * b.height;
    }

    fracToX(frac) {
        const b = this.svgBounds;
        return b.x + frac * b.width;
    }

    yToFrac(y) {
        const b = this.svgBounds;
        return (y - b.y) / b.height;
    }

    // Clamp a guide fraction to valid range, respecting ordering
    clampGuide(name, frac) {
        const order = ['crownTop', 'browline', 'eyeline', 'noseline', 'mouthline', 'chinline', 'bottom'];
        const idx = order.indexOf(name);
        const min = idx > 0 ? this.guides[order[idx - 1]] + 0.03 : 0;
        const max = idx < order.length - 1 ? this.guides[order[idx + 1]] - 0.03 : 1;
        return Math.max(min, Math.min(max, frac));
    }

    // Get feature bounds for containment checking
    getFeatureBounds(featureName) {
        const b = this.svgBounds;
        const cx = b.x + b.width / 2;

        switch (featureName) {
            case 'eyes': {
                const spacing = b.width * (0.15 + this.features.eyes.spacing / 200);
                const eyeW = b.width * (0.12 + this.features.eyes.scale / 400);
                return { left: cx - spacing - eyeW, right: cx + spacing + eyeW };
            }
            case 'nose': {
                const noseW = b.width * (0.1 + this.features.nose.width / 200);
                return { left: cx - noseW, right: cx + noseW };
            }
            case 'mouth': {
                const mouthW = b.width * (this.features.mouth.width / 140);
                return { left: cx - mouthW, right: cx + mouthW };
            }
        }
        return { left: b.x, right: b.x + b.width };
    }

    // Check if feature exceeds log bounds and return overflow
    getOverflow(featureName) {
        const b = this.svgBounds;
        const bounds = this.getFeatureBounds(featureName);
        return {
            left: Math.max(0, b.x - bounds.left),
            right: Math.max(0, bounds.right - (b.x + b.width))
        };
    }

    // Auto-expand log width if features overflow
    getEffectiveWidth() {
        let maxOverflow = 0;
        ['eyes', 'nose', 'mouth'].forEach(f => {
            const overflow = this.getOverflow(f);
            maxOverflow = Math.max(maxOverflow, overflow.left, overflow.right);
        });
        if (maxOverflow > 0) {
            const b = this.svgBounds;
            return b.width + maxOverflow * 2 + 10;
        }
        return this.svgBounds.width;
    }

    formatMeasurement(value) {
        const unit = this.log.unit;
        return unit === 'cm' ? `${value.toFixed(1)} cm` : `${value.toFixed(2)}"`;
    }

    getGoldenRatioGuides() {
        const total = 1.0;
        const unit = total / (1 + PHI + PHI * PHI);
        return {
            eyeline: unit * PHI * PHI / total,
            noseline: (unit * PHI * PHI + unit * PHI) / total,
            mouthline: (unit * PHI * PHI + unit * PHI + unit * 0.618) / total
        };
    }

    getZoneMeasurements() {
        const h = this.faceHeight;
        return {
            crownToEye: (this.guides.eyeline - this.guides.crownTop) * h,
            eyeToNose: (this.guides.noseline - this.guides.eyeline) * h,
            noseToMouth: (this.guides.mouthline - this.guides.noseline) * h,
            mouthToChin: (this.guides.chinline - this.guides.mouthline) * h,
            chinToBottom: (this.guides.bottom - this.guides.chinline) * h
        };
    }

    getGridInfo() {
        const sqSize = this.log.diameter <= 4 ? 0.25 :
                       this.log.diameter <= 8 ? 0.5 : 1.0;
        const cols = Math.ceil(this.faceWidth / sqSize);
        const rows = Math.ceil(this.faceHeight / sqSize);
        return { cols, rows, sqSize };
    }

    toJSON() {
        return JSON.stringify({
            log: this.log,
            guides: this.guides,
            features: this.features,
            decorations: this.decorations
        });
    }

    fromJSON(json) {
        const data = JSON.parse(json);
        Object.assign(this.log, data.log);
        Object.assign(this.guides, data.guides);
        Object.assign(this.features, data.features);
        Object.assign(this.decorations, data.decorations);
    }
}

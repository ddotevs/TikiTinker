// TikiModel - Parametric face data model
// Manages proportions, feature selections, and dimensions

const PHI = 1.618;

export class TikiModel {
    constructor() {
        this.log = {
            diameter: 4,
            height: 8,
            unit: 'in'
        };

        // Guideline positions as fractions of total height (0 = top, 1 = bottom)
        // Default positions inspired by golden ratio but freely adjustable
        this.guides = {
            crownTop: 0.0,
            eyeline: 0.35,
            noseline: 0.55,
            mouthline: 0.70,
            chinline: 0.88,
            bottom: 1.0
        };

        this.features = {
            eyes: { type: 'open', pupil: 50, angle: 0, spacing: 50 },
            brows: { type: 'angry', thickness: 50 },
            nose: { type: 'round', width: 50, nostril: 40, lipDist: 30 },
            mouth: { type: 'open', width: 60 },
            teeth: { type: 'none', size: 50 },
            tongue: { type: 'none', direction: 'center', shape: 'round' }
        };

        this.decorations = {
            crown: 'none',
            filler: 'none'
        };

        this.view = 'front'; // 'front' or 'side'
        this.stage = 1; // 1, 2, or 3

        this.overlays = {
            grid: false,
            guides: true,
            ratio: false
        };
    }

    get circumference() {
        return Math.PI * this.log.diameter;
    }

    get radius() {
        return this.log.diameter / 2;
    }

    // Get the face width (visible from front on a cylinder)
    // On a round log, the visible front face is roughly diameter-wide
    get faceWidth() {
        return this.log.diameter;
    }

    get faceHeight() {
        return this.log.height;
    }

    // Convert model proportions to SVG coordinates
    // SVG viewBox is 400x600; face is centered within
    get svgBounds() {
        const padding = 30;
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

    // Convert a fraction (0-1) of height to SVG Y coordinate
    fracToY(frac) {
        const b = this.svgBounds;
        return b.y + frac * b.height;
    }

    // Convert a fraction (0-1) of width to SVG X coordinate (0.5 = center)
    fracToX(frac) {
        const b = this.svgBounds;
        return b.x + frac * b.width;
    }

    // Get measurement value with unit suffix
    formatMeasurement(value) {
        const unit = this.log.unit;
        if (unit === 'cm') {
            return `${value.toFixed(1)} cm`;
        }
        return `${value.toFixed(2)}"`;
    }

    // Get the golden ratio guide positions (for reference only)
    getGoldenRatioGuides() {
        // Classic facial thirds using phi
        const total = 1.0;
        const unit = total / (1 + PHI + PHI * PHI);
        return {
            eyeline: unit * PHI * PHI / total,
            noseline: (unit * PHI * PHI + unit * PHI) / total,
            mouthline: (unit * PHI * PHI + unit * PHI + unit * 0.618) / total
        };
    }

    // Get real-world measurements for each zone
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

    // Grid calculations
    getGridInfo() {
        const sqSize = this.log.diameter <= 4 ? 0.25 :
                       this.log.diameter <= 8 ? 0.5 : 1.0;
        const cols = Math.ceil(this.faceWidth / sqSize);
        const rows = Math.ceil(this.faceHeight / sqSize);
        return { cols, rows, sqSize };
    }

    // Serialize model to JSON for save/load
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

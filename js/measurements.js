// Measurements - Dimension calculations, grid info, and measurement display

export class Measurements {
    constructor(model) {
        this.model = model;
    }

    updateDisplay() {
        const m = this.model;
        const unit = m.log.unit;
        const suffix = unit === 'in' ? '"' : ' cm';

        // Log dimensions
        this._set('meas-diameter', this._fmt(m.log.diameter) + suffix);
        this._set('meas-circumference', this._fmt(m.circumference) + suffix);
        this._set('meas-radius', this._fmt(m.radius) + suffix);
        this._set('meas-height', this._fmt(m.log.height) + suffix);

        // Feature placement (distance from top)
        const h = m.faceHeight;
        this._set('meas-browline', this._fmt(m.guides.browline * h) + suffix);
        this._set('meas-eyeline', this._fmt(m.guides.eyeline * h) + suffix);
        this._set('meas-noseline', this._fmt(m.guides.noseline * h) + suffix);
        this._set('meas-mouthline', this._fmt(m.guides.mouthline * h) + suffix);
        this._set('meas-chinline', this._fmt(m.guides.chinline * h) + suffix);

        // Grid info
        const grid = m.getGridInfo();
        this._set('meas-grid-squares', `${grid.cols} x ${grid.rows}`);
        this._set('meas-grid-size', this._fmt(grid.sqSize) + suffix);

        // Golden ratio zones
        const zones = m.getZoneMeasurements();
        this._set('meas-ratio-eye', this._fmt(zones.crownToEye) + suffix);
        this._set('meas-ratio-nose', this._fmt(zones.eyeToNose) + suffix);
        this._set('meas-ratio-chin', this._fmt(zones.noseToMouth + zones.mouthToChin) + suffix);
    }

    _fmt(value) {
        return this.model.log.unit === 'in' ? value.toFixed(2) : value.toFixed(1);
    }

    _set(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

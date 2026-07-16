// App - Main application orchestration and UI event wiring

import { TikiModel } from './tikiModel.js';
import { SvgRenderer } from './svgRenderer.js';
import { Guidelines } from './guidelines.js';
import { Measurements } from './measurements.js';
import { DragDrop } from './dragDrop.js';

class TikiTinkerApp {
    constructor() {
        this.model = new TikiModel();
        this.renderer = new SvgRenderer(this.model);
        this.guidelines = new Guidelines(this.model);
        this.measurements = new Measurements(this.model);
        this.dragDrop = new DragDrop(this.model, () => this.render());

        this.layers = {
            grid: document.getElementById('layer-grid'),
            guidelines: document.getElementById('layer-guidelines'),
            ratio: document.getElementById('layer-ratio'),
            face: document.getElementById('layer-face'),
            features: document.getElementById('layer-features'),
            decorations: document.getElementById('layer-decorations'),
            measurements: document.getElementById('layer-measurements')
        };

        const svg = document.getElementById('tiki-canvas');
        this.dragDrop.init(svg);

        this._bindControls();
        this.render();
    }

    render() {
        this.guidelines.renderGrid(this.layers.grid);
        this.guidelines.renderGuides(this.layers.guidelines);
        this.guidelines.renderRatio(this.layers.ratio);
        this.renderer.renderFace(this.layers.face);
        this.renderer.renderFeatures(this.layers.features);
        this.renderer.renderDecorations(this.layers.decorations);
        this.dragDrop.renderHandles();
        this.measurements.updateDisplay();
    }

    _bindControls() {
        // Log dimensions
        this._onChange('log-diameter', v => { this.model.log.diameter = parseFloat(v); });
        this._onChange('log-height', v => { this.model.log.height = parseFloat(v); });
        this._onChange('unit-select', v => { this.model.log.unit = v; });

        // Feature type selects
        this._onChange('feat-eyes', v => { this.model.features.eyes.type = v; });
        this._onChange('feat-brows', v => { this.model.features.brows.type = v; });
        this._onChange('feat-nose', v => { this.model.features.nose.type = v; });
        this._onChange('feat-mouth', v => { this.model.features.mouth.type = v; });
        this._onChange('feat-teeth', v => { this.model.features.teeth.type = v; });
        this._onChange('feat-tongue', v => { this.model.features.tongue.type = v; });

        // Feature parameters (ranges)
        this._onRange('eyes-pupil', v => { this.model.features.eyes.pupil = v; });
        this._onRange('eyes-angle', v => { this.model.features.eyes.angle = v; });
        this._onRange('eyes-spacing', v => { this.model.features.eyes.spacing = v; });
        this._onRange('eyes-scale', v => { this.model.features.eyes.scale = v; });
        this._onRange('brows-thickness', v => { this.model.features.brows.thickness = v; });
        this._onRange('nose-width', v => { this.model.features.nose.width = v; });
        this._onRange('nose-nostril', v => { this.model.features.nose.nostril = v; });
        this._onRange('nose-scale', v => { this.model.features.nose.scale = v; });
        this._onRange('mouth-width', v => { this.model.features.mouth.width = v; });
        this._onRange('mouth-scale', v => { this.model.features.mouth.scale = v; });
        this._onRange('teeth-size', v => { this.model.features.teeth.size = v; });

        // Tongue params
        this._onChange('tongue-dir', v => { this.model.features.tongue.direction = v; });
        this._onChange('tongue-shape', v => { this.model.features.tongue.shape = v; });

        // Decorations
        this._onChange('deco-crown', v => { this.model.decorations.crown = v; });
        this._onChange('deco-filler', v => { this.model.decorations.filler = v; });

        // Toolbar toggles
        this._onToggle('btn-grid', () => { this.model.overlays.grid = !this.model.overlays.grid; });
        this._onToggle('btn-guides', () => { this.model.overlays.guides = !this.model.overlays.guides; });
        this._onToggle('btn-ratio', () => { this.model.overlays.ratio = !this.model.overlays.ratio; });

        // Stage selector
        document.querySelectorAll('.stage-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.model.stage = parseInt(btn.dataset.stage);
                this.render();
            });
        });

        // View tabs
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.model.view = btn.dataset.view;
                this.render();
            });
        });

        // Export button
        document.getElementById('btn-export').addEventListener('click', () => {
            this._exportSVG();
        });
    }

    _onChange(id, setter) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            setter(el.value);
            this.render();
        });
        if (el.type === 'number') {
            el.addEventListener('input', () => {
                setter(el.value);
                this.render();
            });
        }
    }

    _onRange(id, setter) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            setter(parseFloat(el.value));
            this.render();
        });
    }

    _onToggle(id, toggle) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', () => {
            toggle();
            btn.classList.toggle('active');
            this.render();
        });
    }

    _exportSVG() {
        const svg = document.getElementById('tiki-canvas');
        // Remove drag handles from export
        const handles = svg.querySelector('#layer-handles');
        const handlesCopy = handles.innerHTML;
        handles.innerHTML = '';

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tikitinker-${this.model.view}-stage${this.model.stage}.svg`;
        a.click();
        URL.revokeObjectURL(url);

        handles.innerHTML = handlesCopy;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TikiTinkerApp();
});

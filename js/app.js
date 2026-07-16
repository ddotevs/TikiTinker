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
        // Enforce hard containment BEFORE rendering — features can never exceed log
        this.model.enforceContainment();

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
        // Show the export modal
        const modal = document.getElementById('export-modal');
        modal.classList.remove('hidden');

        // Select All button
        document.getElementById('export-select-all').onclick = () => {
            modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        };

        // Cancel
        document.getElementById('export-cancel').onclick = () => {
            modal.classList.add('hidden');
        };

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };

        // Download SVGs (individual files)
        document.getElementById('export-download').onclick = () => {
            const selections = this._getExportSelections(modal);
            selections.forEach(({ view, stage }) => {
                const svgData = this._renderViewToSVG(view, stage);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tikitinker-${view}-stage${stage}.svg`;
                a.click();
                URL.revokeObjectURL(url);
            });
            modal.classList.add('hidden');
        };

        // Print Selected (opens printable page with all selected views)
        document.getElementById('export-print').onclick = () => {
            const selections = this._getExportSelections(modal);
            this._openPrintPage(selections);
            modal.classList.add('hidden');
        };
    }

    _getExportSelections(modal) {
        const selections = [];
        modal.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            selections.push({
                view: cb.dataset.view,
                stage: parseInt(cb.dataset.stage)
            });
        });
        return selections;
    }

    _renderViewToSVG(view, stage) {
        // Temporarily switch model to the requested view/stage, render, capture SVG
        const origView = this.model.view;
        const origStage = this.model.stage;
        const origGuides = this.model.overlays.guides;

        this.model.view = view;
        this.model.stage = stage;
        this.model.overlays.guides = false;

        this.render();

        const svg = document.getElementById('tiki-canvas');
        const handles = svg.querySelector('#layer-handles');
        const handlesCopy = handles ? handles.innerHTML : '';
        if (handles) handles.innerHTML = '';

        const svgData = new XMLSerializer().serializeToString(svg);

        if (handles) handles.innerHTML = handlesCopy;

        // Restore original state
        this.model.view = origView;
        this.model.stage = origStage;
        this.model.overlays.guides = origGuides;
        this.render();

        return svgData;
    }

    _openPrintPage(selections) {
        const stageNames = { 1: 'Block-in', 2: 'Rough-out', 3: 'Detail' };
        const svgs = selections.map(({ view, stage }) => ({
            svg: this._renderViewToSVG(view, stage),
            label: `${view.charAt(0).toUpperCase() + view.slice(1)} — Stage ${stage}: ${stageNames[stage]}`
        }));

        const printHTML = `<!DOCTYPE html>
<html>
<head>
    <title>TikiTinker Export</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; background: #fff; }
        .page {
            page-break-after: always;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .page:last-child { page-break-after: auto; }
        .page-label {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            text-align: center;
        }
        .page svg {
            width: 80%;
            max-height: 80vh;
            border: 1px solid #ccc;
        }
        @media print {
            .no-print { display: none; }
            .page { height: auto; min-height: 100vh; }
            .page svg { width: 90%; max-height: 85vh; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="padding:12px;background:#333;color:#fff;text-align:center;">
        <button onclick="window.print()" style="padding:8px 24px;font-size:14px;cursor:pointer;">Print All Pages</button>
        <span style="margin-left:16px;font-size:12px;">${svgs.length} view(s) selected</span>
    </div>
    ${svgs.map(({ svg, label }) => `
    <div class="page">
        <div class="page-label">${label}</div>
        ${svg}
    </div>`).join('')}
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printHTML);
        printWindow.document.close();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TikiTinkerApp();
});

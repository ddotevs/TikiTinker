// Guidelines - Proportional guide lines (adjustable, non-constraining)
// Renders center vertical, horizontal feature lines, and golden ratio overlay

export class Guidelines {
    constructor(model) {
        this.model = model;
    }

    renderGuides(layer) {
        layer.innerHTML = '';
        if (!this.model.overlays.guides) return;

        const b = this.model.svgBounds;
        const cx = b.x + b.width / 2;

        // Center vertical line
        this._line(layer, cx, b.y, cx, b.y + b.height, 'guideline-center');

        // Horizontal guidelines for each feature zone
        const guides = this.model.guides;
        const labels = [
            { frac: guides.eyeline, label: 'EYE' },
            { frac: guides.noseline, label: 'NOSE' },
            { frac: guides.mouthline, label: 'MOUTH' },
            { frac: guides.chinline, label: 'CHIN' }
        ];

        labels.forEach(({ frac, label }) => {
            const y = this.model.fracToY(frac);
            this._line(layer, b.x, y, b.x + b.width, y, 'guideline');
            this._label(layer, b.x + 4, y - 3, label);
        });
    }

    renderRatio(layer) {
        layer.innerHTML = '';
        if (!this.model.overlays.ratio) return;

        const b = this.model.svgBounds;
        const ratio = this.model.getGoldenRatioGuides();

        // Draw golden ratio reference lines in a different color
        [ratio.eyeline, ratio.noseline, ratio.mouthline].forEach(frac => {
            const y = this.model.fracToY(frac);
            this._line(layer, b.x - 10, y, b.x + b.width + 10, y, 'ratio-line');
        });

        // Draw phi markers on the side
        const phiLabel = '\u03C6';
        this._label(layer, b.x + b.width + 14, this.model.fracToY(ratio.eyeline) + 4, phiLabel, 'ratio-label');
    }

    renderGrid(layer) {
        layer.innerHTML = '';
        if (!this.model.overlays.grid) return;

        const b = this.model.svgBounds;
        const gridInfo = this.model.getGridInfo();

        const cellW = b.width / gridInfo.cols;
        const cellH = b.height / gridInfo.rows;

        // Vertical grid lines
        for (let i = 0; i <= gridInfo.cols; i++) {
            const x = b.x + i * cellW;
            this._line(layer, x, b.y, x, b.y + b.height, 'grid-line');
        }

        // Horizontal grid lines
        for (let i = 0; i <= gridInfo.rows; i++) {
            const y = b.y + i * cellH;
            this._line(layer, b.x, y, b.x + b.width, y, 'grid-line');
        }
    }

    _line(parent, x1, y1, x2, y2, className) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', className);
        parent.appendChild(line);
    }

    _label(parent, x, y, text, className = 'guide-label') {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', x);
        el.setAttribute('y', y);
        el.setAttribute('class', className);
        el.setAttribute('font-size', '8');
        el.setAttribute('fill', 'rgba(233, 69, 96, 0.6)');
        el.setAttribute('font-family', 'monospace');
        el.textContent = text;
        parent.appendChild(el);
    }
}

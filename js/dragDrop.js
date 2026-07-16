// DragDrop - Interactive feature positioning via drag on SVG canvas
// Allows dragging horizontal guide lines to reposition features vertically

export class DragDrop {
    constructor(model, renderCallback) {
        this.model = model;
        this.render = renderCallback;
        this.dragging = null;
        this.svg = null;
        this.handleLayer = null;
    }

    init(svg) {
        this.svg = svg;
        this.handleLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.handleLayer.id = 'layer-handles';
        svg.appendChild(this.handleLayer);

        svg.addEventListener('mousemove', (e) => this._onMouseMove(e));
        svg.addEventListener('mouseup', () => this._onMouseUp());
        svg.addEventListener('mouseleave', () => this._onMouseUp());

        // Touch support
        svg.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMouseMove(touch);
        });
        svg.addEventListener('touchend', () => this._onMouseUp());
    }

    renderHandles() {
        this.handleLayer.innerHTML = '';
        if (!this.model.overlays.guides) return;
        if (this.model.view !== 'front') return;

        const b = this.model.svgBounds;
        const draggableGuides = ['browline', 'eyeline', 'noseline', 'mouthline', 'chinline'];

        draggableGuides.forEach(name => {
            const y = this.model.fracToY(this.model.guides[name]);
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'drag-handle');
            group.setAttribute('data-guide', name);
            group.style.cursor = 'ns-resize';

            // Invisible wide hit area
            const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            hitArea.setAttribute('x', b.x - 15);
            hitArea.setAttribute('y', y - 8);
            hitArea.setAttribute('width', b.width + 30);
            hitArea.setAttribute('height', 16);
            hitArea.setAttribute('fill', 'transparent');
            group.appendChild(hitArea);

            // Small drag handle diamond on the left
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const hx = b.x - 12;
            handle.setAttribute('points', `${hx},${y - 5} ${hx + 5},${y} ${hx},${y + 5} ${hx - 5},${y}`);
            handle.setAttribute('class', 'handle-diamond');
            group.appendChild(handle);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', b.x + b.width + 6);
            label.setAttribute('y', y + 3);
            label.setAttribute('class', 'handle-label');
            label.textContent = name.replace('line', '').toUpperCase();
            group.appendChild(label);

            group.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.dragging = name;
                group.classList.add('dragging');
            });
            group.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.dragging = name;
                group.classList.add('dragging');
            });

            this.handleLayer.appendChild(group);
        });
    }

    _onMouseMove(e) {
        if (!this.dragging) return;

        const pt = this.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(this.svg.getScreenCTM().inverse());

        const newFrac = this.model.yToFrac(svgPt.y);
        const clamped = this.model.clampGuide(this.dragging, newFrac);
        this.model.guides[this.dragging] = clamped;

        this.render();
    }

    _onMouseUp() {
        if (this.dragging) {
            const el = this.handleLayer.querySelector('.dragging');
            if (el) el.classList.remove('dragging');
            this.dragging = null;
        }
    }
}

// Patterns - Decorative tiki fill patterns
// Generates SVG path data for decorative elements

export class Patterns {

    // Crown patterns (top of the head area)
    static crown(type, cx, y, w, h, stage) {
        if (type === 'none' || stage < 3) return [];
        const paths = [];

        switch (type) {
            case 'radiating': {
                // Lines radiating outward from center top
                const count = 9;
                const angleSpread = 140; // degrees
                const startAngle = -(angleSpread / 2) - 90;
                const radius = Math.min(w * 0.4, h);

                for (let i = 0; i < count; i++) {
                    const angle = (startAngle + (angleSpread / (count - 1)) * i) * Math.PI / 180;
                    const x2 = cx + Math.cos(angle) * radius;
                    const y2 = y + h * 0.5 + Math.sin(angle) * radius;
                    paths.push(`M ${cx} ${y + h * 0.5} L ${x2} ${y2}`);
                }
                break;
            }

            case 'fan': {
                // Sunburst fan pattern
                const count = 7;
                const fanW = w * 0.4;
                const fanH = h * 0.8;

                for (let i = 0; i < count; i++) {
                    const frac = i / (count - 1);
                    const x1 = cx - fanW + frac * fanW * 2;
                    const x2 = cx - fanW * 0.5 + frac * fanW;
                    paths.push(`M ${x2} ${y + h * 0.2} L ${x1} ${y + fanH}`);
                }
                // Arc across bottom
                paths.push(`M ${cx - fanW} ${y + fanH} Q ${cx} ${y + fanH + h * 0.15} ${cx + fanW} ${y + fanH}`);
                break;
            }

            case 'chevron': {
                // V-shaped chevron rows
                const rows = 3;
                const chevW = w * 0.35;
                for (let r = 0; r < rows; r++) {
                    const ry = y + h * 0.3 + r * h * 0.2;
                    const scale = 1 - r * 0.2;
                    paths.push(`M ${cx - chevW * scale} ${ry} L ${cx} ${ry - h * 0.12} L ${cx + chevW * scale} ${ry}`);
                }
                break;
            }

            case 'crosshatch': {
                // Cross-hatched fill in crown area
                const density = 6;
                const areaW = w * 0.35;
                const areaH = h * 0.7;
                const startX = cx - areaW;
                const startY = y + h * 0.15;

                // Diagonal lines one way
                for (let i = 0; i < density; i++) {
                    const frac = i / (density - 1);
                    paths.push(`M ${startX + frac * areaW * 2} ${startY} L ${startX + frac * areaW * 2 - areaW * 0.3} ${startY + areaH}`);
                }
                // Diagonal lines other way
                for (let i = 0; i < density; i++) {
                    const frac = i / (density - 1);
                    paths.push(`M ${startX + frac * areaW * 2} ${startY} L ${startX + frac * areaW * 2 + areaW * 0.3} ${startY + areaH}`);
                }
                break;
            }
        }
        return paths;
    }

    // Filler patterns (cheeks, chin, empty spaces)
    static filler(type, cx, cy, w, h, stage) {
        if (type === 'none' || stage < 3) return [];
        const paths = [];
        const areaW = w * 0.12;
        const areaH = h * 0.08;

        // Place filler on both cheeks
        const positions = [
            { x: cx - w * 0.32, y: cy },
            { x: cx + w * 0.32, y: cy }
        ];

        positions.forEach(pos => {
            switch (type) {
                case 'zigzag': {
                    const rows = 3;
                    for (let r = 0; r < rows; r++) {
                        const zy = pos.y - areaH + r * areaH * 0.7;
                        let d = `M ${pos.x - areaW} ${zy}`;
                        const segments = 5;
                        for (let s = 0; s <= segments; s++) {
                            const zx = pos.x - areaW + (s / segments) * areaW * 2;
                            const zy2 = zy + (s % 2 === 0 ? 0 : areaH * 0.3);
                            d += ` L ${zx} ${zy2}`;
                        }
                        paths.push(d);
                    }
                    break;
                }

                case 'spirals': {
                    // Simple spiral
                    const turns = 2.5;
                    const maxR = areaW * 0.7;
                    let d = `M ${pos.x} ${pos.y}`;
                    for (let t = 0; t <= turns * 20; t++) {
                        const angle = (t / 20) * Math.PI * 2;
                        const r = (t / (turns * 20)) * maxR;
                        const px = pos.x + Math.cos(angle) * r;
                        const py = pos.y + Math.sin(angle) * r;
                        d += ` L ${px} ${py}`;
                    }
                    paths.push(d);
                    break;
                }

                case 'concentric': {
                    // Concentric circles
                    const rings = 3;
                    for (let r = 1; r <= rings; r++) {
                        const radius = (r / rings) * areaW * 0.7;
                        paths.push(`M ${pos.x - radius} ${pos.y} A ${radius} ${radius} 0 1 1 ${pos.x + radius} ${pos.y} A ${radius} ${radius} 0 1 1 ${pos.x - radius} ${pos.y}`);
                    }
                    break;
                }

                case 'woodgrain': {
                    // Parallel curved lines (wood grain)
                    const lines = 5;
                    for (let l = 0; l < lines; l++) {
                        const ly = pos.y - areaH + (l / (lines - 1)) * areaH * 2;
                        const curve = areaW * 0.15 * (l % 2 === 0 ? 1 : -1);
                        paths.push(`M ${pos.x - areaW} ${ly} Q ${pos.x} ${ly + curve} ${pos.x + areaW} ${ly}`);
                    }
                    break;
                }
            }
        });

        return paths;
    }
}

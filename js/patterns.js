// Patterns - Decorative tiki fill patterns
// Generates SVG path data for decorative elements
// These patterns appear in stage 2 (simplified) and stage 3 (full detail)

export class Patterns {

    // Crown patterns (top of the head area — above brow ridge)
    static crown(type, cx, y, w, h, stage) {
        if (type === 'none') return [];
        if (stage < 2) return [];
        const paths = [];

        switch (type) {
            case 'radiating': {
                // Vertical parallel lines (like wood grain on a tiki forehead)
                const count = stage >= 3 ? 11 : 7;
                const areaW = w * 0.38;
                const startY = y + h * 0.15;
                const endY = y + h * 0.85;

                for (let i = 0; i < count; i++) {
                    const frac = i / (count - 1);
                    const lx = cx - areaW + frac * areaW * 2;
                    // Slight curve to follow the head shape
                    const curve = (frac - 0.5) * areaW * 0.1;
                    paths.push(`M ${lx} ${startY} Q ${lx + curve} ${(startY + endY) / 2} ${lx} ${endY}`);
                }

                // Horizontal divider line at top
                if (stage >= 3) {
                    paths.push(`M ${cx - areaW} ${startY} L ${cx + areaW} ${startY}`);
                    paths.push(`M ${cx - areaW * 0.9} ${endY} L ${cx + areaW * 0.9} ${endY}`);
                }
                break;
            }

            case 'fan': {
                // Sunburst/fan radiating from a center point
                const count = stage >= 3 ? 9 : 5;
                const centerY = y + h * 0.75;
                const radius = h * 0.7;

                for (let i = 0; i < count; i++) {
                    const frac = i / (count - 1);
                    const angle = (-70 + frac * 140) * Math.PI / 180;
                    const x2 = cx + Math.cos(angle) * radius * (w / h) * 0.5;
                    const y2 = centerY - Math.sin(angle) * radius;
                    paths.push(`M ${cx} ${centerY} L ${x2} ${y2}`);
                }

                // Arc at the base of the fan
                if (stage >= 3) {
                    const arcR = h * 0.15;
                    paths.push(`M ${cx - w * 0.3} ${centerY} Q ${cx} ${centerY + arcR} ${cx + w * 0.3} ${centerY}`);
                }
                break;
            }

            case 'chevron': {
                // V-shaped chevron rows (classic tiki crown pattern)
                const rows = stage >= 3 ? 4 : 2;
                const chevW = w * 0.35;
                const rowH = h * 0.8 / rows;

                for (let r = 0; r < rows; r++) {
                    const ry = y + h * 0.1 + r * rowH + rowH / 2;
                    const scale = 1 - r * 0.05;
                    paths.push(`M ${cx - chevW * scale} ${ry + rowH * 0.3}
                        L ${cx} ${ry}
                        L ${cx + chevW * scale} ${ry + rowH * 0.3}`);
                }

                // Side border lines
                if (stage >= 3) {
                    paths.push(`M ${cx - w * 0.37} ${y + h * 0.1} L ${cx - w * 0.37} ${y + h * 0.9}`);
                    paths.push(`M ${cx + w * 0.37} ${y + h * 0.1} L ${cx + w * 0.37} ${y + h * 0.9}`);
                }
                break;
            }

            case 'crosshatch': {
                // Diamond crosshatch pattern
                const density = stage >= 3 ? 7 : 4;
                const areaW = w * 0.32;
                const areaH = h * 0.7;
                const startX = cx - areaW;
                const startY = y + h * 0.15;

                for (let i = 0; i < density; i++) {
                    const frac = i / (density - 1);
                    const offset = frac * areaW * 2;
                    // Diagonal one way
                    paths.push(`M ${startX + offset} ${startY} L ${startX + offset - areaH * 0.3} ${startY + areaH}`);
                    // Diagonal other way
                    paths.push(`M ${startX + offset} ${startY} L ${startX + offset + areaH * 0.3} ${startY + areaH}`);
                }
                break;
            }
        }
        return paths;
    }

    // Filler patterns (cheeks, empty spaces between features)
    static filler(type, cx, cy, w, h, stage) {
        if (type === 'none') return [];
        if (stage < 2) return [];
        const paths = [];
        const areaW = w * 0.10;
        const areaH = h * 0.06;

        // Place filler on both cheeks (outside the nose/eye area)
        const positions = [
            { x: cx - w * 0.35, y: cy },
            { x: cx + w * 0.35, y: cy }
        ];

        positions.forEach(pos => {
            switch (type) {
                case 'zigzag': {
                    const rows = stage >= 3 ? 4 : 2;
                    for (let r = 0; r < rows; r++) {
                        const zy = pos.y - areaH + r * areaH * 0.6;
                        const segments = 5;
                        let d = `M ${pos.x - areaW} ${zy}`;
                        for (let s = 1; s <= segments; s++) {
                            const zx = pos.x - areaW + (s / segments) * areaW * 2;
                            const zy2 = zy + (s % 2 === 0 ? 0 : areaH * 0.25);
                            d += ` L ${zx} ${zy2}`;
                        }
                        paths.push(d);
                    }
                    break;
                }

                case 'spirals': {
                    // Koru-style spiral (Polynesian motif)
                    const turns = stage >= 3 ? 2.0 : 1.2;
                    const maxR = areaW * 0.6;
                    let d = `M ${pos.x} ${pos.y}`;
                    const steps = Math.floor(turns * 24);
                    for (let t = 1; t <= steps; t++) {
                        const angle = (t / 24) * Math.PI * 2;
                        const r = (t / steps) * maxR;
                        const px = pos.x + Math.cos(angle) * r;
                        const py = pos.y + Math.sin(angle) * r;
                        d += ` L ${px} ${py}`;
                    }
                    paths.push(d);

                    // Second spiral (mirrored) for stage 3
                    if (stage >= 3) {
                        let d2 = `M ${pos.x} ${pos.y + areaH * 1.2}`;
                        for (let t = 1; t <= steps; t++) {
                            const angle = -(t / 24) * Math.PI * 2;
                            const r = (t / steps) * maxR * 0.7;
                            const px = pos.x + Math.cos(angle) * r;
                            const py = pos.y + areaH * 1.2 + Math.sin(angle) * r;
                            d2 += ` L ${px} ${py}`;
                        }
                        paths.push(d2);
                    }
                    break;
                }

                case 'concentric': {
                    // Concentric ovals (target pattern)
                    const rings = stage >= 3 ? 4 : 2;
                    for (let r = 1; r <= rings; r++) {
                        const rx = (r / rings) * areaW * 0.7;
                        const ry = (r / rings) * areaH * 0.6;
                        paths.push(`M ${pos.x - rx} ${pos.y}
                            A ${rx} ${ry} 0 1 1 ${pos.x + rx} ${pos.y}
                            A ${rx} ${ry} 0 1 1 ${pos.x - rx} ${pos.y}`);
                    }
                    break;
                }

                case 'woodgrain': {
                    // Parallel curved lines following wood grain
                    const lines = stage >= 3 ? 6 : 3;
                    for (let l = 0; l < lines; l++) {
                        const ly = pos.y - areaH + (l / (lines - 1)) * areaH * 2;
                        const curve = areaW * 0.2 * Math.sin(l * 0.8);
                        paths.push(`M ${pos.x - areaW} ${ly}
                            Q ${pos.x} ${ly + curve} ${pos.x + areaW} ${ly}`);
                    }
                    break;
                }
            }
        });

        return paths;
    }
}

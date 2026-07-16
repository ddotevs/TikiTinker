// Feature Library - Prebaked SVG path generators for all tiki facial features
// Each function returns SVG path data (d attribute) given position and parameters

export class FeatureLibrary {

    // ─── FACE OUTLINE ───────────────────────────────────────────────────────────
    static faceOutline(bounds, stage) {
        const { x, y, width: w, height: h } = bounds;
        const cx = x + w / 2;
        const r = w / 2;

        if (stage === 1) {
            // Stage 1: blocky trapezoid shape
            const topInset = w * 0.08;
            return `M ${x + topInset} ${y}
                    L ${x + w - topInset} ${y}
                    L ${x + w} ${y + h * 0.15}
                    L ${x + w} ${y + h * 0.85}
                    L ${x + w - topInset} ${y + h}
                    L ${x + topInset} ${y + h}
                    L ${x} ${y + h * 0.85}
                    L ${x} ${y + h * 0.15}
                    Z`;
        }

        // Stage 2+: slightly curved tiki head shape (wider at top, narrowing at chin)
        const topW = w * 0.92;
        const midW = w * 0.98;
        const botW = w * 0.75;
        const topOff = (w - topW) / 2;
        const midOff = (w - midW) / 2;
        const botOff = (w - botW) / 2;

        return `M ${x + topOff} ${y}
                L ${x + w - topOff} ${y}
                Q ${x + w} ${y + h * 0.1} ${x + w - midOff} ${y + h * 0.35}
                L ${x + w - midOff} ${y + h * 0.6}
                Q ${x + w - midOff} ${y + h * 0.8} ${x + w - botOff} ${y + h * 0.9}
                L ${x + w - botOff} ${y + h}
                L ${x + botOff} ${y + h}
                L ${x + botOff} ${y + h * 0.9}
                Q ${x + midOff} ${y + h * 0.8} ${x + midOff} ${y + h * 0.6}
                L ${x + midOff} ${y + h * 0.35}
                Q ${x} ${y + h * 0.1} ${x + topOff} ${y}
                Z`;
    }

    // ─── SIDE PROFILE ───────────────────────────────────────────────────────────
    static sideProfile(bounds, model, stage) {
        const { x, y, width: w, height: h } = bounds;
        const nose = model.features.nose;
        const noseProj = w * (0.3 + nose.width / 200);
        const browProj = w * 0.15;
        const chinProj = w * 0.1;
        const noseY = model.fracToY(model.guides.noseline) - y;
        const eyeY = model.fracToY(model.guides.eyeline) - y;
        const mouthY = model.fracToY(model.guides.mouthline) - y;

        if (stage === 1) {
            return `M ${x + w * 0.3} ${y}
                    L ${x + w * 0.7} ${y}
                    L ${x + w * 0.7} ${y + eyeY}
                    L ${x + w * 0.6} ${y + eyeY + h * 0.05}
                    L ${x + w * 0.6 + noseProj * 0.5} ${y + noseY}
                    L ${x + w * 0.6} ${y + mouthY}
                    L ${x + w * 0.6} ${y + h}
                    L ${x + w * 0.3} ${y + h}
                    Z`;
        }

        // Stage 2+: more detailed profile
        return `M ${x + w * 0.35} ${y}
                L ${x + w * 0.65} ${y}
                C ${x + w * 0.7} ${y + h * 0.05} ${x + w * 0.68 + browProj} ${y + eyeY - h * 0.05} ${x + w * 0.6 + browProj} ${y + eyeY}
                L ${x + w * 0.55} ${y + eyeY + h * 0.04}
                C ${x + w * 0.55} ${y + noseY - h * 0.1} ${x + w * 0.6 + noseProj} ${y + noseY - h * 0.05} ${x + w * 0.6 + noseProj} ${y + noseY}
                L ${x + w * 0.55} ${y + noseY + h * 0.03}
                C ${x + w * 0.55} ${y + mouthY - h * 0.02} ${x + w * 0.58} ${y + mouthY} ${x + w * 0.56} ${y + mouthY + h * 0.03}
                C ${x + w * 0.54} ${y + mouthY + h * 0.06} ${x + w * 0.5 + chinProj} ${y + h * 0.85} ${x + w * 0.5} ${y + h * 0.92}
                L ${x + w * 0.45} ${y + h}
                L ${x + w * 0.35} ${y + h}
                L ${x + w * 0.35} ${y}
                Z`;
    }

    // ─── EYES ───────────────────────────────────────────────────────────────────
    static eyes(type, cx, cy, w, h, params, stage) {
        const spacing = w * (0.15 + params.spacing / 200);
        const eyeW = w * 0.18;
        const eyeH = h * 0.06;
        const angle = params.angle;
        const paths = [];

        [-1, 1].forEach(side => {
            const ex = cx + side * spacing;
            const ey = cy;
            const path = this._singleEye(type, ex, ey, eyeW, eyeH, angle * side, params.pupil, stage);
            paths.push(path);
        });

        return paths;
    }

    static _singleEye(type, cx, cy, w, h, angle, pupil, stage) {
        const result = { outline: '', fill: '' };

        if (stage === 1) {
            // Block-in: just a rectangular socket
            result.outline = `M ${cx - w} ${cy - h} L ${cx + w} ${cy - h} L ${cx + w} ${cy + h} L ${cx - w} ${cy + h} Z`;
            result.fill = result.outline;
            return result;
        }

        switch (type) {
            case 'open':
                // Almond/oval eye typical of tiki
                result.outline = `M ${cx - w} ${cy}
                    Q ${cx - w * 0.5} ${cy - h * 1.4} ${cx} ${cy - h}
                    Q ${cx + w * 0.5} ${cy - h * 1.4} ${cx + w} ${cy}
                    Q ${cx + w * 0.5} ${cy + h * 1.4} ${cx} ${cy + h}
                    Q ${cx - w * 0.5} ${cy + h * 1.4} ${cx - w} ${cy} Z`;
                // Pupil
                const pr = w * pupil / 200;
                result.fill = `M ${cx - pr} ${cy} A ${pr} ${pr * 0.8} 0 1 1 ${cx + pr} ${cy} A ${pr} ${pr * 0.8} 0 1 1 ${cx - pr} ${cy} Z`;
                break;

            case 'closed':
                result.outline = `M ${cx - w} ${cy}
                    Q ${cx} ${cy + h * 0.8} ${cx + w} ${cy}`;
                result.fill = '';
                break;

            case 'squinting':
                result.outline = `M ${cx - w} ${cy}
                    Q ${cx} ${cy - h * 0.6} ${cx + w} ${cy}
                    Q ${cx} ${cy + h * 0.6} ${cx - w} ${cy} Z`;
                result.fill = `M ${cx - w * 0.3} ${cy} Q ${cx} ${cy - h * 0.3} ${cx + w * 0.3} ${cy} Q ${cx} ${cy + h * 0.3} ${cx - w * 0.3} ${cy} Z`;
                break;

            case 'round':
                // Big circular tiki eyes
                result.outline = `M ${cx} ${cy - h * 1.2}
                    A ${w * 0.9} ${h * 1.2} 0 1 1 ${cx} ${cy + h * 1.2}
                    A ${w * 0.9} ${h * 1.2} 0 1 1 ${cx} ${cy - h * 1.2} Z`;
                const rp = w * pupil / 180;
                result.fill = `M ${cx} ${cy - rp} A ${rp} ${rp} 0 1 1 ${cx} ${cy + rp} A ${rp} ${rp} 0 1 1 ${cx} ${cy - rp} Z`;
                break;

            case 'square':
                // Angular blocky tiki eyes
                const sw = w * 0.9, sh = h * 1.1;
                result.outline = `M ${cx - sw} ${cy - sh} L ${cx + sw} ${cy - sh} L ${cx + sw} ${cy + sh} L ${cx - sw} ${cy + sh} Z`;
                const sp = w * pupil / 250;
                result.fill = `M ${cx - sp} ${cy - sp} L ${cx + sp} ${cy - sp} L ${cx + sp} ${cy + sp} L ${cx - sp} ${cy + sp} Z`;
                break;
        }

        return result;
    }

    // ─── EYEBROWS ────────────────────────────────────────────────────────────────
    static eyebrows(type, cx, cy, w, h, params, stage) {
        if (type === 'none') return [];
        const spacing = w * 0.25;
        const browW = w * 0.2;
        const thickness = h * 0.015 * (params.thickness / 50);
        const paths = [];

        if (stage === 1) {
            // Block-in: simple angular lines
            [-1, 1].forEach(side => {
                const bx = cx + side * spacing;
                paths.push(`M ${bx - browW} ${cy} L ${bx + browW} ${cy}`);
            });
            return paths;
        }

        [-1, 1].forEach(side => {
            const bx = cx + side * spacing;
            let path = '';

            switch (type) {
                case 'angry':
                    // Inner end lower, outer end higher — V shape
                    path = `M ${bx - browW * side} ${cy + thickness}
                            Q ${bx} ${cy - thickness * 2} ${bx + browW * side} ${cy - thickness * 1.5}
                            L ${bx + browW * side} ${cy - thickness * 2.5}
                            Q ${bx} ${cy - thickness * 3} ${bx - browW * side} ${cy}
                            Z`;
                    break;
                case 'laughing':
                    // Arched upward
                    path = `M ${bx - browW} ${cy}
                            Q ${bx} ${cy - thickness * 4} ${bx + browW} ${cy}
                            L ${bx + browW} ${cy + thickness}
                            Q ${bx} ${cy - thickness * 3} ${bx - browW} ${cy + thickness}
                            Z`;
                    break;
                case 'sad':
                    // Drooping outer end
                    path = `M ${bx - browW} ${cy - thickness}
                            Q ${bx} ${cy - thickness * 2} ${bx + browW} ${cy + thickness * 2}
                            L ${bx + browW} ${cy + thickness * 3}
                            Q ${bx} ${cy - thickness} ${bx - browW} ${cy}
                            Z`;
                    break;
            }
            paths.push(path);
        });

        return paths;
    }

    // ─── NOSE ────────────────────────────────────────────────────────────────────
    static nose(type, cx, cy, w, h, params, stage) {
        const noseW = w * (0.08 + params.width / 300);
        const nostrilW = noseW * (params.nostril / 60);
        const noseH = h * 0.08;

        if (stage === 1) {
            // Block-in: simple triangle/trapezoid
            return {
                outline: `M ${cx} ${cy - noseH} L ${cx + noseW} ${cy + noseH} L ${cx - noseW} ${cy + noseH} Z`,
                fill: ''
            };
        }

        switch (type) {
            case 'round':
                return {
                    outline: `M ${cx} ${cy - noseH}
                        C ${cx + noseW * 0.3} ${cy - noseH * 0.5} ${cx + noseW * 0.8} ${cy + noseH * 0.3} ${cx + noseW} ${cy + noseH * 0.7}
                        Q ${cx + nostrilW} ${cy + noseH * 1.2} ${cx} ${cy + noseH}
                        Q ${cx - nostrilW} ${cy + noseH * 1.2} ${cx - noseW} ${cy + noseH * 0.7}
                        C ${cx - noseW * 0.8} ${cy + noseH * 0.3} ${cx - noseW * 0.3} ${cy - noseH * 0.5} ${cx} ${cy - noseH} Z`,
                    nostrils: `M ${cx - nostrilW * 0.7} ${cy + noseH * 0.5}
                        A ${nostrilW * 0.4} ${noseH * 0.25} 0 1 1 ${cx - nostrilW * 0.7} ${cy + noseH * 0.51} Z
                        M ${cx + nostrilW * 0.7} ${cy + noseH * 0.5}
                        A ${nostrilW * 0.4} ${noseH * 0.25} 0 1 1 ${cx + nostrilW * 0.7} ${cy + noseH * 0.51} Z`
                };

            case 'blocky':
                return {
                    outline: `M ${cx - noseW * 0.4} ${cy - noseH}
                        L ${cx + noseW * 0.4} ${cy - noseH}
                        L ${cx + noseW * 0.5} ${cy + noseH * 0.5}
                        L ${cx + noseW} ${cy + noseH * 0.7}
                        L ${cx + noseW} ${cy + noseH}
                        L ${cx - noseW} ${cy + noseH}
                        L ${cx - noseW} ${cy + noseH * 0.7}
                        L ${cx - noseW * 0.5} ${cy + noseH * 0.5}
                        Z`,
                    nostrils: `M ${cx - nostrilW * 0.6} ${cy + noseH * 0.6}
                        L ${cx - nostrilW * 0.2} ${cy + noseH * 0.6}
                        L ${cx - nostrilW * 0.2} ${cy + noseH * 0.85}
                        L ${cx - nostrilW * 0.6} ${cy + noseH * 0.85} Z
                        M ${cx + nostrilW * 0.2} ${cy + noseH * 0.6}
                        L ${cx + nostrilW * 0.6} ${cy + noseH * 0.6}
                        L ${cx + nostrilW * 0.6} ${cy + noseH * 0.85}
                        L ${cx + nostrilW * 0.2} ${cy + noseH * 0.85} Z`
                };
        }
    }

    // ─── MOUTH ───────────────────────────────────────────────────────────────────
    static mouth(type, cx, cy, w, h, params, stage) {
        const mouthW = w * (params.width / 150);
        const mouthH = h * 0.05;

        if (stage === 1) {
            return {
                outline: `M ${cx - mouthW} ${cy} L ${cx + mouthW} ${cy} L ${cx + mouthW} ${cy + mouthH} L ${cx - mouthW} ${cy + mouthH} Z`,
                fill: `M ${cx - mouthW} ${cy} L ${cx + mouthW} ${cy} L ${cx + mouthW} ${cy + mouthH} L ${cx - mouthW} ${cy + mouthH} Z`
            };
        }

        switch (type) {
            case 'open':
                return {
                    outline: `M ${cx - mouthW} ${cy}
                        Q ${cx - mouthW * 0.5} ${cy - mouthH * 0.3} ${cx} ${cy - mouthH * 0.2}
                        Q ${cx + mouthW * 0.5} ${cy - mouthH * 0.3} ${cx + mouthW} ${cy}
                        Q ${cx + mouthW * 0.7} ${cy + mouthH * 1.5} ${cx} ${cy + mouthH * 1.8}
                        Q ${cx - mouthW * 0.7} ${cy + mouthH * 1.5} ${cx - mouthW} ${cy} Z`,
                    fill: `M ${cx - mouthW * 0.85} ${cy + mouthH * 0.2}
                        Q ${cx} ${cy + mouthH * 1.5} ${cx + mouthW * 0.85} ${cy + mouthH * 0.2}
                        Q ${cx} ${cy + mouthH * 1.6} ${cx - mouthW * 0.85} ${cy + mouthH * 0.2} Z`
                };

            case 'closed':
                return {
                    outline: `M ${cx - mouthW} ${cy}
                        Q ${cx} ${cy + mouthH * 0.3} ${cx + mouthW} ${cy}`,
                    fill: ''
                };

            case 'smiling':
                return {
                    outline: `M ${cx - mouthW} ${cy}
                        Q ${cx} ${cy + mouthH * 2.5} ${cx + mouthW} ${cy}
                        Q ${cx} ${cy + mouthH * 1.8} ${cx - mouthW} ${cy} Z`,
                    fill: `M ${cx - mouthW * 0.7} ${cy + mouthH * 0.5}
                        Q ${cx} ${cy + mouthH * 2} ${cx + mouthW * 0.7} ${cy + mouthH * 0.5} Z`
                };

            case 'frowning':
                return {
                    outline: `M ${cx - mouthW} ${cy + mouthH}
                        Q ${cx} ${cy - mouthH * 1.5} ${cx + mouthW} ${cy + mouthH}
                        Q ${cx} ${cy + mouthH * 0.5} ${cx - mouthW} ${cy + mouthH} Z`,
                    fill: `M ${cx - mouthW * 0.6} ${cy + mouthH * 0.5}
                        Q ${cx} ${cy - mouthH * 0.8} ${cx + mouthW * 0.6} ${cy + mouthH * 0.5} Z`
                };
        }
    }

    // ─── TEETH ───────────────────────────────────────────────────────────────────
    static teeth(type, cx, cy, w, h, params, mouthWidth) {
        if (type === 'none') return [];
        const mouthW = w * (mouthWidth / 150);
        const toothSize = h * 0.02 * (params.size / 50);
        const paths = [];

        switch (type) {
            case 'normal': {
                const count = 6;
                const tw = (mouthW * 1.4) / count;
                const startX = cx - (count / 2) * tw + tw / 2;
                for (let i = 0; i < count; i++) {
                    const tx = startX + i * tw;
                    paths.push(`M ${tx - tw * 0.4} ${cy}
                        L ${tx + tw * 0.4} ${cy}
                        L ${tx + tw * 0.4} ${cy + toothSize}
                        L ${tx - tw * 0.4} ${cy + toothSize} Z`);
                }
                break;
            }
            case 'buck': {
                // Two large front teeth
                const tw = mouthW * 0.3;
                [-1, 1].forEach(side => {
                    const tx = cx + side * tw * 0.5;
                    paths.push(`M ${tx - tw * 0.4} ${cy}
                        L ${tx + tw * 0.4} ${cy}
                        L ${tx + tw * 0.35} ${cy + toothSize * 2}
                        L ${tx - tw * 0.35} ${cy + toothSize * 2} Z`);
                });
                break;
            }
            case 'deep': {
                // Teeth set back, visible deep in mouth
                const count = 5;
                const tw = (mouthW * 1.2) / count;
                const startX = cx - (count / 2) * tw + tw / 2;
                const offset = h * 0.015;
                for (let i = 0; i < count; i++) {
                    const tx = startX + i * tw;
                    paths.push(`M ${tx - tw * 0.35} ${cy + offset}
                        L ${tx + tw * 0.35} ${cy + offset}
                        L ${tx + tw * 0.35} ${cy + offset + toothSize * 0.8}
                        L ${tx - tw * 0.35} ${cy + offset + toothSize * 0.8} Z`);
                }
                break;
            }
            case 'setback': {
                // Teeth behind lip line - smaller and recessed
                const count = 8;
                const tw = (mouthW * 1.0) / count;
                const startX = cx - (count / 2) * tw + tw / 2;
                const offset = h * 0.01;
                for (let i = 0; i < count; i++) {
                    const tx = startX + i * tw;
                    paths.push(`M ${tx - tw * 0.3} ${cy + offset}
                        L ${tx + tw * 0.3} ${cy + offset}
                        L ${tx + tw * 0.3} ${cy + offset + toothSize * 0.5}
                        L ${tx - tw * 0.3} ${cy + offset + toothSize * 0.5} Z`);
                }
                break;
            }
        }
        return paths;
    }

    // ─── TONGUE ──────────────────────────────────────────────────────────────────
    static tongue(type, cx, cy, w, h, params) {
        if (type === 'none') return '';
        const tongueW = w * 0.08;
        const tongueH = h * (type === 'out' ? 0.08 : 0.035);

        // Direction offset
        let dx = 0, dy = 0;
        switch (params.direction) {
            case 'left': dx = -tongueW * 0.8; break;
            case 'right': dx = tongueW * 0.8; break;
            case 'up': dy = -tongueH * 0.5; break;
        }

        const tx = cx + dx;
        const ty = cy + dy;

        switch (params.shape) {
            case 'round':
                return `M ${tx - tongueW} ${ty}
                    Q ${tx - tongueW} ${ty + tongueH} ${tx} ${ty + tongueH * 1.2}
                    Q ${tx + tongueW} ${ty + tongueH} ${tx + tongueW} ${ty}
                    Z`;
            case 'sharp':
                return `M ${tx - tongueW} ${ty}
                    L ${tx} ${ty + tongueH * 1.5}
                    L ${tx + tongueW} ${ty}
                    Z`;
            case 'snake':
                // Forked tongue
                return `M ${tx - tongueW * 0.4} ${ty}
                    L ${tx - tongueW * 0.3} ${ty + tongueH * 0.8}
                    L ${tx - tongueW * 0.6} ${ty + tongueH * 1.4}
                    M ${tx - tongueW * 0.3} ${ty + tongueH * 0.8}
                    L ${tx} ${ty + tongueH * 1.4}
                    M ${tx + tongueW * 0.4} ${ty}
                    L ${tx + tongueW * 0.3} ${ty + tongueH * 0.8}
                    L ${tx + tongueW * 0.6} ${ty + tongueH * 1.4}
                    M ${tx + tongueW * 0.3} ${ty + tongueH * 0.8}
                    L ${tx} ${ty + tongueH * 1.4}`;
        }
    }
}

// Feature Library - Detailed tiki-style SVG path generators
// Based on traditional Polynesian tiki carving aesthetics:
// - Heavy brow ridges forming connected V-shapes
// - Almond/oval eyes with double outlines
// - Wide triangular noses with prominent nostrils
// - Thick-lipped rectangular mouths
// - Squared rectangular teeth

export class FeatureLibrary {

    // ─── FACE OUTLINE ───────────────────────────────────────────────────────────
    // Default: straight-sided log shape (rectangle with slight top taper)
    static faceOutline(bounds, stage) {
        const { x, y, width: w, height: h } = bounds;

        if (stage === 1) {
            // Pure rectangle — the raw log cross-section
            return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
        }

        // Stage 2+: slight taper at top (wider at forehead, narrower at chin)
        // but still mostly straight — it's a log
        const topInset = w * 0.02;
        const botInset = w * 0.04;
        return `M ${x + topInset} ${y}
                L ${x + w - topInset} ${y}
                L ${x + w - botInset * 0.5} ${y + h * 0.7}
                L ${x + w - botInset} ${y + h}
                L ${x + botInset} ${y + h}
                L ${x + botInset * 0.5} ${y + h * 0.7}
                Z`;
    }

    // ─── SIDE PROFILE ───────────────────────────────────────────────────────────
    // The side view shows the SAME width as front (it's a round log).
    // The profile only cuts into the FRONT HALF (from front surface toward center).
    // "front" = right edge of the bounding box. Cuts go leftward (into the log).
    // The back half (left side) stays as the uncarved log wall.
    //
    // CRITICAL RULE: Each stage can ONLY remove more wood than the previous.
    // Stage 1 = shallowest cuts (closest to front surface)
    // Stage 2 = deeper cuts (further from front, refining shape)
    // Stage 3 = deepest cuts (final surface with all detail)
    // At every Y position, the profile must be EQUAL TO or FURTHER from the front
    // as stage number increases.
    static sideProfile(bounds, model, stage) {
        const { x, y, width: w, height: h } = bounds;

        // Key positions (Y coordinates)
        const browYpos = y + h * model.guides.browline;
        const eyeYpos = y + h * model.guides.eyeline;
        const noseYpos = y + h * model.guides.noseline;
        const mouthYpos = y + h * model.guides.mouthline;
        const chinYpos = y + h * model.guides.chinline;

        // The front surface is at the right edge (x + w).
        // Max carve depth = half the diameter (to center of log) = w/2
        const front = x + w;
        const back = x;

        // Face plane: general carved surface (where flat areas end up)
        const facePlane = front - w * 0.08;

        // Depth values PER STAGE — each stage goes deeper (further left/into log)
        // Stage 1: conservative shallow cuts — just the major planes
        // Stage 2: moderate depth — features take shape
        // Stage 3: deepest — final carved surface
        const depths = {
            1: {
                brow: w * 0.03,      // brow barely projects
                eye: w * 0.05,       // shallow eye socket
                noseProj: w * 0.04,  // nose barely sticks out
                mouth: w * 0.04,     // shallow mouth cut
                chin: w * 0.02       // minimal chin
            },
            2: {
                brow: w * 0.05,
                eye: w * 0.10,
                noseProj: w * (0.04 + model.features.nose.width / 800),
                mouth: w * 0.08,
                chin: w * 0.03
            },
            3: {
                brow: w * 0.06,
                eye: w * 0.12,
                noseProj: w * (0.05 + model.features.nose.width / 600),
                mouth: w * 0.10,
                chin: w * 0.04
            }
        };

        const d = depths[stage];

        // Profile points (X position at each feature height)
        // Higher X = closer to front surface = less wood removed
        // Lower X = deeper into log = more wood removed
        const browX = facePlane + d.brow;     // brow projects forward
        const eyeX = facePlane - d.eye;       // eye sockets are carved IN
        const noseX = facePlane + d.noseProj; // nose projects forward (most forward point)
        const mouthX = facePlane - d.mouth;   // mouth carved IN
        const chinX = facePlane - d.chin;     // chin slightly recessed

        const paths = [];

        // Full log outline (always present)
        paths.push(`M ${back} ${y} L ${front} ${y} L ${front} ${y + h} L ${back} ${y + h} Z`);

        if (stage === 1) {
            // Block-in: angular straight-line cuts (the first bandsaw/rough cuts)
            paths.push(`M ${facePlane} ${y}
                L ${browX} ${browYpos}
                L ${eyeX} ${eyeYpos}
                L ${noseX} ${noseYpos}
                L ${mouthX} ${mouthYpos}
                L ${chinX} ${chinYpos}
                L ${facePlane} ${y + h}`);
        } else {
            // Stage 2+: smooth curves between the same control points
            // The curves go AT LEAST as deep as the angular Stage 1 cuts at every point
            paths.push(`M ${facePlane} ${y}
                C ${facePlane} ${y + (browYpos - y) * 0.5}
                  ${browX} ${browYpos - h * 0.02}
                  ${browX} ${browYpos}
                C ${browX - d.brow * 0.5} ${browYpos + (eyeYpos - browYpos) * 0.3}
                  ${eyeX + d.eye * 0.3} ${eyeYpos - (eyeYpos - browYpos) * 0.2}
                  ${eyeX} ${eyeYpos}
                C ${eyeX} ${eyeYpos + (noseYpos - eyeYpos) * 0.2}
                  ${noseX - d.noseProj * 0.5} ${noseYpos - (noseYpos - eyeYpos) * 0.3}
                  ${noseX} ${noseYpos}
                C ${noseX - d.noseProj * 0.3} ${noseYpos + h * 0.02}
                  ${facePlane - d.mouth * 0.3} ${noseYpos + (mouthYpos - noseYpos) * 0.4}
                  ${mouthX} ${mouthYpos}
                C ${mouthX + d.mouth * 0.3} ${mouthYpos + (chinYpos - mouthYpos) * 0.4}
                  ${chinX - d.chin * 0.2} ${chinYpos - (chinYpos - mouthYpos) * 0.2}
                  ${chinX} ${chinYpos}
                C ${chinX + d.chin * 0.3} ${chinYpos + (y + h - chinYpos) * 0.4}
                  ${facePlane} ${y + h - h * 0.02}
                  ${facePlane} ${y + h}`);
        }

        return paths;
    }

    // ─── BROW RIDGE ──────────────────────────────────────────────────────────────
    // The signature tiki feature: heavy V-shaped ridges above eyes connecting to nose
    static browRidge(type, cx, browY, eyeY, w, h, params, stage) {
        if (type === 'none') return [];
        const paths = [];
        const ridgeH = (eyeY - browY) * 0.8;
        const thickness = ridgeH * (params.thickness / 60);
        const halfW = w * 0.42;
        const innerW = w * 0.06;

        if (stage === 1) {
            // Block-in: simple V
            paths.push({
                d: `M ${cx - halfW} ${browY}
                    L ${cx} ${eyeY - ridgeH * 0.2}
                    L ${cx + halfW} ${browY}`,
                cls: 'feature-path'
            });
            return paths;
        }

        switch (type) {
            case 'angry': {
                // Heavy V-ridge — outer line
                paths.push({
                    d: `M ${cx - halfW} ${browY - thickness * 0.3}
                        C ${cx - halfW * 0.6} ${browY + ridgeH * 0.2} ${cx - innerW * 2} ${eyeY - ridgeH * 0.6} ${cx} ${eyeY - ridgeH * 0.3}
                        C ${cx + innerW * 2} ${eyeY - ridgeH * 0.6} ${cx + halfW * 0.6} ${browY + ridgeH * 0.2} ${cx + halfW} ${browY - thickness * 0.3}
                        L ${cx + halfW} ${browY + thickness * 0.5}
                        C ${cx + halfW * 0.6} ${browY + ridgeH * 0.5} ${cx + innerW * 3} ${eyeY - ridgeH * 0.2} ${cx} ${eyeY + thickness * 0.3}
                        C ${cx - innerW * 3} ${eyeY - ridgeH * 0.2} ${cx - halfW * 0.6} ${browY + ridgeH * 0.5} ${cx - halfW} ${browY + thickness * 0.5}
                        Z`,
                    cls: 'feature-path'
                });
                // Inner detail line
                if (stage >= 3) {
                    paths.push({
                        d: `M ${cx - halfW * 0.85} ${browY + thickness * 0.1}
                            C ${cx - halfW * 0.5} ${browY + ridgeH * 0.35} ${cx - innerW * 2.5} ${eyeY - ridgeH * 0.4} ${cx} ${eyeY - ridgeH * 0.1}
                            C ${cx + innerW * 2.5} ${eyeY - ridgeH * 0.4} ${cx + halfW * 0.5} ${browY + ridgeH * 0.35} ${cx + halfW * 0.85} ${browY + thickness * 0.1}`,
                        cls: 'decoration-path'
                    });
                }
                break;
            }
            case 'laughing': {
                // Arched upward — less menacing
                paths.push({
                    d: `M ${cx - halfW} ${eyeY - ridgeH * 0.5}
                        Q ${cx - halfW * 0.5} ${browY - thickness} ${cx} ${browY - thickness * 0.5}
                        Q ${cx + halfW * 0.5} ${browY - thickness} ${cx + halfW} ${eyeY - ridgeH * 0.5}
                        L ${cx + halfW} ${eyeY - ridgeH * 0.2}
                        Q ${cx + halfW * 0.5} ${browY + thickness * 0.5} ${cx} ${browY + thickness}
                        Q ${cx - halfW * 0.5} ${browY + thickness * 0.5} ${cx - halfW} ${eyeY - ridgeH * 0.2}
                        Z`,
                    cls: 'feature-path'
                });
                break;
            }
            case 'sad': {
                // Inverted — drooping outer ends
                paths.push({
                    d: `M ${cx - halfW} ${eyeY - ridgeH * 0.1}
                        Q ${cx - halfW * 0.5} ${browY + ridgeH * 0.5} ${cx} ${browY}
                        Q ${cx + halfW * 0.5} ${browY + ridgeH * 0.5} ${cx + halfW} ${eyeY - ridgeH * 0.1}
                        L ${cx + halfW} ${eyeY + thickness * 0.3}
                        Q ${cx + halfW * 0.5} ${browY + ridgeH * 0.8} ${cx} ${browY + thickness}
                        Q ${cx - halfW * 0.5} ${browY + ridgeH * 0.8} ${cx - halfW} ${eyeY + thickness * 0.3}
                        Z`,
                    cls: 'feature-path'
                });
                break;
            }
        }

        return paths;
    }

    // ─── EYES ───────────────────────────────────────────────────────────────────
    static eyes(type, cx, cy, w, h, params, stage) {
        const spacing = w * (0.14 + params.spacing / 250);
        const eyeW = w * (0.10 + params.scale / 500);
        const eyeH = h * (0.028 + params.scale / 2000);
        const paths = [];

        [-1, 1].forEach(side => {
            const ex = cx + side * spacing;
            const eyePaths = this._singleEye(type, ex, cy, eyeW, eyeH, params.angle * side, params.pupil, stage);
            paths.push(...eyePaths);
        });

        return paths;
    }

    static _singleEye(type, cx, cy, w, h, angle, pupil, stage) {
        const paths = [];

        if (stage === 1) {
            // Block-in: rectangular socket cut
            paths.push({
                d: `M ${cx - w * 1.1} ${cy - h * 1.3} L ${cx + w * 1.1} ${cy - h * 1.3} L ${cx + w * 1.1} ${cy + h * 1.3} L ${cx - w * 1.1} ${cy + h * 1.3} Z`,
                cls: 'removal-area'
            });
            return paths;
        }

        switch (type) {
            case 'tiki-almond': {
                // Classic tiki: double-outlined almond shape
                // Outer border
                paths.push({
                    d: `M ${cx - w * 1.2} ${cy}
                        C ${cx - w * 0.8} ${cy - h * 2.2} ${cx + w * 0.8} ${cy - h * 2.2} ${cx + w * 1.2} ${cy}
                        C ${cx + w * 0.8} ${cy + h * 2.2} ${cx - w * 0.8} ${cy + h * 2.2} ${cx - w * 1.2} ${cy} Z`,
                    cls: 'feature-path'
                });
                // Inner eye shape
                paths.push({
                    d: `M ${cx - w * 0.85} ${cy}
                        C ${cx - w * 0.6} ${cy - h * 1.5} ${cx + w * 0.6} ${cy - h * 1.5} ${cx + w * 0.85} ${cy}
                        C ${cx + w * 0.6} ${cy + h * 1.5} ${cx - w * 0.6} ${cy + h * 1.5} ${cx - w * 0.85} ${cy} Z`,
                    cls: 'feature-path'
                });
                // Pupil
                const pr = w * pupil / 180;
                paths.push({
                    d: `M ${cx - pr} ${cy}
                        A ${pr} ${pr * 0.85} 0 1 1 ${cx + pr} ${cy}
                        A ${pr} ${pr * 0.85} 0 1 1 ${cx - pr} ${cy} Z`,
                    cls: 'feature-fill'
                });
                // Stage 3: add lid detail lines
                if (stage >= 3) {
                    paths.push({
                        d: `M ${cx - w * 1.0} ${cy - h * 0.3}
                            C ${cx - w * 0.5} ${cy - h * 1.8} ${cx + w * 0.5} ${cy - h * 1.8} ${cx + w * 1.0} ${cy - h * 0.3}`,
                        cls: 'decoration-path'
                    });
                }
                break;
            }

            case 'open': {
                // Wide open oval eyes
                paths.push({
                    d: `M ${cx - w} ${cy}
                        C ${cx - w * 0.7} ${cy - h * 2.5} ${cx + w * 0.7} ${cy - h * 2.5} ${cx + w} ${cy}
                        C ${cx + w * 0.7} ${cy + h * 2.5} ${cx - w * 0.7} ${cy + h * 2.5} ${cx - w} ${cy} Z`,
                    cls: 'feature-path'
                });
                const pr = w * pupil / 160;
                paths.push({
                    d: `M ${cx - pr} ${cy} A ${pr} ${pr} 0 1 1 ${cx + pr} ${cy} A ${pr} ${pr} 0 1 1 ${cx - pr} ${cy} Z`,
                    cls: 'feature-fill'
                });
                break;
            }

            case 'closed': {
                // Closed — curved line with thick lid
                paths.push({
                    d: `M ${cx - w} ${cy}
                        Q ${cx} ${cy + h * 1.5} ${cx + w} ${cy}
                        L ${cx + w * 0.9} ${cy - h * 0.5}
                        Q ${cx} ${cy + h * 0.8} ${cx - w * 0.9} ${cy - h * 0.5}
                        Z`,
                    cls: 'feature-path'
                });
                break;
            }

            case 'squinting': {
                // Narrow slits with heavy lids
                paths.push({
                    d: `M ${cx - w * 1.1} ${cy}
                        C ${cx - w * 0.5} ${cy - h * 1.0} ${cx + w * 0.5} ${cy - h * 1.0} ${cx + w * 1.1} ${cy}
                        C ${cx + w * 0.5} ${cy + h * 1.0} ${cx - w * 0.5} ${cy + h * 1.0} ${cx - w * 1.1} ${cy} Z`,
                    cls: 'feature-path'
                });
                // Narrow pupil slit
                paths.push({
                    d: `M ${cx - w * 0.5} ${cy}
                        C ${cx - w * 0.2} ${cy - h * 0.4} ${cx + w * 0.2} ${cy - h * 0.4} ${cx + w * 0.5} ${cy}
                        C ${cx + w * 0.2} ${cy + h * 0.4} ${cx - w * 0.2} ${cy + h * 0.4} ${cx - w * 0.5} ${cy} Z`,
                    cls: 'feature-fill'
                });
                break;
            }

            case 'round': {
                // Big circular eyes (more cartoonish tiki)
                const r = w * 0.9;
                paths.push({
                    d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`,
                    cls: 'feature-path'
                });
                // Inner circle
                const ri = r * 0.7;
                paths.push({
                    d: `M ${cx - ri} ${cy} A ${ri} ${ri} 0 1 1 ${cx + ri} ${cy} A ${ri} ${ri} 0 1 1 ${cx - ri} ${cy} Z`,
                    cls: 'feature-path'
                });
                const pr = r * pupil / 200;
                paths.push({
                    d: `M ${cx - pr} ${cy} A ${pr} ${pr} 0 1 1 ${cx + pr} ${cy} A ${pr} ${pr} 0 1 1 ${cx - pr} ${cy} Z`,
                    cls: 'feature-fill'
                });
                break;
            }

            case 'square': {
                // Angular diamond/square tiki eyes
                const sw = w * 1.1, sh = h * 1.8;
                paths.push({
                    d: `M ${cx} ${cy - sh} L ${cx + sw} ${cy} L ${cx} ${cy + sh} L ${cx - sw} ${cy} Z`,
                    cls: 'feature-path'
                });
                // Inner diamond
                const si = 0.6;
                paths.push({
                    d: `M ${cx} ${cy - sh * si} L ${cx + sw * si} ${cy} L ${cx} ${cy + sh * si} L ${cx - sw * si} ${cy} Z`,
                    cls: 'feature-path'
                });
                const pr = w * pupil / 250;
                paths.push({
                    d: `M ${cx - pr} ${cy - pr} L ${cx + pr} ${cy - pr} L ${cx + pr} ${cy + pr} L ${cx - pr} ${cy + pr} Z`,
                    cls: 'feature-fill'
                });
                break;
            }
        }

        return paths;
    }

    // ─── NOSE ────────────────────────────────────────────────────────────────────
    static nose(type, cx, cy, w, h, params, stage) {
        const noseW = w * (0.09 + params.width / 250);
        const noseH = h * (0.07 + params.scale / 600);
        const nostrilR = noseW * (params.nostril / 80);
        const paths = [];

        if (stage === 1) {
            // Block-in: triangular removal
            paths.push({
                d: `M ${cx - noseW * 0.3} ${cy - noseH}
                    L ${cx + noseW * 0.3} ${cy - noseH}
                    L ${cx + noseW * 1.1} ${cy + noseH * 0.8}
                    L ${cx - noseW * 1.1} ${cy + noseH * 0.8}
                    Z`,
                cls: 'removal-area'
            });
            return paths;
        }

        switch (type) {
            case 'tiki-wide': {
                // Classic tiki: wide triangular nose with bridge line from brow
                // Nose bridge (narrow at top, widens)
                paths.push({
                    d: `M ${cx - noseW * 0.25} ${cy - noseH * 1.2}
                        L ${cx + noseW * 0.25} ${cy - noseH * 1.2}
                        L ${cx + noseW * 0.4} ${cy - noseH * 0.3}
                        C ${cx + noseW * 0.5} ${cy} ${cx + noseW * 0.8} ${cy + noseH * 0.4} ${cx + noseW} ${cy + noseH * 0.5}
                        L ${cx + noseW} ${cy + noseH * 0.8}
                        C ${cx + noseW * 0.6} ${cy + noseH * 1.1} ${cx - noseW * 0.6} ${cy + noseH * 1.1} ${cx - noseW} ${cy + noseH * 0.8}
                        L ${cx - noseW} ${cy + noseH * 0.5}
                        C ${cx - noseW * 0.8} ${cy + noseH * 0.4} ${cx - noseW * 0.5} ${cy} ${cx - noseW * 0.4} ${cy - noseH * 0.3}
                        Z`,
                    cls: 'feature-path'
                });
                // Nostrils — centered symmetrically
                paths.push({
                    d: `M ${cx - noseW * 0.55} ${cy + noseH * 0.5}
                        C ${cx - noseW * 0.55} ${cy + noseH * 0.8} ${cx - noseW * 0.15} ${cy + noseH * 0.8} ${cx - noseW * 0.15} ${cy + noseH * 0.5}
                        C ${cx - noseW * 0.15} ${cy + noseH * 0.3} ${cx - noseW * 0.55} ${cy + noseH * 0.3} ${cx - noseW * 0.55} ${cy + noseH * 0.5} Z`,
                    cls: 'feature-fill'
                });
                paths.push({
                    d: `M ${cx + noseW * 0.15} ${cy + noseH * 0.5}
                        C ${cx + noseW * 0.15} ${cy + noseH * 0.8} ${cx + noseW * 0.55} ${cy + noseH * 0.8} ${cx + noseW * 0.55} ${cy + noseH * 0.5}
                        C ${cx + noseW * 0.55} ${cy + noseH * 0.3} ${cx + noseW * 0.15} ${cy + noseH * 0.3} ${cx + noseW * 0.15} ${cy + noseH * 0.5} Z`,
                    cls: 'feature-fill'
                });
                // Nose tip detail (stage 3)
                if (stage >= 3) {
                    paths.push({
                        d: `M ${cx - noseW * 0.2} ${cy + noseH * 0.3}
                            Q ${cx} ${cy + noseH * 0.15} ${cx + noseW * 0.2} ${cy + noseH * 0.3}`,
                        cls: 'decoration-path'
                    });
                }
                break;
            }

            case 'round': {
                // Bulbous round nose
                paths.push({
                    d: `M ${cx - noseW * 0.3} ${cy - noseH}
                        L ${cx + noseW * 0.3} ${cy - noseH}
                        C ${cx + noseW * 0.5} ${cy - noseH * 0.5} ${cx + noseW * 0.9} ${cy + noseH * 0.2} ${cx + noseW * 0.8} ${cy + noseH * 0.6}
                        C ${cx + noseW * 0.7} ${cy + noseH * 1.0} ${cx - noseW * 0.7} ${cy + noseH * 1.0} ${cx - noseW * 0.8} ${cy + noseH * 0.6}
                        C ${cx - noseW * 0.9} ${cy + noseH * 0.2} ${cx - noseW * 0.5} ${cy - noseH * 0.5} ${cx - noseW * 0.3} ${cy - noseH}
                        Z`,
                    cls: 'feature-path'
                });
                // Centered nostrils
                const nr = nostrilR * 0.5;
                paths.push({
                    d: `M ${cx - noseW * 0.35 - nr} ${cy + noseH * 0.4}
                        A ${nr} ${nr * 0.7} 0 1 1 ${cx - noseW * 0.35 + nr} ${cy + noseH * 0.4}
                        A ${nr} ${nr * 0.7} 0 1 1 ${cx - noseW * 0.35 - nr} ${cy + noseH * 0.4} Z
                        M ${cx + noseW * 0.35 - nr} ${cy + noseH * 0.4}
                        A ${nr} ${nr * 0.7} 0 1 1 ${cx + noseW * 0.35 + nr} ${cy + noseH * 0.4}
                        A ${nr} ${nr * 0.7} 0 1 1 ${cx + noseW * 0.35 - nr} ${cy + noseH * 0.4} Z`,
                    cls: 'feature-fill'
                });
                break;
            }

            case 'blocky': {
                // Angular geometric nose
                paths.push({
                    d: `M ${cx - noseW * 0.3} ${cy - noseH}
                        L ${cx + noseW * 0.3} ${cy - noseH}
                        L ${cx + noseW * 0.5} ${cy}
                        L ${cx + noseW} ${cy + noseH * 0.5}
                        L ${cx + noseW * 0.8} ${cy + noseH}
                        L ${cx - noseW * 0.8} ${cy + noseH}
                        L ${cx - noseW} ${cy + noseH * 0.5}
                        L ${cx - noseW * 0.5} ${cy}
                        Z`,
                    cls: 'feature-path'
                });
                // Square nostrils
                const ns = nostrilR * 0.4;
                paths.push({
                    d: `M ${cx - noseW * 0.5} ${cy + noseH * 0.3}
                        L ${cx - noseW * 0.2} ${cy + noseH * 0.3}
                        L ${cx - noseW * 0.2} ${cy + noseH * 0.7}
                        L ${cx - noseW * 0.5} ${cy + noseH * 0.7} Z
                        M ${cx + noseW * 0.2} ${cy + noseH * 0.3}
                        L ${cx + noseW * 0.5} ${cy + noseH * 0.3}
                        L ${cx + noseW * 0.5} ${cy + noseH * 0.7}
                        L ${cx + noseW * 0.2} ${cy + noseH * 0.7} Z`,
                    cls: 'feature-fill'
                });
                break;
            }
        }

        return paths;
    }

    // ─── MOUTH ───────────────────────────────────────────────────────────────────
    static mouth(type, cx, cy, w, h, params, stage) {
        const mouthW = w * (params.width / 130);
        const mouthH = h * (0.04 + params.scale / 800);
        const paths = [];

        if (stage === 1) {
            paths.push({
                d: `M ${cx - mouthW} ${cy - mouthH * 0.5}
                    L ${cx + mouthW} ${cy - mouthH * 0.5}
                    L ${cx + mouthW} ${cy + mouthH * 1.5}
                    L ${cx - mouthW} ${cy + mouthH * 1.5} Z`,
                cls: 'removal-area'
            });
            return paths;
        }

        switch (type) {
            case 'open': {
                // Classic tiki open mouth — rectangular with thick rolled lips
                // Outer lip shape
                paths.push({
                    d: `M ${cx - mouthW} ${cy - mouthH * 0.3}
                        Q ${cx - mouthW * 0.8} ${cy - mouthH * 0.8} ${cx} ${cy - mouthH * 0.6}
                        Q ${cx + mouthW * 0.8} ${cy - mouthH * 0.8} ${cx + mouthW} ${cy - mouthH * 0.3}
                        L ${cx + mouthW * 1.05} ${cy + mouthH * 0.3}
                        Q ${cx + mouthW * 0.9} ${cy + mouthH * 2.0} ${cx} ${cy + mouthH * 2.2}
                        Q ${cx - mouthW * 0.9} ${cy + mouthH * 2.0} ${cx - mouthW * 1.05} ${cy + mouthH * 0.3}
                        Z`,
                    cls: 'feature-path'
                });
                // Inner mouth cavity
                paths.push({
                    d: `M ${cx - mouthW * 0.8} ${cy}
                        Q ${cx} ${cy - mouthH * 0.2} ${cx + mouthW * 0.8} ${cy}
                        Q ${cx + mouthW * 0.7} ${cy + mouthH * 1.3} ${cx} ${cy + mouthH * 1.5}
                        Q ${cx - mouthW * 0.7} ${cy + mouthH * 1.3} ${cx - mouthW * 0.8} ${cy}
                        Z`,
                    cls: 'feature-fill'
                });
                // Upper lip detail
                if (stage >= 3) {
                    paths.push({
                        d: `M ${cx - mouthW * 0.85} ${cy - mouthH * 0.1}
                            Q ${cx} ${cy - mouthH * 0.4} ${cx + mouthW * 0.85} ${cy - mouthH * 0.1}`,
                        cls: 'decoration-path'
                    });
                }
                break;
            }

            case 'closed': {
                // Closed grimace — thick lips pressed together
                paths.push({
                    d: `M ${cx - mouthW} ${cy - mouthH * 0.3}
                        Q ${cx} ${cy - mouthH * 0.8} ${cx + mouthW} ${cy - mouthH * 0.3}
                        L ${cx + mouthW} ${cy + mouthH * 0.3}
                        Q ${cx} ${cy + mouthH * 0.8} ${cx - mouthW} ${cy + mouthH * 0.3}
                        Z`,
                    cls: 'feature-path'
                });
                // Lip line
                paths.push({
                    d: `M ${cx - mouthW * 0.9} ${cy}
                        Q ${cx} ${cy + mouthH * 0.2} ${cx + mouthW * 0.9} ${cy}`,
                    cls: 'feature-path'
                });
                break;
            }

            case 'smiling': {
                // Upturned thick-lipped grin
                paths.push({
                    d: `M ${cx - mouthW} ${cy}
                        Q ${cx - mouthW * 0.5} ${cy - mouthH * 0.5} ${cx} ${cy - mouthH * 0.3}
                        Q ${cx + mouthW * 0.5} ${cy - mouthH * 0.5} ${cx + mouthW} ${cy}
                        Q ${cx + mouthW * 0.7} ${cy + mouthH * 2.5} ${cx} ${cy + mouthH * 2.0}
                        Q ${cx - mouthW * 0.7} ${cy + mouthH * 2.5} ${cx - mouthW} ${cy}
                        Z`,
                    cls: 'feature-path'
                });
                paths.push({
                    d: `M ${cx - mouthW * 0.75} ${cy + mouthH * 0.3}
                        Q ${cx} ${cy + mouthH * 1.8} ${cx + mouthW * 0.75} ${cy + mouthH * 0.3}
                        Q ${cx} ${cy + mouthH * 1.5} ${cx - mouthW * 0.75} ${cy + mouthH * 0.3} Z`,
                    cls: 'feature-fill'
                });
                break;
            }

            case 'frowning': {
                // Downturned mouth — menacing
                paths.push({
                    d: `M ${cx - mouthW} ${cy + mouthH * 0.5}
                        Q ${cx - mouthW * 0.5} ${cy + mouthH * 0.8} ${cx} ${cy + mouthH}
                        Q ${cx + mouthW * 0.5} ${cy + mouthH * 0.8} ${cx + mouthW} ${cy + mouthH * 0.5}
                        L ${cx + mouthW} ${cy - mouthH * 0.5}
                        Q ${cx} ${cy - mouthH * 0.8} ${cx - mouthW} ${cy - mouthH * 0.5}
                        Z`,
                    cls: 'feature-path'
                });
                paths.push({
                    d: `M ${cx - mouthW * 0.8} ${cy}
                        Q ${cx} ${cy + mouthH * 0.6} ${cx + mouthW * 0.8} ${cy}
                        Q ${cx} ${cy + mouthH * 0.3} ${cx - mouthW * 0.8} ${cy} Z`,
                    cls: 'feature-fill'
                });
                break;
            }
        }

        return paths;
    }

    // ─── TEETH ───────────────────────────────────────────────────────────────────
    static teeth(type, cx, cy, w, h, params, mouthParams) {
        if (type === 'none') return [];
        const mouthW = w * (mouthParams.width / 130);
        const toothH = h * 0.02 * (params.size / 40);
        const count = params.count || 6;
        const paths = [];
        const teethW = mouthW * 1.4;
        const tw = teethW / count;
        const startX = cx - teethW / 2 + tw / 2;

        switch (type) {
            case 'normal': {
                for (let i = 0; i < count; i++) {
                    const tx = startX + i * tw;
                    paths.push({
                        d: `M ${tx - tw * 0.4} ${cy}
                            L ${tx + tw * 0.4} ${cy}
                            L ${tx + tw * 0.35} ${cy + toothH}
                            L ${tx - tw * 0.35} ${cy + toothH} Z`,
                        cls: 'feature-path'
                    });
                }
                break;
            }
            case 'buck': {
                // Two oversized front teeth
                const btw = mouthW * 0.35;
                [-1, 1].forEach(side => {
                    const tx = cx + side * btw * 0.45;
                    paths.push({
                        d: `M ${tx - btw * 0.4} ${cy}
                            L ${tx + btw * 0.4} ${cy}
                            L ${tx + btw * 0.35} ${cy + toothH * 2.2}
                            L ${tx - btw * 0.35} ${cy + toothH * 2.2} Z`,
                        cls: 'feature-path'
                    });
                });
                // Smaller side teeth
                [-2, -1, 1, 2].forEach(pos => {
                    if (Math.abs(pos) === 1) return;
                    const tx = cx + pos * btw * 0.9;
                    paths.push({
                        d: `M ${tx - btw * 0.25} ${cy}
                            L ${tx + btw * 0.25} ${cy}
                            L ${tx + btw * 0.2} ${cy + toothH * 0.8}
                            L ${tx - btw * 0.2} ${cy + toothH * 0.8} Z`,
                        cls: 'feature-path'
                    });
                });
                break;
            }
            case 'deep': {
                // Teeth recessed inside a deep mouth cavity
                const offset = h * 0.012;
                for (let i = 0; i < count; i++) {
                    const tx = startX + i * tw;
                    paths.push({
                        d: `M ${tx - tw * 0.35} ${cy + offset}
                            L ${tx + tw * 0.35} ${cy + offset}
                            L ${tx + tw * 0.3} ${cy + offset + toothH * 0.7}
                            L ${tx - tw * 0.3} ${cy + offset + toothH * 0.7} Z`,
                        cls: 'feature-path'
                    });
                }
                break;
            }
            case 'setback': {
                // Small teeth behind thick lip line
                const sCount = 8;
                const stw = (mouthW * 1.2) / sCount;
                const sStartX = cx - (mouthW * 1.2) / 2 + stw / 2;
                const offset = h * 0.008;
                for (let i = 0; i < sCount; i++) {
                    const tx = sStartX + i * stw;
                    paths.push({
                        d: `M ${tx - stw * 0.3} ${cy + offset}
                            L ${tx + stw * 0.3} ${cy + offset}
                            L ${tx + stw * 0.25} ${cy + offset + toothH * 0.5}
                            L ${tx - stw * 0.25} ${cy + offset + toothH * 0.5} Z`,
                        cls: 'feature-path'
                    });
                }
                break;
            }
        }
        return paths;
    }

    // ─── TONGUE ──────────────────────────────────────────────────────────────────
    static tongue(type, cx, cy, w, h, params) {
        if (type === 'none') return [];
        const tongueW = w * 0.07;
        const tongueH = h * (type === 'out' ? 0.07 : 0.03);
        const paths = [];

        let dx = 0, dy = 0;
        switch (params.direction) {
            case 'left': dx = -tongueW * 1.2; break;
            case 'right': dx = tongueW * 1.2; break;
            case 'up': dy = -tongueH * 0.6; break;
        }

        const tx = cx + dx;
        const ty = cy + dy;

        switch (params.shape) {
            case 'round':
                paths.push({
                    d: `M ${tx - tongueW} ${ty}
                        Q ${tx - tongueW * 1.1} ${ty + tongueH * 0.8} ${tx} ${ty + tongueH * 1.2}
                        Q ${tx + tongueW * 1.1} ${ty + tongueH * 0.8} ${tx + tongueW} ${ty}
                        Z`,
                    cls: 'feature-fill'
                });
                if (type === 'out') {
                    paths.push({
                        d: `M ${tx} ${ty + tongueH * 0.3} L ${tx} ${ty + tongueH * 1.0}`,
                        cls: 'decoration-path'
                    });
                }
                break;
            case 'sharp':
                paths.push({
                    d: `M ${tx - tongueW} ${ty}
                        L ${tx} ${ty + tongueH * 1.6}
                        L ${tx + tongueW} ${ty}
                        Z`,
                    cls: 'feature-fill'
                });
                break;
            case 'snake':
                paths.push({
                    d: `M ${tx - tongueW * 0.3} ${ty}
                        L ${tx - tongueW * 0.15} ${ty + tongueH * 1.0}
                        L ${tx - tongueW * 0.6} ${ty + tongueH * 1.5}
                        M ${tx - tongueW * 0.15} ${ty + tongueH * 1.0}
                        L ${tx + tongueW * 0.15} ${ty + tongueH * 1.5}
                        M ${tx + tongueW * 0.3} ${ty}
                        L ${tx + tongueW * 0.15} ${ty + tongueH * 1.0}
                        L ${tx + tongueW * 0.6} ${ty + tongueH * 1.5}
                        M ${tx + tongueW * 0.15} ${ty + tongueH * 1.0}
                        L ${tx - tongueW * 0.15} ${ty + tongueH * 1.5}`,
                    cls: 'feature-path'
                });
                break;
        }
        return paths;
    }

    // ─── NASOLABIAL FOLDS (smile lines) ──────────────────────────────────────────
    // Carved lines from nose to mouth — present in stage 2+
    static nasolabialFolds(cx, noseY, mouthY, w, stage) {
        if (stage < 2) return [];
        const foldW = w * 0.18;
        const paths = [];

        [-1, 1].forEach(side => {
            paths.push({
                d: `M ${cx + side * foldW * 0.5} ${noseY}
                    C ${cx + side * foldW * 0.7} ${noseY + (mouthY - noseY) * 0.3}
                      ${cx + side * foldW * 1.0} ${noseY + (mouthY - noseY) * 0.6}
                      ${cx + side * foldW * 1.1} ${mouthY + (mouthY - noseY) * 0.1}`,
                cls: stage >= 3 ? 'feature-path' : 'decoration-path'
            });
        });

        return paths;
    }
}

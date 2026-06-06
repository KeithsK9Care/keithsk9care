// Paw-print silhouette — the simple, generic paw (one round pad + four round toes).
// Shared by the hero trail, the section "walking" trails (PawTrail.astro) and the footer
// trail so the shape lives in ONE place.
//
// Each sub-shape carries pathLength="1" so the scroll-draw animation (stroke-dashoffset 1 -> 0)
// normalises every shape to the same draw length. Rendered into an <svg viewBox="0 0 64 64">
// with fill="none" stroke="currentColor"; the per-instance facing direction is set by a CSS
// rotate() on the <svg> itself (north = toes-up; rotate ~120-180deg to walk "down the page").
export const PAW_SHAPES = `<ellipse pathLength="1" cx="32" cy="46" rx="13" ry="10.5"/><ellipse pathLength="1" cx="15" cy="31" rx="5" ry="7"/><ellipse pathLength="1" cx="26" cy="22" rx="5" ry="7.5"/><ellipse pathLength="1" cx="40" cy="22" rx="5" ry="7.5"/><ellipse pathLength="1" cx="50" cy="31" rx="5" ry="7"/>`;

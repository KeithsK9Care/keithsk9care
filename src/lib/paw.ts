// Brand paw-print silhouette — matches the logo's paw: a heart-shaped main pad + 4 fanned
// petal-toes. Shared by the hero trail, the section "walking" trails (PawTrail.astro) and the
// footer trail so the shape lives in ONE place.
//
// Each sub-shape carries pathLength="1" so the scroll-draw animation (stroke-dashoffset 1 -> 0)
// normalises every shape to the same draw length. Rendered into an <svg viewBox="0 0 64 64">
// with fill="none" stroke="currentColor"; the per-instance facing direction is set by a CSS
// rotate() on the <svg> itself (north = toes-up; rotate ~120-180deg to walk "down the page").
export const PAW_SHAPES = `<path pathLength="1" d="M32 58 C 22 50 13 43 13 35 C 13 30 17 28 21 28 C 26 28 30 31 32 35 C 34 31 38 28 43 28 C 47 28 51 30 51 35 C 51 43 42 50 32 58 Z"/><ellipse pathLength="1" cx="14" cy="24" rx="4.3" ry="8" transform="rotate(-34 14 24)"/><ellipse pathLength="1" cx="25" cy="15" rx="4.7" ry="8.8" transform="rotate(-13 25 15)"/><ellipse pathLength="1" cx="39" cy="15" rx="4.7" ry="8.8" transform="rotate(13 39 15)"/><ellipse pathLength="1" cx="50" cy="24" rx="4.3" ry="8" transform="rotate(34 50 24)"/>`;

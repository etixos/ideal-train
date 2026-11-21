import { CVD_MATRICES } from '../tokens/color';

/** SVG color-matrix filters used to simulate color-vision deficiencies across the whole lab. */
export function CvdFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <defs>
        {Object.entries(CVD_MATRICES).map(([k, m]) => (
          <filter id={`cvd-${k}`} key={k} colorInterpolationFilters="linearRGB">
            <feColorMatrix type="matrix" values={`${m[0]} ${m[1]} ${m[2]} 0 0 ${m[3]} ${m[4]} ${m[5]} 0 0 ${m[6]} ${m[7]} ${m[8]} 0 0 0 0 0 1 0`} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

import React from 'react'

const i = (d, extra = {}) => ({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', ...extra, d })

export function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
  const paths = {
    leaf:   ['M12 22V12M12 12C12 12 7 10 5 6c3 0 7 2 7 6zM12 12c0 0 5-2 7-6-3 0-7 2-7 6z', 'M5 20c2-2 4-4 7-8M19 20c-2-2-4-4-7-8'],
    send:   ['M22 2L11 13', 'M22 2L15 22 11 13 2 9 22 2'],
    plus:   ['M12 5v14', 'M5 12h14'],
    trash:  ['M3 6h18', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6', 'M9 6V4h6v2'],
    pin:    ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0'],
    edit:   ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
    info:   ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 8v4', 'M12 16h.01'],
    close:  ['M18 6L6 18', 'M6 6l12 12'],
    check:  ['M20 6L9 17l-5-5'],
    wifi:   ['M5 12.55a11 11 0 0114.08 0', 'M1.42 9a16 16 0 0121.16 0', 'M8.53 16.11a6 6 0 016.95 0', 'M12 20h.01'],
    wifiOff:['M1 1l22 22', 'M16.72 11.06A10.94 10.94 0 0119 12.55', 'M5 12.55a10.94 10.94 0 015.17-2.39', 'M10.71 5.05A16 16 0 0122.56 9', 'M1.42 9a15.91 15.91 0 014.7-2.88', 'M8.53 16.11a6 6 0 016.95 0', 'M12 20h.01'],
  }
  const ps = paths[name] || []
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      {ps.map((d, i) => d.startsWith('M12 10m') ?
        <circle key={i} cx="12" cy="10" r="3" stroke={color} fill="none" /> :
        <path key={i} d={d} fill="none" />
      )}
    </svg>
  )
}

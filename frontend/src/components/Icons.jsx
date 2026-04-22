import React from 'react'

export function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
  const paths = {
    sprout: [
      'M12 21V11',
      'M12 11C10.4 8 7.8 6.9 5 7.1C5.4 10.8 7.8 13 12 13',
      'M12 11C13.6 8 16.2 6.9 19 7.1C18.6 10.8 16.2 13 12 13',
      'M8 21h8',
    ],
    send: [
      'M22 2L11 13',
      'M22 2L15 22 11 13 2 9 22 2',
    ],
    plus: [
      'M12 5v14',
      'M5 12h14',
    ],
    trash: [
      'M3 6h18',
      'M19 6l-1 14H6L5 6',
      'M10 11v6',
      'M14 11v6',
      'M9 6V4h6v2',
    ],
    pin: [
      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
      'M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    ],
    edit: [
      'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
      'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    ],
    info: [
      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
      'M12 8v4',
      'M12 16h.01',
    ],
    close: [
      'M18 6L6 18',
      'M6 6l12 12',
    ],
    check: [
      'M20 6L9 17l-5-5',
    ],
    wifiOff: [
      'M1 1l22 22',
      'M16.72 11.06A10.94 10.94 0 0119 12.55',
      'M5 12.55a10.94 10.94 0 015.17-2.39',
      'M10.71 5.05A16 16 0 0122.56 9',
      'M1.42 9a15.91 15.91 0 014.7-2.88',
      'M8.53 16.11a6 6 0 016.95 0',
      'M12 20h.01',
    ],
    sparkles: [
      'M12 3l1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3L7.5 7.5l3.3-1.2L12 3z',
      'M19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7L19 14z',
      'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z',
    ],
    chart: [
      'M4 19h16',
      'M7 16V10',
      'M12 16V6',
      'M17 16v-4',
    ],
    filter: [
      'M4 6h16',
      'M7 12h10',
      'M10 18h4',
    ],
    search: [
      'M11 19a8 8 0 100-16 8 8 0 000 16z',
      'M21 21l-4.35-4.35',
    ],
    book: [
      'M4 19.5A2.5 2.5 0 016.5 17H20',
      'M6.5 17H20V4H6.5A2.5 2.5 0 004 6.5v11',
    ],
    bug: [
      'M8 9h8',
      'M9 3h6',
      'M10 17h4',
      'M12 3v14',
      'M5 13h4',
      'M15 13h4',
      'M6 7l2 2',
      'M18 7l-2 2',
      'M6 19l2-2',
      'M18 19l-2-2',
    ],
  }

  const ps = paths[name] || []

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {ps.map((d, i) =>
        d.startsWith('M12 10m')
          ? <circle key={i} cx="12" cy="10" r="3" stroke={color} fill="none" />
          : <path key={i} d={d} fill="none" />
      )}
    </svg>
  )
}
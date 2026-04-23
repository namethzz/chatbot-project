import React from "react";

const wrap = (children) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    {children}
  </svg>
);

export const CropIcons = {
  all: () =>
    wrap(
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" fill="#76A667" />
        <rect x="14" y="3" width="7" height="7" rx="2" fill="#A7C957" />
        <rect x="3" y="14" width="7" height="7" rx="2" fill="#DDB892" />
        <rect x="14" y="14" width="7" height="7" rx="2" fill="#6C9A8B" />
      </>
    ),

  rice: () =>
    wrap(
      <>
        <path d="M12 21V9" stroke="#6B8E23" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 10C10 8 8 7.5 6.5 8.2C7.2 10 8.7 11 11.5 11" stroke="#D9B44A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 13C10 11 8 10.5 6.7 11.2C7.4 12.9 8.9 13.8 11.5 14" stroke="#D9B44A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 10C14 8 16 7.5 17.5 8.2C16.8 10 15.3 11 12.5 11" stroke="#D9B44A" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),

  corn: () =>
    wrap(
      <>
        <ellipse cx="12" cy="12.5" rx="4.3" ry="6.2" fill="#F4C542" stroke="#C99A00" strokeWidth="1.2" />
        <path d="M8.5 14C7 13 6.4 11.5 6.6 9.5" stroke="#5E9C36" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15.5 14C17 13 17.6 11.5 17.4 9.5" stroke="#5E9C36" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),

  cassava: () =>
    wrap(
      <>
        <ellipse cx="12" cy="13" rx="6.2" ry="3.8" fill="#9C6644" stroke="#7F5539" strokeWidth="1.2" />
        <circle cx="9" cy="12" r="0.7" fill="#B08968" />
        <circle cx="13" cy="14" r="0.7" fill="#B08968" />
        <circle cx="15.5" cy="12" r="0.7" fill="#B08968" />
      </>
    ),

  sugarcane: () =>
    wrap(
      <>
        <rect x="8" y="3" width="2.6" height="18" rx="1.2" fill="#7FB069" />
        <rect x="13.4" y="3" width="2.6" height="18" rx="1.2" fill="#5C8D89" />
        <path d="M8 8h2.6M8 13h2.6M13.4 8H16M13.4 13H16" stroke="#EDF6E5" strokeWidth="1" />
      </>
    ),

  pineapple: () =>
    wrap(
      <>
        <path d="M12 3L14 6L12 5L10 6L12 3Z" fill="#4CAF50" />
        <path d="M9 6L11 8M15 6L13 8M12 5V8" stroke="#4CAF50" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="12" cy="14" rx="5" ry="6" fill="#F4B942" stroke="#D08C00" strokeWidth="1.2" />
        <path d="M9 11L15 17M15 11L9 17" stroke="#D08C00" strokeWidth="1" />
      </>
    ),

  rubber: () =>
    wrap(
      <>
        <path d="M12 20V13" stroke="#7B5E57" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="9" r="4.5" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.2" />
      </>
    ),

  durian: () =>
    wrap(
      <>
        <circle cx="12" cy="13" r="5.5" fill="#9CCC65" stroke="#558B2F" strokeWidth="1.2" />
        <path d="M8.5 10.5L15.5 15.5M15.5 10.5L8.5 15.5M12 8.5V17.5" stroke="#558B2F" strokeWidth="1" />
      </>
    ),

  mangosteen: () =>
    wrap(
      <>
        <circle cx="12" cy="13" r="5.2" fill="#7E57C2" stroke="#5E35B1" strokeWidth="1.2" />
        <path d="M9.5 8.5C10.2 7.2 11 6.6 12 6.6C13 6.6 13.8 7.2 14.5 8.5" stroke="#66BB6A" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),

  longan: () =>
    wrap(
      <>
        <circle cx="10" cy="12" r="3.4" fill="#DDB892" stroke="#B08968" strokeWidth="1.1" />
        <circle cx="14.5" cy="12.7" r="3.1" fill="#E6CCB2" stroke="#B08968" strokeWidth="1.1" />
      </>
    ),

  palm: () =>
    wrap(
      <>
        <path d="M12 20V11" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 11C9.5 8.5 7 8.3 5 9.2C6.7 10.8 8.8 11.8 12 11.8" fill="#4CAF50" />
        <path d="M12 11C14.5 8.5 17 8.3 19 9.2C17.3 10.8 15.2 11.8 12 11.8" fill="#66BB6A" />
      </>
    ),

  coconut: () =>
    wrap(
      <>
        <ellipse cx="12" cy="13" rx="5.2" ry="4.2" fill="#A47148" stroke="#7F5539" strokeWidth="1.2" />
        <circle cx="10.2" cy="12.4" r="0.7" fill="#6D4C41" />
        <circle cx="12" cy="11.7" r="0.7" fill="#6D4C41" />
        <circle cx="13.8" cy="12.4" r="0.7" fill="#6D4C41" />
      </>
    ),

  coffee: () =>
    wrap(
      <>
        <path d="M7 8H15V13.5C15 15.7 13.2 17.5 11 17.5C8.8 17.5 7 15.7 7 13.5V8Z" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="1.2" />
        <path d="M15 10H17C18.1 10 19 10.9 19 12C19 13.1 18.1 14 17 14H15" stroke="#8D6E63" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M10.8 9.2C9.9 10 9.9 11.1 10.8 12" stroke="#6D4C41" strokeWidth="1.1" strokeLinecap="round" />
      </>
    ),

  rambutan: () =>
    wrap(
      <>
        <circle cx="12" cy="12" r="4.8" fill="#EF5350" stroke="#C62828" strokeWidth="1.2" />
        <path d="M12 6.2L12 4.5" stroke="#4CAF50" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8.5 8L7.3 6.9M15.5 8L16.7 6.9M8 12H6.2M17.8 12H16M8.6 16L7.4 17.1M15.4 16L16.6 17.1" stroke="#C62828" strokeWidth="1" strokeLinecap="round" />
      </>
    ),
};
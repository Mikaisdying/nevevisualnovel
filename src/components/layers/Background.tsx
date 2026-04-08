import React from 'react';

type Props = {
  bg?: string;
};

function getBgUrl(bg?: string) {
  if (!bg) return '';
  return `/assets/bg/${bg}.png`;
}

export default function Background({ bg }: Props) {
  const bgUrl = getBgUrl(bg);
  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
      {bgUrl ? (
        <img
          src={bgUrl}
          alt="background"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ zIndex: 1, objectFit: 'cover' }}
        />
      ) : (
        <div className="absolute inset-0 h-full w-full bg-gray-800" />
      )}
    </div>
  );
}

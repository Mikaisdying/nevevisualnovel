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
    <div className="fullscreen-absolute layer-background pointer-events-none">
      {bgUrl ? (
        <img
          src={bgUrl}
          alt="background"
          className="fullscreen-absolute object-cover object-center"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div className="fullscreen-absolute bg-gray-800" />
      )}
    </div>
  );
}

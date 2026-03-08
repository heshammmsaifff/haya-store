"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function SmartImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  width,
  height,
  priority = false,
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);

  const useFill = !width && !height;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={useFill ? undefined : { width, height }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt}
        fill={useFill}
        width={useFill ? undefined : width}
        height={useFill ? undefined : height}
        className={`object-cover transition-opacity duration-500 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
        onLoadingComplete={() => setLoaded(true)}
        priority={priority}
        {...imgProps}
      />
    </div>
  );
}

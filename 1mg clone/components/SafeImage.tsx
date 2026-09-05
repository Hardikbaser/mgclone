'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const fallbackSrc = '/assets/product-placeholder.svg';

export function SafeImage({ src, alt, ...props }: ImageProps) {
  const [source, setSource] = useState(src);
  useEffect(() => setSource(src), [src]);
  return <Image {...props} src={source} alt={alt} onError={() => setSource(fallbackSrc)} />;
}

export { fallbackSrc };

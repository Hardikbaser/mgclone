'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const fallbackSrc = '/assets/product-placeholder.svg';

export function SafeImage({ src, alt, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  return <Image {...props} src={failedSource === src ? fallbackSrc : src} alt={alt} onError={() => setFailedSource(src)} />;
}

export { fallbackSrc };

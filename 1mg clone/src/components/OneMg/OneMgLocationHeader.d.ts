import type { ComponentType } from 'react';

declare const OneMgLocationHeader: ComponentType<{
  initialLocation?: string;
  onLocationChange?: (location: string) => void;
  onSearch?: (query: string) => void;
}>;

export default OneMgLocationHeader;

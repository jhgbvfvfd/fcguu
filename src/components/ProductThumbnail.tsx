import React, { useState } from 'react';
import { ProductItem } from '../utils/productLogic';

interface ProductThumbnailProps {
  product: Pick<ProductItem, 'name' | 'sku' | 'imageUrl' | 'category'>;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  product,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const dims =
    size === 'sm'
      ? 'h-9 w-9 rounded-lg'
      : size === 'lg'
      ? 'h-14 w-14 rounded-xl'
      : 'h-11 w-11 rounded-lg';

  const initials = product.sku
    .replace(/^CYB-/, '')
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 ${dims}`}
    >
      {!imgError && product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 font-mono text-[10px] font-semibold tracking-wider text-zinc-300">
          {initials}
        </div>
      )}
    </div>
  );
};

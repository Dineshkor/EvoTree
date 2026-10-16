import { SPRITES, FallbackSprite } from './sprites';

export function CreatureSprite({
  svgKey,
  className,
}: {
  svgKey: string;
  className?: string;
}) {
  const Sprite = SPRITES[svgKey] ?? FallbackSprite;
  return <Sprite className={className} />;
}

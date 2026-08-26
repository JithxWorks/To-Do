import { useSettingsStore } from '../../store/useSettingsStore';
import { PRIORITIES } from '../../lib/constants';
import { hueVar } from '../../lib/style';
import type { Category, Priority } from '../../types';

const FALLBACK: Category = { id: 'other', name: 'Other', color: 'slate' };

export function useCategory(id: string): Category {
  const found = useSettingsStore((s) => s.categories.find((c) => c.id === id));
  return found ?? FALLBACK;
}

export function PriorityBadge({
  priority,
  showLabel = true,
}: {
  priority: Priority;
  showLabel?: boolean;
}) {
  const p = PRIORITIES[priority];
  return (
    <span className="badge" style={hueVar(p.color)}>
      <span className="dot" />
      {showLabel && `${p.label}`}
    </span>
  );
}

export function CategoryBadge({ categoryId }: { categoryId: string }) {
  const cat = useCategory(categoryId);
  return (
    <span className="badge" style={hueVar(cat.color)}>
      <span className="dot" />
      {cat.name}
    </span>
  );
}

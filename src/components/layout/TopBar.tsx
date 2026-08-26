import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="screen-topbar">
      <IconButton label="Go back" onClick={onBack}>
        <ChevronLeft size={24} />
      </IconButton>
      <div className="screen-topbar__title truncate">{title}</div>
      {right}
    </div>
  );
}

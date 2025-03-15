
import { Watch } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Watch className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">WatchShop Manager</span>
    </div>
  );
}

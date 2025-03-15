
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SaleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SaleSearch({ searchTerm, onSearchChange }: SaleSearchProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sales..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

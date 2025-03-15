
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InventorySearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function InventorySearch({ searchTerm, setSearchTerm }: InventorySearchProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search inventory..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-10 gap-1">
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <Button variant="outline" size="sm" className="h-10 gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );
}

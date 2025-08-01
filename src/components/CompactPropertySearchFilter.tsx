import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Home, Euro, Ruler, Users } from "lucide-react";

export interface FilterData {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  rooms: string;
}

interface CompactPropertySearchFilterProps {
  onFilterChange?: (filters: FilterData) => void;
}

export const CompactPropertySearchFilter = ({ onFilterChange }: CompactPropertySearchFilterProps) => {
  const [searchData, setSearchData] = useState<FilterData>({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    rooms: "",
  });

  const handleSearch = () => {
    onFilterChange?.(searchData);
  };

  return (
    <Card className="w-full bg-background border shadow-sm">
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Location */}
          <div className="space-y-1">
            <Select value={searchData.location} onValueChange={(value) => setSearchData({ ...searchData, location: value })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Stadt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Städte</SelectItem>
                <SelectItem value="berlin">Berlin</SelectItem>
                <SelectItem value="hamburg">Hamburg</SelectItem>
                <SelectItem value="muenchen">München</SelectItem>
                <SelectItem value="frankfurt">Frankfurt</SelectItem>
                <SelectItem value="duesseldorf">Düsseldorf</SelectItem>
                <SelectItem value="koeln">Köln</SelectItem>
                <SelectItem value="stuttgart">Stuttgart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="space-y-1">
            <Select value={searchData.propertyType} onValueChange={(value) => setSearchData({ ...searchData, propertyType: value })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="wohnung">Wohnung</SelectItem>
                <SelectItem value="haus">Haus</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="maisonette">Maisonette</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Preis min"
              className="h-9 text-sm"
              value={searchData.minPrice}
              onChange={(e) => setSearchData({ ...searchData, minPrice: e.target.value })}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Preis max"
              className="h-9 text-sm"
              value={searchData.maxPrice}
              onChange={(e) => setSearchData({ ...searchData, maxPrice: e.target.value })}
            />
          </div>

          {/* Area */}
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Fläche (m²)"
              className="h-9 text-sm"
              value={searchData.minArea}
              onChange={(e) => setSearchData({ ...searchData, minArea: e.target.value })}
            />
          </div>

          {/* Rooms */}
          <div className="space-y-1">
            <Select value={searchData.rooms} onValueChange={(value) => setSearchData({ ...searchData, rooms: value })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Zimmer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Zimmer</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5+">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="space-y-1">
            <Button 
              onClick={handleSearch}
              className="w-full h-9 px-3 text-sm"
              size="sm"
            >
              <Search className="h-4 w-4 mr-1" />
              Suchen
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
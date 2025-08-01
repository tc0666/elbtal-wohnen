import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Home, Euro } from "lucide-react";

export const PropertySearchFilter = () => {
  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    rooms: "",
  });

  const handleSearch = () => {
    console.log("Search data:", searchData);
    // This will be connected to actual search functionality later
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <div className="space-y-4 md:space-y-8">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Finden Sie Ihre Traumwohnung
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Suchen Sie in Berlin, Hamburg, München, Frankfurt, Düsseldorf und weiteren Städten
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {/* Location */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="location" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              Standort
            </Label>
            <Select value={searchData.location} onValueChange={(value) => setSearchData({ ...searchData, location: value })}>
              <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Stadt wählen" />
              </SelectTrigger>
              <SelectContent>
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
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="propertyType" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
              <Home className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              Objektart
            </Label>
            <Select value={searchData.propertyType} onValueChange={(value) => setSearchData({ ...searchData, propertyType: value })}>
              <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Typ wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wohnung">Wohnung</SelectItem>
                <SelectItem value="haus">Haus</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="maisonette">Maisonette</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="minPrice" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
              <Euro className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              Miete von
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="z.B. 500"
              className="h-9 md:h-10 text-xs md:text-sm"
              value={searchData.minPrice}
              onChange={(e) => setSearchData({ ...searchData, minPrice: e.target.value })}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="maxPrice" className="text-xs md:text-sm font-medium">
              Miete bis
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="z.B. 2000"
              className="h-9 md:h-10 text-xs md:text-sm"
              value={searchData.maxPrice}
              onChange={(e) => setSearchData({ ...searchData, maxPrice: e.target.value })}
            />
          </div>

          {/* Area */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="minArea" className="text-xs md:text-sm font-medium">
              Fläche ab (m²)
            </Label>
            <Input
              id="minArea"
              type="number"
              placeholder="z.B. 50"
              className="h-9 md:h-10 text-xs md:text-sm"
              value={searchData.minArea}
              onChange={(e) => setSearchData({ ...searchData, minArea: e.target.value })}
            />
          </div>

          {/* Rooms */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="rooms" className="text-xs md:text-sm font-medium">
              Zimmer
            </Label>
            <Select value={searchData.rooms} onValueChange={(value) => setSearchData({ ...searchData, rooms: value })}>
              <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Anzahl" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Zimmer</SelectItem>
                <SelectItem value="2">2 Zimmer</SelectItem>
                <SelectItem value="3">3 Zimmer</SelectItem>
                <SelectItem value="4">4 Zimmer</SelectItem>
                <SelectItem value="5+">5+ Zimmer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center col-span-2 md:col-span-3 lg:col-span-6">
          <Button 
            onClick={handleSearch}
            className="w-full md:w-auto px-6 md:px-8 py-2 bg-primary hover:bg-primary-dark text-primary-foreground font-medium text-sm md:text-base"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            Immobilien suchen
          </Button>
        </div>
      </div>
    </Card>
  );
};
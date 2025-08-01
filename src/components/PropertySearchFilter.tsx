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
    rooms: "",
  });

  const handleSearch = () => {
    console.log("Search data:", searchData);
    // This will be connected to actual search functionality later
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 bg-background shadow-lg">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Finden Sie Ihre Traumwohnung
          </h2>
          <p className="text-muted-foreground">
            Suchen Sie in Berlin, Hamburg, München, Frankfurt, Düsseldorf und weiteren Städten
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Standort
            </Label>
            <Select value={searchData.location} onValueChange={(value) => setSearchData({ ...searchData, location: value })}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              Objektart
            </Label>
            <Select value={searchData.propertyType} onValueChange={(value) => setSearchData({ ...searchData, propertyType: value })}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4 text-primary" />
              Miete von
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="z.B. 500"
              value={searchData.minPrice}
              onChange={(e) => setSearchData({ ...searchData, minPrice: e.target.value })}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="text-sm font-medium">
              Miete bis
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="z.B. 2000"
              value={searchData.maxPrice}
              onChange={(e) => setSearchData({ ...searchData, maxPrice: e.target.value })}
            />
          </div>

          {/* Rooms */}
          <div className="space-y-2">
            <Label htmlFor="rooms" className="text-sm font-medium">
              Zimmer
            </Label>
            <Select value={searchData.rooms} onValueChange={(value) => setSearchData({ ...searchData, rooms: value })}>
              <SelectTrigger>
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

        <div className="flex justify-center">
          <Button 
            onClick={handleSearch}
            className="px-8 py-2 bg-primary hover:bg-primary-dark text-primary-foreground font-medium"
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
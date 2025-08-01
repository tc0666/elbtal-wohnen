import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X } from 'lucide-react';
import { PropertyBase } from '@/types/property';
import { useQuery } from '@tanstack/react-query';

interface PropertyFormNewProps {
  property?: PropertyBase | null;
  onClose: () => void;
}

const PropertyFormNew: React.FC<PropertyFormNewProps> = ({ property, onClose }) => {
  const { toast } = useToast();
  
  // Simple state management - no complex objects that cause re-renders
  const [title, setTitle] = useState(property?.title || '');
  const [description, setDescription] = useState(property?.description || '');
  const [address, setAddress] = useState(property?.address || '');
  const [postalCode, setPostalCode] = useState(property?.postal_code || '');
  const [neighborhood, setNeighborhood] = useState(property?.neighborhood || '');
  const [rooms, setRooms] = useState(property?.rooms || '');
  const [areaSqm, setAreaSqm] = useState(property?.area_sqm?.toString() || '');
  const [priceMonthly, setPriceMonthly] = useState(property?.price_monthly?.toString() || '');
  const [additionalCosts, setAdditionalCosts] = useState(property?.additional_costs_monthly?.toString() || '');
  const [warmmiete, setWarmmiete] = useState(property?.warmmiete_monthly?.toString() || '');
  const [depositMonths, setDepositMonths] = useState(property?.deposit_months?.toString() || '');
  const [floor, setFloor] = useState(property?.floor?.toString() || '');
  const [yearBuilt, setYearBuilt] = useState(property?.year_built?.toString() || '');
  const [availableFrom, setAvailableFrom] = useState(
    property?.available_from ? new Date(property.available_from).toISOString().split('T')[0] : ''
  );
  const [totalFloors, setTotalFloors] = useState(property?.total_floors?.toString() || '');
  const [cityId, setCityId] = useState(property?.city_id || '');
  const [propertyTypeId, setPropertyTypeId] = useState(property?.property_type_id || '');
  
  // Checkbox states
  const [balcony, setBalcony] = useState(property?.balcony || false);
  const [elevator, setElevator] = useState(property?.elevator || false);
  const [parking, setParking] = useState(property?.parking || false);
  const [petsAllowed, setPetsAllowed] = useState(property?.pets_allowed || false);
  const [furnished, setFurnished] = useState(property?.furnished || false);
  const [kitchenEquipped, setKitchenEquipped] = useState(property?.kitchen_equipped || false);
  const [dishwasher, setDishwasher] = useState(property?.dishwasher || false);
  const [washingMachine, setWashingMachine] = useState(property?.washing_machine || false);
  const [dryer, setDryer] = useState(property?.dryer || false);
  const [tv, setTv] = useState(property?.tv || false);
  const [garden, setGarden] = useState(property?.garden || false);
  const [cellar, setCellar] = useState(property?.cellar || false);
  const [attic, setAttic] = useState(property?.attic || false);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(property?.utilities_included || false);
  
  // Other fields
  const [featuresDescription, setFeaturesDescription] = useState(property?.features_description || '');
  const [additionalDescription, setAdditionalDescription] = useState(property?.additional_description || '');
  const [neighborhoodDescription, setNeighborhoodDescription] = useState(property?.neighborhood_description || '');
  const [eigenschaftenDescription, setEigenschaftenDescription] = useState((property as any)?.eigenschaften_description || '');
  const [eigenschaftenTags, setEigenschaftenTags] = useState<string[]>((property as any)?.eigenschaften_tags || []);
  const [customTag, setCustomTag] = useState('');
  const [isFeatured, setIsFeatured] = useState(property?.is_featured || false);
  const [isActive, setIsActive] = useState(property?.is_active !== false);
  
  // Energy fields
  const [energyCertType, setEnergyCertType] = useState(property?.energy_certificate_type || '');
  const [energyCertValue, setEnergyCertValue] = useState(property?.energy_certificate_value || '');
  const [heatingType, setHeatingType] = useState(property?.heating_type || '');
  const [heatingEnergySource, setHeatingEnergySource] = useState(property?.heating_energy_source || '');
  const [internetSpeed, setInternetSpeed] = useState(property?.internet_speed || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cities and property types using React Query
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_cities', token }
      });
      return data?.cities || [];
    }
  });

  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_property_types', token }
      });
      return data?.property_types || [];
    }
  });

  // Tag management functions
  const addCustomTag = useCallback(() => {
    if (customTag.trim() && !eigenschaftenTags.includes(customTag.trim())) {
      setEigenschaftenTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  }, [customTag, eigenschaftenTags]);

  const removeTag = useCallback((index: number) => {
    setEigenschaftenTags(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const action = property ? 'update_property' : 'create_property';
      
      const propertyData = {
        title,
        description,
        address,
        postal_code: postalCode,
        neighborhood,
        rooms,
        area_sqm: parseInt(areaSqm) || 0,
        price_monthly: parseInt(priceMonthly) || 0,
        additional_costs_monthly: additionalCosts ? parseInt(additionalCosts) : null,
        warmmiete_monthly: warmmiete ? parseInt(warmmiete) : null,
        deposit_months: depositMonths ? parseInt(depositMonths) : null,
        floor: floor ? parseInt(floor) : null,
        year_built: yearBuilt ? parseInt(yearBuilt) : null,
        available_from: availableFrom || null,
        total_floors: totalFloors ? parseInt(totalFloors) : null,
        city_id: cityId,
        property_type_id: propertyTypeId,
        balcony,
        elevator,
        parking,
        pets_allowed: petsAllowed,
        furnished,
        kitchen_equipped: kitchenEquipped,
        dishwasher,
        washing_machine: washingMachine,
        dryer,
        tv,
        garden,
        cellar,
        attic,
        utilities_included: utilitiesIncluded,
        features_description: featuresDescription,
        additional_description: additionalDescription,
        neighborhood_description: neighborhoodDescription,
        eigenschaften_description: eigenschaftenDescription,
        eigenschaften_tags: eigenschaftenTags,
        energy_certificate_type: energyCertType,
        energy_certificate_value: energyCertValue,
        heating_type: heatingType,
        heating_energy_source: heatingEnergySource,
        internet_speed: internetSpeed,
        is_featured: isFeatured,
        is_active: isActive,
        images: property?.images || []
      };

      const requestBody = property 
        ? { action, token, propertyId: property.id, propertyData }
        : { action, token, propertyData };

      const { data } = await supabase.functions.invoke('admin-management', {
        body: requestBody
      });

      if (data?.property) {
        toast({
          title: "Erfolgreich",
          description: `Immobilie wurde ${property ? 'aktualisiert' : 'erstellt'}.`,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Fehler",
        description: `Immobilie konnte nicht ${property ? 'aktualisiert' : 'erstellt'} werden.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title, description, address, postalCode, neighborhood, rooms, areaSqm, priceMonthly,
    additionalCosts, warmmiete, depositMonths, floor, yearBuilt, availableFrom, totalFloors,
    cityId, propertyTypeId, balcony, elevator, parking, petsAllowed, furnished, kitchenEquipped,
    dishwasher, washingMachine, dryer, tv, garden, cellar, attic, utilitiesIncluded,
    featuresDescription, additionalDescription, neighborhoodDescription, eigenschaftenDescription,
    eigenschaftenTags, energyCertType, energyCertValue, heatingType, heatingEnergySource,
    internetSpeed, isFeatured, isActive, property, onClose, toast
  ]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Titel *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Select value={propertyTypeId} onValueChange={setPropertyTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Objektart auswählen *" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger>
                <SelectValue placeholder="Stadt auswählen *" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Straße und Hausnummer *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <Input
                placeholder="PLZ"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <Input
              placeholder="Stadtteil"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Basic Data */}
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Kaltmiete (€) *"
                type="number"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                required
              />
              <Input
                placeholder="Nebenkosten (€)"
                type="number"
                value={additionalCosts}
                onChange={(e) => setAdditionalCosts(e.target.value)}
              />
              <Input
                placeholder="Warmmiete (€)"
                type="number"
                value={warmmiete}
                onChange={(e) => setWarmmiete(e.target.value)}
              />
              <Input
                placeholder="Kaution (Monate)"
                type="number"
                value={depositMonths}
                onChange={(e) => setDepositMonths(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Area Data */}
        <Card>
          <CardHeader>
            <CardTitle>Flächenangaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Wohnfläche (m²) *"
                type="number"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                required
              />
              <Input
                placeholder="Zimmer * (z.B. 3)"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                required
              />
              <Input
                placeholder="Etage"
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
              <Input
                placeholder="Baujahr"
                type="number"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Available From */}
        <Card>
          <CardHeader>
            <CardTitle>Verfügbarkeit</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              placeholder="Verfügbar ab"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Features Checkboxes */}
        <Card>
          <CardHeader>
            <CardTitle>Ausstattungsmerkmale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { state: balcony, setState: setBalcony, label: 'Balkon' },
                { state: elevator, setState: setElevator, label: 'Aufzug' },
                { state: parking, setState: setParking, label: 'Parkplatz' },
                { state: petsAllowed, setState: setPetsAllowed, label: 'Haustiere erlaubt' },
                { state: furnished, setState: setFurnished, label: 'Möbliert' },
                { state: kitchenEquipped, setState: setKitchenEquipped, label: 'Küche ausgestattet' },
                { state: dishwasher, setState: setDishwasher, label: 'Spülmaschine' },
                { state: washingMachine, setState: setWashingMachine, label: 'Waschmaschine' },
                { state: dryer, setState: setDryer, label: 'Trockner' },
                { state: tv, setState: setTv, label: 'TV' },
                { state: garden, setState: setGarden, label: 'Garten' },
                { state: cellar, setState: setCellar, label: 'Keller' },
                { state: attic, setState: setAttic, label: 'Dachboden' },
                { state: utilitiesIncluded, setState: setUtilitiesIncluded, label: 'NK inklusive' }
              ].map(({ state, setState, label }) => (
                <div key={label} className="flex items-center space-x-2">
                  <Checkbox
                    id={label}
                    checked={state}
                    onCheckedChange={(checked) => setState(checked as boolean)}
                  />
                  <label htmlFor={label} className="text-sm font-medium">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ausstattung Description */}
        <Card>
          <CardHeader>
            <CardTitle>Ausstattung</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Detaillierte Beschreibung der Ausstattung..."
              value={featuresDescription}
              onChange={(e) => setFeaturesDescription(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Eigenschaften */}
        <Card>
          <CardHeader>
            <CardTitle>Eigenschaften</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Custom Tags */}
            <div>
              <h4 className="font-medium mb-3">Benutzerdefinierte Tags</h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Tag hinzufügen (z.B. Klimaanlage, Sauna, etc.)"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCustomTag}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {eigenschaftenTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {eigenschaftenTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Eigenschaften Description */}
            <div>
              <h4 className="font-medium mb-3">Eigenschaften Beschreibung</h4>
              <Textarea
                placeholder="Detaillierte Beschreibung der besonderen Eigenschaften..."
                value={eigenschaftenDescription}
                onChange={(e) => setEigenschaftenDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Description */}
        <Card>
          <CardHeader>
            <CardTitle>Weitere Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Zusätzliche Informationen..."
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Aktiv
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                />
                <label htmlFor="is_featured" className="text-sm font-medium">
                  Empfohlen
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Speichern...' : (property ? 'Aktualisieren' : 'Erstellen')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormNew;

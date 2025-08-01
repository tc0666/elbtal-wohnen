import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import { PropertyBase } from '@/types/property';

interface SimplePropertyFormProps {
  property?: PropertyBase | null;
  onClose: () => void;
}

const SimplePropertyForm: React.FC<SimplePropertyFormProps> = ({ property, onClose }) => {
  const { toast } = useToast();
  
  // Initialize all states immediately without any complex logic
  const [formState] = useState(() => ({
    title: property?.title || '',
    description: property?.description || '',
    address: property?.address || '',
    rooms: property?.rooms || '',
    areaSqm: property?.area_sqm?.toString() || '',
    priceMonthly: property?.price_monthly?.toString() || '',
    cityId: property?.city_id || '',
    propertyTypeId: property?.property_type_id || '',
    isActive: property?.is_active !== false
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Static data for now to avoid React Query re-renders
  const cities = [
    { id: 'edf4403c-d4f9-445c-9826-00710eafdf39', name: 'Berlin' },
    { id: 'test-city', name: 'Test City' }
  ];

  const propertyTypes = [
    { id: '5ebb058b-5381-4371-85e4-59dbe879a10b', name: 'Wohnung' },
    { id: 'test-type', name: 'Haus' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      toast({
        title: "Test erfolgreich",
        description: "Form submission test - focus should work now!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Test error",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {property ? 'Immobilie bearbeiten' : 'Neue Immobilie'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grundinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  key="title-input"
                  placeholder="Titel *"
                  defaultValue={formState.title}
                  required
                />
                
                <Select defaultValue={formState.propertyTypeId}>
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

                <Textarea
                  key="description-input"
                  placeholder="Beschreibung"
                  defaultValue={formState.description}
                  rows={4}
                />

                <Select defaultValue={formState.cityId}>
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

            <Card>
              <CardHeader>
                <CardTitle>Adresse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  key="address-input"
                  placeholder="Straße und Hausnummer *"
                  defaultValue={formState.address}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    key="price-input"
                    placeholder="Kaltmiete (€) *"
                    type="number"
                    defaultValue={formState.priceMonthly}
                    required
                  />
                  <Input
                    key="area-input"
                    placeholder="Wohnfläche (m²) *"
                    type="number"
                    defaultValue={formState.areaSqm}
                    required
                  />
                  <Input
                    key="rooms-input"
                    placeholder="Zimmer * (z.B. 3)"
                    defaultValue={formState.rooms}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    defaultChecked={formState.isActive}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Aktiv
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Speichern...' : 'Test Submit'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimplePropertyForm;
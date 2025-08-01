import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { PropertyBase, PropertyFormData } from '@/types/property';

interface PropertyFormProps {
  property?: PropertyBase | null;
  onClose: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    postal_code: '',
    neighborhood: '',
    rooms: '',
    area_sqm: 0,
    price_monthly: 0,
    additional_costs_monthly: 0,
    property_type_id: '',
    city_id: '',
    floor: 0,
    total_floors: 0,
    year_built: 0,
    available_from: '',
    deposit_months: 3,
    kitchen_equipped: false,
    furnished: false,
    pets_allowed: false,
    utilities_included: false,
    balcony: false,
    elevator: false,
    parking: false,
    garden: false,
    cellar: false,
    attic: false,
    dishwasher: false,
    washing_machine: false,
    dryer: false,
    tv: false,
    energy_certificate_type: '',
    energy_certificate_value: '',
    heating_type: '',
    heating_energy_source: '',
    internet_speed: '',
    features_description: '',
    additional_description: '',
    is_featured: false,
    is_active: true,
    images: []
  });

  const [cities, setCities] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('PropertyForm received property:', property);
    fetchCitiesAndTypes();
  }, [property]);

  // Separate useEffect to set form data after both property and dropdown data are loaded
  useEffect(() => {
    if (property && cities.length > 0 && propertyTypes.length > 0) {
      console.log('Setting form data with property:', property);
      console.log('Available cities:', cities);
      console.log('Available property types:', propertyTypes);
      
      setFormData({
        title: property.title || '',
        description: property.description || '',
        address: property.address || '',
        postal_code: property.postal_code || '',
        neighborhood: property.neighborhood || '',
        rooms: property.rooms || '',
        area_sqm: property.area_sqm || 0,
        price_monthly: property.price_monthly || 0,
        additional_costs_monthly: property.additional_costs_monthly || 0,
        property_type_id: property.property_type_id || '',
        city_id: property.city_id || '',
        floor: property.floor || 0,
        total_floors: property.total_floors || 0,
        year_built: property.year_built || 0,
        available_from: property.available_from ? new Date(property.available_from).toISOString().split('T')[0] : '',
        deposit_months: property.deposit_months || 3,
        kitchen_equipped: property.kitchen_equipped || false,
        furnished: property.furnished || false,
        pets_allowed: property.pets_allowed || false,
        utilities_included: property.utilities_included || false,
        balcony: property.balcony || false,
        elevator: property.elevator || false,
        parking: property.parking || false,
        garden: property.garden || false,
        cellar: property.cellar || false,
        attic: property.attic || false,
        dishwasher: property.dishwasher || false,
        washing_machine: property.washing_machine || false,
        dryer: property.dryer || false,
        tv: property.tv || false,
        energy_certificate_type: property.energy_certificate_type || '',
        energy_certificate_value: property.energy_certificate_value || '',
        heating_type: property.heating_type || '',
        heating_energy_source: property.heating_energy_source || '',
        internet_speed: property.internet_speed || '',
        features_description: property.features_description || '',
        additional_description: property.additional_description || '',
        is_featured: property.is_featured || false,
        is_active: property.is_active !== undefined ? property.is_active : true,
        images: property.images || []
      });
      
      console.log('Form data set with city_id:', property.city_id, 'and property_type_id:', property.property_type_id);
    }
  }, [property, cities, propertyTypes]);

  const fetchCitiesAndTypes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [citiesResponse, typesResponse] = await Promise.all([
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_cities', token }
        }),
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_property_types', token }
        })
      ]);

      if (citiesResponse.data?.cities) setCities(citiesResponse.data.cities);
      if (typesResponse.data?.property_types) setPropertyTypes(typesResponse.data.property_types);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    
    try {
      // Upload featured image if exists
      if (featuredImageFile) {
        const featuredFileName = `featured-${Date.now()}-${featuredImageFile.name}`;
        const { data: featuredUpload } = await supabase.storage
          .from('featured-images')
          .upload(featuredFileName, featuredImageFile);
        
        if (featuredUpload) {
          const { data: { publicUrl } } = supabase.storage
            .from('featured-images')
            .getPublicUrl(featuredUpload.path);
          uploadedUrls.push(publicUrl);
        }
      }

      // Upload additional images
      for (const file of additionalImageFiles) {
        const fileName = `property-${Date.now()}-${Math.random()}-${file.name}`;
        const { data: upload } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);
        
        if (upload) {
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(upload.path);
          uploadedUrls.push(publicUrl);
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadingImages(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (featuredImageFile || additionalImageFiles.length > 0) {
        newImageUrls = await uploadImages();
      }

      // Combine existing images with new ones
      const allImages = [...formData.images, ...newImageUrls];
      
      const action = property ? 'update_property' : 'create_property';
      
      const propertyData = {
        ...formData,
        images: allImages,
        available_from: formData.available_from || null
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
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImageFiles(prev => [...prev, ...files]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold">
          {property ? 'Immobilie bearbeiten' : 'Neue Immobilie'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Titel *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Zimmer * (z.B. 3)"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Beschreibung"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
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
              </div>
              <div className="space-y-2">
                <Select value={formData.property_type_id} onValueChange={(value) => setFormData({ ...formData, property_type_id: value })}>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Input
                  placeholder="Straße und Hausnummer *"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="PLZ"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Stadtteil"
                value={formData.neighborhood || ''}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preise & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Kaltmiete (€) *"
                  type="number"
                  value={formData.price_monthly || ''}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Nebenkosten (€)"
                  type="number"
                  value={formData.additional_costs_monthly || ''}
                  onChange={(e) => setFormData({ ...formData, additional_costs_monthly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Wohnfläche (m²) *"
                  type="number"
                  value={formData.area_sqm || ''}
                  onChange={(e) => setFormData({ ...formData, area_sqm: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Etage"
                  type="number"
                  value={formData.floor || ''}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Etagen gesamt"
                  type="number"
                  value={formData.total_floors || ''}
                  onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Baujahr"
                  type="number"
                  value={formData.year_built || ''}
                  onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Kaution (Monate)"
                  type="number"
                  value={formData.deposit_months || ''}
                  onChange={(e) => setFormData({ ...formData, deposit_months: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Verfügbar ab"
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energie & Heizung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Energieausweis-Typ (z.B. Verbrauchsausweis)"
                  value={formData.energy_certificate_type}
                  onChange={(e) => setFormData({ ...formData, energy_certificate_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Energiekennwert (z.B. 120 kWh/(m²·a))"
                  value={formData.energy_certificate_value}
                  onChange={(e) => setFormData({ ...formData, energy_certificate_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Heizungsart (z.B. Zentralheizung)"
                  value={formData.heating_type}
                  onChange={(e) => setFormData({ ...formData, heating_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Energieträger (z.B. Gas, Öl, Fernwärme)"
                  value={formData.heating_energy_source}
                  onChange={(e) => setFormData({ ...formData, heating_energy_source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Internet-Geschwindigkeit (z.B. 100 Mbit/s)"
                  value={formData.internet_speed}
                  onChange={(e) => setFormData({ ...formData, internet_speed: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ausstattung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'kitchen_equipped', label: 'Einbauküche' },
                { key: 'furnished', label: 'Möbliert' },
                { key: 'pets_allowed', label: 'Haustiere erlaubt' },
                { key: 'utilities_included', label: 'NK inklusive' },
                { key: 'balcony', label: 'Balkon' },
                { key: 'elevator', label: 'Aufzug' },
                { key: 'parking', label: 'Parkplatz' },
                { key: 'garden', label: 'Garten' },
                { key: 'cellar', label: 'Keller' },
                { key: 'attic', label: 'Dachboden' },
                { key: 'dishwasher', label: 'Spülmaschine' },
                { key: 'washing_machine', label: 'Waschmaschine' },
                { key: 'dryer', label: 'Trockner' },
                { key: 'tv', label: 'TV' },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key as keyof PropertyFormData] as boolean}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, [item.key]: checked })
                    }
                  />
                  <label htmlFor={item.key} className="text-sm cursor-pointer">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Detaillierte Ausstattungsbeschreibung (z.B. Luxuriöse 4-Zimmer Wohnung mit exklusiver Ausstattung...)"
                value={formData.features_description}
                onChange={(e) => setFormData({ ...formData, features_description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weitere Beschreibung & Lage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Weitere Beschreibung (z.B. Exklusives Wohnen in bester Lage. Das Gebäude verfügt über...)"
                value={formData.additional_description}
                onChange={(e) => setFormData({ ...formData, additional_description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Featured Image Upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Hauptbild</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="cursor-pointer"
              />
              {featuredImageFile && (
                <p className="text-sm text-muted-foreground">
                  Ausgewählt: {featuredImageFile.name}
                </p>
              )}
            </div>

            {/* Additional Images Upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Weitere Bilder</p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="cursor-pointer"
              />
              {additionalImageFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {additionalImageFiles.length} neue Bilder ausgewählt:
                  </p>
                  {additionalImageFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Images */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Vorhandene Bilder</p>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <img 
                          src={image} 
                          alt={`Bild ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="text-sm truncate">{image}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <label htmlFor="is_active" className="cursor-pointer">Aktiv</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <label htmlFor="is_featured" className="cursor-pointer">Empfohlen</label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || uploadingImages} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {uploadingImages ? 'Bilder werden hochgeladen...' : isLoading ? 'Speichere...' : (property ? 'Aktualisieren' : 'Erstellen')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    price_monthly: null,
    warmmiete_monthly: null,
    additional_costs_monthly: null,
    property_type_id: '',
    city_id: '',
    floor: null,
    total_floors: null,
    year_built: null,
    available_from: '',
    deposit_months: null,
    energy_certificate_type: '',
    energy_certificate_value: '',
    heating_type: '',
    heating_energy_source: '',
    internet_speed: '',
    features_description: '',
    additional_description: '',
    neighborhood_description: '',
    eigenschaften_description: '',
    eigenschaften_tags: [],
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
  
  // Eigenschaften state
  const [eigenschaftenTags, setEigenschaftenTags] = useState<string[]>([]);
  const [customEigenschaftenTag, setCustomEigenschaftenTag] = useState('');
  
  // Feature checkboxes
  const [featureCheckboxes, setFeatureCheckboxes] = useState({
    balcony: false,
    elevator: false,
    parking: false,
    pets_allowed: false,
    furnished: false,
    kitchen_equipped: false,
    dishwasher: false,
    washing_machine: false,
    dryer: false,
    tv: false,
    garden: false,
    cellar: false,
    attic: false,
    utilities_included: false,
  });
  
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
        price_monthly: property.price_monthly || null,
        warmmiete_monthly: property.warmmiete_monthly || null,
        additional_costs_monthly: property.additional_costs_monthly || null,
        property_type_id: property.property_type_id || '',
        city_id: property.city_id || '',
        floor: property.floor || null,
        total_floors: property.total_floors || null,
        year_built: property.year_built || null,
        available_from: property.available_from ? new Date(property.available_from).toISOString().split('T')[0] : '',
        deposit_months: property.deposit_months || null,
        energy_certificate_type: property.energy_certificate_type || '',
        energy_certificate_value: property.energy_certificate_value || '',
        heating_type: property.heating_type || '',
        heating_energy_source: property.heating_energy_source || '',
        internet_speed: property.internet_speed || '',
        features_description: property.features_description || '',
        additional_description: property.additional_description || '',
        neighborhood_description: property.neighborhood_description || '',
        eigenschaften_description: property.eigenschaften_description || '',
        eigenschaften_tags: property.eigenschaften_tags || [],
        is_featured: property.is_featured || false,
        is_active: property.is_active !== undefined ? property.is_active : true,
        images: property.images || []
      });
      
      // Set eigenschaften tags
      setEigenschaftenTags(property.eigenschaften_tags || []);
      
      // Set feature checkboxes
      setFeatureCheckboxes({
        balcony: property.balcony || false,
        elevator: property.elevator || false,
        parking: property.parking || false,
        pets_allowed: property.pets_allowed || false,
        furnished: property.furnished || false,
        kitchen_equipped: property.kitchen_equipped || false,
        dishwasher: property.dishwasher || false,
        washing_machine: property.washing_machine || false,
        dryer: property.dryer || false,
        tv: property.tv || false,
        garden: property.garden || false,
        cellar: property.cellar || false,
        attic: property.attic || false,
        utilities_included: property.utilities_included || false,
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
      console.log('Starting form submission, token:', token ? 'exists' : 'missing');
      console.log('Form data:', formData);
      
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (featuredImageFile || additionalImageFiles.length > 0) {
        console.log('Uploading images...');
        newImageUrls = await uploadImages();
      }

      // Combine existing images with new ones
      const allImages = [...formData.images, ...newImageUrls];
      
      const action = property ? 'update_property' : 'create_property';
      console.log('Action:', action);
      
      const propertyData = {
        ...formData,
        // Ensure required numeric fields have valid values
        area_sqm: formData.area_sqm && formData.area_sqm > 0 ? formData.area_sqm : 0,
        price_monthly: formData.price_monthly && formData.price_monthly > 0 ? formData.price_monthly : 0,
        images: allImages,
        available_from: formData.available_from || null,
        eigenschaften_tags: eigenschaftenTags,
        ...featureCheckboxes
      };

      console.log('Property data to send:', propertyData);

      const requestBody = property 
        ? { action, token, propertyId: property.id, propertyData }
        : { action, token, propertyData };

      console.log('Request body:', requestBody);

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: requestBody
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (data?.property) {
        console.log('Success! Property created/updated:', data.property);
        toast({
          title: "Erfolgreich",
          description: `Immobilie wurde ${property ? 'aktualisiert' : 'erstellt'}.`,
        });
        onClose();
      } else {
        console.log('No property in response, data:', data);
        toast({
          title: "Fehler",
          description: `Immobilie konnte nicht ${property ? 'aktualisiert' : 'erstellt'} werden.`,
          variant: "destructive"
        });
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

  const addCustomEigenschaftenTag = () => {
    if (customEigenschaftenTag.trim() && !eigenschaftenTags.includes(customEigenschaftenTag.trim())) {
      setEigenschaftenTags([...eigenschaftenTags, customEigenschaftenTag.trim()]);
      setCustomEigenschaftenTag('');
    }
  };

  const removeEigenschaftenTag = (index: number) => {
    setEigenschaftenTags(eigenschaftenTags.filter((_, i) => i !== index));
  };

  const handleFeatureCheckboxChange = (feature: string, checked: boolean) => {
    setFeatureCheckboxes(prev => ({
      ...prev,
      [feature]: checked
    }));
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
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Titel *"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
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

            <div className="space-y-2">
              <Textarea
                placeholder="Beschreibung"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

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
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="ID (wird automatisch generiert)"
                value={property?.id || 'Wird automatisch generiert'}
                disabled
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Kaltmiete (€) *"
                  type="number"
                  value={formData.price_monthly !== null ? formData.price_monthly : ''}
                  onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value ? parseInt(e.target.value) : null })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Nebenkosten (€)"
                  type="number"
                  value={formData.additional_costs_monthly !== null ? formData.additional_costs_monthly : ''}
                  onChange={(e) => setFormData({ ...formData, additional_costs_monthly: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Warmmiete (€)"
                  type="number"
                  value={formData.warmmiete_monthly !== null ? formData.warmmiete_monthly : ''}
                  onChange={(e) => setFormData({ ...formData, warmmiete_monthly: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Kaution (Monate)"
                  type="number"
                  value={formData.deposit_months !== null ? formData.deposit_months : ''}
                  onChange={(e) => setFormData({ ...formData, deposit_months: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flächenangaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Wohnfläche (m²) *"
                  type="number"
                  value={formData.area_sqm || ''}
                  onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value ? parseInt(e.target.value) : 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Zimmer * (z.B. 3)"
                  value={formData.rooms || ''}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Etage"
                  type="number"
                  value={formData.floor !== null ? formData.floor : ''}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Baujahr"
                  type="number"
                  value={formData.year_built !== null ? formData.year_built : ''}
                  onChange={(e) => setFormData({ ...formData, year_built: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="Verfügbar ab (YYYY-MM-DD)"
                type="date"
                value={formData.available_from || ''}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weitere Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Etagen gesamt"
                type="number"
                value={formData.total_floors !== null ? formData.total_floors : ''}
                onChange={(e) => setFormData({ ...formData, total_floors: e.target.value ? parseInt(e.target.value) : null })}
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
            <div className="space-y-2">
              <Textarea
                placeholder="Detaillierte Ausstattungsbeschreibung (z.B. Luxuriöse 4-Zimmer Wohnung mit exklusiver Ausstattung. Marmorbäder, Einbauschränke, Klimaanlage und Alarmanlage. Tiefgaragenstellplatz inklusive.)"
                value={formData.features_description || ''}
                onChange={(e) => setFormData({ ...formData, features_description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eigenschaften & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature Checkboxes */}
            <div>
              <h4 className="font-medium mb-3">Ausstattungsmerkmale</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={featureCheckboxes.balcony}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('balcony', checked as boolean)}
                  />
                  <label htmlFor="balcony" className="cursor-pointer text-sm">Balkon</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="elevator"
                    checked={featureCheckboxes.elevator}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('elevator', checked as boolean)}
                  />
                  <label htmlFor="elevator" className="cursor-pointer text-sm">Aufzug</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={featureCheckboxes.parking}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('parking', checked as boolean)}
                  />
                  <label htmlFor="parking" className="cursor-pointer text-sm">Parkplatz</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pets_allowed"
                    checked={featureCheckboxes.pets_allowed}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('pets_allowed', checked as boolean)}
                  />
                  <label htmlFor="pets_allowed" className="cursor-pointer text-sm">Haustiere erlaubt</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={featureCheckboxes.furnished}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('furnished', checked as boolean)}
                  />
                  <label htmlFor="furnished" className="cursor-pointer text-sm">Möbliert</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kitchen_equipped"
                    checked={featureCheckboxes.kitchen_equipped}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('kitchen_equipped', checked as boolean)}
                  />
                  <label htmlFor="kitchen_equipped" className="cursor-pointer text-sm">Küche ausgestattet</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dishwasher"
                    checked={featureCheckboxes.dishwasher}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('dishwasher', checked as boolean)}
                  />
                  <label htmlFor="dishwasher" className="cursor-pointer text-sm">Spülmaschine</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="washing_machine"
                    checked={featureCheckboxes.washing_machine}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('washing_machine', checked as boolean)}
                  />
                  <label htmlFor="washing_machine" className="cursor-pointer text-sm">Waschmaschine</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dryer"
                    checked={featureCheckboxes.dryer}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('dryer', checked as boolean)}
                  />
                  <label htmlFor="dryer" className="cursor-pointer text-sm">Trockner</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tv"
                    checked={featureCheckboxes.tv}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('tv', checked as boolean)}
                  />
                  <label htmlFor="tv" className="cursor-pointer text-sm">TV</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="garden"
                    checked={featureCheckboxes.garden}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('garden', checked as boolean)}
                  />
                  <label htmlFor="garden" className="cursor-pointer text-sm">Garten</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cellar"
                    checked={featureCheckboxes.cellar}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('cellar', checked as boolean)}
                  />
                  <label htmlFor="cellar" className="cursor-pointer text-sm">Keller</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attic"
                    checked={featureCheckboxes.attic}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('attic', checked as boolean)}
                  />
                  <label htmlFor="attic" className="cursor-pointer text-sm">Dachboden</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="utilities_included"
                    checked={featureCheckboxes.utilities_included}
                    onCheckedChange={(checked) => handleFeatureCheckboxChange('utilities_included', checked as boolean)}
                  />
                  <label htmlFor="utilities_included" className="cursor-pointer text-sm">Nebenkosten inklusive</label>
                </div>
              </div>
            </div>

            {/* Custom Eigenschaften Tags */}
            <div>
              <h4 className="font-medium mb-3">Benutzerdefinierte Eigenschaften Tags</h4>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Tag hinzufügen (z.B. Klimaanlage, Sauna, etc.)"
                  value={customEigenschaftenTag}
                  onChange={(e) => setCustomEigenschaftenTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomEigenschaftenTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCustomEigenschaftenTag}
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
                        onClick={() => removeEigenschaftenTag(index)}
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
                placeholder="Detaillierte Beschreibung der besonderen Eigenschaften (z.B. Diese Wohnung besticht durch ihre moderne Ausstattung und durchdachte Raumaufteilung...)"
                value={formData.eigenschaften_description || ''}
                onChange={(e) => setFormData({ ...formData, eigenschaften_description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weitere Beschreibung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Weitere Beschreibung (z.B. Exklusives Wohnen in bester Lage. Das Gebäude verfügt über einen Concierge-Service und gepflegte Grünanlagen. Fitnessraum und Gemeinschaftsräume stehen den Bewohnern zur Verfügung.)"
                value={formData.additional_description || ''}
                onChange={(e) => setFormData({ ...formData, additional_description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Lage & Umgebung (z.B. Ruhige Lage in beliebtem Stadtteil. Nahe zu öffentlichen Verkehrsmitteln, Einkaufsmöglichkeiten und Parks. Gute Infrastruktur mit Schulen und Kindergärten in der Nähe.)"
                value={formData.neighborhood_description || ''}
                onChange={(e) => setFormData({ ...formData, neighborhood_description: e.target.value })}
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
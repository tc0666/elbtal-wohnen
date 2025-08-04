import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin, Euro, Ruler, Users, Building2, Eye, Calendar, Phone, Mail, MessageSquare, User, Clock } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import { PropertyWithRelations } from '@/types/property';
import { XLSXUpload } from '@/components/XLSXUpload';

interface ContactRequest {
  id: string;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  nachricht: string;
  status: string;
  created_at: string;
}

interface PropertyInquiries {
  property: PropertyWithRelations;
  inquiries: ContactRequest[];
  inquiryCount: number;
}

const PropertiesManagement = () => {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithRelations[]>([]);
  const [cities, setCities] = useState<{id: string; name: string}[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithRelations | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyInquiries | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    notes: '',
    contactId: ''
  });
  const { toast } = useToast();

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      console.log('Fetching properties with token...');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_properties', token }
      });

      console.log('Properties response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to fetch properties');
      }

      if (data?.properties) {
        console.log('Properties loaded:', data.properties.length);
        setProperties(data.properties);
        setFilteredProperties(data.properties);
      } else {
        console.warn('No properties data received');
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Fehler",
        description: "Immobilien konnten nicht geladen werden.",
        variant: "destructive"
      });
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_cities', token }
      });

      if (data?.cities) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchPropertyInquiries = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_property_inquiries', token, propertyId }
      });

      if (data?.inquiries) {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          setSelectedProperty({
            property,
            inquiries: data.inquiries,
            inquiryCount: data.inquiries.length
          });
          setViewDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching property inquiries:', error);
      toast({
        title: "Fehler",
        description: "Anfragen konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  const scheduleAppointment = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'schedule_appointment', 
          token,
          ...appointmentData,
          propertyId: selectedProperty?.property.id
        }
      });

      if (data?.success) {
        toast({
          title: "Termin geplant",
          description: "Der Besichtigungstermin wurde erfolgreich geplant.",
        });
        setAppointmentDialogOpen(false);
        setAppointmentData({ date: '', time: '', notes: '', contactId: '' });
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht geplant werden.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity === 'all') {
      setFilteredProperties(properties);
    } else {
      setFilteredProperties(properties.filter(property => property.city_id === selectedCity));
    }
  }, [selectedCity, properties]);

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Immobilie löschen möchten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'delete_property', token, id: propertyId }
      });

      if (data?.success) {
        toast({
          title: "Erfolgreich",
          description: "Immobilie wurde gelöscht.",
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Fehler",
        description: "Immobilie konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Sind Sie sicher, dass Sie ALLE Immobilien löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'bulk_delete_properties', token }
      });

      if (data?.success) {
        toast({
          title: "Erfolgreich",
          description: "Alle Immobilien wurden gelöscht.",
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Error bulk deleting properties:', error);
      toast({
        title: "Fehler",
        description: "Immobilien konnten nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (property: PropertyWithRelations) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProperty(null);
    fetchProperties();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Immobilien Verwaltung</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Immobilien werden geladen...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <PropertyForm 
        property={editingProperty}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Immobilien Verwaltung</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neue Immobilie
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleBulkDelete}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Alle Immobilien löschen
        </Button>
      </div>

      {/* CSV Upload Section */}
      <XLSXUpload onUploadComplete={fetchProperties} />

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Label htmlFor="city-filter" className="text-sm font-medium">Nach Stadt filtern:</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stadt auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Städte ({properties.length})</SelectItem>
            {cities.map((city) => {
              const cityCount = properties.filter(p => p.city_id === city.id).length;
              return (
                <SelectItem key={city.id} value={city.id}>
                  {city.name} ({cityCount})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredProperties.length} von {properties.length} Immobilien
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Immobilien gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Fügen Sie Ihre erste Immobilie hinzu, um zu beginnen.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Immobilie hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full lg:w-48 h-32 lg:h-24 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full lg:w-48 h-32 lg:h-24 bg-muted rounded-md flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">{property.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}, {property.city?.name}
                        </div>
                      </div>
                      <div className="flex flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchPropertyInquiries(property.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">Anzeigen</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(property)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Löschen</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      {property.is_featured && (
                        <Badge variant="outline">Empfohlen</Badge>
                      )}
                      {property.property_type?.name && (
                        <Badge variant="secondary">{property.property_type.name}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold">{formatPrice(property.price_monthly)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4 text-primary shrink-0" />
                        <span>{property.area_sqm} m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>{property.rooms} Zimmer</span>
                      </div>
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                        <span>ID: {property.id.slice(0, 8)}...</span>
                      </div>
                    </div>

                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                        {property.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Property Inquiries Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anfragen für {selectedProperty?.property.title}</DialogTitle>
            <DialogDescription>
              {selectedProperty?.inquiryCount} Anfrage{selectedProperty?.inquiryCount !== 1 ? 'n' : ''} für diese Immobilie
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{selectedProperty.property.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.property.address}, {selectedProperty.property.city?.name}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {formatPrice(selectedProperty.property.price_monthly)}/Monat
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inquiries List */}
              {selectedProperty.inquiries.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Kontaktanfragen</h4>
                    <Button 
                      onClick={() => setAppointmentDialogOpen(true)}
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Besichtigungstermin planen
                    </Button>
                  </div>
                  
                  {selectedProperty.inquiries.map((inquiry) => (
                    <Card key={inquiry.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <User className="h-8 w-8 bg-primary/10 text-primary p-2 rounded-full" />
                              <div>
                                <p className="font-medium">
                                  {inquiry.anrede && `${inquiry.anrede === 'herr' ? 'Hr.' : inquiry.anrede === 'frau' ? 'Fr.' : 'Divers'} `}
                                  {inquiry.vorname} {inquiry.nachname}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${inquiry.email}`} className="hover:underline">
                                      {inquiry.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <a href={`tel:${inquiry.telefon}`} className="hover:underline">
                                      {inquiry.telefon}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(inquiry.created_at).toLocaleDateString('de-DE')}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(inquiry.status)}>
                              {getStatusLabel(inquiry.status)}
                            </Badge>
                          </div>
                          
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm leading-relaxed">{inquiry.nachricht}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setAppointmentData({...appointmentData, contactId: inquiry.id});
                                setAppointmentDialogOpen(true);
                              }}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Termin vereinbaren
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                window.location.href = `mailto:${inquiry.email}?subject=Re: Ihre Anfrage zu ${selectedProperty.property.title}&body=Hallo ${inquiry.vorname} ${inquiry.nachname},%0D%0A%0D%0AVielen Dank für Ihr Interesse an unserer Immobilie...`;
                              }}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              E-Mail senden
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keine Anfragen</h3>
                    <p className="text-muted-foreground">
                      Für diese Immobilie sind noch keine Anfragen eingegangen.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Scheduling Dialog */}
      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Besichtigungstermin planen</DialogTitle>
            <DialogDescription>
              Planen Sie einen Besichtigungstermin für {selectedProperty?.property.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Datum</Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-time">Uhrzeit</Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentData.time}
                onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-notes">Notizen (optional)</Label>
              <Textarea
                id="appointment-notes"
                placeholder="Besondere Wünsche oder Anmerkungen..."
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setAppointmentDialogOpen(false)} className="flex-1">
                Abbrechen
              </Button>
              <Button onClick={scheduleAppointment} className="flex-1">
                Termin planen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertiesManagement;
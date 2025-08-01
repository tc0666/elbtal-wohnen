import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Send, X } from 'lucide-react';

interface ContactFormData {
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  nummer: string;
  plz: string;
  ort: string;
  nachricht: string;
  datenschutz: boolean;
  propertyId?: string;
}

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  trigger?: React.ReactNode;
  isDialog?: boolean;
  onClose?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  propertyId, 
  propertyTitle, 
  trigger,
  isDialog = false,
  onClose
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    anrede: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    nummer: '',
    plz: '',
    ort: '',
    nachricht: propertyTitle ? `Ich interessiere mich für die Immobilie: ${propertyTitle}` : '',
    datenschutz: false,
    propertyId: propertyId
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.datenschutz) {
      toast({
        title: "Datenschutz erforderlich",
        description: "Bitte stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call later
      console.log('Contact form submission:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Nachricht gesendet!",
        description: "Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze bei Ihnen.",
      });
      
      // Reset form
      setFormData({
        anrede: '',
        vorname: '',
        nachname: '',
        email: '',
        telefon: '',
        strasse: '',
        nummer: '',
        plz: '',
        ort: '',
        nachricht: '',
        datenschutz: false,
        propertyId: propertyId
      });

      if (isDialog) {
        setOpen(false);
        onClose?.();
      }
      
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message */}
      <div>
        <Label htmlFor="nachricht">Ihre Nachricht *</Label>
        <Textarea
          id="nachricht"
          placeholder="Beschreiben Sie Ihr Anliegen..."
          value={formData.nachricht}
          onChange={(e) => handleInputChange('nachricht', e.target.value)}
          required
          className="min-h-[120px] mt-2"
        />
      </div>

      {/* Anrede, Vorname, Nachname */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="anrede">Anrede</Label>
          <Select value={formData.anrede} onValueChange={(value) => handleInputChange('anrede', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="herr">Herr</SelectItem>
              <SelectItem value="frau">Frau</SelectItem>
              <SelectItem value="divers">Divers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vorname">Vorname *</Label>
          <Input
            id="vorname"
            value={formData.vorname}
            onChange={(e) => handleInputChange('vorname', e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            value={formData.nachname}
            onChange={(e) => handleInputChange('nachname', e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="telefon">Telefon *</Label>
          <Input
            id="telefon"
            type="tel"
            value={formData.telefon}
            onChange={(e) => handleInputChange('telefon', e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Label htmlFor="strasse">Straße</Label>
          <Input
            id="strasse"
            value={formData.strasse}
            onChange={(e) => handleInputChange('strasse', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nummer">Nr.</Label>
          <Input
            id="nummer"
            value={formData.nummer}
            onChange={(e) => handleInputChange('nummer', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            value={formData.plz}
            onChange={(e) => handleInputChange('plz', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="ort">Ort</Label>
          <Input
            id="ort"
            value={formData.ort}
            onChange={(e) => handleInputChange('ort', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Privacy Checkbox */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="datenschutz"
          checked={formData.datenschutz}
          onCheckedChange={(checked) => handleInputChange('datenschutz', checked as boolean)}
        />
        <Label htmlFor="datenschutz" className="text-sm leading-relaxed">
          Ich habe die{' '}
          <a href="#" className="text-primary hover:underline">
            Datenschutzerklärung
          </a>{' '}
          gelesen und willige der Verarbeitung meiner Daten zum Zweck 
          der Bearbeitung meiner Anfrage ein. *
        </Label>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Wird gesendet..."
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Jetzt Anfrage senden
          </>
        )}
      </Button>
    </form>
  );

  if (isDialog && trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {propertyTitle ? `Interesse an: ${propertyTitle}` : 'Kontakt aufnehmen'}
            </DialogTitle>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Kontaktformular
        </CardTitle>
        <p className="text-muted-foreground">
          Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
        </p>
      </CardHeader>
      <CardContent>
        <FormContent />
      </CardContent>
    </Card>
  );
};

export default ContactForm;
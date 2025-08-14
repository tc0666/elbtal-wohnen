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
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  trigger?: React.ReactNode;
  isDialog?: boolean;
  onClose?: () => void;
}

const ContactFormFixed: React.FC<ContactFormProps> = ({ 
  propertyId, 
  propertyTitle, 
  trigger,
  isDialog = false,
  onClose
}) => {
  const { toast } = useToast();
  
  // Individual state variables to prevent re-render issues
  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [strasse, setStrasse] = useState('');
  const [nummer, setNummer] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [nachricht, setNachricht] = useState(
    propertyTitle ? `Ich interessiere mich für die Immobilie: ${propertyTitle}` : ''
  );
  const [datenschutz, setDatenschutz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    setIsSubmitting(true);
    
    try {
      const formData = {
        propertyId,
        anrede,
        vorname,
        nachname,
        email,
        telefon,
        strasse,
        nummer,
        plz,
        ort,
        nachricht,
        datenschutz: true
      };

      // Submit to contact-submit edge function
      const { data, error } = await supabase.functions.invoke('contact-submit', {
        body: formData
      });

      if (error || data.error) {
        throw new Error(data.error || 'Submission failed');
      }
      
      toast({
        title: "Nachricht gesendet!",
        description: "Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze bei Ihnen.",
      });
      
      // Reset form
      setAnrede('');
      setVorname('');
      setNachname('');
      setEmail('');
      setTelefon('');
      setStrasse('');
      setNummer('');
      setPlz('');
      setOrt('');
      setNachricht('');
      setDatenschutz(false);

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
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          required
          className="min-h-[120px] mt-2"
        />
      </div>

      {/* Anrede, Vorname, Nachname */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="anrede">Anrede</Label>
          <Select value={anrede} onValueChange={setAnrede}>
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
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            value={nachname}
            onChange={(e) => setNachname(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="telefon">Telefon *</Label>
          <Input
            id="telefon"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
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
            value={strasse}
            onChange={(e) => setStrasse(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nummer">Nr.</Label>
          <Input
            id="nummer"
            value={nummer}
            onChange={(e) => setNummer(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="ort">Ort</Label>
          <Input
            id="ort"
            value={ort}
            onChange={(e) => setOrt(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Privacy Text */}
      <div className="text-sm leading-relaxed">
        Mit dem Absenden der Anfrage erkläre ich mich damit einverstanden, dass meine angegebenen personenbezogenen Daten gemäß der Datenschutzerklärung verarbeitet und zum Zweck der Bearbeitung meiner Anfrage gespeichert werden.
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
          "Anfrage senden"
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

export default ContactFormFixed;
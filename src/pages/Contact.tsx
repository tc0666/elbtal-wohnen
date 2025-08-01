import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Building,
  Users,
  MessageSquare,
  CheckCircle,
  HeartHandshake
} from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
    datenschutz: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Nachricht gesendet!",
        description: "Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze bei Ihnen.",
      });
      setIsSubmitting(false);
      
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
        datenschutz: false
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      details: ["+49 123 456 789", "+49 123 456 790"],
      description: "Mo-Fr: 9:00-18:00 Uhr, Sa: 9:00-14:00 Uhr"
    },
    {
      icon: Mail,
      title: "E-Mail",
      details: ["info@elbtal-immobilien.de", "service@elbtal-immobilien.de"],
      description: "Wir antworten innerhalb von 24 Stunden"
    },
    {
      icon: MapPin,
      title: "Adresse",
      details: ["Musterstraße 123", "01234 Dresden"],
      description: "Direkt im Stadtzentrum gelegen"
    },
    {
      icon: Building,
      title: "Bürozeiten",
      details: ["Montag - Freitag: 9:00 - 18:00", "Samstag: 9:00 - 14:00"],
      description: "Termine nach Vereinbarung möglich"
    }
  ];

  const services = [
    "Immobilienvermietung",
    "Hausverwaltung", 
    "Immobilienbewertung",
    "Finanzierungsberatung",
    "Mietrechtsberatung",
    "Energieberatung"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Kontakt
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nehmen Sie Kontakt mit uns auf
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Haben Sie Fragen zu unseren Immobilien oder Services? Wir sind gerne für Sie da 
            und beraten Sie kompetent und persönlich.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Kontaktformular
              </CardTitle>
              <p className="text-muted-foreground">
                Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Contact Details */}
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-foreground font-medium">
                          {detail}
                        </p>
                      ))}
                      <p className="text-muted-foreground text-sm mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Services Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Unsere Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Persönliche Beratung</h3>
                <p className="mb-4 opacity-90">
                  Vereinbaren Sie einen Termin für eine kostenlose Beratung vor Ort.
                </p>
                <Button variant="secondary" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Termin vereinbaren
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
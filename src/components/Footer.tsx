import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">Elbtal</h3>
              <p className="text-sm text-muted-foreground">Immobilien</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ihr vertrauensvoller Partner für hochwertige Mietwohnungen in Deutschland. 
              Seit über 15 Jahren verbinden wir Menschen mit ihrem perfekten Zuhause.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Mietangebote</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vermietungsablauf</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Leistungsübersicht</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kundenservice</a></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Standorte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Berlin</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Hamburg</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">München</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Frankfurt</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Düsseldorf</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Kontakt</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Hauptstraße 123<br />10115 Berlin</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span>+49 30 123456789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span>info@elbtal-immobilien.de</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Mo-Fr: 9:00-18:00 Uhr</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
          <div>
            © 2024 Elbtal Immobilien. Alle Rechte vorbehalten.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Impressum</a>
            <a href="#" className="hover:text-primary transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-primary transition-colors">AGB</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
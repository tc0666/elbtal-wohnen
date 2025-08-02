import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Users, Award } from "lucide-react";

export const ProjectsSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Unsere Stadt – UNSERE PROJEKTE
          </h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Sie suchen ein erstklassiges Immobilienobjekt, vertrauen langjähriger Erfahrung und umfassendem Wissen mit hohem Qualitätsbewusstsein? 
              Dann sind Sie bei uns genau richtig. Wir stellen vor. Die Berlinhaus GmbH entwickelt Einzelhandels- und Büroflächen, Hotels, Ärztehäuser und Wohnimmobilien. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Die Ansprüche an den Lebensraum entwickeln sich beständig weiter, innovative Lösungen sind gefragt. Auch modernes Arbeiten braucht ihre passenden Räume. 
              Für jedes unternehmerische Vorhaben sind Räumlichkeiten und Umfeld entscheidende Faktoren, hochwertige Flächen und ganzheitliche Lösungen für Büro, Handel und Gastronomie sind hierfür ansprechend. 
              Wir finden für Sie die optimale Immobilie, ganz nach Ihren Vorstellungen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wohnimmobilien</h3>
              <p className="text-muted-foreground text-sm">
                Moderne Wohnkomplexe und Einzelobjekte in besten Lagen
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gewerbeimmobilien</h3>
              <p className="text-muted-foreground text-sm">
                Büroflächen, Einzelhandel und Gastronomieobjekte
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ärztehäuser</h3>
              <p className="text-muted-foreground text-sm">
                Spezialisierte Immobilien für medizinische Einrichtungen
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hotels</h3>
              <p className="text-muted-foreground text-sm">
                Hotelimmobilien in erstklassigen Standorten
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
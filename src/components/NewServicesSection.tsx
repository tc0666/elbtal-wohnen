import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Briefcase, Headphones } from "lucide-react";

const services = [
  {
    icon: Target,
    title: "Unsere ZIELE",
    description: "Wir streben nach höchster Qualität in der Immobilienverwaltung und schaffen langfristige Werte für unsere Kunden. Unser Ziel ist es, durch professionelle Betreuung und transparente Kommunikation das Vertrauen unserer Mieter und Eigentümer zu gewinnen."
  },
  {
    icon: Briefcase,
    title: "Unsere ­ANGEBOTE",
    description: "Von der kompletten Hausverwaltung über Mietverwaltung bis hin zur technischen Betreuung bieten wir umfassende Dienstleistungen. Unsere Expertise umfasst Objektbetreuung, Mieterberatung, Instandhaltung und kaufmännische Verwaltung für alle Immobilienarten."
  },
  {
    icon: Headphones,
    title: "Unser ­SERVICE",
    description: "24/7 Erreichbarkeit für Notfälle, regelmäßige Objektbesichtigungen und proaktive Wartung stehen im Mittelpunkt unseres Service. Wir bieten persönliche Beratung, digitale Verwaltungslösungen und schnelle Problemlösung für alle Anliegen."
  }
];

export const NewServicesSection = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
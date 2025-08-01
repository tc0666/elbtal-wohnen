import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Shield, Clock, Phone, MapPin } from "lucide-react";

export const ServicesSection = () => {
  const services = [
    {
      icon: Home,
      title: "Mietangebote",
      description: "Hochwertige Wohnungen in besten Lagen von Berlin bis München. Sorgfältig ausgewählte Immobilien für jeden Anspruch.",
    },
    {
      icon: Users,
      title: "Persönliche Beratung",
      description: "Unser erfahrenes Team steht Ihnen bei der Wohnungssuche zur Seite. Individuelle Betreuung von der ersten Besichtigung bis zum Einzug.",
    },
    {
      icon: Shield,
      title: "Transparenz & Sicherheit",
      description: "Faire Mietpreise, transparente Nebenkosten und rechtssichere Verträge. Ihr Vertrauen ist unser wichtigstes Gut.",
    },
    {
      icon: Clock,
      title: "Schnelle Abwicklung",
      description: "Effiziente Vermietungsprozesse ohne lange Wartezeiten. Von der Bewerbung bis zur Schlüsselübergabe - alles aus einer Hand.",
    },
    {
      icon: Phone,
      title: "24/7 Service",
      description: "Unser Kundenservice ist rund um die Uhr für Sie da. Bei Fragen oder Problemen erreichen Sie uns jederzeit.",
    },
    {
      icon: MapPin,
      title: "Beste Lagen",
      description: "Immobilien in Top-Lagen mit exzellenter Verkehrsanbindung, Einkaufsmöglichkeiten und Infrastruktur.",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Unsere Leistungen
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Wir bieten Ihnen einen Rundumservice für Ihre Immobiliensuche - 
            professionell, zuverlässig und kundenorientiert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-center leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
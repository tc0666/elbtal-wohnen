import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User, Wrench, Shield, Calculator } from "lucide-react";

const ansprechpartner = [
  {
    id: 1,
    icon: User,
    title: "Ihr Verwalter",
    name: "Thomas Müller",
    phone: "+49 30 123456789",
    email: "t.mueller@elbtal.de",
    description: "Allgemeine Verwaltungsangelegenheiten"
  },
  {
    id: 2,
    icon: Wrench,
    title: "Ihr Techniker", 
    name: "Stefan Weber",
    phone: "+49 30 987654321",
    email: "s.weber@elbtal.de",
    description: "Technische Angelegenheiten & Schadensmeldungen"
  },
  {
    id: 3,
    icon: Shield,
    title: "Schadensbearbeitung",
    name: "Marina Schmidt",
    phone: "+49 30 555123456",
    email: "schaeden@elbtal.de", 
    description: "Schadensmeldungen & Versicherungsangelegenheiten"
  },
  {
    id: 4,
    icon: Calculator,
    title: "Buchhaltung",
    name: "Andrea Klein",
    phone: "+49 30 444987654",
    email: "buchhaltung@elbtal.de",
    description: "Abrechnungen & finanzielle Angelegenheiten"
  }
];

export const AnsprechpartnerSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ihre Ansprechpartner
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Sie suchen den richtigen Ansprechpartner, Ihren Verwalter oder Ihren Techniker für eine Schadenanzeige? 
            Wählen Sie einfach hier den passenden Fachbereich aus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ansprechpartner.map((person) => {
            const IconComponent = person.icon;
            return (
              <Card key={person.id} className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{person.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">{person.name}</h4>
                    <p className="text-sm text-muted-foreground">{person.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = `tel:${person.phone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {person.phone}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = `mailto:${person.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {person.email}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Mueller",
      city: "Berlin",
      rating: 5,
      text: "Elbtal hat mir dabei geholfen, die perfekte Wohnung in Berlin zu finden. Der Service war ausgezeichnet und die Beratung sehr professionell. Absolut empfehlenswert!",
    },
    {
      name: "Thomas Weber",
      city: "München",
      rating: 5,
      text: "Sehr zufrieden mit dem Service von Elbtal. Die Wohnungssuche war unkompliziert und das Team war immer erreichbar. Tolle Betreuung vom ersten Kontakt bis zur Schlüsselübergabe.",
    },
    {
      name: "Anna Schmidt",
      city: "Hamburg",
      rating: 5,
      text: "Endlich eine Immobilienagentur, die hält was sie verspricht! Transparente Preise, faire Konditionen und ein super freundliches Team. Vielen Dank für die großartige Unterstützung.",
    },
    {
      name: "Michael Bauer",
      city: "Frankfurt",
      rating: 5,
      text: "Die Wohnungsbesichtigung war perfekt organisiert und die Abwicklung sehr professionell. Elbtal macht die Wohnungssuche so einfach wie nie zuvor. Absolute Empfehlung!",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Was unsere Kunden sagen
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Überzeugen Sie sich selbst von der Qualität unseres Services. 
            Hier teilen zufriedene Mieter ihre Erfahrungen mit Elbtal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-muted-foreground mb-4 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.city}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">4.9/5</span>
            </div>
            <span>•</span>
            <span>Basierend auf 247 Bewertungen</span>
          </div>
        </div>
      </div>
    </section>
  );
};
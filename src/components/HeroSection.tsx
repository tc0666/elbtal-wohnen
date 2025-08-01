import { PropertySearchFilter } from "./PropertySearchFilter";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-light/10 to-primary/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Ihr Zuhause wartet auf Sie
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Entdecken Sie erstklassige Mietwohnungen in Deutschlands beliebtesten Städten. 
            Professionell, vertrauenswürdig, persönlich.
          </p>
        </div>
        
        <div className="mb-8">
          <PropertySearchFilter />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-2xl mx-auto text-center">
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Immobilien</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Städte</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">15+</div>
            <div className="text-sm text-muted-foreground">Jahre Erfahrung</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
            <div className="text-sm text-muted-foreground">Zufriedenheit</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Service</div>
          </div>
        </div>
      </div>
    </section>
  );
};
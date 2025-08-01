import { PropertySearchFilter } from "./PropertySearchFilter";
import heroPropertyBg from "@/assets/hero-property-bg.jpg";

export const HeroSection = () => {
  return (
    <section 
      className="relative py-20 md:py-28 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroPropertyBg})`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Ihr Zuhause wartet auf Sie
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Entdecken Sie erstklassige Mietwohnungen in Deutschlands beliebtesten Städten. 
            Professionell, vertrauenswürdig, persönlich.
          </p>
        </div>
        
        <div className="mb-8">
          <PropertySearchFilter />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-2xl mx-auto text-center">
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">500+</div>
            <div className="text-sm text-white/80">Immobilien</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">5</div>
            <div className="text-sm text-white/80">Städte</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">15+</div>
            <div className="text-sm text-white/80">Jahre Erfahrung</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">98%</div>
            <div className="text-sm text-white/80">Zufriedenheit</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">24/7</div>
            <div className="text-sm text-white/80">Service</div>
          </div>
        </div>
      </div>
    </section>
  );
};
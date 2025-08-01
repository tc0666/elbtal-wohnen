import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertySearchFilter } from "@/components/PropertySearchFilter";
import { PropertyListings } from "@/components/PropertyListings";

const Mietangebote = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary to-primary-dark py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Mietangebote
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Entdecken Sie unsere hochwertigen Mietwohnungen in den besten Lagen Deutschlands
              </p>
            </div>
          </div>
        </section>

        {/* Search Filter */}
        <section className="py-8 bg-gradient-to-b from-primary-dark to-background">
          <div className="container mx-auto px-4">
            <PropertySearchFilter />
          </div>
        </section>

        {/* Property Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PropertyListings />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Mietangebote;
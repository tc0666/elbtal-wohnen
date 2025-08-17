import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AnsprechpartnerSection } from "@/components/AnsprechpartnerSection";
import { NewServicesSection } from "@/components/NewServicesSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CustomerReviewsSection } from "@/components/CustomerReviewsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main role="main">
        <HeroSection />
        <section aria-label="Ansprechpartner">
          <AnsprechpartnerSection />
        </section>
        <section aria-label="Unsere Services">
          <NewServicesSection />
        </section>
        <section aria-label="Unsere Projekte">
          <ProjectsSection />
        </section>
        <section aria-label="Kundenbewertungen">
          <CustomerReviewsSection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

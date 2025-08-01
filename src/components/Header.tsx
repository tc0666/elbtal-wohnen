import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="block">
              <h1 className="text-2xl font-bold text-primary">Elbtal</h1>
              <span className="text-xs text-muted-foreground">Immobilienverwaltung seit 1988</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Startseite
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary">
                  Wohnen & Service
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <Link to="/mietangebote">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Mietangebote</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Entdecken Sie unsere aktuellen Mietangebote
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/vermietungsablauf">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Vermietungsablauf</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Erfahren Sie mehr über unseren Vermietungsprozess
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/leistungsübersicht">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Leistungsübersicht</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Alle unsere Services im Überblick
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/kontakt">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Unternehmen
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/vermietungsablauf">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Vermietungsablauf
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/leistungsübersicht">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Leistungsübersicht
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Startseite
              </Link>
              <div className="space-y-1">
                <button className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                  Wohnen & Service
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="pl-4 space-y-1">
                  <Link to="/mietangebote" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Mietangebote
                  </Link>
                  <Link to="/vermietungsablauf" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Vermietungsablauf
                  </Link>
                  <Link to="/leistungsübersicht" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Leistungsübersicht
                  </Link>
                </div>
              </div>
              <Link to="/kontakt" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Kontakt
              </Link>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Unternehmen
              </a>
              <Link to="/vermietungsablauf" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Vermietungsablauf
              </Link>
              <Link to="/leistungsübersicht" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Leistungsübersicht
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
-- Add sample text to features_description for all properties
UPDATE public.properties 
SET features_description = 'Diese moderne Wohnung verfügt über eine vollausgestattete Küche mit hochwertigen Elektrogeräten, elegante Badezimmer mit modernen Armaturen, sowie hochwertige Bodenbeläge und große Fenster für optimalen Lichteinfall. Die Immobilie bietet eine durchdachte Raumaufteilung und wurde mit viel Liebe zum Detail gestaltet.'
WHERE features_description IS NULL;

-- Add sample text to additional_description for all properties
UPDATE public.properties 
SET additional_description = 'Die Wohnung befindet sich in einem gepflegten Wohngebäude in ruhiger Lage. Die Umgebung bietet eine ausgezeichnete Infrastruktur mit Einkaufsmöglichkeiten, Restaurants und öffentlichen Verkehrsmitteln in unmittelbarer Nähe. Ideal für Berufstätige und Familien, die Wert auf Komfort und Lebensqualität legen.'
WHERE additional_description IS NULL;
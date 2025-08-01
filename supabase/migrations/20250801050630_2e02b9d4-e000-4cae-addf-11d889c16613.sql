-- Add sample descriptions for Ausstattung and Weitere Beschreibung to all properties
UPDATE properties 
SET 
  features_description = CASE 
    WHEN id = 'c32f3456-b4ef-42e8-b34b-591b4c9e3e7b' THEN 'Diese einzigartige Loft-Wohnung bietet industriellen Charme mit modernen Annehmlichkeiten. Die Wohnung verfügt über hohe Decken, große Fenster und einen offenen Grundriss. Haustiere sind nach Absprache erlaubt.'
    WHEN id = '55eba92a-1638-45fd-914e-ce0724d81a89' THEN 'Moderne Ausstattung mit hochwertigen Materialien. Die Wohnung verfügt über eine Einbauküche, Echtholzparkett und bodentiefe Fenster. Balkon mit Blick ins Grüne vorhanden.'
    WHEN id = '8901696d-9d85-4b85-a8dd-935007322c2f' THEN 'Hochwertige 3-Zimmer Wohnung mit Luxusausstattung. Einbauküche mit Markengeräten, Fußbodenheizung, elektrische Rollläden und Video-Gegensprechanlage sind selbstverständlich.'
    WHEN id = 'a00e5d37-9e98-4079-8217-786ea78e0f09' THEN 'Gemütliches Studio mit praktischer Aufteilung. Moderne Küchenzeile, Duschbad mit Fenster und großzügiger Wohnbereich. Ideal für Singles oder Paare.'
    WHEN id = 'fcbc9e99-3dde-41c8-98a5-802116935d62' THEN 'Luxuriöse 4-Zimmer Wohnung mit exklusiver Ausstattung. Marmorbäder, Einbauschränke, Klimaanlage und Alarmanlage. Tiefgaragenstellplatz inklusive.'
    WHEN id = '498320e8-ff99-484e-b27b-a2b0db6acac4' THEN 'Charmante Altbauwohnung mit historischem Flair. Originalstuck, Kassettentüren und Parkettböden. Moderne Sanitäranlagen und Einbauküche wurden fachmännisch integriert.'
    WHEN id = 'c73643c4-3768-41e7-9c83-d9b3dc1e477f' THEN 'Großzügige 2-Zimmer Wohnung mit hochwertiger Ausstattung. Laminatboden, moderne Badausstattung und ein großer Balkon runden das Angebot ab.'
    WHEN id = 'b117edba-3876-478e-b7fd-220d3f31fdb4' THEN 'Exklusive Penthouse-Wohnung mit Premium-Ausstattung. Dachterrasse, Fußbodenheizung, Smart-Home-System und zwei Bäder mit hochwertigen Armaturen.'
    WHEN id = 'b0dfdde8-93d8-435c-944b-24ae760092d4' THEN 'Gemütliche 1-Zimmer Wohnung im Szeneviertel. Moderne Ausstattung mit Laminatboden, neuer Küchenzeile und renoviertem Bad.'
    WHEN id = 'f744fbec-dc06-4dac-9058-af33b8eba6ac' THEN 'Modernes Familienhaus mit durchdachter Ausstattung. Einbauküche, Gäste-WC, Garage und großer Garten mit Terrasse. Ideal für Familien.'
    ELSE 'Hochwertige Ausstattung mit modernen Annehmlichkeiten. Details zur Ausstattung erhalten Sie gerne auf Anfrage.'
  END,
  additional_description = CASE 
    WHEN id = 'c32f3456-b4ef-42e8-b34b-591b4c9e3e7b' THEN 'Das Objekt befindet sich in einem lebendigen Künstlerviertel mit vielen Galerien, Cafés und Restaurants. Die Verkehrsanbindung ist ausgezeichnet - U-Bahn und S-Bahn sind fußläufig erreichbar. In der Nähe befinden sich auch mehrere Parks und Grünflächen für die Freizeitgestaltung.'
    WHEN id = '55eba92a-1638-45fd-914e-ce0724d81a89' THEN 'Die zentrale Lage in Berlin-Mitte bietet optimale Anbindung an alle wichtigen Verkehrsmittel. Einkaufsmöglichkeiten, Restaurants und kulturelle Einrichtungen sind in wenigen Gehminuten erreichbar. Das Gebäude verfügt über einen gepflegten Innenhof.'
    WHEN id = '8901696d-9d85-4b85-a8dd-935007322c2f' THEN 'Diese Wohnung liegt in einer ruhigen Seitenstraße und bietet dennoch beste Anbindung an das Stadtzentrum. Das Gebäude wurde kürzlich saniert und verfügt über einen Aufzug. Kellerraum ist im Mietpreis enthalten.'
    WHEN id = 'a00e5d37-9e98-4079-8217-786ea78e0f09' THEN 'Perfekt für Berufstätige oder Studenten - diese Wohnung liegt verkehrsgünstig und bietet alle Annehmlichkeiten des Stadtlebens. Waschmaschinenanschluss vorhanden, Hausmeisterservice inklusive.'
    WHEN id = 'fcbc9e99-3dde-41c8-98a5-802116935d62' THEN 'Exklusives Wohnen in bester Lage. Das Gebäude verfügt über einen Concierge-Service und gepflegte Grünanlagen. Fitnessraum und Gemeinschaftsräume stehen den Bewohnern zur Verfügung.'
    WHEN id = '498320e8-ff99-484e-b27b-a2b0db6acac4' THEN 'Leben im denkmalgeschützten Altbau mit modernem Komfort. Das Viertel ist bekannt für seine lebendige Kulturszene und vielfältige Gastronomie. Fahrradkeller und Dachboden gehören zur Wohnung.'
    WHEN id = 'c73643c4-3768-41e7-9c83-d9b3dc1e477f' THEN 'Ruhige Wohnlage in begehrtem Stadtteil. Kindergärten und Schulen sind in der Nähe, ebenso wie öffentliche Verkehrsmittel. Das Gebäude verfügt über eine Fahrradabstellmöglichkeit.'
    WHEN id = 'b117edba-3876-478e-b7fd-220d3f31fdb4' THEN 'Luxuswohnen auf höchstem Niveau. Die Dachterrasse bietet einen atemberaubenden Blick über die Stadt. Hauseigene Sauna und Wellnessbereich können mitgenutzt werden. 24h-Sicherheitsdienst vorhanden.'
    WHEN id = 'b0dfdde8-93d8-435c-944b-24ae760092d4' THEN 'Kreuzberg bietet das authentische Berlin-Feeling mit einer lebendigen Kunst- und Kulturszene. Zahlreiche Bars, Clubs und Restaurants sind fußläufig erreichbar. Sehr gute Anbindung an öffentliche Verkehrsmittel.'
    WHEN id = 'f744fbec-dc06-4dac-9058-af33b8eba6ac' THEN 'Familienfreundliche Wohngegend mit guter Infrastruktur. Spielplätze, Schulen und Kindergärten sind in der Nähe. Der große Garten bietet viel Platz für Kinder zum Spielen. Garage und zusätzliche Stellplätze vorhanden.'
    ELSE 'Weitere Details zur Lage und Ausstattung erhalten Sie gerne bei einer Besichtigung. Vereinbaren Sie noch heute einen Termin!'
  END
WHERE features_description IS NULL OR additional_description IS NULL;
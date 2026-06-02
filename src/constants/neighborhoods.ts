export const neighborhoodsByMunicipality: Record<string, string[]> = {
  belem: [
    "Batista Campos",
    "Benguí",
    "Campina",
    "Canudos",
    "Cidade Velha",
    "Cremação",
    "Fátima",
    "Guamá",
    "Jurunas",
    "Marco",
    "Marambaia",
    "Nazaré",
    "Pedreira",
    "Sacramenta",
    "São Brás",
    "Souza",
    "Tapanã",
    "Telégrafo",
    "Terra Firme",
    "Umarizal"
  ],
  ananindeua: [
    "Águas Brancas",
    "Atalaia",
    "Cidade Nova",
    "Coqueiro",
    "Curuçambá",
    "Distrito Industrial",
    "Guanabara",
    "Icuí-Guajará",
    "Jaderlândia",
    "Maguari",
    "Paar",
    "Quarenta Horas"
  ],
  marituba: [
    "Almir Gabriel",
    "Bela Vista",
    "Centro",
    "Decouville",
    "Dom Aristides",
    "São João",
    "União"
  ],
  castanhal: [
    "Apeú",
    "Betânia",
    "Centro",
    "Cristo Redentor",
    "Estrela",
    "Imperador",
    "Jaderlândia",
    "Nova Olinda",
    "Pirapora",
    "Santa Catarina"
  ],
  santarem: [
    "Aeroporto Velho",
    "Aldeia",
    "Caranazal",
    "Centro",
    "Diamantino",
    "Interventoria",
    "Jardim Santarém",
    "Maracanã",
    "Prainha",
    "Santarenzinho"
  ]
}

export function normalizeMunicipalityName(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function getNeighborhoodSuggestions(municipalityName?: string) {
  const normalized = normalizeMunicipalityName(municipalityName)
  return neighborhoodsByMunicipality[normalized] || []
}

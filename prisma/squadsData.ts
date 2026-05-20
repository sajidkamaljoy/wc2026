export interface SeedPlayer {
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  shirtNumber?: number;
  club?: string;
  age?: number;
  caps?: number;
}

export interface SquadData {
  status: "CONFIRMED" | "PRELIMINARY" | "TBD";
  players: SeedPlayer[];
}

export const SQUADS: Record<string, SquadData> = {
  BRA: {
    status: "CONFIRMED",
    players: [
      // Goalkeepers
      { name: "Alisson", position: "GK", shirtNumber: 1, club: "Liverpool", age: 33 },
      { name: "Ederson", position: "GK", shirtNumber: 23, club: "Fenerbahçe", age: 32 },
      { name: "Weverton", position: "GK", shirtNumber: 12, club: "Grêmio", age: 38 },
      // Defenders
      { name: "Alex Sandro", position: "DEF", shirtNumber: 6, club: "Flamengo", age: 35 },
      { name: "Bremer", position: "DEF", shirtNumber: 14, club: "Juventus", age: 29 },
      { name: "Danilo", position: "DEF", shirtNumber: 2, club: "Flamengo", age: 34 },
      { name: "Douglas Santos", position: "DEF", shirtNumber: 16, club: "Zenit", age: 32 },
      { name: "Gabriel Magalhães", position: "DEF", shirtNumber: 4, club: "Arsenal", age: 28 },
      { name: "Ibañez", position: "DEF", shirtNumber: 13, club: "Al-Ahli", age: 27 },
      { name: "Léo Pereira", position: "DEF", shirtNumber: 15, club: "Flamengo", age: 30 },
      { name: "Marquinhos", position: "DEF", shirtNumber: 3, club: "PSG", age: 32 },
      { name: "Wesley", position: "DEF", shirtNumber: 25, club: "Roma", age: 25 },
      // Midfielders
      { name: "Bruno Guimarães", position: "MID", shirtNumber: 5, club: "Newcastle", age: 28 },
      { name: "Casemiro", position: "MID", shirtNumber: 8, club: "Man Utd", age: 34 },
      { name: "Danilo Santos", position: "MID", shirtNumber: 18, club: "Botafogo", age: 25 },
      { name: "Fabinho", position: "MID", shirtNumber: 15, club: "Al-Ittihad", age: 32 },
      { name: "Lucas Paquetá", position: "MID", shirtNumber: 10, club: "Flamengo", age: 28 },
      // Forwards
      { name: "Endrick", position: "FWD", shirtNumber: 9, club: "Lyon", age: 19 },
      { name: "Gabriel Martinelli", position: "FWD", shirtNumber: 22, club: "Arsenal", age: 24 },
      { name: "Igor Thiago", position: "FWD", shirtNumber: 19, club: "Brentford", age: 24 },
      { name: "Luiz Henrique", position: "FWD", shirtNumber: 20, club: "Zenit", age: 25 },
      { name: "Matheus Cunha", position: "FWD", shirtNumber: 21, club: "Man Utd", age: 26 },
      { name: "Neymar", position: "FWD", shirtNumber: 11, club: "Santos", age: 34 },
      { name: "Raphinha", position: "FWD", shirtNumber: 7, club: "Barcelona", age: 29 },
      { name: "Rayan", position: "FWD", shirtNumber: 24, club: "Bournemouth", age: 19 },
      { name: "Vinícius Júnior", position: "FWD", shirtNumber: 17, club: "Real Madrid", age: 25 },
    ]
  },
  FRA: {
    status: "CONFIRMED",
    players: [
      // Goalkeepers
      { name: "Mike Maignan", position: "GK", shirtNumber: 16, club: "AC Milan", age: 30 },
      { name: "Brice Samba", position: "GK", shirtNumber: 1, club: "Rennes", age: 32 },
      { name: "Robin Risser", position: "GK", shirtNumber: 23, club: "Lens", age: 21 },
      // Defenders
      { name: "Lucas Digne", position: "DEF", shirtNumber: 3, club: "Aston Villa", age: 32 },
      { name: "Malo Gusto", position: "DEF", shirtNumber: 22, club: "Chelsea", age: 23 },
      { name: "Lucas Hernandez", position: "DEF", shirtNumber: 21, club: "PSG", age: 30 },
      { name: "Theo Hernandez", position: "DEF", shirtNumber: 22, club: "Al-Hilal", age: 28 },
      { name: "Ibrahima Konaté", position: "DEF", shirtNumber: 24, club: "Liverpool", age: 26 },
      { name: "Jules Koundé", position: "DEF", shirtNumber: 5, club: "Barcelona", age: 27 },
      { name: "Maxence Lacroix", position: "DEF", shirtNumber: 15, club: "Crystal Palace", age: 26 },
      { name: "William Saliba", position: "DEF", shirtNumber: 4, club: "Arsenal", age: 25 },
      { name: "Dayot Upamecano", position: "DEF", shirtNumber: 18, club: "Bayern Munich", age: 27 },
      // Midfielders
      { name: "N'Golo Kanté", position: "MID", shirtNumber: 13, club: "Fenerbahçe", age: 35 },
      { name: "Manu Koné", position: "MID", shirtNumber: 19, club: "Roma", age: 25 },
      { name: "Adrien Rabiot", position: "MID", shirtNumber: 14, club: "AC Milan", age: 31 },
      { name: "Aurélien Tchouaméni", position: "MID", shirtNumber: 8, club: "Real Madrid", age: 26 },
      { name: "Warren Zaïre-Emery", position: "MID", shirtNumber: 6, club: "PSG", age: 20 },
      // Forwards
      { name: "Maghnes Akliouche", position: "FWD", shirtNumber: 25, club: "Monaco", age: 24 },
      { name: "Bradley Barcola", position: "FWD", shirtNumber: 20, club: "PSG", age: 23 },
      { name: "Rayan Cherki", position: "FWD", shirtNumber: 26, club: "Man City", age: 22 },
      { name: "Ousmane Dembélé", position: "FWD", shirtNumber: 11, club: "PSG", age: 29 },
      { name: "Désiré Doué", position: "FWD", shirtNumber: 17, club: "PSG", age: 20 },
      { name: "Jean-Philippe Mateta", position: "FWD", shirtNumber: 12, club: "Crystal Palace", age: 28 },
      { name: "Kylian Mbappé", position: "FWD", shirtNumber: 10, club: "Real Madrid", age: 27 },
      { name: "Michael Olise", position: "FWD", shirtNumber: 7, club: "Bayern Munich", age: 24 },
      { name: "Marcus Thuram", position: "FWD", shirtNumber: 9, club: "Inter Milan", age: 28 },
    ]
  },
  JPN: {
    status: "CONFIRMED",
    players: [
      // Goalkeepers
      { name: "Zion Suzuki", position: "GK", shirtNumber: 1, club: "Parma", age: 23 },
      { name: "Keisuke Osako", position: "GK", shirtNumber: 12, club: "Sanfrecce Hiroshima", age: 26 },
      { name: "Tomoki Hayakawa", position: "GK", shirtNumber: 23, club: "Shonan Bellmare", age: 27 },
      // Defenders
      { name: "Yuto Nagatomo", position: "DEF", shirtNumber: 5, club: "FC Tokyo", age: 39 },
      { name: "Takehiro Tomiyasu", position: "DEF", shirtNumber: 22, club: "Arsenal", age: 27 },
      { name: "Ko Itakura", position: "DEF", shirtNumber: 4, club: "Monchengladbach", age: 29 },
      { name: "Shogo Taniguchi", position: "DEF", shirtNumber: 3, club: "Sint-Truiden", age: 34 },
      { name: "Hiroki Ito", position: "DEF", shirtNumber: 21, club: "Bayern Munich", age: 27 },
      { name: "Yukinari Sugawara", position: "DEF", shirtNumber: 2, club: "Southampton", age: 25 },
      { name: "Ayumu Seko", position: "DEF", shirtNumber: 16, club: "Grasshoppers", age: 25 },
      { name: "Tsuyoshi Watanabe", position: "DEF", shirtNumber: 15, club: "Gent", age: 29 },
      { name: "Junnosuke Suzuki", position: "DEF", shirtNumber: 24, club: "Shonan Bellmare", age: 22 },
      // Midfielders
      { name: "Wataru Endo", position: "MID", shirtNumber: 6, club: "Liverpool", age: 33 },
      { name: "Junya Ito", position: "MID", shirtNumber: 14, club: "Reims", age: 33 },
      { name: "Ritsu Doan", position: "MID", shirtNumber: 8, club: "Freiburg", age: 27 },
      { name: "Daichi Kamada", position: "MID", shirtNumber: 10, club: "Crystal Palace", age: 29 },
      { name: "Takefusa Kubo", position: "MID", shirtNumber: 20, club: "Real Sociedad", age: 24 },
      { name: "Ao Tanaka", position: "MID", shirtNumber: 17, club: "Leeds", age: 27 },
      { name: "Keito Nakamura", position: "MID", shirtNumber: 13, club: "Reims", age: 25 },
      { name: "Kaishu Sano", position: "MID", shirtNumber: 7, club: "Mainz", age: 25 },
      // Forwards
      { name: "Ayase Ueda", position: "FWD", shirtNumber: 9, club: "Feyenoord", age: 27 },
      { name: "Daizen Maeda", position: "FWD", shirtNumber: 11, club: "Celtic", age: 28 },
      { name: "Koki Ogawa", position: "FWD", shirtNumber: 19, club: "NEC Nijmegen", age: 28 },
      { name: "Yuito Suzuki", position: "FWD", shirtNumber: 18, club: "Brøndby", age: 24 },
      { name: "Keisuke Goto", position: "FWD", shirtNumber: 25, club: "Anderlecht", age: 20 },
      { name: "Kento Shiogai", position: "FWD", shirtNumber: 26, club: "NEC Nijmegen", age: 21 },
    ]
  },
  KOR: {
    status: "CONFIRMED",
    players: [
      // Goalkeepers
      { name: "Jo Hyeon-woo", position: "GK", shirtNumber: 21, club: "Ulsan HD", age: 34 },
      { name: "Kim Seung-gyu", position: "GK", shirtNumber: 1, club: "Al-Shabab", age: 35 },
      { name: "Song Bum-keun", position: "GK", shirtNumber: 12, club: "Shonan Bellmare", age: 28 },
      // Defenders
      { name: "Kim Min-jae", position: "DEF", shirtNumber: 4, club: "Bayern Munich", age: 29 },
      { name: "Cho Yu-min", position: "DEF", shirtNumber: 24, club: "Sharjah", age: 29 },
      { name: "Lee Han-beom", position: "DEF", shirtNumber: 2, club: "Midtjylland", age: 23 },
      { name: "Kim Tae-hyeon", position: "DEF", shirtNumber: 3, club: "Sagan Tosu", age: 25 },
      { name: "Park Jin-seob", position: "DEF", shirtNumber: 15, club: "Jeonbuk Hyundai", age: 30 },
      { name: "Lee Gi-hyuk", position: "DEF", shirtNumber: 19, club: "Gangwon FC", age: 25 },
      { name: "Lee Tae-seok", position: "DEF", shirtNumber: 13, club: "Pohang Steelers", age: 23 },
      { name: "Seol Young-woo", position: "DEF", shirtNumber: 22, club: "Crvena zvezda", age: 27 },
      { name: "Jens Castrop", position: "DEF", shirtNumber: 16, club: "1. FC Nürnberg", age: 22 },
      { name: "Kim Moon-hwan", position: "DEF", shirtNumber: 23, club: "Daejeon Hana Citizen", age: 30 },
      // Midfielders
      { name: "Yang Hyun-jun", position: "MID", shirtNumber: 14, club: "Celtic", age: 23 },
      { name: "Paik Seung-ho", position: "MID", shirtNumber: 8, club: "Birmingham City", age: 29 },
      { name: "Hwang In-beom", position: "MID", shirtNumber: 6, club: "Feyenoord", age: 29 },
      { name: "Kim Jin-gyu", position: "MID", shirtNumber: 17, club: "Jeonbuk Hyundai", age: 28 },
      { name: "Bae Jun-ho", position: "MID", shirtNumber: 20, club: "Stoke City", age: 22 },
      { name: "Eom Ji-sung", position: "MID", shirtNumber: 25, club: "Swansea City", age: 23 },
      { name: "Hwang Hee-chan", position: "MID", shirtNumber: 11, club: "Wolves", age: 30 },
      { name: "Lee Dong-gyeong", position: "MID", shirtNumber: 18, club: "Gimcheon Sangmu", age: 28 },
      { name: "Lee Jae-sung", position: "MID", shirtNumber: 10, club: "Mainz", age: 34 },
      { name: "Lee Kang-in", position: "MID", shirtNumber: 7, club: "PSG", age: 25 },
      // Forwards
      { name: "Son Heung-min", position: "FWD", shirtNumber: 9, club: "Tottenham", age: 33 },
      { name: "Oh Hyeon-gyu", position: "FWD", shirtNumber: 26, club: "Genk", age: 25 },
      { name: "Cho Gue-sung", position: "FWD", shirtNumber: 15, club: "Midtjylland", age: 28 },
    ]
  },
  POR: {
    status: "PRELIMINARY",
    players: [
      // Goalkeepers
      { name: "Diogo Costa", position: "GK", shirtNumber: 1, club: "Porto", age: 26 },
      { name: "José Sá", position: "GK", shirtNumber: 12, club: "Wolves", age: 33 },
      { name: "Rui Silva", position: "GK", shirtNumber: 22, club: "Real Betis", age: 32 },
      { name: "Ricardo Velho", position: "GK", shirtNumber: 24, club: "Farense", age: 27 },
      // Defenders
      { name: "Tomás Araújo", position: "DEF", shirtNumber: 2, club: "Benfica", age: 24 },
      { name: "João Cancelo", position: "DEF", shirtNumber: 20, club: "Al-Hilal", age: 31 },
      { name: "Diogo Dalot", position: "DEF", shirtNumber: 5, club: "Man Utd", age: 27 },
      { name: "Rúben Dias", position: "DEF", shirtNumber: 4, club: "Man City", age: 29 },
      { name: "Gonçalo Inácio", position: "DEF", shirtNumber: 14, club: "Sporting CP", age: 24 },
      { name: "Nuno Mendes", position: "DEF", shirtNumber: 19, club: "PSG", age: 23 },
      { name: "Matheus Nunes", position: "DEF", shirtNumber: 23, club: "Man City", age: 27 },
      { name: "Nélson Semedo", position: "DEF", shirtNumber: 3, club: "Wolves", age: 32 },
      { name: "Renato Veiga", position: "DEF", shirtNumber: 13, club: "Chelsea", age: 22 },
      // Midfielders
      { name: "Samuel Costa", position: "MID", shirtNumber: 15, club: "Mallorca", age: 25 },
      { name: "Bruno Fernandes", position: "MID", shirtNumber: 8, club: "Man Utd", age: 31 },
      { name: "João Neves", position: "MID", shirtNumber: 6, club: "PSG", age: 21 },
      { name: "Rúben Neves", position: "MID", shirtNumber: 18, club: "Al-Hilal", age: 29 },
      { name: "Bernardo Silva", position: "MID", shirtNumber: 10, club: "Man City", age: 31 },
      { name: "Vitinha", position: "MID", shirtNumber: 25, club: "PSG", age: 26 },
      // Forwards
      { name: "Francisco Conceição", position: "FWD", shirtNumber: 26, club: "Juventus", age: 23 },
      { name: "João Félix", position: "FWD", shirtNumber: 11, club: "Chelsea", age: 25 },
      { name: "Gonçalo Guedes", position: "FWD", shirtNumber: 16, club: "Wolves", age: 29 },
      { name: "Rafael Leão", position: "FWD", shirtNumber: 17, club: "AC Milan", age: 26 },
      { name: "Pedro Neto", position: "FWD", shirtNumber: 21, club: "Chelsea", age: 26 },
      { name: "Gonçalo Ramos", position: "FWD", shirtNumber: 9, club: "PSG", age: 24 },
      { name: "Cristiano Ronaldo", position: "FWD", shirtNumber: 7, club: "Al-Nassr", age: 41 },
      { name: "Francisco Trincão", position: "FWD", shirtNumber: 27, club: "Sporting CP", age: 26 },
    ]
  }
};

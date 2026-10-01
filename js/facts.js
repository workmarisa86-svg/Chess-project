/* "Did you know?" chess facts, in English and Spanish. */
const FACTS = [
  {
    en: 'There are about 10^120 possible chess games — far more than the estimated 10^80 atoms in the observable universe.',
    es: 'Existen alrededor de 10^120 partidas de ajedrez posibles, muchísimas más que los aproximadamente 10^80 átomos que se calcula que hay en el universo observable.'
  },
  {
    en: 'After just 3 moves each, there are over 119 million possible ways a game could have gone.',
    es: 'Después de solo 3 jugadas por bando, una partida puede haber transcurrido de más de 119 millones de maneras distintas.'
  },
  {
    en: 'The bishop was originally an elephant. The Spanish name "alfil" comes from the Arabic "al-fīl," meaning "the elephant."',
    es: 'El alfil era originalmente un elefante. Su nombre viene del árabe "al-fīl", que significa "el elefante".'
  },
  {
    en: 'The queen began as the king’s advisor and could only move one square diagonally. Around the late 1400s in Spain, she became the most powerful piece on the board.',
    es: 'La dama empezó siendo el consejero del rey y solo podía moverse una casilla en diagonal. A finales del siglo XV, en España, se convirtió en la pieza más poderosa del tablero.'
  },
  {
    en: 'Chess began in India around the 6th century as "chaturanga," then spread to Persia, the Islamic world, and Europe.',
    es: 'El ajedrez nació en la India hacia el siglo VI con el nombre de "chaturanga" y desde allí se extendió a Persia, al mundo islámico y a Europa.'
  },
  {
    en: '"Checkmate" comes from the Persian "shah mat," often translated as "the king is helpless."',
    es: '"Jaque mate" viene del persa "shah mat", que suele traducirse como "el rey está indefenso".'
  },
  {
    en: 'Legend says the inventor of chess asked a king for one grain of wheat on the first square, doubling it on each square. By the 64th square, the total would be more wheat than the whole world has ever harvested.',
    es: 'Cuenta la leyenda que el inventor del ajedrez pidió a un rey un grano de trigo por la primera casilla y el doble en cada casilla siguiente. Al llegar a la casilla 64, el total superaría todo el trigo cosechado jamás en el mundo.'
  },
  {
    en: 'Ruy López, a Spanish priest, wrote one of the first chess books in 1561. The famous Ruy López (Spanish) Opening is named after him.',
    es: 'Ruy López, un sacerdote español, escribió uno de los primeros libros de ajedrez en 1561. La famosa Apertura Española (o Ruy López) lleva su nombre.'
  },
  {
    en: 'Saint Teresa of Ávila used chess as a metaphor in her writings on prayer, and she was later named patroness of Spanish chess players.',
    es: 'Santa Teresa de Ávila usó el ajedrez como metáfora en sus escritos sobre la oración, y más tarde fue nombrada patrona de los ajedrecistas españoles.'
  },
  {
    en: 'Benjamin Franklin wrote an essay, "The Morals of Chess," saying chess teaches foresight, caution, and not giving up when things look bad.',
    es: 'Benjamin Franklin escribió un ensayo, "La moral del ajedrez", en el que decía que el ajedrez enseña previsión, prudencia y a no rendirse cuando las cosas van mal.'
  },
  {
    en: 'In the early 1950s, Alan Turing wrote a chess program before any computer could run it, so he played it by hand — taking about half an hour per move.',
    es: 'A principios de los años 50, Alan Turing escribió un programa de ajedrez antes de que existiera un ordenador capaz de ejecutarlo, así que lo jugó a mano, tardando una media hora por jugada.'
  },
  {
    en: 'In 1970, the cosmonauts aboard Soyuz 9 played chess against people on Earth.',
    es: 'En 1970, los cosmonautas de la Soyuz 9 jugaron una partida de ajedrez contra personas que estaban en la Tierra.'
  },
  {
    en: 'The longest tournament game lasted 269 moves and more than 20 hours (Nikolić vs. Arsović, Belgrade 1989) — and it ended in a draw.',
    es: 'La partida de torneo más larga duró 269 jugadas y más de 20 horas (Nikolić contra Arsović, Belgrado 1989)… y terminó en tablas.'
  },
  {
    en: 'In 1997, IBM’s Deep Blue became the first computer to defeat a reigning world champion, Garry Kasparov, in a match.',
    es: 'En 1997, Deep Blue, de IBM, se convirtió en la primera computadora en derrotar en un match a un campeón del mundo en ejercicio, Garry Kasparov.'
  },
  {
    en: 'The rook comes from the Persian "rukh," meaning chariot. In Spanish it is called "torre" (tower) because of its castle-like shape.',
    es: 'La torre procede del persa "rukh", que significa "carro de guerra". En español se llama torre por su forma de torreón de castillo.'
  },
  {
    en: 'The pawn’s two-square first move was added in medieval Europe to speed up the game. The en passant rule came with it, so a pawn couldn’t use the double step to slip past an enemy pawn.',
    es: 'El avance doble del peón en su primera jugada se añadió en la Europa medieval para agilizar el juego. Con él llegó la captura al paso, para que un peón no pudiera esquivar así a un peón rival.'
  },
  {
    en: 'In 1283, King Alfonso X "the Wise" of Castile completed the "Book of Games," one of the most important medieval works on chess, full of colorful illustrated problems.',
    es: 'En 1283, el rey Alfonso X el Sabio, de Castilla, terminó el "Libro de los juegos", una de las obras medievales más importantes sobre ajedrez, lleno de problemas ilustrados a todo color.'
  },
  {
    en: 'The first official World Chess Champion was Wilhelm Steinitz, who won the title in 1886.',
    es: 'El primer campeón mundial oficial de ajedrez fue Wilhelm Steinitz, que conquistó el título en 1886.'
  },
  {
    en: 'José Raúl Capablanca of Cuba, World Champion from 1921 to 1927, learned chess at about age four just by watching his father play.',
    es: 'El cubano José Raúl Capablanca, campeón del mundo de 1921 a 1927, aprendió a jugar con unos cuatro años solo con ver jugar a su padre.'
  },
  {
    en: 'In 1991, Judit Polgár became a grandmaster at 15 years and 4 months old, breaking Bobby Fischer’s record as the youngest grandmaster at the time.',
    es: 'En 1991, Judit Polgár se convirtió en gran maestra con 15 años y 4 meses, batiendo el récord de Bobby Fischer como la persona más joven en lograr el título hasta entonces.'
  },
  {
    en: 'The fastest possible checkmate is "Fool’s Mate," in just two moves: 1.f3 e5 2.g4 Qh4#.',
    es: 'El jaque mate más rápido posible es el "mate del loco", en solo dos jugadas: 1.f3 e5 2.g4 Dh4#.'
  },
  {
    en: 'In the "Immortal Game" (London, 1851), Adolf Anderssen gave up both rooks, a bishop, and his queen — and still delivered checkmate.',
    es: 'En la "Partida Inmortal" (Londres, 1851), Adolf Anderssen entregó las dos torres, un alfil y la dama… y aun así dio jaque mate.'
  },
  {
    en: 'Before algebraic notation (like Nf3) became the official standard in 1981, many players wrote moves in descriptive notation, such as "P-K4" for "pawn to king’s fourth."',
    es: 'Antes de que la notación algebraica (como Cf3) se convirtiera en la oficial en 1981, muchos jugadores usaban la notación descriptiva, por ejemplo "P4R" para "peón cuatro rey".'
  },
  {
    en: 'FIDE, the International Chess Federation, was founded in Paris on July 20, 1924. That is why July 20 is celebrated as International Chess Day.',
    es: 'La FIDE, la Federación Internacional de Ajedrez, se fundó en París el 20 de julio de 1924. Por eso el 20 de julio se celebra el Día Internacional del Ajedrez.'
  },
  {
    en: 'A knight can visit every square of the board exactly once. This puzzle, the "knight’s tour," was studied by the mathematician Leonhard Euler in 1759.',
    es: 'Un caballo puede visitar todas las casillas del tablero exactamente una vez. Este acertijo, el "recorrido del caballo", lo estudió el matemático Leonhard Euler en 1759.'
  },
  {
    en: 'After only 2 moves each, there are already 197,281 different possible games.',
    es: 'Con solo 2 jugadas por bando ya hay 197.281 partidas distintas posibles.'
  },
  {
    en: 'In 2014, Magnus Carlsen reached a rating of 2882, the highest ever achieved in official classical chess.',
    es: 'En 2014, Magnus Carlsen alcanzó un Elo de 2882, el más alto jamás logrado en el ajedrez clásico oficial.'
  }
];

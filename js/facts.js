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
  },
  {
    en: 'White has 20 possible first moves: 16 pawn moves and 4 knight moves.',
    es: 'Las blancas tienen 20 primeras jugadas posibles: 16 de peón y 4 de caballo.'
  },
  {
    en: 'In the starting position, only the pawns and the knights can move.',
    es: 'En la posición inicial, solo pueden moverse los peones y los caballos.'
  },
  {
    en: 'Castling is the only move in which two of your own pieces move at the same time: the king and a rook.',
    es: 'El enroque es la única jugada en la que se mueven dos piezas propias a la vez: el rey y una torre.'
  },
  {
    en: 'You can’t castle out of check, through a square that is attacked, or into check.',
    es: 'No se puede enrocar estando en jaque, pasando por una casilla atacada ni quedando en jaque.'
  },
  {
    en: '“O-O” means castling on the king’s side, and “O-O-O” means castling on the queen’s side.',
    es: '«O-O» significa enroque corto (del lado del rey) y «O-O-O», enroque largo (del lado de la dama).'
  },
  {
    en: 'The board is always set up with a light square in each player’s right-hand corner: “light on the right.”',
    es: 'El tablero siempre se coloca con una casilla clara en la esquina derecha de cada jugador.'
  },
  {
    en: 'At the start, each queen stands on a square of her own color: the White queen on a light square (d1), the Black queen on a dark square (d8).',
    es: 'Al empezar, cada dama está en una casilla de su color: la dama blanca en casilla clara (d1) y la negra en casilla oscura (d8).'
  },
  {
    en: 'A knight always lands on a square of the opposite color from the one it started on.',
    es: 'El caballo siempre cae en una casilla de color distinto al de la casilla de la que salió.'
  },
  {
    en: 'A bishop stays on squares of the same color for the whole game.',
    es: 'Un alfil se queda en casillas del mismo color durante toda la partida.'
  },
  {
    en: 'The knight is the only piece that can jump over other pieces in a normal move.',
    es: 'El caballo es la única pieza que puede saltar por encima de otras en una jugada normal.'
  },
  {
    en: 'The queen moves like a rook and a bishop combined.',
    es: 'La dama se mueve como una torre y un alfil juntos.'
  },
  {
    en: 'Pawns are the only pieces that never move backward, and the only ones that capture in a different way from how they move.',
    es: 'Los peones son las únicas piezas que nunca retroceden y las únicas que capturan de forma distinta a como se mueven.'
  },
  {
    en: 'Two kings can never stand on squares next to each other.',
    es: 'Los dos reyes nunca pueden estar en casillas vecinas.'
  },
  {
    en: 'A pawn that reaches the last rank can become a queen, rook, bishop or knight, so in theory a player could have nine queens.',
    es: 'Un peón que llega a la última fila puede convertirse en dama, torre, alfil o caballo, así que en teoría un jugador podría tener nueve damas.'
  },
  {
    en: 'Promoting to a piece other than a queen is called underpromotion. Choosing a knight can be the best move, because a knight can give a check that a queen can’t.',
    es: 'Coronar una pieza que no sea dama se llama subpromoción. Elegir caballo puede ser lo mejor, porque el caballo da jaques que la dama no puede dar.'
  },
  {
    en: 'An en passant capture is only allowed on the very next move after the enemy pawn advances two squares.',
    es: 'La captura al paso solo se permite en la jugada inmediatamente posterior a que el peón rival avance dos casillas.'
  },
  {
    en: '“En passant” is French for “in passing.”',
    es: '«En passant» es francés y significa «al paso».'
  },
  {
    en: '“Zugzwang” is a German word meaning “compulsion to move”: any move you make will weaken your position.',
    es: '«Zugzwang» es una palabra alemana que significa «obligación de mover»: cualquier jugada empeora tu posición.'
  },
  {
    en: '“Fianchetto” comes from Italian and means “little flank.” It describes a bishop developed to b2, g2, b7 or g7.',
    es: '«Fianchetto» viene del italiano y significa «pequeño flanco». Describe un alfil desarrollado en b2, g2, b7 o g7.'
  },
  {
    en: 'The Spanish word “ajedrez” comes from the Arabic “ash-shaṭranj,” which in turn comes from the Sanskrit “chaturanga.”',
    es: 'La palabra «ajedrez» viene del árabe «ash-shaṭranj», que a su vez procede del sánscrito «chaturanga».'
  },
  {
    en: '“Chaturanga” means “four parts”: the four divisions of an ancient Indian army, namely infantry, cavalry, elephants and chariots.',
    es: '«Chaturanga» significa «cuatro partes»: las cuatro divisiones de un antiguo ejército indio, es decir, infantería, caballería, elefantes y carros.'
  },
  {
    en: 'A king with only a knight, or only a bishop, can never checkmate a lone king.',
    es: 'Un rey con solo un caballo, o con solo un alfil, nunca puede dar mate a un rey solo.'
  },
  {
    en: 'Even two knights can’t force checkmate against a lone king. Mate is only possible if the defender makes a mistake.',
    es: 'Ni siquiera dos caballos pueden forzar el mate a un rey solo. El mate solo es posible si el defensor se equivoca.'
  },
  {
    en: 'King, bishop and knight can force checkmate against a lone king, but with perfect defense it can take up to 33 moves.',
    es: 'Rey, alfil y caballo pueden forzar el mate a un rey solo, pero con defensa perfecta puede llevar hasta 33 jugadas.'
  },
  {
    en: 'Computers have solved every position with seven or fewer pieces on the board. These solved databases are called endgame tablebases.',
    es: 'Las computadoras han resuelto todas las posiciones con siete piezas o menos en el tablero. Esas bases de datos resueltas se llaman tablas de finales.'
  },
  {
    en: 'Under the 50-move rule, a player can claim a draw if 50 moves by each side pass with no capture and no pawn move.',
    es: 'Según la regla de las 50 jugadas, se puede reclamar tablas si pasan 50 jugadas de cada bando sin capturas ni movimientos de peón.'
  },
  {
    en: 'Since 2014, official rules end a game as a draw automatically after 75 moves without a capture or pawn move, or when the same position appears five times.',
    es: 'Desde 2014, el reglamento oficial declara tablas automáticamente tras 75 jugadas sin capturas ni movimientos de peón, o cuando la misma posición aparece cinco veces.'
  },
  {
    en: 'Under the touch-move rule, if you deliberately touch one of your pieces in an official game, you must move it if it has a legal move.',
    es: 'Según la regla de «pieza tocada, pieza movida», si en una partida oficial tocas a propósito una de tus piezas, debes moverla si tiene alguna jugada legal.'
  },
  {
    en: 'To straighten a piece on its square without having to move it, a player first says “j’adoube,” French for “I adjust.”',
    es: 'Para centrar una pieza en su casilla sin tener que moverla, el jugador dice antes «j’adoube», que en francés significa «compongo».'
  },
  {
    en: 'In written chess, “!” marks a good move, “!!” a brilliant one, “?” a mistake and “??” a blunder.',
    es: 'En las partidas escritas, «!» marca una buena jugada, «!!» una brillante, «?» un error y «??» un error grave.'
  },
  {
    en: 'FIDE first awarded the official grandmaster title in 1950, to 27 players.',
    es: 'La FIDE otorgó por primera vez el título oficial de gran maestro en 1950, a 27 jugadores.'
  },
  {
    en: 'The Elo rating system is named after Arpad Elo, a Hungarian-American physics professor. FIDE adopted it in 1970.',
    es: 'El sistema de puntuación Elo lleva el nombre de Arpad Elo, un profesor de física húngaro-estadounidense. La FIDE lo adoptó en 1970.'
  },
  {
    en: 'The first official Chess Olympiad, a team competition between countries, was held in London in 1927.',
    es: 'La primera Olimpiada de Ajedrez oficial, una competición por equipos entre países, se celebró en Londres en 1927.'
  },
  {
    en: 'The first official World Championship match, Steinitz against Zukertort in 1886, was played in three U.S. cities: New York, St. Louis and New Orleans.',
    es: 'El primer match oficial por el Campeonato del Mundo, Steinitz contra Zukertort en 1886, se jugó en tres ciudades de Estados Unidos: Nueva York, San Luis y Nueva Orleans.'
  },
  {
    en: 'Emanuel Lasker was World Champion for 27 years, from 1894 to 1921, longer than anyone else.',
    es: 'Emanuel Lasker fue campeón del mundo durante 27 años, de 1894 a 1921, más tiempo que nadie.'
  },
  {
    en: 'José Raúl Capablanca went about eight years, from 1916 to 1924, without losing a single tournament or match game.',
    es: 'José Raúl Capablanca pasó unos ocho años, de 1916 a 1924, sin perder ni una sola partida de torneo o de match.'
  },
  {
    en: 'Alexander Alekhine is the only World Champion who died while still holding the title, in 1946.',
    es: 'Alexander Alekhine es el único campeón del mundo que murió siendo todavía campeón, en 1946.'
  },
  {
    en: 'Vera Menchik was the first Women’s World Champion. She held the title from 1927 until 1944.',
    es: 'Vera Menchik fue la primera campeona mundial femenina. Mantuvo el título desde 1927 hasta 1944.'
  },
  {
    en: 'In 1978, Nona Gaprindashvili became the first woman to be awarded the full grandmaster title.',
    es: 'En 1978, Nona Gaprindashvili se convirtió en la primera mujer en recibir el título de gran maestro absoluto.'
  },
  {
    en: 'Maia Chiburdanidze became Women’s World Champion in 1978, at just 17 years old.',
    es: 'Maia Chiburdanidze se proclamó campeona mundial femenina en 1978, con solo 17 años.'
  },
  {
    en: 'Hou Yifan became Women’s World Champion in 2010 at 16, the youngest ever to win that title.',
    es: 'Hou Yifan se proclamó campeona mundial femenina en 2010 con 16 años, la más joven en lograr ese título.'
  },
  {
    en: 'Mikhail Tal, the “Magician from Riga,” became World Champion in 1960 at age 23. He was famous for daring sacrifices.',
    es: 'Mijaíl Tal, el «Mago de Riga», fue campeón del mundo en 1960 con 23 años. Era famoso por sus sacrificios atrevidos.'
  },
  {
    en: 'Paul Morphy of New Orleans traveled to Europe in 1858 and beat the strongest players there. Soon afterwards he retired from serious chess.',
    es: 'Paul Morphy, de Nueva Orleans, viajó a Europa en 1858 y derrotó a los jugadores más fuertes. Poco después se retiró del ajedrez serio.'
  },
  {
    en: 'Morphy’s famous “Opera Game” was played in 1858 in a box at the Paris Opera, during a performance. He won in 17 moves.',
    es: 'La famosa «Partida de la Ópera» de Morphy se jugó en 1858 en un palco de la Ópera de París, durante una función. Ganó en 17 jugadas.'
  },
  {
    en: 'In the “Game of the Century” (New York, 1956), 13-year-old Bobby Fischer beat Donald Byrne with a famous queen sacrifice.',
    es: 'En la «Partida del Siglo» (Nueva York, 1956), Bobby Fischer, con 13 años, venció a Donald Byrne con un famoso sacrificio de dama.'
  },
  {
    en: 'Bobby Fischer won the 1963–64 U.S. Championship with a perfect score: 11 wins out of 11 games.',
    es: 'Bobby Fischer ganó el Campeonato de Estados Unidos de 1963-64 con puntuación perfecta: 11 victorias en 11 partidas.'
  },
  {
    en: 'In 1972, in Reykjavík, Iceland, Bobby Fischer defeated Boris Spassky and became the first U.S.-born World Champion.',
    es: 'En 1972, en Reikiavik (Islandia), Bobby Fischer venció a Borís Spaski y se convirtió en el primer campeón del mundo nacido en Estados Unidos.'
  },
  {
    en: 'In 1975, Anatoly Karpov became World Champion without playing a match, because Bobby Fischer did not defend his title.',
    es: 'En 1975, Anatoli Kárpov se convirtió en campeón del mundo sin jugar el match, porque Bobby Fischer no defendió su título.'
  },
  {
    en: 'The first World Championship match between Karpov and Kasparov (1984–85) was stopped after 48 games without a winner.',
    es: 'El primer match por el título entre Kárpov y Kaspárov (1984-85) se suspendió tras 48 partidas sin un ganador.'
  },
  {
    en: 'In 1985, Garry Kasparov became the youngest undisputed World Champion at age 22.',
    es: 'En 1985, Garri Kaspárov se convirtió, con 22 años, en el campeón del mundo indiscutido más joven.'
  },
  {
    en: 'Before losing to Deep Blue in 1997, Garry Kasparov had beaten an earlier version of it in 1996, 4–2.',
    es: 'Antes de perder contra Deep Blue en 1997, Garri Kaspárov había vencido a una versión anterior en 1996 por 4-2.'
  },
  {
    en: 'Deep Blue could examine about 200 million chess positions per second.',
    es: 'Deep Blue podía examinar unos 200 millones de posiciones de ajedrez por segundo.'
  },
  {
    en: 'In 2017, the program AlphaZero learned chess from scratch, knowing only the rules, by playing millions of games against itself.',
    es: 'En 2017, el programa AlphaZero aprendió ajedrez desde cero, conociendo solo las reglas, jugando millones de partidas contra sí mismo.'
  },
  {
    en: 'Viswanathan Anand became India’s first grandmaster in 1988 and later won the World Championship several times.',
    es: 'Viswanathan Anand fue el primer gran maestro de la India, en 1988, y más tarde ganó el Campeonato del Mundo varias veces.'
  },
  {
    en: 'Magnus Carlsen won the World Championship in 2013 by beating Viswanathan Anand in Chennai, India.',
    es: 'Magnus Carlsen ganó el Campeonato del Mundo en 2013 al vencer a Viswanathan Anand en Chennai (India).'
  },
  {
    en: 'In 2021, Abhimanyu Mishra became the youngest grandmaster in history, at 12 years, 4 months and 25 days.',
    es: 'En 2021, Abhimanyu Mishra se convirtió en el gran maestro más joven de la historia, con 12 años, 4 meses y 25 días.'
  },
  {
    en: '“The Turk,” a chess-playing machine shown in 1770, amazed audiences for decades. It was a trick: a strong human player hid inside.',
    es: '«El Turco», una máquina que jugaba al ajedrez presentada en 1770, asombró al público durante décadas. Era un truco: dentro se escondía un jugador fuerte.'
  },
  {
    en: 'Spanish engineer Leonardo Torres Quevedo built “El Ajedrecista” in 1912. This real machine could play the king and rook against king ending on its own.',
    es: 'El ingeniero español Leonardo Torres Quevedo construyó «El Ajedrecista» en 1912. Esta máquina real podía jugar sola el final de rey y torre contra rey.'
  },
  {
    en: 'The classic “Staunton” chess pieces were introduced in 1849 and named after Howard Staunton, a leading English player.',
    es: 'Las clásicas piezas «Staunton» se presentaron en 1849 y llevan el nombre de Howard Staunton, un destacado jugador inglés.'
  },
  {
    en: 'In Chess960, proposed by Bobby Fischer in 1996, the pieces on the back rank are shuffled, giving 960 possible starting positions.',
    es: 'En el Ajedrez960, propuesto por Bobby Fischer en 1996, las piezas de la primera fila se colocan al azar, con 960 posiciones iniciales posibles.'
  },
  {
    en: 'In blindfold chess, players play without seeing the board, keeping the whole position in their memory.',
    es: 'En el ajedrez a ciegas, los jugadores juegan sin ver el tablero y llevan toda la posición en la memoria.'
  },
  {
    en: 'In a simultaneous exhibition, one strong player plays many opponents at once, walking from board to board.',
    es: 'En una partida simultánea, un jugador fuerte se enfrenta a muchos rivales a la vez, pasando de tablero en tablero.'
  },
  {
    en: 'In correspondence chess, moves used to be sent by post, so a single game could last months or even years.',
    es: 'En el ajedrez por correspondencia las jugadas se enviaban por correo, así que una sola partida podía durar meses o incluso años.'
  },
  {
    en: 'The Sicilian Defense (1.e4 c5) is the most popular reply to 1.e4 among strong players.',
    es: 'La Defensa Siciliana (1.e4 c5) es la respuesta más popular a 1.e4 entre los jugadores fuertes.'
  },
  {
    en: 'Scholar’s Mate ends the game in four moves with a queen capture on f7 (or f2). Defending f7 early is an easy way to stop it.',
    es: 'El mate del pastor termina la partida en cuatro jugadas con una captura de dama en f7 (o f2). Defender f7 a tiempo es una forma sencilla de evitarlo.'
  },
  {
    en: 'Chess has been played as a medal event at the Asian Games, for example in 2006 and 2010.',
    es: 'El ajedrez ha formado parte del medallero de los Juegos Asiáticos, por ejemplo en 2006 y 2010.'
  }
];

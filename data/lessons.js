/*
 * Lessons: a short chess course in nine chapters, written for this app in
 * English and Spanish (the order of topics follows the classic path of
 * Capablanca's "Chess Fundamentals", 1921; the text is our own).
 * Loaded on demand when the Lessons screen opens.
 *
 * Step kinds:
 *   { term: 'fork' }                         glossary explanation and diagram
 *   { fen, en, es, arrows?, marks? }         a position with text
 *   { moves: 'e4 e5 Nf3', en, es, ... }      the position after these moves
 * task:     { f, s, g, en, es } a "Your turn" position (checked by the engine)
 * practice: { c, t?, l? } Challenge puzzles to practise with (category, theme, level)
 */
self.LESSONS = [
  {
    ch: { en: 'First steps', es: 'Primeros pasos' },
    lessons: [
      {
        id: 'pieces',
        t: { en: 'How the pieces move', es: 'Cómo se mueven las piezas' },
        steps: [
          { moves: '', en: 'Each side starts with 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, a queen and a king. White always moves first.', es: 'Cada bando empieza con 16 piezas: 8 peones, 2 torres, 2 caballos, 2 alfiles, una dama y un rey. Siempre empiezan las blancas.' },
          { fen: '4k3/8/8/8/3R4/8/8/4K3 w - - 0 1', arrows: [['d4', 'd8'], ['d4', 'd1'], ['d4', 'a4'], ['d4', 'h4']], en: 'The rook moves in straight lines, along ranks and files, as far as it likes.', es: 'La torre se mueve en línea recta, por filas y columnas, tantas casillas como quiera.' },
          { fen: '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1', arrows: [['d4', 'h8'], ['d4', 'a1'], ['d4', 'a7'], ['d4', 'g1']], en: 'The bishop moves along diagonals, so it always stays on squares of one color.', es: 'El alfil se mueve en diagonal, así que siempre se queda en casillas de un mismo color.' },
          { fen: '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1', arrows: [['d4', 'd8'], ['d4', 'h4'], ['d4', 'h8'], ['d4', 'a7'], ['d4', 'a4'], ['d4', 'd1'], ['d4', 'a1'], ['d4', 'g1']], en: 'The queen combines the rook and the bishop: any straight line or diagonal. It is the strongest piece.', es: 'La dama combina la torre y el alfil: cualquier línea recta o diagonal. Es la pieza más fuerte.' },
          { fen: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1', marks: ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'], en: 'The knight jumps in an L shape: two squares one way and one to the side. It is the only piece that can jump over others.', es: 'El caballo salta en forma de L: dos casillas en una dirección y una hacia el lado. Es la única pieza que puede saltar por encima de otras.' },
          { fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1', arrows: [['e2', 'e4']], marks: ['d3', 'f3'], en: 'Pawns move straight forward one square (two on their first move) but capture one square diagonally forward. The king moves one square in any direction.', es: 'Los peones avanzan una casilla recto (dos en su primera jugada), pero capturan una casilla en diagonal hacia delante. El rey se mueve una casilla en cualquier dirección.' }
        ],
        task: { f: '4k3/8/8/3q4/8/4N3/7P/4K3 w - - 0 1', s: 'e3d5', g: 'mat', en: 'The knight jumps from e3 to d5 and captures the queen.', es: 'El caballo salta de e3 a d5 y captura la dama.' }
      },
      {
        id: 'check',
        t: { en: 'Check, checkmate and stalemate', es: 'Jaque, jaque mate y ahogado' },
        steps: [
          { term: 'check' },
          { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', arrows: [['a1', 'a8']], en: 'There are three ways out of check: move the king, block the line, or capture the checking piece. If none works, it is checkmate and the game is over.', es: 'Hay tres formas de salir del jaque: mover el rey, tapar la línea o capturar la pieza que da jaque. Si ninguna funciona, es jaque mate y la partida termina.' },
          { fen: 'R5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', marks: ['g8'], en: 'Here the rook checks along the back rank. The king\'s own pawns block its escape, nothing can block or capture: checkmate.', es: 'Aquí la torre da jaque por la última fila. Los propios peones encierran al rey y nada puede tapar ni capturar: jaque mate.' },
          { term: 'stalemate' }
        ],
        task: { f: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', s: 'a1a8', g: 'm1', en: 'Ra8 checks along the back rank, and the king is trapped by its own pawns.', es: 'Ta8 da jaque por la última fila y el rey queda encerrado por sus propios peones.' }
      },
      {
        id: 'values',
        t: { en: 'What the pieces are worth', es: 'Cuánto valen las piezas' },
        steps: [
          { term: 'materialValue' },
          { fen: '4k3/8/8/8/1r6/8/3B4/4K3 w - - 0 1', arrows: [['d2', 'b4']], en: 'Before every capture, compare values. Here the bishop (3) can take an undefended rook (5) for free.', es: 'Antes de cada captura, compara valores. Aquí el alfil (3) puede llevarse gratis una torre (5) sin defensa.' },
          { term: 'hangingPiece' }
        ],
        task: { f: '4k3/8/8/8/1r6/8/3B4/4K3 w - - 0 1', s: 'd2b4', g: 'mat', en: 'Bxb4 wins a whole rook: it was not defended.', es: 'Axb4 gana una torre entera: no estaba defendida.' }
      },
      {
        id: 'special',
        t: { en: 'Castling, en passant and promotion', es: 'Enroque, captura al paso y coronación' },
        steps: [
          { term: 'castling' },
          { term: 'enPassant' },
          { term: 'promotion' }
        ],
        task: { f: '7k/4P3/6K1/8/8/8/8/8 w - - 0 1', s: 'e7e8q', g: 'm1', en: 'The pawn promotes on e8 with check along the back rank, and the White king covers g7 and h7: checkmate.', es: 'El peón corona en e8 dando jaque por la última fila, y el rey blanco controla g7 y h7: jaque mate.' }
      }
    ]
  },
  {
    ch: { en: 'Simple mates', es: 'Mates sencillos' },
    lessons: [
      {
        id: 'mateQueen',
        t: { en: 'Mate with the queen', es: 'Mate con la dama' },
        steps: [
          { fen: '8/8/3k4/8/8/2Q5/8/6K1 w - - 0 1', marks: ['c3'], en: 'With king and queen against a lone king, use the queen to make the enemy king\'s box smaller, step by step. Keep the queen a knight\'s jump away from the king, so it is never stalemate by accident.', es: 'Con rey y dama contra rey solo, usa la dama para hacer más pequeña la caja del rey rival, paso a paso. Mantén la dama a un salto de caballo del rey, para no ahogarlo por accidente.' },
          { fen: '7k/5Q2/8/8/8/8/8/6K1 w - - 0 1', marks: ['h8'], en: 'Once the king is stuck on the edge, stop pushing and bring your own king closer. The queen alone can never mate.', es: 'Cuando el rey está atrapado en el borde, deja de empujar y acerca tu propio rey. La dama sola nunca puede dar mate.' },
          { term: 'basicMate' }
        ],
        task: { f: '7k/8/6K1/8/8/8/8/5Q2 w - - 0 1', s: 'f1f8', g: 'm1', en: 'Qf8 checks along the back rank; g7 and h7 are covered by your king.', es: 'Df8 da jaque por la última fila; g7 y h7 están controladas por tu rey.' },
        practice: { c: 'e', t: 'basicMate' }
      },
      {
        id: 'mateRook',
        t: { en: 'Mate with the rook', es: 'Mate con la torre' },
        steps: [
          { fen: '8/8/8/3k4/8/8/8/R5K1 w - - 0 1', arrows: [['a1', 'a4']], en: 'The rook cuts the enemy king off along a rank or file. Your king walks up to face the other king.', es: 'La torre corta al rey rival por una fila o columna. Tu rey se acerca hasta quedar frente al otro rey.' },
          { fen: '4k3/8/4K3/8/8/8/8/R7 w - - 0 1', arrows: [['a1', 'a8']], en: 'When the kings face each other with one square between them, a rook check on the edge is mate.', es: 'Cuando los reyes están frente a frente con una casilla entre ellos, un jaque de torre en el borde es mate.' }
        ],
        task: { f: '6k1/8/6K1/8/8/8/8/R7 w - - 0 1', s: 'a1a8', g: 'm1', en: 'Ra8 is mate: your king covers f7, g7 and h7.', es: 'Ta8 es mate: tu rey controla f7, g7 y h7.' },
        practice: { c: 'e', t: 'basicMate' }
      },
      {
        id: 'patterns',
        t: { en: 'Mating patterns', es: 'Patrones de mate' },
        steps: [
          { term: 'backRankMate' },
          { term: 'smotheredMate' }
        ],
        task: { f: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1', s: 'h6f7', g: 'm1', en: 'Nf7 is a smothered mate: the king is surrounded by its own pieces.', es: 'Cf7 es un mate de la coz: el rey está rodeado por sus propias piezas.' },
        practice: { c: 't', t: 'checkmate' }
      }
    ]
  },
  {
    ch: { en: 'Pawn endings', es: 'Finales de peones' },
    lessons: [
      { id: 'kp', t: { en: 'King and pawn', es: 'Rey y peón' }, steps: [{ term: 'kingPawnEnding' }, { term: 'opposition' }, { term: 'zugzwang' }], practice: { c: 'e', t: 'opposition' } },
      { id: 'square', t: { en: 'The rule of the square', es: 'La regla del cuadrado' }, steps: [{ term: 'ruleOfSquare' }, { term: 'passedPawn' }], practice: { c: 'e', t: 'ruleOfSquare' } },
      { id: 'breakthrough', t: { en: 'Pawn breakthroughs', es: 'Rupturas de peones' }, steps: [{ term: 'breakthrough' }], practice: { c: 'e', t: 'breakthrough' } }
    ]
  },
  {
    ch: { en: 'Winning won games', es: 'Ganar las partidas ganadas' },
    lessons: [
      {
        id: 'convert',
        t: { en: 'Turning an advantage into a win', es: 'Convertir la ventaja en victoria' },
        steps: [
          { fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', en: 'When you are ahead in material, trade pieces, not pawns. Every trade makes your extra material count for more, and with fewer pieces your opponent has fewer tricks.', es: 'Cuando tienes más material, cambia piezas, no peones. Cada cambio hace que tu ventaja pese más, y con menos piezas el rival tiene menos trucos.' },
          { fen: '8/5k2/8/8/2P5/8/5K2/8 w - - 0 1', arrows: [['c4', 'c8']], en: 'A passed pawn is a future queen. Push it, and keep your king close to help it.', es: 'Un peón pasado es una futura dama. Empújalo y mantén tu rey cerca para ayudarlo.' },
          { term: 'kingActivity' },
          { fen: '7k/8/8/8/8/8/8/R5K1 w - - 0 1', en: 'Stay alert to the opponent\'s last chances: check for threats before every move, and avoid stalemate when the enemy king has few squares.', es: 'Atento a las últimas oportunidades del rival: revisa sus amenazas antes de cada jugada y evita el ahogado cuando el rey rival tenga pocas casillas.' }
        ],
        practice: { c: 'e', t: 'kingPawnEnding' }
      }
    ]
  },
  {
    ch: { en: 'Opening principles', es: 'Principios de apertura' },
    lessons: [
      {
        id: 'center',
        t: { en: 'Center, development, castling', es: 'Centro, desarrollo y enroque' },
        steps: [
          { moves: 'e4 e5', marks: ['d4', 'e4', 'd5', 'e5'], en: 'Start by putting a pawn in the center. Pieces placed toward the center control more squares.', es: 'Empieza poniendo un peón en el centro. Las piezas colocadas hacia el centro controlan más casillas.' },
          { term: 'centerControl' },
          { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5', en: 'Develop your knights and bishops quickly, each to a good square, without moving the same piece twice.', es: 'Desarrolla rápido caballos y alfiles, cada uno a una buena casilla, sin mover dos veces la misma pieza.' },
          { term: 'development' },
          { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', arrows: [['e1', 'g1']], en: 'Castle early to put your king in safety and bring a rook toward the center.', es: 'Enroca pronto para poner tu rey a salvo y acercar una torre al centro.' },
          { term: 'earlyQueen' }
        ],
        practice: { c: 'o', l: 0 }
      },
      {
        id: 'traps',
        t: { en: 'Common opening traps', es: 'Trampas de apertura habituales' },
        steps: [
          { term: 'trap' },
          { moves: 'e4 e5 Bc4 Nc6 Qh5', arrows: [['h5', 'f7'], ['c4', 'f7']], en: 'Scholar\'s Mate: the queen and bishop both aim at f7, which only the king defends.', es: 'El mate del pastor: la dama y el alfil apuntan a f7, que solo defiende el rey.' },
          { moves: 'e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#', en: 'If Black ignores the threat, Qxf7 is checkmate. A simple ...g6 or ...Qe7 stops it, and then the White queen has moved early for nothing.', es: 'Si las negras ignoran la amenaza, Dxf7 es jaque mate. Un simple ...g6 o ...De7 lo evita, y entonces la dama blanca ha salido pronto para nada.' },
          { moves: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5', en: 'Légal\'s trap: White seems to drop the queen with Nxe5...', es: 'La trampa de Légal: las blancas parecen regalar la dama con Cxe5...' },
          { moves: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#', en: '...but after ...Bxd1, Bxf7+ and Nd5 are checkmate by three minor pieces.', es: '...pero tras ...Axd1, Axf7+ y Cd5 es jaque mate con tres piezas menores.' }
        ],
        practice: { c: 'o', l: 1 }
      }
    ]
  },
  {
    ch: { en: 'Middlegame plans', es: 'Planes de medio juego' },
    lessons: [
      {
        id: 'plans',
        t: { en: 'Open files, outposts and attack', es: 'Columnas abiertas, puestos avanzados y ataque' },
        steps: [
          { term: 'openFile' },
          { fen: 'r4rk1/pp3ppp/8/3N4/4P3/8/PPP2PPP/R4RK1 w - - 0 1', marks: ['d5'], en: 'An outpost is a square in enemy territory that no enemy pawn can attack, like d5 here. A knight placed there is very strong.', es: 'Un puesto avanzado es una casilla en campo rival que ningún peón enemigo puede atacar, como d5 aquí. Un caballo colocado ahí es muy fuerte.' },
          { term: 'kingSafety' },
          { fen: '2kr3r/ppp2ppp/8/8/8/8/PPP2PPP/2KR3R w - - 0 1', en: 'Make a plan from the position: attack where you are stronger, put rooks on open files, and improve your worst piece when nothing else is happening.', es: 'Haz un plan según la posición: ataca donde eres más fuerte, pon las torres en columnas abiertas y mejora tu peor pieza cuando no pase nada más.' },
          { term: 'tempo' }
        ],
        practice: { c: 't', t: 'threat' }
      }
    ]
  },
  {
    ch: { en: 'Tactics', es: 'Táctica' },
    lessons: [
      { id: 'fork', t: { en: 'Forks and double attacks', es: 'Horquillas y dobles ataques' }, steps: [{ term: 'fork' }, { term: 'doubleAttack' }], practice: { c: 't', t: 'fork' } },
      { id: 'pin', t: { en: 'Pins and skewers', es: 'Clavadas y enfiladas' }, steps: [{ term: 'pin' }, { term: 'skewer' }], practice: { c: 't', t: 'pin' } },
      { id: 'discovered', t: { en: 'Discovered attacks', es: 'Ataques a la descubierta' }, steps: [{ term: 'discoveredAttack' }, { term: 'discoveredCheck' }, { term: 'doubleCheck' }], practice: { c: 't', t: 'discoveredAttack' } },
      { id: 'defenders', t: { en: 'Deflection, decoy and removing the defender', es: 'Desviación, atracción y eliminación del defensor' }, steps: [{ term: 'removingDefender' }, { term: 'deflection' }, { term: 'decoy' }, { term: 'overloading' }], practice: { c: 't', t: 'removingDefender' } }
    ]
  },
  {
    ch: { en: 'Rook endings', es: 'Finales de torres' },
    lessons: [
      { id: 'lucena', t: { en: 'The Lucena position: how to win', es: 'La posición de Lucena: cómo ganar' }, steps: [{ term: 'lucena' }], practice: { c: 'e', l: 3 } },
      { id: 'philidor', t: { en: 'The Philidor position: how to draw', es: 'La posición de Philidor: cómo hacer tablas' }, steps: [{ term: 'philidorPosition' }], practice: { c: 'e', l: 3 } }
    ]
  },
  {
    ch: { en: 'Great games explained', es: 'Grandes partidas explicadas' },
    lessons: [
      {
        id: 'opera',
        t: { en: 'Morphy\'s Opera Game (Paris, 1858)', es: 'La Partida de la Ópera de Morphy (París, 1858)' },
        game: 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#',
        steps: [
          { ply: 6, en: 'Black pins the knight with ...Bg4, but this costs time and soon gives up the bishop pair.', es: 'Las negras clavan el caballo con ...Ag4, pero esto cuesta tiempo y pronto entrega la pareja de alfiles.' },
          { ply: 11, en: 'After the trades, Morphy develops with a threat: Bc4 and the queen both eye f7.', es: 'Tras los cambios, Morphy desarrolla con amenaza: Ac4 y la dama apuntan a f7.' },
          { ply: 13, en: 'Qb3 attacks f7 and b7 at once: a double attack.', es: 'Db3 ataca f7 y b7 a la vez: un doble ataque.' },
          { ply: 15, en: 'Instead of grabbing a pawn, Morphy keeps developing. Being ahead in development is his real advantage.', es: 'En lugar de comer un peón, Morphy sigue desarrollando. Ir por delante en desarrollo es su verdadera ventaja.' },
          { ply: 17, en: 'Bg5 pins the knight on f6 to the queen.', es: 'Ag5 clava el caballo de f6 contra la dama.' },
          { ply: 19, en: 'Nxb5! A sacrifice to open lines toward the black king, which never castled.', es: '¡Cxb5! Un sacrificio para abrir líneas hacia el rey negro, que nunca enrocó.' },
          { ply: 23, en: 'Castling queenside brings the rook straight to the open d-file.', es: 'El enroque largo lleva la torre directamente a la columna d abierta.' },
          { ply: 25, en: 'Rxd7! Another sacrifice: Morphy removes the defenders one by one.', es: '¡Txd7! Otro sacrificio: Morphy elimina los defensores uno a uno.' },
          { ply: 31, en: 'Qb8+!! The queen sacrifice decoys the knight away from d7...', es: '¡¡Db8+!! El sacrificio de dama atrae al caballo lejos de d7...' },
          { ply: 33, en: '...and Rd8 is checkmate. Fast development, open lines and active pieces beat extra material.', es: '...y Td8 es jaque mate. Desarrollo rápido, líneas abiertas y piezas activas vencen al material de más.' }
        ],
        practice: { c: 'g' }
      },
      {
        id: 'reti',
        t: { en: 'Réti vs. Tartakower (Vienna, 1910)', es: 'Réti contra Tartakower (Viena, 1910)' },
        game: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Kc7 Bd8#',
        steps: [
          { ply: 10, en: 'Black opens the center with ...e5 while the black king is still in the middle.', es: 'Las negras abren el centro con ...e5 con el rey negro todavía en el centro.' },
          { ply: 15, en: 'White castles queenside: the rook lands on the d-file, facing the black king.', es: 'Las blancas enrocan largo: la torre llega a la columna d, frente al rey negro.' },
          { ply: 16, en: 'Black grabs the knight on e4, but leaves the king exposed.', es: 'Las negras se comen el caballo de e4, pero dejan el rey expuesto.' },
          { ply: 17, en: 'Qd8+!! A queen sacrifice: the king must take.', es: '¡¡Dd8+!! Un sacrificio de dama: el rey tiene que capturar.' },
          { ply: 19, en: 'Bg5+ is a double check, from the bishop and the rook at the same time, so the king must move.', es: 'Ag5+ es un jaque doble, del alfil y de la torre a la vez, así que el rey debe moverse.' },
          { ply: 21, en: 'Bd8 is checkmate: a short, famous lesson about not leaving your king in the center.', es: 'Ad8 es jaque mate: una lección breve y famosa sobre no dejar el rey en el centro.' }
        ],
        practice: { c: 'g' }
      }
    ]
  }
];

// "Guess the master's move": famous games, guessed from move `from` (a ply where the winner is to move).
self.GUESS_GAMES = [
  { id: 'opera', n: { en: 'Morphy vs. Duke of Brunswick & Count Isouard, Paris 1858', es: 'Morphy contra el duque de Brunswick y el conde Isouard, París 1858' }, from: 6,
    moves: 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#',
    a: { en: 'Morphy won with checkmate on move 17.', es: 'Morphy ganó con jaque mate en la jugada 17.' } },
  { id: 'reti', n: { en: 'Réti vs. Tartakower, Vienna 1910', es: 'Réti contra Tartakower, Viena 1910' }, from: 8,
    moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Kc7 Bd8#',
    a: { en: 'A queen sacrifice and a double check: mate on move 11.', es: 'Un sacrificio de dama y un jaque doble: mate en la jugada 11.' } },
  { id: 'immortal', n: { en: 'Anderssen vs. Kieseritzky, London 1851 (the Immortal Game)', es: 'Anderssen contra Kieseritzky, Londres 1851 (la Partida Inmortal)' }, from: 10,
    moves: 'e4 e5 f4 exf4 Bc4 Qh4+ Kf1 b5 Bxb5 Nf6 Nf3 Qh6 d3 Nh5 Nh4 Qg5 Nf5 c6 g4 Nf6 Rg1 cxb5 h4 Qg6 h5 Qg5 Qf3 Ng8 Bxf4 Qf6 Nc3 Bc5 Nd5 Qxb2 Bd6 Bxg1 e5 Qxa1+ Ke2 Na6 Nxg7+ Kd8 Qf6+ Nxf6 Be7#',
    a: { en: 'Anderssen gave up both rooks, a bishop and his queen, and still mated.', es: 'Anderssen entregó las dos torres, un alfil y la dama, y aun así dio mate.' } },
  { id: 'evergreen', n: { en: 'Anderssen vs. Dufresne, Berlin 1852 (the Evergreen Game)', es: 'Anderssen contra Dufresne, Berlín 1852 (la Partida Siempreviva)' }, from: 12,
    moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d3 Qb3 Qf6 e5 Qg6 Re1 Nge7 Ba3 b5 Qxb5 Rb8 Qa4 Bb6 Nbd2 Bb7 Ne4 Qf5 Bxd3 Qh5 Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#',
    a: { en: 'It ended with a famous double check and mate.', es: 'Terminó con un célebre jaque doble y mate.' } },
  { id: 'lasker', n: { en: 'Edward Lasker vs. Thomas, London 1912', es: 'Edward Lasker contra Thomas, Londres 1912' }, from: 10,
    moves: 'd4 e6 Nf3 f5 Nc3 Nf6 Bg5 Be7 Bxf6 Bxf6 e4 fxe4 Nxe4 b6 Ne5 O-O Bd3 Bb7 Qh5 Qe7 Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5 h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#',
    a: { en: 'The black king was chased across the whole board and mated on g1.', es: 'El rey negro fue perseguido por todo el tablero y recibió mate en g1.' } }
];

// ---------------------------------------------------------------- more books
// The shelf: the first course above, then more books. Same lesson format.
self.BOOKS = [
  { id: 'course', icon: '📘', t: { en: 'First course', es: 'Primer curso' }, d: { en: 'From the moves of the pieces to great games, in nine chapters.', es: 'De los movimientos de las piezas a las grandes partidas, en nueve capítulos.' }, chapters: self.LESSONS },
  {
    id: 'traps', icon: '🪤', t: { en: 'Opening Traps', es: 'Trampas de apertura' },
    d: { en: 'Twelve famous traps: how they work, how to punish them and how not to fall into them.', es: 'Doce trampas famosas: cómo funcionan, cómo castigarlas y cómo no caer en ellas.' },
    chapters: [
      {
        ch: { en: 'Traps after 1.e4 e5', es: 'Trampas tras 1.e4 e5' },
        lessons: [
          {
            id: 'trFool', t: { en: 'Fool\'s Mate', es: 'El mate del loco' },
            steps: [
              { moves: 'f3 e5', en: 'The fastest mate possible. White\'s first move, f3, weakens the diagonal from h4 to e1.', es: 'El mate más rápido posible. La primera jugada blanca, f3, debilita la diagonal de h4 a e1.' },
              { moves: 'f3 e5 g4', arrows: [['d8', 'h4']], en: 'After g4 the diagonal is wide open...', es: 'Tras g4 la diagonal queda totalmente abierta...' },
              { moves: 'f3 e5 g4 Qh4#', en: '...and Qh4 is checkmate. Lesson: don\'t move the f- and g-pawns early, they shelter your king.', es: '...y Dh4 es jaque mate. Lección: no muevas pronto los peones f y g, protegen a tu rey.' }
            ],
            task: { moves: 'f3 e5 g4', s: 'd8h4', g: 'm1', en: 'Qh4 mates: the king is boxed in by its own pieces and nothing can block.', es: 'Dh4 da mate: el rey está encerrado por sus piezas y nada puede tapar.' }
          },
          {
            id: 'trShilling', t: { en: 'The Blackburne Shilling Gambit', es: 'El gambito Blackburne Shilling' },
            steps: [
              { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4', en: 'Black plays the odd ...Nd4, leaving the e5-pawn undefended.', es: 'Las negras juegan la extraña ...Cd4, dejando sin defensa el peón de e5.' },
              { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5', arrows: [['g5', 'g2'], ['g5', 'e5']], en: 'White grabs the pawn, but ...Qg5 attacks the knight on e5 and the pawn on g2.', es: 'Las blancas comen el peón, pero ...Dg5 ataca al caballo de e5 y al peón de g2.' },
              { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2 Nf3#', en: 'If White greedily plays Nxf7, Black takes on g2 and e4 and mates with a knight on f3. The safe answer to ...Nd4 is simply Nxd4 or castling.', es: 'Si las blancas siguen comiendo con Cxf7, las negras capturan en g2 y e4 y dan mate con el caballo en f3. Lo seguro ante ...Cd4 es Cxd4 o enrocar.' }
            ],
            task: { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2', s: 'd4f3', g: 'm1', en: 'Nf3 is a smothered-style mate: the king on e1 is surrounded by its own pieces.', es: 'Cf3 es un mate de estilo ahogado: el rey de e1 está rodeado por sus propias piezas.' }
          },
          {
            id: 'trPetrov', t: { en: 'The Petrov queen trap', es: 'La trampa de la dama en la Petrov' },
            steps: [
              { moves: 'e4 e5 Nf3 Nf6 Nxe5', en: 'In the Petrov Defense, Black should first chase the knight with ...d6 before taking on e4.', es: 'En la Defensa Petrov, las negras deben echar primero al caballo con ...d6 antes de comer en e4.' },
              { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2', arrows: [['e2', 'e8']], en: 'After the copycat ...Nxe4, Qe2 pins the knight against the king on the open e-file.', es: 'Tras la imitación ...Cxe4, De2 clava el caballo contra el rey en la columna e abierta.' },
              { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6 Nc6+', arrows: [['c6', 'd8'], ['e2', 'e8']], en: 'If the knight retreats, Nc6+ is a discovered check from the queen, and the knight attacks the black queen: it is lost.', es: 'Si el caballo se retira, Cc6+ es un jaque a la descubierta de la dama, y el caballo ataca a la dama negra: está perdida.' }
            ]
          },
          {
            id: 'trStafford', t: { en: 'The Stafford Gambit', es: 'El gambito Stafford' },
            steps: [
              { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6', en: 'Black gives up a pawn for fast development and open lines.', es: 'Las negras entregan un peón a cambio de desarrollo rápido y líneas abiertas.' },
              { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5', en: 'Bg5 pins the knight to the queen, and it looks strong...', es: 'Ag5 clava el caballo contra la dama, y parece fuerte...' },
              { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5 Nxe4 Bxd8 Bxf2+ Ke2 Bg4#', en: '...but ...Nxe4! gives up the queen: after Bxd8, ...Bxf2+ and ...Bg4 are checkmate. Before you take a queen, check what the opponent threatens.', es: '...pero ...Cxe4! entrega la dama: tras Axd8, ...Axf2+ y ...Ag4 son jaque mate. Antes de capturar una dama, mira qué amenaza el rival.' }
            ],
            task: { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5 Nxe4 Bxd8 Bxf2+ Ke2', s: 'c8g4', g: 'm1', en: 'Bg4 is mate: the king on e2 has no squares, and the knight on e4 covers the escape.', es: 'Ag4 es mate: el rey de e2 no tiene casillas, y el caballo de e4 cubre la huida.' }
          },
          {
            id: 'trNoah', t: { en: 'Noah\'s Ark Trap', es: 'La trampa del Arca de Noé' },
            steps: [
              { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3', en: 'In the Ruy López, Black has pushed the bishop back with ...a6 and ...b5. Watch the bishop on b3.', es: 'En la Ruy López, las negras han hecho retroceder al alfil con ...a6 y ...b5. Fíjate en el alfil de b3.' },
              { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4 c5', arrows: [['c5', 'c4']], en: 'After the trades, ...c5 hits the queen and prepares ...c4.', es: 'Tras los cambios, ...c5 ataca a la dama y prepara ...c4.' },
              { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4 c5 Qd5 Be6 Qc6+ Bd7 Qd5 c4', marks: ['b3'], en: 'The pawns a6, b5 and c4 build an "ark" around the bishop on b3: it is trapped and lost. White should have played c3 instead of grabbing the pawn.', es: 'Los peones de a6, b5 y c4 forman un "arca" alrededor del alfil de b3: queda atrapado y se pierde. Las blancas debieron jugar c3 en lugar de comerse el peón.' }
            ]
          }
        ]
      },
      {
        ch: { en: 'Traps against 1.d4', es: 'Trampas contra 1.d4' },
        lessons: [
          {
            id: 'trElephant', t: { en: 'The Elephant Trap', es: 'La trampa del elefante' },
            steps: [
              { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5', en: 'In the Queen\'s Gambit Declined, the knight on f6 seems pinned and the pawn on d5 seems loose.', es: 'En el Gambito de Dama Rehusado, el caballo de f6 parece clavado y el peón de d5 parece débil.' },
              { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5', en: 'If White grabs it with Nxd5, Black takes back and offers the queen!', es: 'Si las blancas lo comen con Cxd5, las negras recapturan y ¡ofrecen la dama!' },
              { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8', en: 'After Bxd8, the check ...Bb4+ wins the queen back, and Black ends up a piece ahead. The pin was not real: the knight on d7 protected nothing that mattered.', es: 'Tras Axd8, el jaque ...Ab4+ recupera la dama y las negras quedan con una pieza de más. La clavada no era real.' }
            ]
          },
          {
            id: 'trLasker', t: { en: 'The Lasker Trap', es: 'La trampa de Lasker' },
            steps: [
              { moves: 'd4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3', en: 'In the Albin Countergambit, Black\'s pawn has advanced to e3 and attacks f2.', es: 'En el Contragambito Albin, el peón negro ha llegado a e3 y ataca f2.' },
              { moves: 'd4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2', en: 'White took the bishop. Now the pawn takes on f2 with check...', es: 'Las blancas se comieron el alfil. Ahora el peón captura en f2 con jaque...' },
              { moves: 'd4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2 fxg1=N+', en: '...and promotes to a KNIGHT with check! A queen would just be captured. If Rxg1, then ...Bg4+ wins the White queen. A famous underpromotion.', es: '...y ¡corona en CABALLO dando jaque! Una dama sería capturada. Si Txg1, ...Ag4+ gana la dama blanca. Una famosa subpromoción.' }
            ]
          },
          {
            id: 'trEnglund', t: { en: 'The Englund Gambit trap', es: 'La trampa del gambito Englund' },
            steps: [
              { moves: 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2', en: 'Black has grabbed the b2-pawn with the queen and now attacks the rook on a1.', es: 'Las negras se comieron el peón de b2 con la dama y ahora atacan la torre de a1.' },
              { moves: 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4', arrows: [['b4', 'c3']], en: 'Bc3 looks natural, but ...Bb4! pins the bishop to the queen on d1.', es: 'Ac3 parece natural, pero ¡...Ab4! clava el alfil contra la dama de d1.' },
              { moves: 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Qxc3 Qc1#', en: 'After Qd2 Bxc3 Qxc3, ...Qc1 is mate: the queen on c3 left the c1 square unguarded.', es: 'Tras Dd2 Axc3 Dxc3, ...Dc1 es mate: la dama de c3 dejó sin vigilar la casilla c1.' }
            ],
            task: { moves: 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Qxc3', s: 'b2c1', g: 'm1', en: 'Qc1 is mate: the king on e1 is trapped behind its own pieces.', es: 'Dc1 es mate: el rey de e1 está atrapado tras sus propias piezas.' }
          },
          {
            id: 'trKieninger', t: { en: 'The Kieninger Trap', es: 'La trampa Kieninger' },
            steps: [
              { moves: 'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3', en: 'In the Budapest Gambit, Black wins the pawn back while White attacks the bishop with a3.', es: 'En el gambito Budapest, las negras recuperan el peón mientras las blancas atacan al alfil con a3.' },
              { moves: 'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4', en: 'White takes the bishop...', es: 'Las blancas se comen el alfil...' },
              { moves: 'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4 Nd3#', en: '...and ...Nd3 is a smothered mate: the king is surrounded by its own pieces, and the pawn on e2 is pinned by the queen.', es: '...y ...Cd3 es mate de la coz: el rey está rodeado por sus piezas y el peón de e2 está clavado por la dama.' }
            ],
            task: { moves: 'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4', s: 'e5d3', g: 'm1', en: 'Nd3 is mate: e2 is pinned by the queen on e7, so nothing can take the knight.', es: 'Cd3 es mate: e2 está clavado por la dama de e7, así que nada puede comer al caballo.' }
          }
        ]
      },
      {
        ch: { en: 'Other openings', es: 'Otras aperturas' },
        lessons: [
          {
            id: 'trCaro', t: { en: 'The Caro-Kann knight mate', es: 'El mate del caballo en la Caro-Kann' },
            steps: [
              { moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2', arrows: [['e2', 'e8']], en: 'Qe2 sets a trap on the e-file, where the black king still stands.', es: 'De2 tiende una trampa en la columna e, donde sigue el rey negro.' },
              { moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6 Nd6#', en: 'If Black develops with ...Ngf6, Nd6 is mate: a discovered check from the queen, and the e7-pawn cannot take because it is pinned.', es: 'Si las negras desarrollan con ...Cgf6, Cd6 es mate: jaque a la descubierta de la dama, y el peón de e7 no puede comer porque está clavado.' }
            ],
            task: { moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6', s: 'e4d6', g: 'm1', en: 'Nd6 mates: the e-file opens onto the king and nothing can block it.', es: 'Cd6 da mate: la columna e se abre sobre el rey y nada puede taparla.' }
          },
          {
            id: 'trSiberian', t: { en: 'The Siberian Trap', es: 'La trampa siberiana' },
            steps: [
              { moves: 'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4', arrows: [['c7', 'h2'], ['g4', 'h2']], en: 'In the Smith-Morra Gambit, Black\'s queen and knight both aim at h2.', es: 'En el gambito Smith-Morra, la dama y el caballo negros apuntan a h2.' },
              { moves: 'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3 Nd4', arrows: [['d4', 'e2'], ['d4', 'f3']], en: 'White chases the knight with h3, and ...Nd4! attacks the queen and the knight on f3, the only defender of h2.', es: 'Las blancas echan al caballo con h3, y ¡...Cd4! ataca a la dama y al caballo de f3, el único defensor de h2.' },
              { moves: 'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3 Nd4 Nxd4 Qh2#', en: 'If Nxd4, the defender is gone and ...Qh2 is checkmate.', es: 'Si Cxd4, el defensor desaparece y ...Dh2 es jaque mate.' }
            ],
            task: { moves: 'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3 Nd4 Nxd4', s: 'c7h2', g: 'm1', en: 'Qh2 is mate, protected by the knight on g4.', es: 'Dh2 es mate, protegida por el caballo de g4.' }
          },
          {
            id: 'trDamiano', t: { en: 'Damiano\'s Defense', es: 'La defensa Damiano' },
            steps: [
              { moves: 'e4 e5 Nf3 f6', en: 'Defending e5 with ...f6 is a mistake: it weakens the king and takes the best square from the knight.', es: 'Defender e5 con ...f6 es un error: debilita al rey y quita la mejor casilla al caballo.' },
              { moves: 'e4 e5 Nf3 f6 Nxe5 fxe5 Qh5+', arrows: [['h5', 'e8'], ['h5', 'e5']], en: 'White gives the knight anyway: after ...fxe5, Qh5+ attacks the king and the e5-pawn. If ...g6, Qxe5+ forks king and rook; if ...Ke7, the king is exposed in the center.', es: 'Las blancas entregan el caballo igualmente: tras ...fxe5, Dh5+ ataca al rey y al peón de e5. Si ...g6, Dxe5+ hace horquilla a rey y torre; si ...Re7, el rey queda expuesto en el centro.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'masters', icon: '🏛️', t: { en: 'Masterpieces', es: 'Obras maestras' },
    d: { en: 'Four of the most famous games ever played, explained move by move.', es: 'Cuatro de las partidas más famosas de la historia, explicadas jugada a jugada.' },
    chapters: [
      {
        ch: { en: 'The romantic era', es: 'La época romántica' },
        lessons: [
          {
            id: 'gmImmortal', t: { en: 'The Immortal Game (London, 1851)', es: 'La Partida Inmortal (Londres, 1851)' },
            game: 'e4 e5 f4 exf4 Bc4 Qh4+ Kf1 b5 Bxb5 Nf6 Nf3 Qh6 d3 Nh5 Nh4 Qg5 Nf5 c6 g4 Nf6 Rg1 cxb5 h4 Qg6 h5 Qg5 Qf3 Ng8 Bxf4 Qf6 Nc3 Bc5 Nd5 Qxb2 Bd6 Bxg1 e5 Qxa1+ Ke2 Na6 Nxg7+ Kd8 Qf6+ Nxf6 Be7#',
            steps: [
              { ply: 3, en: 'Adolf Anderssen (White) against Lionel Kieseritzky. The King\'s Gambit: White offers a pawn to open the f-file and take the center.', es: 'Adolf Anderssen (blancas) contra Lionel Kieseritzky. El Gambito de Rey: las blancas ofrecen un peón para abrir la columna f y dominar el centro.' },
              { ply: 7, en: 'After the queen check, the White king must move and loses the right to castle. In those days, players accepted risks like this for fast development.', es: 'Tras el jaque de dama, el rey blanco debe moverse y pierde el enroque. En aquella época se aceptaban riesgos así a cambio de un desarrollo rápido.' },
              { ply: 21, en: 'Rg1 leaves the bishop on b5 to be captured. Anderssen prefers to attack the black queen with his pawns.', es: 'Tg1 deja que capturen el alfil de b5. Anderssen prefiere atacar a la dama negra con sus peones.' },
              { ply: 33, en: 'The knight jumps to d5, joining the attack near the black king.', es: 'El caballo salta a d5 y se une al ataque cerca del rey negro.' },
              { ply: 35, en: 'Bd6!! White lets Black take a rook, and then the other one: the black pieces are being pulled away from their king.', es: '¡¡Ad6!! Las blancas dejan que les capturen una torre, y luego la otra: las piezas negras se alejan de su rey.' },
              { ply: 37, en: 'e5! cuts the black queen off from the defence of g7.', es: '¡e5! corta a la dama negra de la defensa de g7.' },
              { ply: 41, en: 'Down two rooks and a bishop, White begins the final attack with Nxg7+.', es: 'Con dos torres y un alfil de menos, las blancas inician el ataque final con Cxg7+.' },
              { ply: 43, en: 'Qf6+!! The last sacrifice: the queen. The knight must take it...', es: '¡¡Df6+!! El último sacrificio: la dama. El caballo tiene que comerla...' },
              { ply: 45, en: '...and Be7 is checkmate with only minor pieces. Active pieces near the enemy king can matter more than material.', es: '...y Ae7 es jaque mate solo con piezas menores. Las piezas activas cerca del rey rival pueden valer más que el material.' }
            ],
            guess: 'immortal'
          },
          {
            id: 'gmEvergreen', t: { en: 'The Evergreen Game (Berlin, 1852)', es: 'La Partida Siempreviva (Berlín, 1852)' },
            game: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d3 Qb3 Qf6 e5 Qg6 Re1 Nge7 Ba3 b5 Qxb5 Rb8 Qa4 Bb6 Nbd2 Bb7 Ne4 Qf5 Bxd3 Qh5 Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#',
            steps: [
              { ply: 7, en: 'Anderssen again, against Jean Dufresne. The Evans Gambit: White gives a pawn to gain time and build a big center.', es: 'Otra vez Anderssen, contra Jean Dufresne. El Gambito Evans: las blancas dan un peón para ganar tiempo y formar un gran centro.' },
              { ply: 13, en: 'White castles and is far ahead in development while the black king is still in the center.', es: 'Las blancas enrocan y van muy por delante en desarrollo, con el rey negro aún en el centro.' },
              { ply: 33, en: 'Nf6+! A sacrifice to open lines toward the black king.', es: '¡Cf6+! Un sacrificio para abrir líneas hacia el rey negro.' },
              { ply: 37, en: 'Rad1!! A quiet move in the middle of an attack. It allows ...Qxf3 with a mate threat on g2, but White is faster.', es: '¡¡Tad1!! Una jugada tranquila en pleno ataque. Permite ...Dxf3 con amenaza de mate en g2, pero las blancas van más rápido.' },
              { ply: 39, en: 'Rxe7+ removes the knight that guarded d7...', es: 'Txe7+ elimina el caballo que defendía d7...' },
              { ply: 41, en: '...and Qxd7+!! gives up the queen to drag the king forward.', es: '...y ¡¡Dxd7+!! entrega la dama para arrastrar al rey hacia delante.' },
              { ply: 43, en: 'Bf5+ is a double check, from the bishop and the rook on d1: the king can only move.', es: 'Af5+ es un jaque doble, del alfil y de la torre de d1: el rey solo puede moverse.' },
              { ply: 47, en: 'Bxe7 is checkmate. A model of how to use a lead in development.', es: 'Axe7 es jaque mate. Un modelo de cómo aprovechar la ventaja de desarrollo.' }
            ],
            guess: 'evergreen'
          }
        ]
      },
      {
        ch: { en: 'The 20th century', es: 'El siglo XX' },
        lessons: [
          {
            id: 'gmLasker', t: { en: 'The king hunt: Ed. Lasker vs. Thomas (London, 1912)', es: 'La caza del rey: Ed. Lasker contra Thomas (Londres, 1912)' },
            game: 'd4 e6 Nf3 f5 Nc3 Nf6 Bg5 Be7 Bxf6 Bxf6 e4 fxe4 Nxe4 b6 Ne5 O-O Bd3 Bb7 Qh5 Qe7 Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5 h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#',
            steps: [
              { ply: 19, en: 'Edward Lasker\'s pieces all point at the black king: the knight on e5, the bishop on d3 and now the queen on h5.', es: 'Todas las piezas de Edward Lasker apuntan al rey negro: el caballo de e5, el alfil de d3 y ahora la dama en h5.' },
              { ply: 21, en: 'Qxh7+!! The queen is sacrificed to pull the king out of its shelter.', es: '¡¡Dxh7+!! La dama se sacrifica para sacar al rey de su refugio.' },
              { ply: 23, en: 'Nxf6+ is a double check: from the knight and from the bishop on d3.', es: 'Cxf6+ es un jaque doble: del caballo y del alfil de d3.' },
              { ply: 27, en: 'Check after check, the king is driven up the board...', es: 'Jaque tras jaque, el rey es empujado tablero arriba...' },
              { ply: 33, en: '...all the way to White\'s own back rank.', es: '...hasta la propia primera fila de las blancas.' },
              { ply: 35, en: 'Kd2 uncovers a check from the rook on a1: checkmate (castling queenside would also have mated). A king hunt across the whole board.', es: 'Rd2 destapa el jaque de la torre de a1: jaque mate (el enroque largo también habría dado mate). Una caza del rey por todo el tablero.' }
            ],
            guess: 'lasker'
          },
          {
            id: 'gmCentury', t: { en: 'The Game of the Century (New York, 1956)', es: 'La Partida del Siglo (Nueva York, 1956)' },
            game: 'Nf3 Nf6 c4 g6 Nc3 Bg7 d4 O-O Bf4 d5 Qb3 dxc4 Qxc4 c6 e4 Nbd7 Rd1 Nb6 Qc5 Bg4 Bg5 Na4 Qa3 Nxc3 bxc3 Nxe4 Bxe7 Qb6 Bc4 Nxc3 Bc5 Rfe8+ Kf1 Be6 Bxb6 Bxc4+ Kg1 Ne2+ Kf1 Nxd4+ Kg1 Ne2+ Kf1 Nc3+ Kg1 axb6',
            steps: [
              { ply: 16, en: 'Donald Byrne (White) against 13-year-old Bobby Fischer. White has a big center, while Black prepares to strike back.', es: 'Donald Byrne (blancas) contra Bobby Fischer, de 13 años. Las blancas tienen un gran centro y las negras preparan el contraataque.' },
              { ply: 22, en: '...Na4!! The knight offers itself: if White takes it, the pawn on e4 falls with a strong attack.', es: '¡¡...Ca4!! El caballo se ofrece: si las blancas lo comen, el peón de e4 cae con un fuerte ataque.' },
              { ply: 34, en: '...Be6!! The famous move: Fischer leaves his queen to be captured.', es: '¡¡...Ae6!! La famosa jugada: Fischer deja que le capturen la dama.' },
              { ply: 36, en: 'After Bxb6, ...Bxc4+ starts a "windmill": discovered checks again and again.', es: 'Tras Axb6, ...Axc4+ inicia un "molino": jaques a la descubierta una y otra vez.' },
              { ply: 46, en: 'The windmill won a bishop and a pawn, Black took back the bishop on b6, and the rook on d1 falls next. For his queen Fischer gets a rook, two bishops and a pawn, and he went on to win with a checkmate on move 41.', es: 'El molino ganó un alfil y un peón, las negras recuperaron el alfil de b6, y la torre de d1 cae después. A cambio de la dama Fischer obtiene torre, dos alfiles y un peón, y acabó ganando con jaque mate en la jugada 41.' }
            ]
          }
        ]
      }
    ]
  }
];

// Classic books: the complete original text, read in the book reader (chapters load on demand).
self.BOOKS.push({
 "id": "fundamentals",
 "kind": "reader",
 "icon": "📖",
 "src": "books/fundamentals/text.json",
 "t": {
  "en": "Chess Fundamentals, by J. R. Capablanca (1921)",
  "es": "Chess Fundamentals, de J. R. Capablanca (1921)"
 },
 "d": {
  "en": "The complete original book, in English, with its 150 diagrams. Each chapter ends with hands-on practice.",
  "es": "El libro original completo, en inglés, con sus 150 diagramas. Cada capítulo termina con práctica en el tablero."
 },
 "chapters": [
  {
   "t": "Chapter I",
   "sub": "First Principles: Endings, Middle-Game and Openings",
   "hands": [
    "mateQueen",
    "mateRook",
    "kp",
    "center"
   ]
  },
  {
   "t": "Chapter II",
   "sub": "Further Principles in End-Game Play",
   "hands": [
    "kp",
    "square",
    "breakthrough",
    "convert"
   ]
  },
  {
   "t": "Chapter III",
   "sub": "Planning a Win in Middle-Game Play",
   "hands": [
    "plans",
    "fork"
   ]
  },
  {
   "t": "Chapter IV",
   "sub": "General Theory",
   "hands": [
    "plans",
    "values",
    "pin"
   ]
  },
  {
   "t": "Chapter V",
   "sub": "End-Game Strategy",
   "hands": [
    "convert",
    "lucena",
    "philidor"
   ]
  },
  {
   "t": "Chapter VI",
   "sub": "Further Openings and Middle-Games",
   "hands": [
    "center",
    "traps",
    "plans"
   ]
  },
  {
   "t": "Game 1. Queen's Gambit Declined",
   "sub": "",
   "game": {
    "white": "F. J. Marshall",
    "black": "J. R. Capablanca",
    "moves": "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 Ne4 Bxe7 Qxe7 Bd3 Nxc3 bxc3 Nd7 Nf3 O-O cxd5 exd5 Qb3 Nf6 a4 c5 Qa3 b6 a5 Bb7 O-O Qc7 Rfb1 Nd7 Bf5 Rfc8 Bxd7 Qxd7 a6 Bc6 dxc5 bxc5 Qxc5 Rab8 Rxb8 Rxb8 Ne5 Qf5 f4 Rb6 Qxb6",
    "side": "b"
   }
  },
  {
   "t": "Game 2. Queen's Gambit Declined",
   "sub": "",
   "game": {
    "white": "A. K. Rubinstein",
    "black": "J. R. Capablanca",
    "moves": "d4 d5 Nf3 c5 c4 e6 cxd5 exd5 Nc3 Nc6 g3 Be6 Bg2 Be7 O-O Rc8 dxc5 Bxc5 Ng5 Nf6 Nxe6 fxe6 Bh3 Qe7 Bg5 O-O Bxf6 Qxf6 Nxd5 Qh6 Kg2 Rcd8 Qc1 exd5 Qxc5 Qd2 Qb5 Nd4 Qd3 Qxd3 exd3 Rfe8 Bg4 Rd6 Rfe1 Rxe1 Rxe1 Rb6 Re5 Rxb2 Rxd5 Nc6 Be6+ Kf8 Rf5+ Ke8 Bf7+ Kd7 Bc4 a6 Rf7+ Kd6 Rxg7 b5 Bg8 a5 Rxh7 a4 h4 b4 Rh6+ Kc5 Rh5+ Kb6 Bd5 b3 axb3 a3 Bxc6 Rxb3 Bd5 a2 Rh6+",
    "side": "b"
   }
  },
  {
   "t": "Game 3. Irregular Defence",
   "sub": "",
   "game": {
    "white": "D. Janowski",
    "black": "J. R. Capablanca",
    "moves": "d4 Nf6 Nf3 d6 Bg5 Nbd7 e3 e5 Nc3 c6 Bd3 Be7 Qe2 Qa5 O-O Nf8 Rfd1 Bg4 h3 Bh5 dxe5 dxe5 Ne4 Nxe4 Bxe7 Kxe7 Bxe4 Bg6 Qc4 Ne6 b4 Qc7 Bxg6 hxg6 Qe4 Kf6 Rd3 Rad8 Rad1 g5 c4 Rxd3 Rxd3 Rd8 Rxd8 Nxd8 h4 gxh4 Qxh4+ Ke6 Qg4+ Kf6 Qg5+ Ke6 Qxg7 Qd6 c5 Qd5 e4 Qd1+ Kh2 f6 Qg4+ Ke7 Nxe5 Qxg4 Nxg4 Ne6 e5 fxe5 Nxe5 Nd4",
    "side": "b"
   }
  },
  {
   "t": "Game 4. French Defence",
   "sub": "",
   "game": {
    "white": "J. R. Capablanca",
    "black": "E. A. Snosko-Borovski",
    "moves": "d4 e6 e4 d5 Nc3 Nf6 Bg5 Bb4 exd5 Qxd5 Bxf6 Bxc3+ bxc3 gxf6 Nf3 b6 Qd2 Bb7 Be2 Nd7 c4 Qf5 O-O-O O-O-O Qe3 Rhg8 g3 Qa5 Rd3 Kb8 Rhd1 Qf5 Nh4 Qg5 f4 Qg7 Bf3 Rge8 Bxb7 Kxb7 c5 c6 Nf3 Qf8 Nd2 bxc5 Nc4 Nb6 Na5+ Ka8 dxc5 Nd5 Qd4 Rc8 c4 e5 Qg1 e4 cxd5 exd3 d6 Re2 d7 Rc2+ Kb1 Rb8+ Nb3 Qe7 Rxd3 Re2 Qd4 Rd8 Qa4 Qe4 Qa6 Kb8 Kc1 Rxd7 Nd4 Re1+",
    "side": "w"
   }
  },
  {
   "t": "Game 5. Ruy Lopez",
   "sub": "",
   "game": {
    "white": "Dr. E. Lasker",
    "black": "J. R. Capablanca",
    "moves": "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 d4 exd4 Qxd4 Qxd4 Nxd4 Bd6 Nc3 Ne7 O-O O-O f4 Re8 Nb3 f6 f5 b6 Bf4 Bb7 Bxd6 cxd6 Nd4 Rad8 Ne6 Rd7 Rad1 Nc8 Rf2 b5 Rfd2 Rde7 b4 Kf7 a3 Ba8 Kf2 Ra7 g4 h6 Rd3 a5 h4 axb4 axb4 Rae7 Kf3 Rg8 Kf4 g6 Rg3 g5+ Kf3 Nb6 hxg5 hxg5 Rh3 Rd7 Kg3 Ke8 Rdh1 Bb7 e5 dxe5 Ne4 Nd5 N6c5 Bc8 Nxd7 Bxd7 Rh7 Rf8 Ra1 Kd8 Ra8+ Bc8 Nc5",
    "side": "b"
   }
  },
  {
   "t": "Game 6. French Defence",
   "sub": "",
   "game": {
    "white": "O. Chajes",
    "black": "J. R. Capablanca",
    "moves": "e4 e6 d4 d5 Nc3 Nf6 Bg5 Bb4 e5 h6 Bd2 Bxc3 bxc3 Ne4 Qg4 Kf8 Bc1 c5 Bd3 Qa5 Ne2 cxd4 O-O dxc3 Bxe4 dxe4 Qxe4 Nc6 Rd1 g6 f4 Kg7 Be3 Ne7 Bf2 Nd5 Rd3 Bd7 Nd4 Rac8 Rg3 Kh7 h4 Rhg8 h5 Qb4 Rh3 f5 exf6 Nxf6 hxg6+ Rxg6 Rxh6+ Kxh6 Nf5+ exf5 Qxb4 Rcg8 g3 Bc6 Rd1 Kh5 Rd6 Be4 Qxc3 Nd5 Rxg6 Kxg6 Qe5 Kf7 c4 Re8 Qb2 Nf6 Bd4 Rh8 Qb5 Rh1+ Kf2 a6 Qb6 Rh2+ Ke1 Nd7 Qd6 Bc6 g4 fxg4 f5 Rh1+ Kd2 Ke8 f6 Rh7 Qe6+ Kf8 Be3 Rf7 Bh6+ Kg8 Bg7 g3 Ke2 g2 Kf2 Nf8 Qg4 Nd7 Kg1 a5 a4 Bxa4 Qh3 Rxf6 Bxf6 Nxf6 Qxg2+ Kf8 Qxb7",
    "side": "b"
   }
  },
  {
   "t": "Game 7. Ruy Lopez",
   "sub": ""
  },
  {
   "t": "Game 8. Centre Game",
   "sub": "",
   "game": {
    "white": "J. Mieses",
    "black": "J. R. Capablanca",
    "moves": "e4 e5 d4 exd4 Qxd4 Nc6 Qe3 Nf6 Nc3 Bb4 Bd2 O-O O-O-O Re8 Qg3 Nxe4 Nxe4 Rxe4 Bf4 Qf6 Nh3 d6 Bd3 Nd4 Be3 Bg4 Ng5 Rxe3 Qxg4 Ne2+ Bxe2 Rxe2 Ne4 Rxe4 Qxe4 Qg5+ f4 Qb5 c3 Bc5 Rhe1 Qc6 Rd5 Qd7 f5 c6 Rd2 d5 Qf3 Be7 Rde2 Bf6 Qh5 h6 g4 Kh7 Kb1 Rd8 Rd1 c5 Qh3 Qa4 Red2 Qe4+ Ka1 b5 Qg2 Qa4 Kb1 b4 cxb4 Qxb4 a3 Qa4 Rxd5 Rb8 R1d2 c4 Qg3 Rb3 Qd6 c3 Rc2 cxb2 Rd3 Qe4 Rd1 Rc3",
    "side": "b"
   }
  },
  {
   "t": "Game 9. Queen's Gambit Declined",
   "sub": "",
   "game": {
    "white": "J. R. Capablanca",
    "black": "R. Teichmann",
    "moves": "d4 d5 Nf3 Nf6 c4 e6 Bg5 Be7 Nc3 Nbd7 e3 O-O Rc1 b6 cxd5 exd5 Bb5 Bb7 O-O a6 Ba4 Rc8 Qe2 c5 dxc5 Nxc5 Rfd1 Nxa4 Nxa4 b5 Rxc8 Qxc8 Nc3 Qc4 Nd4 Qxe2 Ncxe2 Rc8 Nf5 Kf8 Nxe7 Kxe7 Nd4 g6 f3 h6 Bxh6 Nd7 h4 Nc5 Bf4 Ne6 Nxe6 Kxe6 Rd2 Rh8 Rc2 Rc8 Rxc8 Bxc8 Kf2 d4 exd4 Kd5 Ke3 Be6 Kd3 Kc6 a3 Bc4+ Ke3 Be6 Bh6 Kd5 Bg7",
    "side": "w"
   }
  },
  {
   "t": "Game 10. Petroff Defence",
   "sub": "",
   "game": {
    "white": "J. R. Capablanca",
    "black": "F. J. Marshall",
    "moves": "e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Qe2 Qe7 d3 Nf6 Bg5 Be6 Nc3 h6 Bxf6 Qxf6 d4 Be7 Qb5+ Nd7 Bd3 g5 h3 O-O Qxb7 Rab8 Qe4 Qg7 b3 c5 O-O cxd4 Nd5 Bd8 Bc4 Nc5 Qxd4 Qxd4 Nxd4 Bxd5 Bxd5 Bf6 Rad1 Bxd4 Rxd4 Kg7 Bc4 Rb6 Re1 Kf6 f4 Ne6 fxg5+ hxg5 Rf1+ Ke7 Rg4 Rg8 Rf5 Rc6 h4 Rgc8 hxg5 Rc5 Bxe6 fxe6 Rxc5 Rxc5 g6 Kf8 Rc4 Ra5 a4 Kg7 Rc6 Rd5 Rc7+ Kxg6 Rxa7 Rd1+ Kh2 d5 a5 Rc1 Rc7 Ra1 b4 Ra4 c3 d4 Rc6 dxc3 Rxc3 Rxb4 Ra3 Rb7 a6 Ra7 Ra5 Kf6 g4 Ke7 Kg3 Kd6 Kf4 Kc7 Ke5 Kd7 g5 Ke7 g6 Kf8 Kxe6 Ke8 g7 Rxg7 a7 Rg6+ Kf5",
    "side": "w"
   }
  },
  {
   "t": "Game 11. Ruy Lopez",
   "sub": "",
   "game": {
    "white": "J. R. Capablanca",
    "black": "D. Janowski",
    "moves": "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nc3 Bc5 d3 Bg4 Be3 Bxe3 fxe3 Qe7 O-O O-O-O Qe1 Nh6 Rb1 f6 b4 Nf7 a4 Bxf3 Rxf3 b6 b5 cxb5 axb5 a5 Nd5 Qc5 c4 Ng5 Rf2 Ne6 Qc3 Rd7 Rd1 Kb7 d4 Qd6 Rc2 exd4 exd4 Nf4 c5 Nxd5 exd5 Qxd5 c6+ Kb8 cxd7 Qxd7 d5 Re8 d6 cxd6 Qc6",
    "side": "w"
   }
  },
  {
   "t": "Game 12. French Defence",
   "sub": ""
  },
  {
   "t": "Game 13. Ruy Lopez",
   "sub": "",
   "game": {
    "white": "J. S. Morrison",
    "black": "J. R. Capablanca",
    "moves": "e4 e5 Nf3 Nc6 Bb5 d6 Nc3 Bd7 d4 exd4 Nxd4 g6 Nf3 Bg7 Bg5 Nf6 Qd2 h6 Bh4 O-O O-O-O Re8 Rhe1 g5 Bg3 Nh5 Nd5 a6 Bd3 Be6 c3 f5 h4 f4 hxg5 hxg5 Rh1 Bf7 Kb1 Ne5 Nxe5 Rxe5 Bh2 Nf6 g3 Nxe4 Bxe4 Rxe4 gxf4 c6 Ne3 Qa5 c4 Qxd2 Rxd2 gxf4 Ng4 Bg6 Ka1 Rae8 a3 Re1+ Rxe1 Rxe1+ Ka2 Bf7 Kb3 d5 Bxf4 dxc4+ Kb4 c3 bxc3 Re4+ c4 Rxc4+ Ka5 Rxf4 Rd8+ Kh7 Rd7 Be6",
    "side": "b"
   }
  },
  {
   "t": "Game 14. Queen's Gambit Declined",
   "sub": "",
   "game": {
    "white": "F. J. Marshall",
    "black": "J. R. Capablanca",
    "moves": "d4 d5 Nf3 Nf6 c4 e6 Nc3 Nbd7 Bg5 Be7 e3 O-O Rc1 c6 Qc2 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Qxc3 b6 e4 Bb7 Rfe1 Rfd8 d5 Nc5 dxe6 Nxe6 Bxe6 Qxe6 Nd4 Qe5 Nxc6 Qxc3 Rxc3 Rd2 Rb1 Re8 e5 g5 h4 gxh4 Re1 Re6 Rec1 Kg7 b4 b5 a3 Rg6 Kf1 Ra2 Kg1 h3 g3 a6 e6 Rxe6 g4 Rh6 f3 Rd6 Ne7 Rdd2 Nf5+ Kf6 Nh4 Kg5 Nf5 Rg2+ Kf1 h2 f4+ Kxf4",
    "side": "b"
   }
  }
 ]
});

// ---------------------------------------------------------------- five more books (our own text)
self.BOOKS.splice(3, 0,
  {
    id: 'tactics', icon: '🧩', t: { en: 'Tactics Patterns', es: 'Patrones tácticos' },
    d: { en: 'The patterns strong players see at a glance: famous mates and the tricks that win material.', es: 'Los patrones que los jugadores fuertes ven de un vistazo: mates famosos y los trucos que ganan material.' },
    chapters: [
      {
        ch: { en: 'Famous mating patterns', es: 'Patrones de mate famosos' },
        lessons: [
          {
            id: 'tpGreek', t: { en: 'The Greek gift (Bxh7+)', es: 'El regalo griego (Axh7+)' },
            steps: [
              { board: false, en: 'The Greek gift is one of the oldest attacking ideas in chess. A bishop is sacrificed on h7 (or h2 for Black) with check, the king has to take it, and then a knight and the queen come in for a quick attack.\n\nIt works when three things are true. First, a bishop can reach h7 and a knight can jump to g5. Second, the queen can reach the h-file quickly (often Qh5). Third, the defender has no piece that can cover h7 or capture on g5: the knight that usually stands on f6 has gone, and no bishop guards g5.\n\nBefore you sacrifice, check the king\'s escape squares after Ng5+: if the king can run to g6 or h6 safely, the attack may fail. Strong players count these details first and only then give the piece.', es: 'El regalo griego es una de las ideas de ataque más antiguas del ajedrez. Se sacrifica un alfil en h7 (o en h2 si juegan las negras) dando jaque, el rey tiene que capturarlo, y entonces entran un caballo y la dama para un ataque rápido.\n\nFunciona cuando se cumplen tres cosas. Primero, un alfil puede llegar a h7 y un caballo puede saltar a g5. Segundo, la dama puede llegar pronto a la columna h (a menudo Dh5). Tercero, el defensor no tiene ninguna pieza que cubra h7 o capture en g5: el caballo que suele estar en f6 se ha ido y ningún alfil vigila g5.\n\nAntes de sacrificar, comprueba las casillas de escape del rey tras Cg5+: si el rey puede huir a g6 o h6 con seguridad, el ataque puede fallar. Los jugadores fuertes cuentan estos detalles primero y solo después entregan la pieza.' },
              { fen: 'r1bq1rk1/p1pnb2p/1p2p3/3pB1p1/3P4/2PBP3/PP3PPP/RN1Q1RK1 w - - 2 13', arrows: [['d3', 'h7'], ['d1', 'h5']], en: 'A position from a real game: Black\'s king has few defenders and the queen can reach h5 at once. Bxh7+! Kxh7 and Qh5+ breaks in. Here the queen does the work that the knight on g5 does in the classic version.', es: 'Una posición de una partida real: el rey negro tiene pocos defensores y la dama puede llegar a h5 enseguida. ¡Axh7+! Rxh7 y Dh5+ entra en el ataque. Aquí la dama hace el trabajo que en la versión clásica hace el caballo en g5.' }
            ],
            task: { f: 'r1bq1rk1/p1pnb2p/1p2p3/3pB1p1/3P4/2PBP3/PP3PPP/RN1Q1RK1 w - - 2 13', s: 'd3h7 g8h7 d1h5 h7g8 h5g6', g: 'm3', en: 'Bxh7+! Kxh7, Qh5+ Kg8 and the queen mates: a Greek gift that ends in checkmate.', es: '¡Axh7+! Rxh7, Dh5+ Rg8 y la dama da mate: un regalo griego que termina en jaque mate.' },
            practice: { c: 't', t: 'sacrifice' }
          },
          {
            id: 'tpArabian', t: { en: 'The Arabian mate', es: 'El mate árabe' },
            steps: [
              { board: false, en: 'The Arabian mate is one of the oldest known patterns, already described in Arabic chess manuscripts more than a thousand years ago. A rook and a knight work together against a king in the corner.\n\nThe knight stands two squares away diagonally from the corner (for example on f6 against a king on h8). It protects the rook and covers the square g8. The rook then gives check on the h-file or on the 7th rank, right next to the king. The king cannot take the rook because the knight defends it, and it has no squares left.\n\nRemember the shape: king in the corner, knight a "knight\'s jump" from the rook\'s square. When you see it, look for the rook check.', es: 'El mate árabe es uno de los patrones más antiguos que se conocen, ya descrito en manuscritos de ajedrez árabes hace más de mil años. Una torre y un caballo colaboran contra un rey en la esquina.\n\nEl caballo se sitúa a dos casillas en diagonal de la esquina (por ejemplo en f6 contra un rey en h8). Protege a la torre y cubre la casilla g8. Entonces la torre da jaque en la columna h o en la séptima fila, justo al lado del rey. El rey no puede comer la torre porque la defiende el caballo, y no le quedan casillas.\n\nRecuerda la forma: rey en la esquina y caballo a un salto de la casilla de la torre. Cuando la veas, busca el jaque de torre.' },
              { fen: '7k/7R/5N2/8/8/8/8/6K1 b - - 0 1', marks: ['h8'], en: 'The finished pattern: Rh7 is protected by the knight on f6, which also covers g8.', es: 'El patrón terminado: la torre de h7 está protegida por el caballo de f6, que además cubre g8.' }
            ],
            task: { f: '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1', s: 'a7h7', g: 'm1', en: 'Rh7 is the Arabian mate.', es: 'Th7 es el mate árabe.' },
            practice: { c: 't', t: 'checkmate' }
          },
          {
            id: 'tpAnastasia', t: { en: 'Anastasia\'s mate', es: 'El mate de Anastasia' },
            steps: [
              { board: false, en: 'Anastasia\'s mate takes its name from a novel of the early 1800s in which it appears. A knight and a rook (or queen) trap a king on the edge of the board.\n\nThe king stands on h7 with its own pawn on g7. A knight on e7 covers g8 and g6. Now any rook or queen check along the h-file is mate: the king cannot go to g6 or g8, its own pawn blocks g7, and the h-file is controlled.\n\nThe pattern often appears after a sacrifice on h7 or h6 that opens the h-file. When an enemy king is on the edge with your knight close by, think of Anastasia.', es: 'El mate de Anastasia toma su nombre de una novela de principios del siglo XIX en la que aparece. Un caballo y una torre (o la dama) atrapan a un rey en el borde del tablero.\n\nEl rey está en h7 con su propio peón en g7. Un caballo en e7 cubre g8 y g6. Entonces cualquier jaque de torre o dama por la columna h es mate: el rey no puede ir a g6 ni a g8, su propio peón tapa g7 y la columna h está controlada.\n\nEl patrón suele aparecer tras un sacrificio en h7 o h6 que abre la columna h. Cuando el rey rival está en el borde y tu caballo está cerca, piensa en Anastasia.' },
              { fen: '5r2/4N1pk/8/8/7R/8/8/6K1 b - - 0 1', marks: ['h7', 'g8', 'g6'], en: 'Rh4 is mate: the knight on e7 covers g8 and g6.', es: 'Th4 es mate: el caballo de e7 cubre g8 y g6.' }
            ],
            task: { f: '5r2/4N1pk/8/8/R7/8/8/6K1 w - - 0 1', s: 'a4h4', g: 'm1', en: 'Rh4 is Anastasia\'s mate.', es: 'Th4 es el mate de Anastasia.' },
            practice: { c: 't', t: 'checkmate' }
          }
        ]
      },
      {
        ch: { en: 'Tricks that win material', es: 'Trucos que ganan material' },
        lessons: [
          { id: 'tpWindmill', t: { en: 'The windmill', es: 'El molino' }, steps: [{ board: false, en: 'A windmill is a series of discovered checks. One piece gives check, the king steps aside, and the other piece moves again with a new discovered check, capturing something each time. Like the sails of a windmill, it turns again and again.\n\nThe key ingredients are a piece that gives check along a line (a rook, bishop or queen) and a second piece in front of it that can move away and capture. The defender is always in check and never has time to save anything.\n\nA famous example is in Byrne vs. Fischer, 1956, explained in the Masterpieces book: Fischer\'s bishop and knight took piece after piece with discovered checks.', es: 'Un molino es una serie de jaques a la descubierta. Una pieza da jaque, el rey se aparta, y la otra pieza vuelve a moverse con un nuevo jaque a la descubierta, capturando algo cada vez. Como las aspas de un molino, gira una y otra vez.\n\nLos ingredientes son una pieza que da jaque en línea (torre, alfil o dama) y otra delante de ella que puede apartarse y capturar. El defensor está siempre en jaque y nunca tiene tiempo de salvar nada.\n\nUn ejemplo famoso está en Byrne contra Fischer, 1956, explicada en el libro Obras maestras: el alfil y el caballo de Fischer se llevaron pieza tras pieza con jaques a la descubierta.' }, { term: 'discoveredCheck' }], practice: { c: 't', t: 'discoveredCheck' } },
          { id: 'tpClearance', t: { en: 'Clearance and interference', es: 'Despeje e interferencia' }, steps: [{ board: false, en: 'Sometimes your own piece is in the way. A clearance sacrifice gives up that piece, often with check or a threat, just to empty a square or a line for another piece. The question to ask is: "If this piece were not here, what could I do?"\n\nInterference is the opposite idea: you put a piece on a line between two enemy pieces so that one can no longer defend the other. For example, a piece dropped between a rook and the square it protects cuts the connection, and the defended piece falls.\n\nBoth ideas are about lines. Look at the lines your pieces would like to use, and the lines your opponent\'s defenders depend on.', es: 'A veces tu propia pieza estorba. Un sacrificio de despeje entrega esa pieza, a menudo con jaque o amenaza, solo para vaciar una casilla o una línea para otra pieza. La pregunta es: "Si esta pieza no estuviera aquí, ¿qué podría hacer?"\n\nLa interferencia es la idea contraria: colocas una pieza en una línea entre dos piezas rivales para que una ya no pueda defender a la otra. Por ejemplo, una pieza que se interpone entre una torre y la casilla que protege corta la conexión, y la pieza defendida cae.\n\nAmbas ideas tratan de líneas. Mira las líneas que tus piezas querrían usar y las líneas de las que dependen los defensores rivales.' }, { term: 'deflection' }], practice: { c: 't', t: 'deflection' } },
          { id: 'tpDesperado', t: { en: 'Desperado and the in-between move', es: 'Desesperado y la jugada intermedia' }, steps: [{ board: false, en: 'A "desperado" is a piece that is lost anyway, so before it dies it captures as much as it can. If your knight is attacked and cannot be saved, maybe it can take a pawn, or even give check, before it is captured.\n\nThe in-between move (zwischenzug) is related: instead of the expected recapture, you first play a stronger move, usually a check or a big threat, and recapture afterwards. Many tactics fail because the attacker forgot about the defender\'s in-between move.\n\nThe habit to build: in every exchange, before you recapture automatically, ask whether there is a check or a threat to play first.', es: 'Un "desesperado" es una pieza que se va a perder de todos modos, así que antes de caer captura todo lo que puede. Si tu caballo está atacado y no se puede salvar, quizá pueda comer un peón, o incluso dar jaque, antes de que lo capturen.\n\nLa jugada intermedia (zwischenzug) está relacionada: en lugar de la recaptura esperada, juegas primero una jugada más fuerte, normalmente un jaque o una gran amenaza, y recapturas después. Muchas combinaciones fallan porque el atacante olvidó la jugada intermedia del defensor.\n\nEl hábito que debes crear: en cada cambio, antes de recapturar automáticamente, pregúntate si hay un jaque o una amenaza que jugar primero.' }, { term: 'zwischenzug' }], practice: { c: 't', t: 'hangingPiece' } },
          { id: 'tpXray', t: { en: 'X-rays and double attacks', es: 'Rayos X y dobles ataques' }, steps: [{ term: 'xray' }, { term: 'doubleAttack' }], practice: { c: 't', t: 'doubleAttack' } }
        ]
      }
    ]
  },
  {
    id: 'endgames', icon: '🏁', t: { en: 'Endgame Essentials', es: 'Finales esenciales' },
    d: { en: 'The endings every player must know, so that won games are really won and lost ones are saved.', es: 'Los finales que todo jugador debe conocer, para ganar las partidas ganadas y salvar las perdidas.' },
    chapters: [
      {
        ch: { en: 'King and pawns', es: 'Rey y peones' },
        lessons: [
          {
            id: 'egKey', t: { en: 'Key squares', es: 'Casillas clave' },
            steps: [
              { board: false, en: 'Key squares are the squares where, if your king reaches them, your pawn will promote no matter what the defender does. They are more useful than counting moves.\n\nFor a pawn that has not yet crossed the middle of the board (on its 2nd, 3rd or 4th rank), the key squares are the three squares two ranks in front of it. For a pawn on e4, they are d6, e6 and f6. Once the pawn reaches the 5th rank, the key squares are also the squares directly beside the square in front, so for a pawn on e5 they include d6, e6 and f6 and also d7, e7 and f7.\n\nSo the plan in king and pawn endings is not to push the pawn first, but to bring your king to a key square. The defender fights for those same squares, often using the opposition.', es: 'Las casillas clave son las casillas a las que, si llega tu rey, tu peón coronará haga lo que haga el defensor. Son más útiles que contar jugadas.\n\nPara un peón que aún no ha cruzado el centro del tablero (en su 2ª, 3ª o 4ª fila), las casillas clave son las tres casillas dos filas por delante. Para un peón en e4 son d6, e6 y f6. Cuando el peón llega a la 5ª fila, también son clave las casillas de al lado de la casilla de delante, así que para un peón en e5 son d6, e6, f6 y también d7, e7 y f7.\n\nPor eso el plan en los finales de rey y peón no es empujar primero el peón, sino llevar el rey a una casilla clave. El defensor lucha por esas mismas casillas, muchas veces usando la oposición.' },
              { fen: '8/8/4k3/8/4P3/8/4K3/8 w - - 0 1', marks: ['d6', 'e6', 'f6'], en: 'Pawn on e4: the key squares are d6, e6 and f6. Here the black king stands on one of them, so White must first fight for the opposition.', es: 'Peón en e4: las casillas clave son d6, e6 y f6. Aquí el rey negro está en una de ellas, así que las blancas deben luchar primero por la oposición.' },
              { term: 'opposition' }
            ],
            practice: { c: 'e', t: 'opposition' }
          },
          {
            id: 'egRookPawn', t: { en: 'The rook pawn and the wrong bishop', es: 'El peón de torre y el alfil equivocado' },
            steps: [
              { board: false, en: 'Pawns on the a- and h-files are special. If the defending king reaches the corner in front of the pawn, the stronger side usually cannot win: the attacking king can only take away the king\'s last squares by giving stalemate.\n\nEven an extra bishop does not always help. If the bishop does not control the corner square where the pawn promotes (for example a dark-squared bishop with an h-pawn, whose promotion square h8 is light), the defender sits in the corner and the game is a draw. This is called the "wrong bishop".\n\nPractical advice: when you are losing an ending, look for a way to reach that corner. When you are winning, keep the enemy king away from it.', es: 'Los peones de las columnas a y h son especiales. Si el rey defensor llega a la esquina delante del peón, el bando fuerte normalmente no puede ganar: el rey atacante solo puede quitarle las últimas casillas dando ahogado.\n\nNi siquiera un alfil de más ayuda siempre. Si el alfil no controla la casilla de coronación (por ejemplo, un alfil de casillas oscuras con un peón h, que corona en h8, casilla clara), el defensor se queda en la esquina y la partida es tablas. Es el "alfil equivocado".\n\nConsejo práctico: cuando estés perdiendo un final, busca la forma de llegar a esa esquina. Cuando estés ganando, mantén lejos de ella al rey rival.' },
              { fen: '7k/8/5K2/7P/8/8/8/8 b - - 0 1', marks: ['h8'], en: 'The black king in the corner: White cannot win, whatever he tries.', es: 'El rey negro en la esquina: las blancas no pueden ganar, hagan lo que hagan.' }
            ],
            practice: { c: 'e', t: 'kingPawnEnding' }
          },
          { id: 'egBreak', t: { en: 'Passed pawns and breakthroughs', es: 'Peones pasados y rupturas' }, steps: [{ term: 'passedPawn' }, { term: 'ruleOfSquare' }, { term: 'breakthrough' }], practice: { c: 'e', t: 'breakthrough' } }
        ]
      },
      {
        ch: { en: 'Pieces against pawns, and mates', es: 'Piezas contra peones, y mates' },
        lessons: [
          {
            id: 'egRookBehind', t: { en: 'Rooks belong behind passed pawns', es: 'Las torres, detrás de los peones pasados' },
            steps: [
              { board: false, en: 'One of the most useful rules in rook endings: put your rook behind passed pawns. This is true for your own passed pawn and for your opponent\'s.\n\nBehind your own pawn, the rook supports it all the way and gets more active with every step the pawn takes. In front of the pawn, the rook gets more and more passive. Behind the enemy pawn, your rook stops it from the back and the enemy rook in front of it is tied down.\n\nIn rook endings, activity is usually worth more than a pawn. A passive rook that only defends often loses even with equal material.', es: 'Una de las reglas más útiles de los finales de torres: coloca la torre detrás de los peones pasados. Vale para tu propio peón pasado y para el del rival.\n\nDetrás de tu peón, la torre lo apoya todo el camino y es más activa con cada paso que da el peón. Delante del peón, la torre se vuelve cada vez más pasiva. Detrás del peón rival, tu torre lo frena desde atrás y la torre rival que está delante queda atada.\n\nEn los finales de torres, la actividad suele valer más que un peón. Una torre pasiva que solo defiende muchas veces pierde incluso con material igualado.' },
              { fen: '8/8/4k3/P7/8/8/8/R5K1 w - - 0 1', arrows: [['a1', 'a5']], en: 'The rook on a1 supports the a-pawn from behind: as the pawn advances, the rook gets even more room.', es: 'La torre de a1 apoya al peón a desde atrás: a medida que avanza el peón, la torre gana aún más espacio.' },
              { term: 'lucena' },
              { term: 'philidorPosition' }
            ],
            practice: { c: 'e', l: 3 }
          },
          {
            id: 'egQueenPawn', t: { en: 'Queen against a pawn', es: 'Dama contra peón' },
            steps: [
              { board: false, en: 'A queen against a pawn on its 7th rank, supported by its king, is usually a win, but the method is worth knowing. The queen gives checks and pins to force the enemy king in front of its own pawn. Each time that happens, your own king gets one free move to come closer.\n\nThere are two famous exceptions. With a rook pawn (a- or h-file), the defender can hide in the corner and stalemate saves him. With a bishop pawn (c- or f-file), the defender can go to the corner too, because taking the pawn would give stalemate. In those cases the attacking king must already be close to win.\n\nWith a centre or knight pawn, the queen always wins when it can start checking.', es: 'Una dama contra un peón en su 7ª fila apoyado por su rey suele ganar, pero conviene conocer el método. La dama da jaques y clavadas para obligar al rey rival a ponerse delante de su propio peón. Cada vez que eso ocurre, tu rey gana un tiempo libre para acercarse.\n\nHay dos excepciones famosas. Con un peón de torre (columna a o h), el defensor se esconde en la esquina y el ahogado lo salva. Con un peón de alfil (columna c o f), el defensor también puede ir a la esquina, porque capturar el peón daría ahogado. En esos casos el rey atacante ya tiene que estar cerca para ganar.\n\nCon un peón central o de caballo, la dama siempre gana si puede empezar a dar jaques.' },
              { fen: '8/8/8/8/1Q6/8/3p4/3k2K1 w - - 0 1', marks: ['d1'], en: 'The checks have forced the black king in front of its own pawn, onto d1. The pawn cannot move now, so White\'s king gets a free move to come closer. Repeat until the king arrives.', es: 'Los jaques han obligado al rey negro a ponerse delante de su propio peón, en d1. Ahora el peón no puede avanzar, así que el rey blanco gana un tiempo para acercarse. Se repite hasta que llega el rey.' }
            ],
            practice: { c: 'e', t: 'basicMate' }
          },
          {
            id: 'egBN', t: { en: 'Mate with bishop and knight', es: 'Mate con alfil y caballo' },
            steps: [
              { board: false, en: 'King, bishop and knight can force mate against a lone king, but it can take more than 30 moves and is the hardest of the basic mates. The key fact: mate is only possible in a corner of the same colour as the bishop\'s squares.\n\nThe method has two parts. First, drive the enemy king to the edge with all three pieces together, the king doing most of the work. Second, if the king runs to the wrong corner, push it along the edge toward the right one; the knight makes a "W" shaped path to take the escape squares while the bishop and king keep the box closed.\n\nYou may never need it in a game, but practising it teaches how the pieces cooperate.', es: 'Rey, alfil y caballo pueden forzar el mate a un rey solo, pero puede llevar más de 30 jugadas y es el más difícil de los mates básicos. Lo esencial: el mate solo es posible en una esquina del mismo color que las casillas del alfil.\n\nEl método tiene dos partes. Primero, llevar el rey rival al borde con las tres piezas juntas, haciendo el rey la mayor parte del trabajo. Segundo, si el rey huye a la esquina equivocada, empujarlo por el borde hacia la buena; el caballo hace un recorrido en forma de "W" para quitarle las casillas mientras el alfil y el rey mantienen la caja cerrada.\n\nQuizá nunca lo necesites en una partida, pero practicarlo enseña cómo colaboran las piezas.' },
              { fen: '7k/4N3/6K1/4B3/8/8/8/8 b - - 0 1', marks: ['h8'], en: 'The final picture: mate in the dark corner with a dark-squared bishop. The knight covers g8, the king covers g7 and h7.', es: 'La imagen final: mate en la esquina oscura con el alfil de casillas oscuras. El caballo cubre g8 y el rey cubre g7 y h7.' }
            ],
            practice: { c: 'e', t: 'basicMate' }
          }
        ]
      }
    ]
  },
  {
    id: 'thinking', icon: '🧠', t: { en: 'How to Think in a Game', es: 'Cómo pensar en una partida' },
    d: { en: 'Good habits that prevent blunders and help you find strong moves.', es: 'Buenos hábitos que evitan errores graves y ayudan a encontrar jugadas fuertes.' },
    chapters: [
      {
        ch: { en: 'Before every move', es: 'Antes de cada jugada' },
        lessons: [
          { id: 'thThreat', t: { en: 'What does my opponent want?', es: '¿Qué quiere mi rival?' }, steps: [{ board: false, en: 'Most games between club players are not decided by deep plans but by one missed threat. The single most valuable habit is to ask, every time your opponent moves: "What does this move want to do?"\n\nLook at what the moved piece now attacks, which lines it opened, and whether it set up a check or a capture next move. Then look at what it stopped defending. Only after that should you think about your own ideas.\n\nThis takes a few seconds and saves countless games. The coach in this app shows the same idea when it explains which threat a best move stops.', es: 'La mayoría de las partidas entre aficionados no se deciden por planes profundos, sino por una amenaza que no se vio. El hábito más valioso es preguntarse, cada vez que el rival mueve: "¿Qué quiere hacer esta jugada?"\n\nMira qué ataca ahora la pieza que se movió, qué líneas abrió y si prepara un jaque o una captura para la jugada siguiente. Luego mira qué dejó de defender. Solo después piensa en tus propias ideas.\n\nEsto lleva unos segundos y salva muchísimas partidas. El entrenador de esta aplicación muestra la misma idea cuando explica qué amenaza frena la mejor jugada.' }, { term: 'threat' }], practice: { c: 't', t: 'threat' } },
          { id: 'thCCT', t: { en: 'Checks, captures, threats', es: 'Jaques, capturas, amenazas' }, steps: [{ board: false, en: 'When you look for your own move, start with the most forcing moves: checks first, then captures, then moves that make a threat. Forcing moves limit your opponent\'s answers, so you can calculate them, and they are where tactics hide.\n\nGo through them even when they look silly. Many brilliant combinations begin with a check that "loses" a piece. If none of them works, you have lost nothing and you can calmly choose a quiet, improving move.\n\nDo the same for your opponent: what are their checks, captures and threats after your move? That is your blunder check.', es: 'Cuando busques tu jugada, empieza por las más forzadas: primero los jaques, luego las capturas y después las jugadas que crean una amenaza. Las jugadas forzadas limitan las respuestas del rival, así que puedes calcularlas, y es donde se esconde la táctica.\n\nRevísalas aunque parezcan absurdas. Muchas combinaciones brillantes empiezan con un jaque que "pierde" una pieza. Si ninguna funciona, no has perdido nada y puedes elegir con calma una jugada tranquila que mejore tu posición.\n\nHaz lo mismo para tu rival: ¿qué jaques, capturas y amenazas tiene tras tu jugada? Esa es tu comprobación contra errores graves.' }, { term: 'check' }], practice: { c: 't', l: 1 } },
          { id: 'thBlunder', t: { en: 'The blunder check', es: 'La comprobación contra errores' }, steps: [{ board: false, en: 'Before you touch a piece, picture the board after your move and ask three questions. Is any of my pieces left undefended or attacked more times than it is defended? Can my opponent give a check that hurts? Did my move open a line toward my king or remove a defender?\n\nIt helps to look at the squares your moved piece used to protect. A knight that leaves f3, for example, no longer guards h2, d4 or e5.\n\nIn fast games, do at least the quick version: "Is everything still protected, and does my opponent have a strong check?"', es: 'Antes de tocar una pieza, imagina el tablero tras tu jugada y hazte tres preguntas. ¿Queda alguna pieza sin defensa, o atacada más veces de las que está defendida? ¿Puede mi rival dar un jaque que haga daño? ¿Mi jugada abre una línea hacia mi rey o quita un defensor?\n\nAyuda mirar las casillas que protegía la pieza que mueves. Un caballo que sale de f3, por ejemplo, deja de vigilar h2, d4 y e5.\n\nEn partidas rápidas, haz al menos la versión corta: "¿Sigue todo protegido y tiene mi rival algún jaque fuerte?"' }, { term: 'hangingPiece' }], practice: { c: 't', t: 'hangingPiece' } }
        ]
      },
      {
        ch: { en: 'When nothing is happening', es: 'Cuando no pasa nada' },
        lessons: [
          { id: 'thWorst', t: { en: 'Improve your worst piece', es: 'Mejora tu peor pieza' }, steps: [{ board: false, en: 'Often there is no tactic and no clear plan. Then a simple rule works very well: find your worst piece and improve it. A bishop blocked by its own pawns, a knight on the edge, or a rook with no open file are typical candidates.\n\nAsk where that piece would be ideal, and find a route to get there. Often it takes two or three moves, and your opponent may not be able to stop it.\n\nThe same question about your opponent helps too: which of their pieces is best? Can you trade it off, or take away its good squares?', es: 'A menudo no hay táctica ni un plan claro. Entonces funciona muy bien una regla sencilla: busca tu peor pieza y mejórala. Un alfil bloqueado por sus propios peones, un caballo en el borde o una torre sin columna abierta son candidatos típicos.\n\nPregúntate dónde estaría ideal esa pieza y busca un camino para llevarla allí. A menudo hacen falta dos o tres jugadas, y puede que tu rival no pueda impedirlo.\n\nLa misma pregunta sobre el rival también ayuda: ¿cuál es su mejor pieza? ¿Puedes cambiarla o quitarle sus buenas casillas?' }, { term: 'openFile' }], practice: { c: 't', t: 'threat' } },
          { id: 'thPlan', t: { en: 'Making a plan', es: 'Hacer un plan' }, steps: [{ board: false, en: 'A plan comes from the position, not from wishes. Look at the differences between the two sides: who has more space, a better pawn structure, safer king, more active pieces, an open file or a weak square to use?\n\nThen pick a target and a way to reach it. For example: "Black\'s pawn on d5 is isolated, so I will put my pieces on it and trade the pieces that defend it." Or: "The kings castled on opposite sides, so I will push the pawns in front of the enemy king."\n\nA simple plan followed with every move is much stronger than random good-looking moves. Capablanca\'s book, in the bookshelf, is full of examples of this way of thinking.', es: 'Un plan nace de la posición, no de los deseos. Mira las diferencias entre los dos bandos: ¿quién tiene más espacio, mejor estructura de peones, el rey más seguro, piezas más activas, una columna abierta o una casilla débil que aprovechar?\n\nLuego elige un objetivo y una forma de alcanzarlo. Por ejemplo: "El peón negro de d5 está aislado, así que pondré mis piezas sobre él y cambiaré las que lo defienden". O: "Los reyes enrocaron en lados opuestos, así que avanzaré los peones delante del rey rival".\n\nUn plan sencillo seguido en cada jugada es mucho más fuerte que jugadas sueltas que parecen buenas. El libro de Capablanca, en la estantería, está lleno de ejemplos de esta forma de pensar.' }], read: { book: 'fundamentals', idx: 2 }, practice: { c: 'g' } },
          { id: 'thAfter', t: { en: 'Learn from your games', es: 'Aprende de tus partidas' }, steps: [{ board: false, en: 'The fastest way to improve is to look at your own games, especially the losses. Right after a game, go through it and find the moment where things went wrong. Was it a missed threat, a tactic you did not see, or a plan that did not work?\n\nUse the analysis board in Challenge: set up the position and ask for the best move and the explanation. Then write down one lesson from the game, such as "I left my back rank weak".\n\nOver time you will see the same kind of mistake again and again. That tells you exactly what to study next: tactics, endgames or openings.', es: 'La forma más rápida de mejorar es revisar tus propias partidas, sobre todo las derrotas. Justo después de jugar, repásala y busca el momento en que las cosas se torcieron. ¿Fue una amenaza que no viste, una táctica que se te escapó o un plan que no funcionó?\n\nUsa el tablero de análisis de Desafíos: prepara la posición y pide la mejor jugada y la explicación. Luego apunta una lección de la partida, como "dejé débil mi última fila".\n\nCon el tiempo verás el mismo tipo de error una y otra vez. Eso te dice exactamente qué estudiar: táctica, finales o aperturas.' }], practice: { c: 't', l: 2 } }
        ]
      }
    ]
  },
  {
    id: 'structures', icon: '🏗️', t: { en: 'Pawn Structures', es: 'Estructuras de peones' },
    d: { en: 'Pawns decide the plans: learn the common structures and what to do in each.', es: 'Los peones deciden los planes: aprende las estructuras habituales y qué hacer en cada una.' },
    chapters: [
      {
        ch: { en: 'Pawn weaknesses', es: 'Debilidades de peones' },
        lessons: [
          { id: 'psIsolated', t: { en: 'The isolated pawn', es: 'El peón aislado' }, steps: [{ board: false, en: 'An isolated pawn has no friendly pawns on the files next to it, so no pawn can ever defend it. The most common one is the isolated queen\'s pawn on d4 (or d5).\n\nIt has a good side: it gives space, open files for the rooks and strong squares in front of it (e5 and c5 for White) for the knights. With many pieces on the board, the side with the isolated pawn often attacks.\n\nIt also has a bad side: the square in front of it is a perfect outpost for the opponent, and in the endgame the pawn is easy to attack. So the side playing against it wants to block it, trade pieces and win it later.', es: 'Un peón aislado no tiene peones propios en las columnas vecinas, así que ningún peón podrá defenderlo nunca. El más habitual es el peón de dama aislado en d4 (o d5).\n\nTiene un lado bueno: da espacio, columnas abiertas para las torres y casillas fuertes delante de él (e5 y c5 para las blancas) para los caballos. Con muchas piezas en el tablero, el bando con el peón aislado suele atacar.\n\nTambién tiene un lado malo: la casilla de delante es un puesto avanzado perfecto para el rival, y en el final el peón es fácil de atacar. Por eso el bando que juega contra él quiere bloquearlo, cambiar piezas y ganarlo más tarde.' }, { fen: 'r1bq1rk1/pp2bppp/2n1pn2/8/3P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 1', marks: ['d4', 'd5', 'e5'], en: 'White has an isolated d-pawn: active pieces and the e5 square on one side, a blockade on d5 for Black on the other.', es: 'Las blancas tienen un peón d aislado: piezas activas y la casilla e5 por un lado, un bloqueo en d5 para las negras por el otro.' }], practice: { c: 'o', l: 2 } },
          { id: 'psDoubled', t: { en: 'Doubled and backward pawns', es: 'Peones doblados y retrasados' }, steps: [{ board: false, en: 'Doubled pawns are two pawns of the same colour on one file, after a capture. They cannot protect each other and the front one blocks the back one. They are often a weakness, especially in the endgame, but they also open a file and can control important squares.\n\nA backward pawn is a pawn that has fallen behind its neighbours and cannot be supported by them. It is weak in two ways: the pawn itself can be attacked, and the square in front of it becomes a hole that the opponent can occupy with a piece.\n\nWhen you take with a pawn, think about the structure you leave behind. When your opponent has these weaknesses, aim your pieces at them.', es: 'Los peones doblados son dos peones del mismo color en una columna, tras una captura. No pueden protegerse entre sí y el de delante bloquea al de atrás. Suelen ser una debilidad, sobre todo en el final, pero también abren una columna y pueden controlar casillas importantes.\n\nUn peón retrasado es un peón que se ha quedado atrás respecto a sus vecinos y no puede ser apoyado por ellos. Es débil de dos maneras: el propio peón puede ser atacado, y la casilla de delante se convierte en un agujero que el rival puede ocupar con una pieza.\n\nCuando captures con un peón, piensa en la estructura que dejas. Cuando el rival tenga estas debilidades, apunta tus piezas hacia ellas.' }, { fen: '4k3/pp3ppp/2p5/8/8/2P5/P1P2PPP/4K3 w - - 0 1', marks: ['c2', 'c3'], en: 'White\'s doubled c-pawns: the pawn count is equal, but in an endgame Black\'s healthy queenside pawns can make a passed pawn and White\'s cannot.', es: 'Los peones c doblados de las blancas: hay los mismos peones, pero en un final los peones sanos de las negras en el flanco de dama pueden crear un peón pasado y los blancos no.' }], practice: { c: 'e', t: 'kingPawnEnding' } }
        ]
      },
      {
        ch: { en: 'Structures and plans', es: 'Estructuras y planes' },
        lessons: [
          { id: 'psChain', t: { en: 'Pawn chains: attack the base', es: 'Cadenas de peones: ataca la base' }, steps: [{ board: false, en: 'A pawn chain is a diagonal line of pawns, each protecting the next. The first pawn at the back, the "base", is the only one not defended by another pawn, so it is the natural target.\n\nIn the French Defence after 1.e4 e6 2.d4 d5 3.e5, White\'s chain d4-e5 points at the black kingside, and Black attacks its base with ...c5. White usually attacks on the side the chain points to, while the other side breaks with pawns against the base.\n\nA good rule: attack where your pawns point, and break the opponent\'s chain at its base.', es: 'Una cadena de peones es una línea diagonal de peones en la que cada uno protege al siguiente. El primero de atrás, la "base", es el único que no está defendido por otro peón, así que es el objetivo natural.\n\nEn la Defensa Francesa tras 1.e4 e6 2.d4 d5 3.e5, la cadena blanca d4-e5 apunta al flanco de rey negro, y las negras atacan su base con ...c5. Las blancas suelen atacar en el flanco hacia el que apunta la cadena, mientras el otro bando rompe con peones contra la base.\n\nUna buena regla: ataca hacia donde apuntan tus peones y rompe la cadena rival por su base.' }, { moves: 'e4 e6 d4 d5 e5 c5', arrows: [['c5', 'd4']], en: 'The French Advance: ...c5 attacks the base of White\'s chain on d4.', es: 'La Francesa del Avance: ...c5 ataca la base de la cadena blanca en d4.' }], read: { book: 'fundamentals', idx: 9 }, practice: { c: 'o', l: 1 } },
          { id: 'psMinority', t: { en: 'The minority attack', es: 'El ataque de minorías' }, steps: [{ board: false, en: 'In the Queen\'s Gambit Exchange structure (White pawns on a2, b2, d4; Black pawns on a7, b7, c6, d5), White has two pawns against three on the queenside. Strangely, the "minority" attacks: White pushes b4 and b5 to trade on c6.\n\nAfter the exchange, Black is left with a weak pawn on c6 or a backward pawn on c6 with a hole on c5, or an isolated pawn on d5. White\'s pieces then attack that weakness.\n\nThis plan shows a deep idea: pawns are not only for promoting; they are tools to create weaknesses in the opponent\'s camp.', es: 'En la estructura del Gambito de Dama Variante del Cambio (peones blancos en a2, b2 y d4; negros en a7, b7, c6 y d5), las blancas tienen dos peones contra tres en el flanco de dama. Curiosamente, la "minoría" ataca: las blancas avanzan b4 y b5 para cambiar en c6.\n\nTras el cambio, a las negras les queda un peón débil en c6, o retrasado en c6 con un agujero en c5, o un peón aislado en d5. Entonces las piezas blancas atacan esa debilidad.\n\nEste plan enseña una idea profunda: los peones no solo sirven para coronar; son herramientas para crear debilidades en el campo rival.' }, { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5', marks: ['b2', 'a2', 'a7', 'b7', 'c7'], en: 'The Carlsbad structure: White\'s plan is b4-b5 against Black\'s queenside pawns.', es: 'La estructura Carlsbad: el plan blanco es b4-b5 contra los peones del flanco de dama negro.' }], read: { book: 'fundamentals', idx: 14 }, practice: { c: 'o', l: 2 } },
          { id: 'psBishop', t: { en: 'Good and bad bishops', es: 'Alfiles buenos y malos' }, steps: [{ board: false, en: 'A bishop is "bad" when many of its own pawns stand on squares of its colour: it hits its own pawns and has little scope. A "good" bishop moves on the other colour, where the pawns do not get in the way.\n\nThis gives a practical rule: put your pawns on the opposite colour to your bishop, and fix your opponent\'s pawns on the colour of their bishop. In the French Defence, for example, Black\'s light-squared bishop on c8 is often bad, blocked by the pawns on e6 and d5.\n\nA bad bishop can still be useful as a defender, and you can make it better by bringing it outside the pawn chain or by trading it.', es: 'Un alfil es "malo" cuando muchos de sus propios peones están en casillas de su color: choca con sus peones y tiene poco alcance. Un alfil "bueno" se mueve en el otro color, donde los peones no estorban.\n\nDe ahí sale una regla práctica: coloca tus peones en el color contrario al de tu alfil, y fija los peones rivales en el color de su alfil. En la Defensa Francesa, por ejemplo, el alfil negro de casillas claras de c8 suele ser malo, bloqueado por los peones de e6 y d5.\n\nUn alfil malo aún puede ser útil como defensor, y puedes mejorarlo sacándolo fuera de la cadena de peones o cambiándolo.' }, { moves: 'e4 e6 d4 d5 e5', marks: ['c8', 'e6', 'd5'], en: 'Black\'s bishop on c8 is hemmed in by the pawns on e6 and d5.', es: 'El alfil negro de c8 está encerrado por los peones de e6 y d5.' }], practice: { c: 'o', l: 1 } }
        ]
      }
    ]
  },
  {
    id: 'repertoire', icon: '📖', t: { en: 'Your Opening Repertoire', es: 'Tu repertorio de aperturas' },
    d: { en: 'One simple, solid set of openings with White and Black: the ideas and plans, not long lines to memorize.', es: 'Un repertorio sencillo y sólido con blancas y negras: ideas y planes, no largas líneas que memorizar.' },
    chapters: [
      {
        ch: { en: 'With White: 1.e4', es: 'Con blancas: 1.e4' },
        lessons: [
          { id: 'rpItalian', t: { en: 'The Italian Game', es: 'La Apertura Italiana' }, steps: [{ board: false, en: 'Against 1...e5, play the Italian Game: 2.Nf3 Nc6 3.Bc4. Your bishop aims at f7, the weakest point in Black\'s camp, and your pieces develop naturally.\n\nA calm and modern set-up is c3, d3, castling, then Re1 and a knight route Nbd2-f1-g3. The pawn on c3 prepares d4 when the moment is right, and gives the bishop a safe retreat on c2 or b3.\n\nWatch for ...Ng4 or ...Bxf2+ tricks if you get careless, and remember Scholar\'s mate ideas only work against careless opponents: develop first.', es: 'Contra 1...e5, juega la Apertura Italiana: 2.Cf3 Cc6 3.Ac4. Tu alfil apunta a f7, el punto más débil del campo negro, y tus piezas se desarrollan de forma natural.\n\nUn esquema tranquilo y moderno es c3, d3, enroque, luego Te1 y la ruta del caballo Cbd2-f1-g3. El peón de c3 prepara d4 en el momento oportuno y da al alfil una retirada segura en c2 o b3.\n\nVigila los trucos ...Cg4 o ...Axf2+ si te descuidas, y recuerda que las ideas del mate del pastor solo funcionan contra rivales descuidados: desarrolla primero.' }, { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O', en: 'A typical Italian position: both sides develop calmly, and White prepares d4 or a kingside attack.', es: 'Una posición italiana típica: ambos bandos se desarrollan con calma y las blancas preparan d4 o un ataque en el flanco de rey.' }, { term: 'giuocoPiano' }], guess: 'evergreen', practice: { c: 'o', l: 0 } },
          { id: 'rpAlapin', t: { en: 'Against the Sicilian: 2.c3', es: 'Contra la Siciliana: 2.c3' }, steps: [{ board: false, en: 'Against 1...c5, the Alapin Variation 2.c3 is simple and sound. White prepares d4 to build a full pawn centre, and avoids the huge amount of theory of the open Sicilian.\n\nThe two main answers are 2...d5 (3.exd5 Qxd5 4.d4, and the black queen will be chased a little) and 2...Nf6 (3.e5 Nd5 4.d4, with space for White).\n\nThe plans are classical: develop the knights and bishops, castle, and use the centre. It is a great choice while you learn the typical middlegames.', es: 'Contra 1...c5, la Variante Alapin 2.c3 es sencilla y sólida. Las blancas preparan d4 para formar un centro completo de peones y evitan la enorme teoría de la Siciliana abierta.\n\nLas dos respuestas principales son 2...d5 (3.exd5 Dxd5 4.d4, y la dama negra será perseguida un poco) y 2...Cf6 (3.e5 Cd5 4.d4, con espacio para las blancas).\n\nLos planes son clásicos: desarrollar caballos y alfiles, enrocar y aprovechar el centro. Es una gran elección mientras aprendes los medios juegos típicos.' }, { moves: 'e4 c5 c3 d5 exd5 Qxd5 d4', en: 'The Alapin with 2...d5: White gets d4 in, and the black queen in the centre can be harassed with Nf3, Be2 and Na3 or Nc3.', es: 'La Alapin con 2...d5: las blancas consiguen d4, y la dama negra en el centro puede ser hostigada con Cf3, Ae2 y Ca3 o Cc3.' }, { term: 'alapin' }], practice: { c: 'o', l: 1 } },
          { id: 'rpAdvance', t: { en: 'Against the French and Caro-Kann: the Advance', es: 'Contra la Francesa y la Caro-Kann: el Avance' }, steps: [{ board: false, en: 'Against both 1...e6 (French) and 1...c6 (Caro-Kann), Black wants to play ...d5. A simple answer is to push e4-e5: the Advance Variation. You gain space on the kingside and your pawn chain d4-e5 points at the black king.\n\nBlack will attack the base of the chain with ...c5 and pieces on d4. Keep d4 well protected with c3 and Nf3, develop, and use your extra space for a kingside attack.\n\nOne warning from the Caro-Kann: in other lines, an early Qe2 sets the famous Nd6# trap, explained in the Opening Traps book.', es: 'Tanto contra 1...e6 (Francesa) como contra 1...c6 (Caro-Kann), las negras quieren jugar ...d5. Una respuesta sencilla es avanzar e4-e5: la Variante del Avance. Ganas espacio en el flanco de rey y tu cadena d4-e5 apunta al rey negro.\n\nLas negras atacarán la base de la cadena con ...c5 y con piezas sobre d4. Protege bien d4 con c3 y Cf3, desarrolla, y usa tu espacio extra para atacar en el flanco de rey.\n\nUn aviso de la Caro-Kann: en otras líneas, una De2 temprana tiende la famosa trampa Cd6#, explicada en el libro Trampas de apertura.' }, { moves: 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3', en: 'French Advance: White keeps the centre with c3 and Nf3.', es: 'Francesa del Avance: las blancas mantienen el centro con c3 y Cf3.' }, { moves: 'e4 c6 d4 d5 e5 Bf5', en: 'Caro-Kann Advance: Black develops the bishop outside the chain first, then plays ...e6 and ...c5.', es: 'Caro-Kann del Avance: las negras sacan primero el alfil fuera de la cadena y luego juegan ...e6 y ...c5.' }], read: { book: 'fundamentals', idx: 9 }, practice: { c: 'o', l: 1 } }
        ]
      },
      {
        ch: { en: 'With Black', es: 'Con negras' },
        lessons: [
          { id: 'rpE5', t: { en: 'Against 1.e4: play 1...e5', es: 'Contra 1.e4: juega 1...e5' }, steps: [{ board: false, en: 'Answer 1.e4 with 1...e5: it fights for the centre at once and opens lines for your bishop and queen. After 2.Nf3 Nc6 you defend e5 with a developing move.\n\nAgainst 3.Bc4, play 3...Bc5 or 3...Nf6, with the same ideas as the Italian Game for White. Against 3.Bb5 (the Ruy López), 3...a6 asks the bishop a question; after 4.Ba4 Nf6 5.O-O Be7, Black develops solidly.\n\nKnow the traps for both sides: the Noah\'s Ark Trap and Légal\'s trap are in the Opening Traps book, and Capablanca\'s Ruy López games are in his book.', es: 'Responde a 1.e4 con 1...e5: lucha por el centro de inmediato y abre líneas para tu alfil y tu dama. Tras 2.Cf3 Cc6 defiendes e5 con una jugada de desarrollo.\n\nContra 3.Ac4, juega 3...Ac5 o 3...Cf6, con las mismas ideas que la Italiana con blancas. Contra 3.Ab5 (la Ruy López), 3...a6 le hace una pregunta al alfil; tras 4.Aa4 Cf6 5.O-O Ae7, las negras se desarrollan con solidez.\n\nConoce las trampas de ambos bandos: la trampa del Arca de Noé y la de Légal están en el libro Trampas de apertura, y las partidas de Capablanca con la Ruy López están en su libro.' }, { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7', en: 'The Ruy López with a solid set-up for Black: ...a6, ...Nf6, ...Be7 and castling next.', es: 'La Ruy López con un esquema sólido para las negras: ...a6, ...Cf6, ...Ae7 y después el enroque.' }, { term: 'ruyLopez' }], read: { book: 'fundamentals', idx: 10 }, practice: { c: 'o', l: 0 } },
          { id: 'rpQGD', t: { en: 'Against 1.d4: the Queen\'s Gambit Declined', es: 'Contra 1.d4: el Gambito de Dama Rehusado' }, steps: [{ board: false, en: 'Against 1.d4, play 1...d5, and against 2.c4 decline the gambit with 2...e6: the Queen\'s Gambit Declined. Your centre stays solid and your pieces develop behind it with ...Nf6, ...Be7, ...O-O and ...Nbd7.\n\nThe one problem piece is the light-squared bishop on c8, hemmed in by the pawn on e6. The classic solutions are ...dxc4 followed by ...c5, or ...b6 and ...Bb7. Capablanca often freed his game with timely exchanges, as you can see in his games in the bookshelf.\n\nRemember the Elephant Trap: if White grabs your d5 pawn with a pinned-looking knight, it can backfire.', es: 'Contra 1.d4, juega 1...d5, y contra 2.c4 rehúsa el gambito con 2...e6: el Gambito de Dama Rehusado. Tu centro se mantiene sólido y tus piezas se desarrollan detrás con ...Cf6, ...Ae7, ...O-O y ...Cbd7.\n\nLa pieza problemática es el alfil de casillas claras de c8, encerrado por el peón de e6. Las soluciones clásicas son ...dxc4 seguido de ...c5, o ...b6 y ...Ab7. Capablanca a menudo liberaba su juego con cambios oportunos, como puedes ver en sus partidas de la estantería.\n\nRecuerda la trampa del elefante: si las blancas se comen tu peón de d5 con un caballo que parece clavado, puede volverse en su contra.' }, { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7', en: 'The classical QGD set-up for Black: solid centre, quick castling.', es: 'El esquema clásico del Gambito de Dama Rehusado con negras: centro sólido y enroque rápido.' }, { term: 'qgd' }], read: { book: 'fundamentals', idx: 6 }, practice: { c: 'o', l: 1 } }
        ]
      }
    ]
  }
);

// More classic books, complete and in their original words.
self.BOOKS.push({"id": "bluebook", "kind": "reader", "icon": "📘", "src": "books/bluebook/text.json", "t": {"en": "The Blue Book of Chess (1910 edition, after Staunton)", "es": "The Blue Book of Chess (edición de 1910, según Staunton)"}, "d": {"en": "A classic manual: the rudiments, every main opening of the time and the endings, with games by Morphy, Anderssen, Staunton and others.", "es": "Un manual clásico: los rudimentos, todas las aperturas principales de la época y los finales, con partidas de Morphy, Anderssen, Staunton y otros."}, "credit": {"en": "Text and diagrams of the 1910 revised edition (public domain), transcribed by Suzanne Lybarger, Peter Barozzi and the Online Distributed Proofreading Team. Games converted to modern moves by this app; where the old notation was ambiguous, the move was chosen with the engine.", "es": "Texto y diagramas de la edición revisada de 1910 (dominio público), transcritos por Suzanne Lybarger, Peter Barozzi y el Online Distributed Proofreading Team. Las partidas se pasaron a notación moderna con esta aplicación; donde la notación antigua era ambigua, la jugada se eligió con el motor."}, "chapters": [{"t": "Chapter I", "sub": "Introduction", "hands": ["pieces", "check", "special"]}, {"t": "Chapter II", "sub": "The King's Knight's Opening", "hands": ["rpItalian", "rpE5", "trPetrov", "trNoah"], "games": [{"title": "Game I. — Mr. Morphy plays without seeing the Chess board or men, against M. Boucher, at P", "moves": "e4 e5 Nf3 d6 d4 exd4 Qxd4 Nc6 Bb5 Bd7 Bxc6 Bxc6 Bg5 f6 Bh4 Nh6 Nc3 Be7 O-O O-O Qc4+ Kh8 Nd4 Qd7 Rad1 Rf7 f4 a5 f5 Rff8 Ne6 Rg8 a4 Ng4 Qe2 Ne5 Bg3 Qc8 Bxe5 dxe5 Rf3 Bd7 Rh3 h6 Qd2 Kh7 Qxd7 Bd6 Rxh6+ Kxh6 Rd3 Kh5 Qf7+", "side": "w"}, {"title": "Game III. — Between Mr. Morphy and Mr. Harrwitz.", "moves": "e4 e5 Nf3 d6 d4 exd4 Qxd4 Nc6 Bb5 Bd7 Bxc6 Bxc6 Bg5 Nf6 Nc3 Be7 O-O-O O-O Rhe1 h6 Bh4 Ne8 Bxe7 Qxe7 e5 Bxf3 gxf3 Qg5+ Kb1 dxe5 Rxe5 Qg2 Nd5 Qxh2 Ree1 Qd6 Rg1 Kh7 Qe3 f5 Nf4 Qb6 Qe2 Rf7 Qc4 Qf6 Nh5 Qe7 Rde1 Qd7 a3 Nd6 Qd4 Rg8 Rg2 b6 Rgg1 Ne8 Qc3 f4 Rh1 g6 Reg1 Qd5 Qe1 gxh5 Rg5 Qxf3 Qe5 Rf6 Qe7+ Rg7 Qxe8 hxg5 Qe1 Qc6 f3 Re6 Qf2 Rge7", "side": "b"}, {"title": "Game II. — Skilfully conducted", "moves": "e4 e5 Nf3 Nf6 d4 Nxe4 Bd3 d5 Nxe5 Bd6 O-O O-O c4 f5 f4 c6 Be3 Be6 cxd5 cxd5 Nc3 Nc6 Rc1 Rf6 Bxe4 fxe4 Nb5 Ne7 Nxd6 Qxd6 g4 g6 f5 gxf5 Bg5 Rff8 Bh6 Rfc8 Qd2 Qd8 Rxc8 Rxc8 gxf5 Nxf5 Qg2+ Kh8 Rxf5 Qg8 Rf6 Bh3 Qg3 Qxg3+ hxg3", "side": "w"}, {"title": "Game I. — Between Messrs. Cochrane and Staunton.", "moves": "e4 e5 Nf3 d5 Nxe5 Qe7 d4 f6 Nc3 fxe5 Nxd5 Qf7 Bc4 Be6 O-O c6 f4 cxd5 fxe5 Qd7 exd5 Bxd5 e6 Qc6 Qh5+ g6 Qxd5 Ne7 Qe5 Qxc4 Qxh8 Nf5 Bh6 Qb4 Qxf8+ Qxf8 Bxf8 Kxf8 g4", "side": "w"}, {"title": "Game I. — Between Mr. D. Harrwitz of Paris and", "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5 Qe2+ Be6 Bb5 O-O Bxc6 bxc6 O-O Rb8 b3 Nf4 Qa6 Re8 Rfe1 Qd7 Ne5 Qxd4 Ndf3 Qb6 Qxb6 Rxb6 Rac1 f6 Nc4 Ra6", "side": "b"}, {"title": "Game V. — Between M. St. Amant and Mr. Staunton.", "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Qe7 d4 exd4 O-O Ne5 Nxe5 Qxe5 f4 dxc3+ Kh1 Qd4 Qb3 Nh6 Nxc3 O-O h3 c6 f5 Qf6 e5 Qh4 Bxh6 Qxh6 Ne4 Bd4 Nd6 Qh5 Bxf7+ Rxf7 g4 Bxe5 Rae1 Qxh3+ Qxh3 Bxd6 Re8+ Bf8 Rfe1 d5 Rd8 Rd7 Ree8 Rxd8 Rxd8 b6 Qe3 Bb7 Rxa8 Bxa8 Qe6+ Kh8 Qf7", "side": "w"}, {"title": "Game VII. — Between Mr. Popert and another fine player of London.", "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 O-O Nxe4 d4 d5 Bb5 exd4 cxd4 Bd6 Ne5 Bxe5 dxe5 O-O f4 f5 Nc3 Be6 Be3 a6 Bxc6 bxc6 Rc1 Qe8 Qc2 Rb8 Nxe4 fxe4 Qxc6 Rxb2 Qxe8 Rxe8 f5 Bc8 Rxc7 Re2 Bd4 Rd2 Bc3 Rd1 f6 gxf6 exf6 Be6 Rg7+ Kh8 Be5 Bg8 Re7 Bf7", "side": "b"}, {"title": "Game III. — Between Mr. Anderssen and Mr. Hillel.", "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O Bb6 cxd4 d6 h3 Qf6 Bb2 Nh6 Nbd2 O-O e5 dxe5 dxe5 Qe7 Ne4 Be6 Bd3 Bf5 Nf6+ gxf6 exf6 Qe8 Qd2 Be3 fxe3 Bxd3 Qxd3 Rd8 Qa3 Nf5 Rae1 Qe4 Ng5 Qh4 e4 Nfd4 Nf3 Nxf3+ Qxf3 Rd2 Bc3 Rxa2 e5 Nd4 Bxd4 Qxd4+ Kh1 Kh8 Re4 Qb2 Rh4 Qxe5 Qd3 h5 Qf5 Qxf5 Rxf5 Kh7 Rg5 Kh6 Rhxh5#", "side": "w"}, {"title": "Game I. — Played by Telegraph, in the Match between", "moves": "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5 c3 Nf6 e5 d5 Bb5 Ne4 cxd4 Bb6 Nbd2 O-O Bxc6 bxc6 Qc2 Nxd2 Bxd2 Bg4 Ng5 g6 Qc3 f6 h3 Bf5 Nf3 Be4 Bf4 fxe5 Bxe5 Qe7 O-O c5 Rfe1 cxd4 Bxd4 c5 Be5 Rae8 Bg3 Qb7 Ne5 d4 Qc4+ Bd5 Qa4 Re6 Ng4 h5 Rxe6 Bxe6 Qc2 Kh7 Re1 Bf5 Qd2 hxg4 hxg4 Qd5 Ra1 Kg8 gxf5 Qxf5 Qh6 g5 Bd6 Rf6 Qh5 Qg6 Qh8+ Kf7 Re1", "side": "w"}, {"title": "Game II. — Played by Correspondence between", "moves": "e4 e5 Nf3 Nc6 d4 Nxd4 Nxd4 exd4 Bc4 Qf6 O-O Bc5 e5 Qf5 c3 dxc3 Nxc3 Ne7 Bd3 Qe6 Ne4 Bd4 Ng5 Qb6 Qh5 g6 Qh6 Bxe5 Re1 Qf6 Nf3 d6 Bg5 Qe6 Nxe5 dxe5 Rac1 Rf8 Bc4 Qf5 Bxe7 Kxe7 f4 e4 Bd3 Be6 Bxe4 Qa5 Qh4+ Kd7 Red1+ Ke8 Kh1 c6 Rxc6 Rd8 Rcc1 Rxd1+ Rxd1 h5 Qf6 Bc8 Bxb7", "side": "w"}]}, {"t": "Chapter III", "sub": "The King's Bishop's Opening", "hands": ["center", "trFool"], "games": [{"title": "Game II. — Between two Amateurs.", "moves": "e4 e5 Bc4 Bc5 c3 Qg5 Qf3 Qg6 Ne2 d6 d4 exd4 cxd4 Bb6 e5 Ne7 e6 f6 Nbc3 O-O Nf4 Qe8 Be3 Nbc6 Rd1 Kh8 h4 Nd8 h5 f5 Ncd5 Bxe6 Nxe7 Qxe7 Ng6+ hxg6 hxg6+", "side": "w"}, {"title": "Game IV. —", "moves": "e4 e5 Bc4 Bc5 Qe2 Nc6 Bxf7+ Kxf7 Qc4+ d5 Qxc5 dxe4 Qc4+ Be6 Qxe4 Nf6 Qh4 Nd4 Na3 e4 c3 g5 Qxg5 Rg8 Qe3 Nf5 Qe2 Rxg2 Nc2 Qd6 Ne3 Nxe3 dxe3 Rag8 Qf1 Rd8 Qe2 Ng4 Nh3 Ne5 Nf4 Nf3+ Kf1", "side": "w"}, {"title": "Game I. — Between Messrs. Stanley and Rousseau.", "moves": "e4 e5 Bc4 Nf6 Nc3 Bc5 Nf3 d6 h3 O-O d3 Be6 Bb3 Nc6 Ne2 Qe7 Ng3 Nd4 Nxd4 Bxd4 c3 Bb6 O-O d5 Bg5 c6 Nh5 dxe4 dxe4 Bxb3 Qf3 Bc4 Bxf6 Qe6 Nxg7 Be2 Nxe6 Bxf3 Nxf8", "side": "w"}, {"title": "Game II. — Between Messrs. Horwitz and Schulten.", "moves": "e4 e5 Bc4 Nf6 Nc3 b5 Bxb5 Bc5 d3 c6 Bc4 Qb6 Qe2 d5 exd5 O-O Ne4 Nxe4 dxe4 Bxf2+ Qxf2 Qb4+ Bd2 Qxc4 Qf3 f5 exf5 Bxf5 Qb3", "side": "w"}]}, {"t": "Chapter IV", "sub": "The King's Gambit", "hands": ["gmImmortal"], "games": [{"title": "Game I. — Between V. H. der Laza and Dr. Bledow.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 Bg7 d4 Qe7 O-O h6 Nc3 c6 e5 Qb4 Ne4 Bf8 Qe2 g4 Nd6+ Bxd6 exd6+ Kd8 Ne5 Rh7 c3 f3 Qe4 Nf6 Qxh7 Nxh7", "side": "b"}, {"title": "Game II. — Between V. H. der Laza and Mr. H. of Berlin.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 Bg7 O-O h6 d4 d6 c3 c6 Qb3 Qe7 g3 g4 Bxf4 gxf3 Rxf3 Be6 d5 Bg4 dxc6 Bxf3 cxb7 Qxe4 bxa8=Q Qxa8 Bxf7+ Kf8 Bxg8 Rxg8 Bxd6+ Ke8", "side": "b"}, {"title": "Game I. — Between Mr. Lewis and an Amateur of great skill.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 g4 O-O gxf3 Qxf3 Bh6 d4 Qe7 Bxf4 Nc6 Bxh6 Nxh6 Qh5 Qf8 Rf6 Qg7 Qxh6 Qxh6 Rxh6 Nxd4 Na3 c6 Rd6 Ne6 Rad1 Rg8 Bxe6 fxe6 Nc4 Rg5 Kf2 Ke7 Ne3 a5 Kf3 b5 Ng4 Ra7 Kf4 Rc5 c3 b4 cxb4 axb4 Ne5 Rc2 a4 Rxb2 Rxc6 Rf2+ Ke3 Rf8 Rdc1 Ba6 Rc7 Rxc7 Rxc7 Kd6 Ra7 Kxe5 Rxa6 Rb8 Ra5+ d5 exd5 exd5 Kd3 Rc8 Rb5 Rc3+ Kd2 Rc4 a5 Rf4 a6 Rf2+ Kd3 Ra2 Rxb4 Rxa6", "side": "b"}, {"title": "Game II. — Between Mr. Szen, of Hungary, and V. H. der Laza, of the Berlin Chess Club.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 g4 O-O gxf3 Qxf3 Qf6 e5 Qxe5 d3 Bh6 Nc3 Ne7 Bd2 O-O Rae1 Qc5+ Kh1 c6 Ne4 Qf5 Bc3 Bg7 Nd6 Qg5 Rxe7 Bxc3 Rxf7 Rxf7 Bxf7+ Kg7 bxc3 Na6 Qxf4 Qxf4 Rxf4 Nc7 Bb3 Nd5 Bxd5 cxd5 Rf7+ Kg8 Re7 b6 Re8+ Kg7 Rxc8", "side": "w"}, {"title": "Game IV. — Between La Bourdonnais and McDonnell.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 g4 Nc3 gxf3 Qxf3 Bh6 d4 Nc6 O-O Nxd4 Bxf7+ Kxf7 Qh5+ Kg7 Bxf4 Bxf4 Rxf4 Nf6 Qg5+ Kf7 Raf1 Ke8 Rxf6 Qe7 Nd5 Qc5 Kh1 Ne6 Rxe6+ dxe6 Nf6+", "side": "w"}, {"title": "Game V. — From Ghulam Kassim.", "moves": "e4 e5 f4 exf4 Nf3 g5 Bc4 g4 d4 gxf3 Qxf3 d5 Bxd5 Nf6 O-O Nxd5 exd5 Qf6 Qe4+ Kd8 Bxf4 Qe7 Qf3 Rg8 Nd2 Bg4 Qf2 Nd7 Rae1 Qf6 Ne4 Qg6 c4 Bd6 Bxd6 cxd6 c5 dxc5 dxc5 Re8 Nd6 Rxe1 Qxe1 Kc7 Qb4 Kd8", "side": "b"}, {"title": "Game IV. — Played some years ago between one of the best", "moves": "e4 e5 f4 exf4 Bc4 d5 exd5 Nf6 Qf3 Bd6 h3 O-O c3 c6 dxc6 Nxc6 d4 Ne4 Bxf4 Qh4+ g3 Nxg3 Bxd6 Nxh1+ Kf1 Be6 Bd3 Rad8 Bh2 Bd5 Qf4 Qh5 Nd2 Ne7 c4 Ng6 Qg4 Qh6 Rd1 Qe3 Qf5 Bg2+ Kxg2 Nh4+", "side": "b"}, {"title": "Game I. — Played by Mr. Morphy without seeing the", "moves": "e4 e5 f4 Bc5 Nf3 d6 c3 Bg4 Bc4 Nf6 fxe5 Bxf3 Qxf3 dxe5 d3 Nc6 Bg5 a6 Nd2 Be7 O-O-O Qd7 Nf1 O-O-O Ne3 h6 Bh4 g5 Bg3 Rdf8 Nd5 Ne8 d4 exd4 cxd4 Nd6 Bb3 Bd8 Rhf1 Nb5 Qe3 f5 exf5 Rxf5 Nb6+ cxb6 Be6 Rd5 Rf7 Ne7 Kb1 Re8 Rc1+ Nc7 Bxd7+ Rxd7 d5 Nc6 dxc6 Rxe3 cxd7+", "side": "w"}]}, {"t": "Chapter V", "sub": "The Queen's Gambit", "hands": ["rpQGD", "trElephant", "trLasker"]}, {"t": "Chapter VI", "sub": "Irregular Openings", "hands": ["rpAdvance", "rpAlapin", "trCaro"], "games": [{"title": "Game III. — Played in 1854, between", "moves": "e4 e6 d4 d5 exd5 Qxd5 Nc3 Bb4 Nf3 Nf6 Bd3 c5 Bd2 Bxc3 Bxc3 c4 Be2 Ne4 O-O Nxc3 bxc3 Nd7 Nd2 Nb6 a4 a5 Rb1 Qc6 Bf3 Qc7 Ne4 Nxa4 Qd2 O-O Rb5 f5 Ng3 Rb8 d5 Qd7 Rxa5 b5 Qf4 Qb7 dxe6 Qb6 e7 Re8 Re1 Be6 Rxa4 bxa4 Qe5 Rxe7 Nxf5 Rf7 Nd6 Rf6 Ne4 Rf5 Qg3 Rbf8 Ng5 Bd5 Bxd5+ Rxd5 Ne6 Qxe6", "side": "b"}, {"title": "Game IV. — Played by Correspondence between New York and Philadelphia, in 1857.", "moves": "e4 c5 d4 cxd4 Nf3 e6 Qxd4 Nc6 Qd1 Bc5 Bd3 Nge7 Nc3 d5 exd5 Nxd5 Ne4 Bb6 Bb5 O-O Bxc6 bxc6 O-O f5 Ng3 Qc7 c4 Nf6 Qc2 c5 b3 Bb7 Ng5 Qc6 f3 Bc7 Re1 Rae8 Bb2 g6 Re2 e5 Rae1 e4 fxe4 Bf4 Nh3 Bxg3 hxg3 Nxe4 Ng5 Nxg5 Qc3 Qxg2+ Rxg2 Rxe1+ Qxe1 Nf3+ Kf1 Nxe1 Rd2 f4 gxf4 Ng2 Rd7 Rxf4+ Kg1 Be4 Rg7+ Kf8 Rxh7 Ne3 Rh8+ Kf7 Be5 Rf1+ Kh2 Nf5 Kh3 g5 Rc8", "side": "w"}, {"title": "Game VII. — Played in Oct. 1858, between Mr. James Thompson", "moves": "e4 c5 c4 e5 Nc3 f5 exf5 Nf6 Nd5 d6 Bd3 Nc6 g4 Nxd5 cxd5 Nd4 Nf3 h5 gxh5 Nxf5 Bb5+ Bd7 Bxd7+ Qxd7 Ng5 Nd4 d3 Qf5 Be3 O-O-O Rc1 Be7 Bxd4 exd4 Ne4 Rde8 Rg1 Bg5 Qe2 Qf4 Rc2 Bf6 h3 Kb8 b4 Qh2 Qg4 Rhf8 Kd1 Rxe4 dxe4 d3 Rd2 Qe5 Rxd3 Qa1+ Ke2 Qxa2+ Kf1 cxb4 Qe2 b3 Rd1 b2 Qc2 Bd4 Rg2", "side": "w"}, {"title": "Game VIII. — Between Mr. Morphy and Mr. Anderssen.", "moves": "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 e5 dxe5 Qxe5+ Be2 Bb4 Nf3 Bxc3+ bxc3 Qxc3+ Bd2 Qc5 Rb1 Nc6 O-O Nf6 Bf4 O-O Bxc7 Nd4 Qxd4 Qxc7 Bd3 Bg4 Ng5 Rfd8 Qb4 Bc8 Rfe1 a5 Qe7 Qxe7 Rxe7 Nd5 Bxh7+ Kh8 Rxf7 Nc3 Re1 Nxa2 Rf4 Ra6 Bd3", "side": "w"}, {"title": "Game IX. — Between Mr. Morphy and Mr. Anderssen.", "moves": "e4 d5 exd5 Nf6 d4 Nxd5 c4 Nf6 Nc3 Bf5 Nf3 e6 Be3 Bb4 Qb3 Bxc3+ bxc3 Be4 Nd2 Bc6 Bd3 Nbd7 Qc2 h6 O-O O-O Rae1 b6 h3 Qc8 Kh2 Kh8 Rg1 Rg8 g4 g5 f4 Qf8 Rg3 Rd8 Nf3 Bxf3 Rxf3 Qd6 Kg2 Nh5 fxg5 hxg5 gxh5 g4 hxg4 Rxg4+ Kf1 f5 Qf2 Ne5 dxe5 Qxd3+ Qe2 Qe4 Bf2 Qc6 Rd1 Rxd1+ Qxd1 Qxc4+ Qd3 Qxa2 Rg3 Qc4 Qxc4 Rxc4 Rg6 Rc6 c4 a5 Ke2 Rxc4 Rxe6 Rc2+ Kf3 a4 Rg6 Rc4 Rg1 a3 e6 a2 Ra1 Re4 Rxa2 Rxe6 Kf4 Rd6 Kxf5 Rd5+ Kg4 b5 Ra8+ Kh7 Ra7 Rd7 Bg3 Rg7+ Kh4", "side": "w"}, {"title": "Game XI. — Between the same players. (March 12, 1859.)", "moves": "e4 e6 d4 c5 d5 Nf6 Bg5 Qa5+ Bd2 Qc7 Nc3 Be7 f4 O-O Nf3 a6 a4 c4 Be3 Ng4 Qd2 Nxe3 Qxe3 Bc5 Nd4 e5 fxe5 Qxe5 O-O-O b5 Kb1 b4 Nce2 d6 Ng3 Bg4 Rd2 c3 bxc3 bxc3 Qxc3 Nd7 Ka2 Rab8 Nge2 Qe8 Rd1 Nb6", "side": "b"}, {"title": "Game XIII. — Between Mr. Morphy and Mr. Harrwitz.", "moves": "d4 e6 c4 d5 Nc3 Nf6 Bf4 a6 e3 c5 Nf3 Nc6 a3 cxd4 exd4 dxc4 Bxc4 b5 Bd3 Bb7 O-O Be7 Be5 O-O Qe2 Nd5 Bg3 Kh8 Rfe1 Bf6 Qe4 g6 Nxd5 Qxd5 Qxd5 exd5 Ne5 Rad8 Nxc6 Bxc6 Rac1 Rc8 Bd6 Rg8 Be5 Kg7 f4 Bd7 Kf2 h6 Ke3 Rxc1 Rxc1 Rc8 Rc5 Bxe5 fxe5 Be6 a4 bxa4 Bxa6 Rb8 Rb5 Rd8 Rb6 Ra8 Kd2 Bc8 Bxc8 Rxc8 Rb5 Ra8 Rxd5 a3 bxa3 Rxa3 Rc5 Kf8 Ke2 Ke7 d5 Kd7 Rc6 h5 Rf6 Ke7 d6+ Ke8 e6 fxe6 Rxe6+ Kf7 d7 Ra8 Rd6 Ke7 Rxg6 Kxd7 Rg5 Rh8 Kf3 Ke6 Kg3 h4+ Kg4 h3 g3 Kf6 Rh5", "side": "w"}, {"title": "Game XIV. — (", "moves": "a3 e5 c4 Nf6 Nc3 d5 cxd5 Nxd5 e3 Be6 Nf3 Bd6 Be2 O-O d4 Nxc3 bxc3 e4 Nd2 f5 f4 g5 Bc4 Bxc4 Nxc4 gxf4 exf4 Qe8 O-O Qc6 Qb3 Qd5 Rb1 b6 Qa2 c6 Qe2 Nd7 Ne3 Qe6 c4 Nf6 Rb3 Kf7 Bb2 Rac8 Kh1 Rg8 d5 cxd5 cxd5 Qd7 Nc4 Ke7 Bxf6+ Kxf6 Qb2+ Kf7 Rh3 Rg7 Qd4 Kg8 Rh6 Bf8 d6 Rf7 Rh3 Qa4 Rc1 Rc5 Rg3+ Bg7 h3 Kh8 Rxg7 Rxg7 Rc3 e3 Rxe3 Rxc4 Qf6 Rc1+ Kh2 Qxf4+", "side": "b"}]}, {"t": "Chapter VII", "sub": "Endings of Games", "hands": ["egKey", "egRookBehind", "mateRook", "egQueenPawn"]}]}, {"id": "morphy", "kind": "reader", "icon": "🏛️", "src": "books/morphy/text.json", "t": {"en": "The Exploits and Triumphs of Paul Morphy (F. M. Edge, 1859)", "es": "The Exploits and Triumphs of Paul Morphy (F. M. Edge, 1859)"}, "d": {"en": "Morphy's tour of Europe in 1858, told by his secretary: the matches, the blindfold displays and the famous Opera Game.", "es": "La gira de Morphy por Europa en 1858, contada por su secretario: los matches, las simultáneas a ciegas y la famosa Partida de la Ópera."}, "credit": {"en": "Text of the 1859 edition (public domain), transcribed by the Online Distributed Proofreading Team.", "es": "Texto de la edición de 1859 (dominio público), transcrito por el Online Distributed Proofreading Team."}, "chapters": [{"t": "Chapter I", "sub": "Morphy's First Games"}, {"t": "Chapter II", "sub": "The First American Chess Congress"}, {"t": "Chapter III", "sub": "Morphy Prepares To Start For Europe"}, {"t": "Chapter IV", "sub": "Chess in England"}, {"t": "Chapter V", "sub": "Morphy in England"}, {"t": "Chapter VI", "sub": "The Staunton Affair"}, {"t": "Chapter VII", "sub": "Morphy in France", "hands": ["opera"]}, {"t": "Chapter VIII", "sub": "The Café de la Régence", "hands": ["opera"]}, {"t": "Chapter IX", "sub": "The Match Between Morphy and Harrwitz"}, {"t": "Chapter X", "sub": "Morphy's Greatest Blindfold Feat"}, {"t": "Chapter XI", "sub": "Continuation of the Match With Harrwitz"}, {"t": "Chapter XII", "sub": "Morphy in Society"}, {"t": "Chapter XIII", "sub": "Morphy and the French Amateurs"}, {"t": "Chapter XIV", "sub": "Morphy Gets Beaten"}, {"t": "Chapter XV", "sub": "Morphy and Anderssen", "hands": ["gmImmortal", "gmEvergreen"]}, {"t": "Chapter XVI", "sub": "Morphy and Mongredieu"}, {"t": "Chapter XVII", "sub": "Trophies", "hands": ["opera"]}]});

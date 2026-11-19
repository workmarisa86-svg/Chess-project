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

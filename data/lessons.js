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

/*
 * Chess terms used by the coach and the glossary.
 * n = name, a = indefinite article ("a fork" / "una horquilla"),
 * the = definite article (openings), d = definition, w = why it is useful,
 * x = a simple example. demo = position for the mini board
 * (fen or SAN moves from the start, plus arrows and marked squares).
 */
const TERMS = {
  // ---------------- Tactics ----------------
  fork: {
    cat: 'tactic',
    en: { n: 'fork', a: 'a', d: 'One piece attacks two or more enemy pieces at the same time.', w: 'Your opponent can usually save only one of them, so you win material.', x: 'A knight jumps to c7 giving check to the king on e8 and attacking the rook on a8. After the king moves, the knight takes the rook.' },
    es: { n: 'horquilla', a: 'una', d: 'Una sola pieza ataca a la vez a dos o más piezas rivales (también se llama doble ataque).', w: 'El rival normalmente solo puede salvar una de ellas, así que ganas material.', x: 'Un caballo salta a c7 dando jaque al rey en e8 y atacando la torre de a8. Cuando el rey se mueve, el caballo captura la torre.' },
    demo: { fen: 'r3k3/2N5/8/8/8/8/8/4K3 b - - 0 1', arrows: [['c7', 'e8'], ['c7', 'a8']], marks: ['c7'] }
  },
  pin: {
    cat: 'tactic',
    en: { n: 'pin', a: 'a', d: 'A piece cannot move (or should not move) because a more valuable piece is behind it on the same line. If the piece behind is the king, it is an absolute pin and moving is illegal.', w: 'A pinned piece is frozen: it cannot defend, and you can attack it again to win it.', x: 'A white bishop on b5 attacks the knight on c6. The black king is behind it on e8, so the knight cannot move.' },
    es: { n: 'clavada', a: 'una', d: 'Una pieza no puede (o no debe) moverse porque detrás de ella, en la misma línea, hay otra pieza más valiosa. Si detrás está el rey, es una clavada absoluta y moverla es ilegal.', w: 'La pieza clavada queda paralizada: no puede defender y puedes atacarla de nuevo para ganarla.', x: 'Un alfil blanco en b5 ataca al caballo de c6. Detrás está el rey negro en e8, así que el caballo no puede moverse.' },
    demo: { fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1', arrows: [['b5', 'e8']], marks: ['c6'] }
  },
  skewer: {
    cat: 'tactic',
    en: { n: 'skewer', a: 'a', d: 'Like a pin in reverse: you attack a valuable piece, and when it moves out of the way, you capture the piece behind it.', w: 'The front piece is usually the king or queen, so it must move and leaves the piece behind undefended.', x: 'A rook on h5 checks the king on d5. The king must step aside, and the rook captures the queen on a5.' },
    es: { n: 'enfilada', a: 'una', d: 'Es como una clavada al revés: atacas una pieza valiosa y, cuando se aparta, capturas la pieza que estaba detrás.', w: 'La pieza delantera suele ser el rey o la dama, que debe apartarse y deja sin protección a la de atrás.', x: 'Una torre en h5 da jaque al rey en d5. El rey tiene que apartarse y la torre captura la dama de a5.' },
    demo: { fen: '8/8/8/q2k3R/8/8/8/6K1 b - - 0 1', arrows: [['h5', 'a5']], marks: ['d5', 'a5'] }
  },
  discoveredAttack: {
    cat: 'tactic',
    en: { n: 'discovered attack', a: 'a', d: 'You move one piece out of the way, uncovering an attack by another piece (a rook, bishop or queen) behind it.', w: 'You make two threats with one move: the piece that moved can attack something too.', x: 'The knight leaves d4 for f5, and suddenly the rook on d1 attacks the queen on d8.' },
    es: { n: 'ataque a la descubierta', a: 'un', d: 'Mueves una pieza que estorbaba y destapas el ataque de otra pieza (torre, alfil o dama) que estaba detrás.', w: 'Creas dos amenazas con una sola jugada: la pieza que se mueve también puede atacar algo.', x: 'El caballo sale de d4 hacia f5 y, de pronto, la torre de d1 ataca a la dama de d8.' },
    demo: { fen: '3q2k1/8/8/5N2/8/8/8/3R2K1 b - - 0 1', arrows: [['d4', 'f5'], ['d1', 'd8']], marks: ['d8'] }
  },
  discoveredCheck: {
    cat: 'tactic',
    en: { n: 'discovered check', a: 'a', d: 'A discovered attack where the uncovered piece gives check.', w: 'The opponent must answer the check, so the piece that moved can grab something for free.', x: 'The bishop moves from e2 to g4, the rook on e1 now gives check, and the bishop also attacks the queen on d7.' },
    es: { n: 'jaque a la descubierta', a: 'un', d: 'Un ataque a la descubierta en el que la pieza destapada da jaque.', w: 'El rival debe responder al jaque, así que la pieza que se movió puede capturar algo gratis.', x: 'El alfil va de e2 a g4, la torre de e1 da jaque y además el alfil ataca a la dama de d7.' },
    demo: { fen: '4k3/3q4/8/8/6B1/8/8/4R1K1 b - - 0 1', arrows: [['e2', 'g4'], ['e1', 'e8'], ['g4', 'd7']], marks: ['e8'] }
  },
  doubleCheck: {
    cat: 'tactic',
    en: { n: 'double check', a: 'a', d: 'Two pieces give check at the same time (usually through a discovered check).', w: 'You cannot block or capture two checkers at once, so the king is forced to move. It is one of the most powerful tactics.', x: 'The knight jumps from e4 to d6 with check, and the rook on e1 also checks the king on e8.' },
    es: { n: 'jaque doble', a: 'un', d: 'Dos piezas dan jaque a la vez (normalmente gracias a un jaque a la descubierta).', w: 'No se puede tapar ni capturar a dos piezas a la vez, así que el rey está obligado a moverse. Es una de las tácticas más potentes.', x: 'El caballo salta de e4 a d6 dando jaque, y la torre de e1 también da jaque al rey en e8.' },
    demo: { fen: '4k3/8/3N4/8/8/8/8/4R1K1 b - - 0 1', arrows: [['e4', 'd6'], ['e1', 'e8'], ['d6', 'e8']], marks: ['e8'] }
  },
  doubleAttack: {
    cat: 'tactic',
    en: { n: 'double attack', a: 'a', d: 'Any move that creates two threats at once — for example a queen attacking two pieces, or a check plus an attack.', w: 'Defending against two threats with one move is often impossible.', x: 'The queen goes to e4, giving check on the e-file and attacking the rook on a8 along the diagonal.' },
    es: { n: 'doble ataque', a: 'un', d: 'Cualquier jugada que crea dos amenazas a la vez; por ejemplo, una dama que ataca dos piezas, o un jaque más un ataque.', w: 'Defenderse de dos amenazas con una sola jugada suele ser imposible.', x: 'La dama va a e4, da jaque por la columna e y ataca a la torre de a8 por la diagonal.' },
    demo: { fen: 'r3k3/8/8/8/4Q3/8/8/4K3 b - - 0 1', arrows: [['e4', 'e8'], ['e4', 'a8']], marks: ['e4'] }
  },
  deflection: {
    cat: 'tactic',
    en: { n: 'deflection', a: 'a', d: 'You force an enemy piece to leave the square or line it was defending.', w: 'Once the defender is pulled away, whatever it protected falls.', x: 'The black rook on d8 protects the queen on d4. White plays Re8+! The rook must capture on e8, and then Qxd4 wins the queen.' },
    es: { n: 'desviación', a: 'una', d: 'Obligas a una pieza rival a abandonar la casilla o la línea que estaba defendiendo.', w: 'Cuando el defensor se aleja, lo que protegía queda indefenso.', x: 'La torre negra de d8 protege a la dama de d4. Las blancas juegan Te8+! La torre debe capturar en e8 y luego Dxd4 gana la dama.' },
    demo: { fen: '3r2k1/5ppp/8/8/3q4/7P/5PP1/3QR1K1 w - - 0 1', arrows: [['e1', 'e8'], ['d8', 'e8'], ['d1', 'd4']], marks: ['d4'] }
  },
  decoy: {
    cat: 'tactic',
    en: { n: 'decoy', a: 'a', d: 'You lure an enemy piece (often the king or queen) onto a bad square, usually with a sacrifice.', w: 'On that square the piece becomes a target for a fork, pin or mate.', x: 'White plays Rh8+! and after Kxh8 the king stands on h8, so Nxf7+ forks the king and the queen on d6.' },
    es: { n: 'atracción', a: 'una', d: 'Atraes a una pieza rival (a menudo el rey o la dama) a una casilla mala, normalmente con un sacrificio.', w: 'En esa casilla la pieza se convierte en blanco de una horquilla, una clavada o un mate.', x: 'Las blancas juegan Th8+! y tras Rxh8 el rey queda en h8, así que Cxf7+ hace una horquilla al rey y a la dama de d6.' },
    demo: { fen: '6k1/5pp1/3q4/6N1/8/8/8/6KR w - - 0 1', arrows: [['h1', 'h8'], ['g5', 'f7']], marks: ['h8', 'd6'] }
  },
  zwischenzug: {
    cat: 'tactic',
    en: { n: 'zwischenzug', a: 'a', d: 'German for "in-between move": instead of making the expected move (often a recapture), you first play a forcing move such as a check.', w: 'It can change the outcome of an exchange in your favor.', x: 'Black has just taken on c3. Instead of recapturing at once with bxc3 (which would lose the rook on d1), White first plays Rxd8+ and only then recaptures.' },
    es: { n: 'jugada intermedia', a: 'una', d: 'También llamada zwischenzug (en alemán): en lugar de hacer la jugada esperada (a menudo una recaptura), primero haces una jugada forzante, como un jaque.', w: 'Puede cambiar a tu favor el resultado de un intercambio.', x: 'Las negras acaban de capturar en c3. En lugar de recapturar enseguida con bxc3 (que perdería la torre de d1), las blancas juegan antes Txd8+ y solo después recapturan.' },
    demo: { fen: '3r2k1/8/8/8/8/2b5/1P3PPP/3R2K1 w - - 0 1', arrows: [['d1', 'd8'], ['b2', 'c3']], marks: ['c3'] }
  },
  removingDefender: {
    cat: 'tactic',
    en: { n: 'removing the defender', a: '', d: 'You capture (or chase away) the piece that protects another enemy piece or an important square.', w: 'After the defender is gone, the piece it protected can be won.', x: 'The knight on f6 is the only defender of the bishop on d5. White plays Bxf6, and after gxf6 the rook takes on d5.' },
    es: { n: 'eliminación del defensor', a: 'una', d: 'Capturas (o expulsas) la pieza que protege a otra pieza rival o a una casilla importante.', w: 'Sin su defensor, la pieza que estaba protegida se puede ganar.', x: 'El caballo de f6 es el único defensor del alfil de d5. Las blancas juegan Axf6 y, tras gxf6, la torre captura en d5.' },
    demo: { fen: '6k1/6pp/5n2/3b2B1/8/8/5PPP/3R2K1 w - - 0 1', arrows: [['g5', 'f6'], ['d1', 'd5'], ['f6', 'd5']], marks: ['f6', 'd5'] }
  },
  backRankMate: {
    cat: 'tactic',
    en: { n: 'back-rank mate', a: 'a', d: 'Checkmate by a rook or queen on the king’s first rank, when the king is trapped by its own pawns.', w: 'It is one of the most common ways to win (and lose!). Keep an escape square for your king, e.g. by playing h3.', x: 'The black king on g8 is boxed in by its pawns on f7, g7 and h7. Re8 is checkmate.' },
    es: { n: 'mate del pasillo', a: 'un', d: 'Jaque mate con una torre o la dama en la primera fila del rey, cuando este está encerrado por sus propios peones.', w: 'Es una de las formas más comunes de ganar (¡y de perder!). Deja una casilla de escape a tu rey, por ejemplo jugando h3.', x: 'El rey negro de g8 está encerrado por sus peones de f7, g7 y h7. Te8 es jaque mate.' },
    demo: { fen: '4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', arrows: [['e1', 'e8']], marks: ['g8'] }
  },
  overloading: {
    cat: 'tactic',
    en: { n: 'overloading', a: '', d: 'One enemy piece has to do two defensive jobs at once. You attack one of them, and the other collapses.', w: 'An overloaded piece cannot cover everything; it is a common way to win material or deliver mate.', x: 'The black queen on d7 defends both the knight on d5 and the rook on e8. After Rxe8+ Qxe8 the queen no longer guards d5, and Rxd5 wins the knight.' },
    es: { n: 'sobrecarga', a: 'una', d: 'Una pieza rival tiene que cumplir dos tareas defensivas a la vez. Atacas una de ellas y la otra se viene abajo.', w: 'Una pieza sobrecargada no puede cubrirlo todo; es una forma típica de ganar material o dar mate.', x: 'La dama negra de d7 defiende al caballo de d5 y a la torre de e8. Tras Txe8+ Dxe8 la dama ya no protege d5, y Txd5 gana el caballo.' },
    demo: { fen: '4r1k1/3q1ppp/8/3n4/8/7P/5PP1/3RR1K1 w - - 0 1', arrows: [['d7', 'd5'], ['d7', 'e8'], ['d1', 'd5'], ['e1', 'e8']], marks: ['d7'] }
  },
  xray: {
    cat: 'tactic',
    en: { n: 'x-ray', a: 'an', d: 'A rook, bishop or queen acts "through" another piece on the same line — for example two rooks lined up (a battery) on a file.', w: 'The piece behind supports the front one or attacks what is behind an enemy piece, so exchanges end in your favor.', x: 'The rooks on d1 and d2 are lined up. After Rxd8+ Rxd8, the second rook recaptures with Rxd8#.' },
    es: { n: 'rayos X', a: 'un ataque en', d: 'Una torre, un alfil o la dama actúa "a través" de otra pieza situada en la misma línea; por ejemplo, dos torres alineadas (una batería) en una columna.', w: 'La pieza de atrás apoya a la de delante o ataca lo que hay detrás de una pieza rival, así que los cambios terminan a tu favor.', x: 'Las torres de d1 y d2 están alineadas. Tras Txd8+ Txd8, la segunda torre recaptura con Txd8#.' },
    demo: { fen: 'r2r2k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1', arrows: [['d1', 'd8']], marks: ['d2', 'd8'] }
  },
  sacrifice: {
    cat: 'tactic',
    en: { n: 'sacrifice', a: 'a', d: 'Giving up material on purpose to get something more valuable: an attack, mate, or even more material.', w: 'A well-calculated sacrifice can break through a solid defense.', x: 'A famous combination: Qg8+!! gives away the queen. After Rxg8 (the only move), Nf7 is checkmate.' },
    es: { n: 'sacrificio', a: 'un', d: 'Entregar material a propósito para conseguir algo más valioso: un ataque, un mate o incluso más material.', w: 'Un sacrificio bien calculado puede romper una defensa sólida.', x: 'Una combinación famosa: Dg8+!! entrega la dama. Tras Txg8 (la única jugada), Cf7 es jaque mate.' },
    demo: { fen: '3r3k/6pp/1q5N/3Q4/8/8/5PPP/6K1 w - - 0 1', arrows: [['d5', 'g8'], ['h6', 'f7']], marks: ['h8'] }
  },
  hangingPiece: {
    cat: 'tactic',
    en: { n: 'hanging piece', a: 'a', d: 'A piece that is attacked and not defended (or not defended enough), so it can be captured for free.', w: 'Before every move, check: are any of my pieces hanging? Can I capture a hanging enemy piece?', x: 'The black knight on e5 is attacked by the queen on e2 and nothing defends it: Qxe5+ wins it.' },
    es: { n: 'pieza colgada', a: 'una', d: 'Una pieza atacada y sin defensa (o con defensa insuficiente), que se puede capturar gratis.', w: 'Antes de cada jugada pregúntate: ¿tengo alguna pieza colgada? ¿Puedo capturar una pieza colgada del rival?', x: 'El caballo negro de e5 está atacado por la dama de e2 y nadie lo defiende: Dxe5+ lo gana.' },
    demo: { fen: '4k3/8/8/4n3/8/8/4Q3/4K3 w - - 0 1', arrows: [['e2', 'e5']], marks: ['e5'] }
  },
  smotheredMate: {
    cat: 'tactic',
    en: { n: 'smothered mate', a: 'a', d: 'A checkmate delivered by a knight when the king is completely surrounded ("smothered") by its own pieces.', w: 'It shows how a king with no free squares can be mated by a single knight.', x: 'The black king on h8 is blocked by its rook on g8 and pawns on g7 and h7. Nf7 is checkmate.' },
    es: { n: 'mate de la coz', a: 'un', d: 'Jaque mate dado por un caballo cuando el rey está totalmente rodeado ("ahogado") por sus propias piezas.', w: 'Demuestra cómo un rey sin casillas libres puede recibir mate de un solo caballo.', x: 'El rey negro de h8 está bloqueado por su torre de g8 y sus peones de g7 y h7. Cf7 es jaque mate.' },
    demo: { fen: '6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1', arrows: [['f7', 'h8']], marks: ['h8'] }
  },
  threat: {
    cat: 'tactic',
    en: { n: 'threat', a: 'a', d: 'Something you are ready to do on your next move if the opponent does not stop it, such as winning a piece or giving mate.', w: 'Always ask "what does my opponent threaten?" before you move. Making threats keeps the initiative.', x: 'With the queen on h5 and the bishop on c4, White threatens Qxf7# (the "Scholar’s Mate").' },
    es: { n: 'amenaza', a: 'una', d: 'Algo que estás listo para hacer en tu próxima jugada si el rival no lo impide, como ganar una pieza o dar mate.', w: 'Antes de jugar, pregúntate siempre: "¿qué amenaza mi rival?". Crear amenazas te da la iniciativa.', x: 'Con la dama en h5 y el alfil en c4, las blancas amenazan Dxf7# (el "mate del pastor").' },
    demo: { moves: 'e4 e5 Qh5 Nc6 Bc4', arrows: [['h5', 'f7'], ['c4', 'f7']], marks: ['f7'] }
  },
  trade: {
    cat: 'tactic',
    en: { n: 'trade', a: 'a', d: 'Exchanging pieces of equal value: you capture one of theirs and they capture one of yours.', w: 'Trade when you are ahead in material (it simplifies the win) or to remove a strong enemy piece.', x: 'In the Exchange Variation of the Ruy López, White trades the bishop for the knight with Bxc6 dxc6.' },
    es: { n: 'cambio', a: 'un', d: 'Intercambiar piezas del mismo valor: capturas una del rival y él captura una tuya.', w: 'Cambia piezas cuando tengas ventaja de material (simplifica la victoria) o para eliminar una pieza rival fuerte.', x: 'En la Variante del Cambio de la Apertura Española, las blancas cambian alfil por caballo con Axc6 dxc6.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6', arrows: [], marks: ['c6'] }
  },
  winningExchange: {
    cat: 'tactic',
    en: { n: 'winning the exchange', a: '', d: 'Winning a rook (5 points) for a bishop or knight (3 points).', w: 'It is a material advantage of about two pawns — often enough to win in the long run.', x: 'The bishop on g2 captures the rook on a8: White gives nothing and wins the exchange.' },
    es: { n: 'ganar la calidad', a: '', d: 'Ganar una torre (5 puntos) a cambio de un alfil o un caballo (3 puntos).', w: 'Es una ventaja material de unos dos peones; a la larga suele bastar para ganar.', x: 'El alfil de g2 captura la torre de a8: las blancas ganan la calidad.' },
    demo: { fen: 'r3k3/8/8/8/8/8/6B1/4K3 w - - 0 1', arrows: [['g2', 'a8']], marks: ['a8'] }
  },

  // ---------------- Rules ----------------
  check: {
    cat: 'rule',
    en: { n: 'check', a: 'a', d: 'The king is attacked. The player in check must get out of it at once: move the king, block the attack, or capture the attacker.', w: 'Checks are forcing moves: the opponent has to respond, which you can use to set up tactics.', x: 'The rook on e1 gives check to the king on e8 along the e-file.' },
    es: { n: 'jaque', a: 'un', d: 'El rey está atacado. Quien está en jaque debe salir de él inmediatamente: mover el rey, tapar el ataque o capturar a la pieza atacante.', w: 'Los jaques son jugadas forzantes: el rival tiene que responder, y eso sirve para preparar tácticas.', x: 'La torre de e1 da jaque al rey de e8 por la columna e.' },
    demo: { fen: '4k3/8/8/8/8/8/8/4R1K1 b - - 0 1', arrows: [['e1', 'e8']], marks: ['e8'] }
  },
  checkmate: {
    cat: 'rule',
    en: { n: 'checkmate', a: 'a', d: 'The king is in check and there is no legal way to escape. The game is over.', w: 'Checkmate is the goal of the game — it wins no matter how much material is left.', x: 'Scholar’s Mate: 1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6?? 4.Qxf7#.' },
    es: { n: 'jaque mate', a: 'un', d: 'El rey está en jaque y no tiene ninguna forma legal de escapar. La partida termina.', w: 'El jaque mate es el objetivo del juego: gana sin importar el material que quede.', x: 'Mate del pastor: 1.e4 e5 2.Ac4 Cc6 3.Dh5 Cf6?? 4.Dxf7#.' },
    demo: { moves: 'e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7', arrows: [['c4', 'f7']], marks: ['e8'] }
  },
  stalemate: {
    cat: 'rule',
    en: { n: 'stalemate', a: 'a', d: 'The player to move is NOT in check but has no legal move. The game is a draw.', w: 'When you are winning, be careful not to stalemate; when you are losing, it can save the game.', x: 'Black king on h8, white queen on f7 and king on g6: Black is not in check but cannot move — draw.' },
    es: { n: 'ahogado', a: 'un', d: 'El jugador al que le toca mover NO está en jaque pero no tiene ninguna jugada legal (rey ahogado). La partida es tablas.', w: 'Si vas ganando, ten cuidado de no ahogar al rey rival; si vas perdiendo, puede salvarte la partida.', x: 'Rey negro en h8, dama blanca en f7 y rey blanco en g6: las negras no están en jaque pero no pueden mover. Tablas.' },
    demo: { fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', arrows: [], marks: ['h8'] }
  },
  castling: {
    cat: 'rule',
    en: { n: 'castling', a: '', d: 'A special move of king and rook: the king moves two squares toward a rook and the rook jumps over it. Kingside is O-O, queenside is O-O-O. Not allowed if the king or that rook has moved, if the king is in check, or if it passes through an attacked square.', w: 'It tucks the king into safety and brings the rook toward the center in one move.', x: 'With the squares f1 and g1 empty, White plays O-O: the king goes to g1 and the rook to f1.' },
    es: { n: 'enroque', a: 'un', d: 'Jugada especial del rey y una torre: el rey se desplaza dos casillas hacia la torre y la torre salta por encima. El enroque corto es O-O y el largo O-O-O. No se permite si el rey o esa torre ya se movieron, si el rey está en jaque o si pasa por una casilla atacada.', w: 'En una sola jugada pone al rey a salvo y acerca la torre al centro.', x: 'Con f1 y g1 libres, las blancas juegan O-O: el rey va a g1 y la torre a f1.' },
    demo: { fen: '4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1', arrows: [['e1', 'g1'], ['h1', 'f1']], marks: [] }
  },
  enPassant: {
    cat: 'rule',
    en: { n: 'en passant', a: '', d: 'If a pawn moves two squares and lands next to an enemy pawn, that enemy pawn may capture it as if it had moved only one square — but only on the very next move.', w: 'It stops pawns from sneaking past enemy pawns with the double step.', x: 'Black plays d7-d5 next to the white pawn on e5. White can answer exd6 en passant, removing the pawn from d5.' },
    es: { n: 'captura al paso', a: 'una', d: 'Si un peón avanza dos casillas y queda al lado de un peón rival, este puede capturarlo como si solo hubiera avanzado una, pero únicamente en la jugada inmediata.', w: 'Impide que los peones esquiven a los peones rivales con el avance doble.', x: 'Las negras juegan d7-d5 junto al peón blanco de e5. Las blancas pueden responder exd6 capturando al paso y retirando el peón de d5.' },
    demo: { fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', arrows: [['e5', 'd6']], marks: ['d5'] }
  },
  promotion: {
    cat: 'rule',
    en: { n: 'promotion', a: 'a', d: 'When a pawn reaches the last rank it becomes a queen, rook, bishop or knight (your choice). Choosing something other than a queen is called underpromotion.', w: 'A new queen usually decides the game, so passed pawns are very valuable.', x: 'The pawn on e7 moves to e8 and becomes a queen.' },
    es: { n: 'coronación', a: 'una', d: 'Cuando un peón llega a la última fila se convierte en dama, torre, alfil o caballo (a tu elección). Elegir otra pieza que no sea la dama se llama subpromoción.', w: 'Una dama nueva suele decidir la partida, por eso los peones pasados valen tanto.', x: 'El peón de e7 avanza a e8 y corona dama.' },
    demo: { fen: '8/4P3/8/8/8/2k5/8/4K3 w - - 0 1', arrows: [['e7', 'e8']], marks: ['e8'] }
  },
  threefold: {
    cat: 'rule',
    en: { n: 'threefold repetition', a: '', d: 'If the same position appears three times with the same player to move, the game is a draw.', w: 'A losing player can save the game by repeating moves, for example with perpetual check.', x: 'Both players move their knights out and back twice: the starting position repeats and the game is drawn.' },
    es: { n: 'triple repetición', a: 'una', d: 'Si la misma posición se repite tres veces con el mismo jugador al turno, la partida es tablas.', w: 'Quien va perdiendo puede salvarse repitiendo jugadas, por ejemplo con un jaque perpetuo.', x: 'Ambos jugadores sacan sus caballos y los devuelven dos veces: la posición inicial se repite y es tablas.' }
  },
  fiftyMove: {
    cat: 'rule',
    en: { n: 'fifty-move rule', a: 'the', d: 'If 50 moves by each player pass without any capture or pawn move, the game is a draw.', w: 'It stops endless games when nobody can make progress.', x: 'King and rook against king and rook: after 50 moves each without captures or pawn moves, it is a draw.' },
    es: { n: 'regla de los 50 movimientos', a: 'la', d: 'Si pasan 50 jugadas de cada jugador sin capturas ni movimientos de peón, la partida es tablas.', w: 'Evita partidas interminables cuando nadie puede progresar.', x: 'Rey y torre contra rey y torre: tras 50 jugadas de cada bando sin capturas ni movimientos de peón, son tablas.' }
  },
  insufficient: {
    cat: 'rule',
    en: { n: 'insufficient material', a: '', d: 'When neither side has enough pieces to checkmate (for example king and bishop against king), the game is a draw.', w: 'Knowing which endings are drawn helps you decide what to trade.', x: 'King and bishop against a lone king cannot force mate — draw.' },
    es: { n: 'material insuficiente', a: '', d: 'Cuando ningún bando tiene piezas suficientes para dar mate (por ejemplo, rey y alfil contra rey), la partida es tablas.', w: 'Saber qué finales son tablas te ayuda a decidir qué cambiar.', x: 'Rey y alfil contra rey solo no pueden forzar el mate: tablas.' },
    demo: { fen: '8/8/3k4/8/8/4KB2/8/8 w - - 0 1', arrows: [], marks: [] }
  },
  notation: {
    cat: 'rule',
    en: { n: 'algebraic notation', a: '', d: 'The standard way to write moves: piece letter (K king, Q queen, R rook, B bishop, N knight, nothing for pawns) plus the square. "x" means capture, "+" check, "#" checkmate, O-O castling.', w: 'It lets you record games, read books, and replay what happened.', x: 'Nf3 = knight to f3; Bxc6 = bishop captures on c6; exd5 = the e-pawn captures on d5.' },
    es: { n: 'notación algebraica', a: 'la', d: 'La forma estándar de anotar jugadas: letra de la pieza (R rey, D dama, T torre, A alfil, C caballo y nada para los peones) más la casilla. "x" indica captura, "+" jaque, "#" jaque mate y O-O enroque.', w: 'Te permite anotar tus partidas, leer libros y reproducir lo que pasó.', x: 'Cf3 = caballo a f3; Axc6 = el alfil captura en c6; exd5 = el peón e captura en d5.' }
  },

  // ---------------- Principles ----------------
  centerControl: {
    cat: 'principle',
    en: { n: 'controlling the center', a: '', d: 'Occupying or attacking the central squares e4, d4, e5 and d5 with pawns and pieces.', w: 'Pieces in the center reach more squares and can quickly switch to either side of the board.', x: '1.e4 and 2.d4 put two pawns in the center; knights on f3 and c3 also attack central squares.' },
    es: { n: 'control del centro', a: 'el', d: 'Ocupar o atacar las casillas centrales e4, d4, e5 y d5 con peones y piezas.', w: 'Desde el centro las piezas alcanzan más casillas y pueden ir rápidamente a cualquier flanco.', x: '1.e4 y 2.d4 colocan dos peones en el centro; los caballos en f3 y c3 también atacan casillas centrales.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 d4', arrows: [], marks: ['d4', 'e4', 'd5', 'e5'] }
  },
  development: {
    cat: 'principle',
    en: { n: 'development', a: '', d: 'Bringing your knights and bishops off the back rank into active positions during the opening.', w: 'A developed army is ready to attack and defend; the side that develops faster usually gets the initiative.', x: 'After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 both sides have developed two pieces.' },
    es: { n: 'desarrollo', a: 'el', d: 'Sacar los caballos y alfiles de la primera fila a casillas activas durante la apertura.', w: 'Un ejército desarrollado está listo para atacar y defender; quien se desarrolla más rápido suele tener la iniciativa.', x: 'Tras 1.e4 e5 2.Cf3 Cc6 3.Ac4 Ac5 ambos bandos han desarrollado dos piezas.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5', arrows: [], marks: ['f3', 'c4', 'c6', 'c5'] }
  },
  kingSafety: {
    cat: 'principle',
    en: { n: 'king safety', a: '', d: 'Keeping your king protected — usually castled behind a wall of pawns — and not opening lines toward it.', w: 'If your king is exposed, the opponent can attack it with checks and tactics. Many games are lost because of it.', x: 'After castling, the white king on g1 is protected by the pawns on f2, g2 and h2.' },
    es: { n: 'seguridad del rey', a: 'la', d: 'Mantener a tu rey protegido (normalmente enrocado tras una muralla de peones) y no abrir líneas hacia él.', w: 'Si tu rey está expuesto, el rival puede atacarlo con jaques y tácticas. Muchas partidas se pierden por eso.', x: 'Tras enrocar, el rey blanco de g1 está protegido por los peones de f2, g2 y h2.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 O-O Nf6', arrows: [], marks: ['g1', 'f2', 'g2', 'h2'] }
  },
  castleEarly: {
    cat: 'principle',
    en: { n: 'castling early', a: '', d: 'Castling in the first ten or so moves, once the knight and bishop between king and rook have moved.', w: 'It gets the king out of the center before the position opens, and connects your rooks.', x: 'In the Italian Game White develops Nf3 and Bc4 and castles on move 4.' },
    es: { n: 'enrocar pronto', a: '', d: 'Enrocar en las primeras diez jugadas, una vez que el caballo y el alfil entre el rey y la torre se han movido.', w: 'Saca al rey del centro antes de que la posición se abra y conecta tus torres.', x: 'En la Apertura Italiana las blancas desarrollan Cf3 y Ac4 y enrocan en la jugada 4.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5', arrows: [['e1', 'g1'], ['h1', 'f1']], marks: [] }
  },
  passedPawn: {
    cat: 'principle',
    en: { n: 'passed pawn', a: 'a', d: 'A pawn with no enemy pawns in front of it on its own file or the neighbouring files.', w: 'Nothing but pieces can stop it, so it threatens to promote. "Passed pawns must be pushed!"', x: 'The white pawn on d5 has no black pawns on the c, d or e files: it is passed and can run to d8.' },
    es: { n: 'peón pasado', a: 'un', d: 'Un peón que no tiene peones rivales delante, ni en su columna ni en las columnas vecinas.', w: 'Solo las piezas pueden detenerlo, así que amenaza con coronar. "¡Los peones pasados deben avanzar!"', x: 'El peón blanco de d5 no tiene peones negros en las columnas c, d ni e: es pasado y puede correr hacia d8.' },
    demo: { fen: '4k3/5ppp/8/3P4/8/8/5PPP/4K3 w - - 0 1', arrows: [['d5', 'd8']], marks: ['d5'] }
  },
  openFile: {
    cat: 'principle',
    en: { n: 'open file', a: 'an', d: 'A column (file) with no pawns on it.', w: 'Rooks and queens are strongest on open files, where they can travel deep into enemy territory.', x: 'With no pawns on the d-file, the rook on d1 controls it all the way to d8.' },
    es: { n: 'columna abierta', a: 'una', d: 'Una columna en la que no hay peones.', w: 'Las torres y la dama son más fuertes en las columnas abiertas, desde donde penetran en el campo rival.', x: 'Sin peones en la columna d, la torre de d1 la controla hasta d8.' },
    demo: { fen: '3r2k1/ppp2ppp/8/8/8/8/PPP2PPP/3R2K1 w - - 0 1', arrows: [['d1', 'd7']], marks: [] }
  },
  earlyQueen: {
    cat: 'principle',
    en: { n: 'bringing the queen out early', a: '', d: 'Moving the queen in the first few moves, before the minor pieces are developed.', w: 'The opponent can attack the queen with developing moves, gaining time while yours keeps running away.', x: '1.e4 d5 2.exd5 Qxd5 3.Nc3! attacks the queen, so Black must move it again.' },
    es: { n: 'sacar la dama pronto', a: '', d: 'Mover la dama en las primeras jugadas, antes de desarrollar las piezas menores.', w: 'El rival puede atacarla con jugadas de desarrollo y ganar tiempos mientras tu dama huye.', x: '1.e4 d5 2.exd5 Dxd5 3.Cc3! ataca a la dama y las negras deben moverla otra vez.' },
    demo: { moves: 'e4 d5 exd5 Qxd5 Nc3', arrows: [['c3', 'd5']], marks: ['d5'] }
  },
  tempo: {
    cat: 'principle',
    en: { n: 'tempo', a: 'a', d: 'A unit of time in chess: one move. You "gain a tempo" when you develop while forcing the opponent to waste a move, and "lose a tempo" when you move the same piece twice without need.', w: 'In the opening, being a move ahead in development can decide the fight.', x: 'After 3.Nc3 attacks the queen on d5, White develops and Black loses a tempo moving the queen again.' },
    es: { n: 'tiempo', a: 'un', d: 'La unidad de tiempo en ajedrez: una jugada (también se dice tempo). "Ganas un tiempo" cuando te desarrollas obligando al rival a perder una jugada, y "pierdes un tiempo" si mueves la misma pieza dos veces sin necesidad.', w: 'En la apertura, ir una jugada por delante en el desarrollo puede decidir la lucha.', x: 'Tras 3.Cc3 atacando a la dama de d5, las blancas se desarrollan y las negras pierden un tiempo moviendo otra vez la dama.' },
    demo: { moves: 'e4 d5 exd5 Qxd5 Nc3 Qa5', arrows: [['d5', 'a5']], marks: ['c3'] }
  },
  fianchetto: {
    cat: 'principle',
    en: { n: 'fianchetto', a: 'a', d: 'Developing a bishop to b2 or g2 (b7 or g7 for Black) after moving the knight’s pawn one square.', w: 'The bishop controls the long diagonal and helps protect the castled king.', x: '1.Nf3 d5 2.g3 Nf6 3.Bg2: the bishop on g2 aims along the long diagonal toward a8.' },
    es: { n: 'fianchetto', a: 'un', d: 'Desarrollar un alfil a b2 o g2 (b7 o g7 con negras) tras avanzar una casilla el peón de caballo.', w: 'El alfil controla la gran diagonal y ayuda a proteger al rey enrocado.', x: '1.Cf3 d5 2.g3 Cf6 3.Ag2: el alfil de g2 apunta por la gran diagonal hacia a8.' },
    demo: { moves: 'Nf3 d5 g3 Nf6 Bg2', arrows: [['g2', 'd5']], marks: ['g2', 'g3'] }
  },
  kingActivity: {
    cat: 'principle',
    en: { n: 'active king', a: 'an', d: 'In the endgame, when queens are gone, the king becomes a fighting piece and should walk toward the center.', w: 'An active king attacks pawns and supports your own passed pawns.', x: 'With few pieces left, the white king on d4 dominates the center and supports the c-pawn.' },
    es: { n: 'rey activo', a: 'un', d: 'En el final, cuando ya no hay damas, el rey se convierte en una pieza de combate y debe ir hacia el centro.', w: 'Un rey activo ataca peones y apoya a tus peones pasados.', x: 'Con pocas piezas en el tablero, el rey blanco de d4 domina el centro y apoya al peón c.' },
    demo: { fen: '8/8/4k3/8/3K4/2P5/8/8 w - - 0 1', arrows: [], marks: ['d4'] }
  },
  materialValue: {
    cat: 'principle',
    en: { n: 'piece values', a: '', d: 'A guide to how much each piece is worth: pawn 1, knight 3, bishop 3, rook 5, queen 9. The king is priceless.', w: 'It helps you judge trades: giving a knight (3) for a rook (5) is good business.', x: 'Capturing a rook with a bishop wins about 2 points of material.' },
    es: { n: 'valor de las piezas', a: 'el', d: 'Una guía de cuánto vale cada pieza: peón 1, caballo 3, alfil 3, torre 5, dama 9. El rey no tiene precio.', w: 'Te ayuda a valorar los cambios: dar un caballo (3) por una torre (5) es buen negocio.', x: 'Capturar una torre con un alfil gana unos 2 puntos de material.' }
  },

  // ---------------- Move ratings ----------------
  brilliant: {
    cat: 'rating',
    en: { n: 'Brilliant', a: 'a', d: 'The best move, and it involves a clever sacrifice or a move that is very hard to find.', w: 'Brilliant moves win games that look "normal" on the surface.', x: 'Sacrificing a rook to force checkmate a few moves later.' },
    es: { n: 'Brillante', a: 'una jugada', d: 'La mejor jugada, e incluye un sacrificio ingenioso o una idea muy difícil de encontrar.', w: 'Las jugadas brillantes ganan partidas que en apariencia son "normales".', x: 'Sacrificar una torre para forzar el mate pocas jugadas después.' }
  },
  great: {
    cat: 'rating',
    en: { n: 'Great move', a: 'a', d: 'The best move in a position where it really mattered — a tactic, or the only good move.', w: 'Finding these moves is what separates strong players from average ones.', x: 'Spotting a fork that wins the opponent’s queen.' },
    es: { n: 'Gran jugada', a: 'una', d: 'La mejor jugada en una posición donde era importante: una táctica o la única jugada buena.', w: 'Encontrar estas jugadas es lo que distingue a los jugadores fuertes.', x: 'Ver una horquilla que gana la dama rival.' }
  },
  good: {
    cat: 'rating',
    en: { n: 'Good move', a: 'a', d: 'A solid move that keeps your position healthy — the best move or very close to it.', w: 'Consistently good moves win games against most opponents.', x: 'Developing a knight toward the center in the opening.' },
    es: { n: 'Buena jugada', a: 'una', d: 'Una jugada sólida que mantiene tu posición sana: la mejor o muy cerca de ella.', w: 'Hacer buenas jugadas con regularidad gana partidas contra la mayoría de rivales.', x: 'Desarrollar un caballo hacia el centro en la apertura.' }
  },
  inaccuracy: {
    cat: 'rating',
    en: { n: 'Inaccuracy', a: 'an', d: 'A playable move, but a better one was available. It gives away a small part of your advantage.', w: 'Inaccuracies add up; spotting them helps you play more precisely.', x: 'Moving a pawn on the edge when developing a piece was more useful.' },
    es: { n: 'Imprecisión', a: 'una', d: 'Una jugada aceptable, pero había otra mejor. Cedes una pequeña parte de tu ventaja.', w: 'Las imprecisiones se acumulan; detectarlas te ayuda a jugar con más precisión.', x: 'Mover un peón de la banda cuando era más útil desarrollar una pieza.' }
  },
  mistake: {
    cat: 'rating',
    en: { n: 'Mistake', a: 'a', d: 'A bad move that noticeably worsens your position, often allowing a tactic or losing material.', w: 'Learning why it was a mistake is the fastest way to improve.', x: 'Moving a defender away so an enemy piece can win a pawn or the exchange.' },
    es: { n: 'Error', a: 'un', d: 'Una mala jugada que empeora claramente tu posición; a menudo permite una táctica o pierde material.', w: 'Entender por qué fue un error es la forma más rápida de mejorar.', x: 'Retirar un defensor y permitir que una pieza rival gane un peón o la calidad.' }
  },
  blunder: {
    cat: 'rating',
    en: { n: 'Blunder', a: 'a', d: 'A serious mistake that loses a lot of material or allows checkmate.', w: 'Before every move, check for checks, captures and threats — that prevents most blunders.', x: 'Leaving your queen where a pawn can capture it.' },
    es: { n: 'Error grave', a: 'un', d: 'Un error serio que pierde mucho material o permite el jaque mate.', w: 'Antes de cada jugada revisa jaques, capturas y amenazas: así se evitan la mayoría de errores graves.', x: 'Dejar tu dama donde un peón puede capturarla.' }
  },

  // ---------------- Openings ----------------
  kingsPawn: {
    cat: 'opening',
    en: { n: 'King’s Pawn Opening', the: 'the', d: 'The most popular first move: 1.e4.', w: 'It grabs the center and opens lines for the queen and the light-squared bishop.', x: '1.e4 — Black usually answers 1...e5, 1...c5, 1...e6 or 1...c6.' },
    es: { n: 'Apertura de Peón de Rey', the: 'la', d: 'La primera jugada más popular: 1.e4.', w: 'Ocupa el centro y abre líneas para la dama y el alfil de casillas blancas.', x: '1.e4: las negras suelen responder 1...e5, 1...c5, 1...e6 o 1...c6.' },
    demo: { moves: 'e4', arrows: [], marks: ['e4'] }
  },
  queensPawn: {
    cat: 'opening',
    en: { n: 'Queen’s Pawn Opening', the: 'the', d: 'Starting with 1.d4.', w: 'The d-pawn is already protected by the queen, so it leads to solid, strategic positions.', x: '1.d4 d5 or 1.d4 Nf6 are the main answers.' },
    es: { n: 'Apertura de Peón de Dama', the: 'la', d: 'Empezar con 1.d4.', w: 'El peón d ya está protegido por la dama, por lo que lleva a posiciones sólidas y estratégicas.', x: '1.d4 d5 o 1.d4 Cf6 son las respuestas principales.' },
    demo: { moves: 'd4', arrows: [], marks: ['d4'] }
  },
  english: {
    cat: 'opening',
    en: { n: 'English Opening', the: 'the', d: 'Starting with 1.c4.', w: 'It controls d5 from the side and keeps flexible options.', x: '1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6.' },
    es: { n: 'Apertura Inglesa', the: 'la', d: 'Empezar con 1.c4.', w: 'Controla d5 desde el flanco y mantiene opciones flexibles.', x: '1.c4 e5 2.Cc3 Cf6 3.Cf3 Cc6.' },
    demo: { moves: 'c4 e5 Nc3 Nf6', arrows: [], marks: ['c4'] }
  },
  reti: {
    cat: 'opening',
    en: { n: 'Réti Opening', the: 'the', d: 'Starting with 1.Nf3, often followed by c4 and a kingside fianchetto.', w: 'White controls the center with pieces from a distance instead of occupying it with pawns.', x: '1.Nf3 d5 2.c4.' },
    es: { n: 'Apertura Réti', the: 'la', d: 'Empezar con 1.Cf3, a menudo seguido de c4 y un fianchetto en el flanco de rey.', w: 'Las blancas controlan el centro a distancia con piezas, en lugar de ocuparlo con peones.', x: '1.Cf3 d5 2.c4.' },
    demo: { moves: 'Nf3 d5 c4', arrows: [['c4', 'd5']], marks: [] }
  },
  bird: {
    cat: 'opening',
    en: { n: 'Bird’s Opening', the: 'the', d: 'Starting with 1.f4.', w: 'It controls e5 and prepares a kingside attack, at the cost of weakening the king a little.', x: '1.f4 d5 2.Nf3 Nf6.' },
    es: { n: 'Apertura Bird', the: 'la', d: 'Empezar con 1.f4.', w: 'Controla e5 y prepara un ataque en el flanco de rey, a costa de debilitar un poco al rey.', x: '1.f4 d5 2.Cf3 Cf6.' },
    demo: { moves: 'f4', arrows: [], marks: ['f4', 'e5'] }
  },
  italian: {
    cat: 'opening',
    en: { n: 'Italian Game', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Bc4.', w: 'Quick development, the bishop aims at f7 (Black’s weakest point) and White can castle early.', x: '3...Bc5 is the Giuoco Piano; 3...Nf6 is the Two Knights Defense.' },
    es: { n: 'Apertura Italiana', the: 'la', d: '1.e4 e5 2.Cf3 Cc6 3.Ac4.', w: 'Desarrollo rápido; el alfil apunta a f7 (el punto más débil de las negras) y las blancas pueden enrocar pronto.', x: '3...Ac5 es el Giuoco Piano; 3...Cf6 es la Defensa de los Dos Caballos.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4', arrows: [['c4', 'f7']], marks: [] }
  },
  giuocoPiano: {
    cat: 'opening',
    en: { n: 'Giuoco Piano', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 — "the quiet game" in Italian.', w: 'Both sides develop naturally; White often plays c3 and d4 to build a big center.', x: '4.c3 Nf6 5.d4 is the classical main line.' },
    es: { n: 'Giuoco Piano', the: 'el', d: '1.e4 e5 2.Cf3 Cc6 3.Ac4 Ac5: "el juego tranquilo" en italiano.', w: 'Ambos bandos se desarrollan con naturalidad; las blancas suelen jugar c3 y d4 para formar un gran centro.', x: '4.c3 Cf6 5.d4 es la línea principal clásica.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5', arrows: [['c4', 'f7'], ['c5', 'f2']], marks: [] }
  },
  twoKnights: {
    cat: 'opening',
    en: { n: 'Two Knights Defense', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6.', w: 'Black counterattacks the e4 pawn immediately, leading to sharp play.', x: '4.Ng5 attacks f7, and Black usually answers 4...d5.' },
    es: { n: 'Defensa de los Dos Caballos', the: 'la', d: '1.e4 e5 2.Cf3 Cc6 3.Ac4 Cf6.', w: 'Las negras contraatacan enseguida el peón de e4, con juego agudo.', x: '4.Cg5 ataca f7 y las negras suelen responder 4...d5.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Nf6', arrows: [['f6', 'e4']], marks: [] }
  },
  evans: {
    cat: 'opening',
    en: { n: 'Evans Gambit', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4.', w: 'White gives a pawn to gain time and build a strong center with c3 and d4.', x: '4...Bxb4 5.c3 Ba5 6.d4.' },
    es: { n: 'Gambito Evans', the: 'el', d: '1.e4 e5 2.Cf3 Cc6 3.Ac4 Ac5 4.b4.', w: 'Las blancas entregan un peón para ganar tiempos y formar un centro fuerte con c3 y d4.', x: '4...Axb4 5.c3 Aa5 6.d4.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4', arrows: [['b4', 'c5']], marks: ['b4'] }
  },
  ruyLopez: {
    cat: 'opening',
    en: { n: 'Ruy López (Spanish Opening)', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Bb5.', w: 'The bishop pressures the knight that defends e5. It is one of the oldest and deepest openings.', x: '3...a6 4.Ba4 Nf6 5.O-O is the main line.' },
    es: { n: 'Apertura Española (Ruy López)', the: 'la', d: '1.e4 e5 2.Cf3 Cc6 3.Ab5.', w: 'El alfil presiona al caballo que defiende e5. Es una de las aperturas más antiguas y profundas.', x: '3...a6 4.Aa4 Cf6 5.O-O es la línea principal.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Bb5', arrows: [['b5', 'c6'], ['c6', 'e5']], marks: [] }
  },
  scotch: {
    cat: 'opening',
    en: { n: 'Scotch Game', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.d4.', w: 'White opens the center at once and gets free development.', x: '3...exd4 4.Nxd4.' },
    es: { n: 'Apertura Escocesa', the: 'la', d: '1.e4 e5 2.Cf3 Cc6 3.d4.', w: 'Las blancas abren el centro de inmediato y logran un desarrollo libre.', x: '3...exd4 4.Cxd4.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 d4', arrows: [['d4', 'e5']], marks: [] }
  },
  fourKnights: {
    cat: 'opening',
    en: { n: 'Four Knights Game', the: 'the', d: '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6.', w: 'Simple, symmetrical development — great for learning the basic principles.', x: '4.Bb5 (the Spanish Four Knights) or 4.d4.' },
    es: { n: 'Partida de los Cuatro Caballos', the: 'la', d: '1.e4 e5 2.Cf3 Cc6 3.Cc3 Cf6.', w: 'Desarrollo sencillo y simétrico: ideal para aprender los principios básicos.', x: '4.Ab5 (Cuatro Caballos Española) o 4.d4.' },
    demo: { moves: 'e4 e5 Nf3 Nc6 Nc3 Nf6', arrows: [], marks: ['c3', 'f3', 'c6', 'f6'] }
  },
  petrov: {
    cat: 'opening',
    en: { n: 'Petrov’s Defense', the: 'the', d: '1.e4 e5 2.Nf3 Nf6 (also called the Russian Defense).', w: 'Black counterattacks e4 instead of defending e5; very solid.', x: '3.Nxe5 d6! 4.Nf3 Nxe4 — careful: 3...Nxe4? 4.Qe2 is a known trap.' },
    es: { n: 'Defensa Petrov', the: 'la', d: '1.e4 e5 2.Cf3 Cf6 (también llamada Defensa Rusa).', w: 'Las negras contraatacan e4 en lugar de defender e5; es muy sólida.', x: '3.Cxe5 d6! 4.Cf3 Cxe4. Cuidado: 3...Cxe4? 4.De2 es una trampa conocida.' },
    demo: { moves: 'e4 e5 Nf3 Nf6', arrows: [['f6', 'e4'], ['f3', 'e5']], marks: [] }
  },
  philidor: {
    cat: 'opening',
    en: { n: 'Philidor Defense', the: 'the', d: '1.e4 e5 2.Nf3 d6.', w: 'Black solidly protects e5, though the position is a bit passive.', x: '3.d4 exd4 4.Nxd4 Nf6 5.Nc3.' },
    es: { n: 'Defensa Philidor', the: 'la', d: '1.e4 e5 2.Cf3 d6.', w: 'Las negras protegen e5 con solidez, aunque la posición es algo pasiva.', x: '3.d4 exd4 4.Cxd4 Cf6 5.Cc3.' },
    demo: { moves: 'e4 e5 Nf3 d6', arrows: [], marks: ['d6', 'e5'] }
  },
  kingsGambit: {
    cat: 'opening',
    en: { n: 'King’s Gambit', the: 'the', d: '1.e4 e5 2.f4.', w: 'White offers a pawn to open the f-file and build a big center — an aggressive, romantic opening.', x: '2...exf4 3.Nf3 is the King’s Gambit Accepted.' },
    es: { n: 'Gambito de Rey', the: 'el', d: '1.e4 e5 2.f4.', w: 'Las blancas ofrecen un peón para abrir la columna f y formar un gran centro: una apertura agresiva y romántica.', x: '2...exf4 3.Cf3 es el Gambito de Rey Aceptado.' },
    demo: { moves: 'e4 e5 f4', arrows: [['f4', 'e5']], marks: ['f4'] }
  },
  vienna: {
    cat: 'opening',
    en: { n: 'Vienna Game', the: 'the', d: '1.e4 e5 2.Nc3.', w: 'White develops and keeps the option of f4 for a kingside attack.', x: '2...Nf6 3.f4 is the Vienna Gambit.' },
    es: { n: 'Apertura Vienesa', the: 'la', d: '1.e4 e5 2.Cc3.', w: 'Las blancas se desarrollan y mantienen la opción de f4 para atacar en el flanco de rey.', x: '2...Cf6 3.f4 es el Gambito Vienés.' },
    demo: { moves: 'e4 e5 Nc3', arrows: [], marks: ['c3'] }
  },
  bishopsOpening: {
    cat: 'opening',
    en: { n: 'Bishop’s Opening', the: 'the', d: '1.e4 e5 2.Bc4.', w: 'The bishop immediately eyes f7 while keeping the f-pawn free to move.', x: '2...Nf6 3.d3.' },
    es: { n: 'Apertura de Alfil', the: 'la', d: '1.e4 e5 2.Ac4.', w: 'El alfil apunta enseguida a f7 y deja libre el peón f.', x: '2...Cf6 3.d3.' },
    demo: { moves: 'e4 e5 Bc4', arrows: [['c4', 'f7']], marks: [] }
  },
  sicilian: {
    cat: 'opening',
    en: { n: 'Sicilian Defense', the: 'the', d: '1.e4 c5.', w: 'Black fights for d4 from the side and creates an unbalanced game — the most popular and combative answer to 1.e4.', x: '2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 (the Open Sicilian).' },
    es: { n: 'Defensa Siciliana', the: 'la', d: '1.e4 c5.', w: 'Las negras luchan por d4 desde el flanco y crean una partida desequilibrada: es la respuesta más popular y combativa a 1.e4.', x: '2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 (la Siciliana Abierta).' },
    demo: { moves: 'e4 c5', arrows: [['c5', 'd4']], marks: [] }
  },
  najdorf: {
    cat: 'opening',
    en: { n: 'Najdorf Variation', the: 'the', d: 'Sicilian Defense with 5...a6: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6.', w: 'A flexible move that controls b5 and prepares ...e5 or ...b5. A favorite of world champions.', x: '6.Be3 e5 7.Nb3 Be6.' },
    es: { n: 'Variante Najdorf', the: 'la', d: 'Defensa Siciliana con 5...a6: 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6.', w: 'Una jugada flexible que controla b5 y prepara ...e5 o ...b5. Favorita de campeones del mundo.', x: '6.Ae3 e5 7.Cb3 Ae6.' },
    demo: { moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', arrows: [], marks: ['a6'] }
  },
  dragon: {
    cat: 'opening',
    en: { n: 'Dragon Variation', the: 'the', d: 'Sicilian Defense with ...g6 and ...Bg7: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6.', w: 'The fianchettoed bishop breathes fire along the long diagonal; games are often sharp attacks on opposite sides.', x: '6.Be3 Bg7 7.f3 O-O 8.Qd2 (the Yugoslav Attack).' },
    es: { n: 'Variante del Dragón', the: 'la', d: 'Defensa Siciliana con ...g6 y ...Ag7: 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6.', w: 'El alfil en fianchetto "escupe fuego" por la gran diagonal; suelen ser partidas con ataques en flancos opuestos.', x: '6.Ae3 Ag7 7.f3 O-O 8.Dd2 (el Ataque Yugoslavo).' },
    demo: { moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6', arrows: [], marks: ['g6'] }
  },
  alapin: {
    cat: 'opening',
    en: { n: 'Alapin Sicilian', the: 'the', d: '1.e4 c5 2.c3.', w: 'White prepares d4 to build a classical pawn center and avoids the main Sicilian theory.', x: '2...Nf6 3.e5 Nd5 4.d4.' },
    es: { n: 'Variante Alapin', the: 'la', d: '1.e4 c5 2.c3.', w: 'Las blancas preparan d4 para formar un centro clásico de peones y evitan la teoría principal de la Siciliana.', x: '2...Cf6 3.e5 Cd5 4.d4.' },
    demo: { moves: 'e4 c5 c3', arrows: [], marks: ['c3', 'd4'] }
  },
  french: {
    cat: 'opening',
    en: { n: 'French Defense', the: 'the', d: '1.e4 e6, followed by ...d5.', w: 'A solid pawn chain; Black counterattacks White’s center later with ...c5.', x: '2.d4 d5 3.Nc3 or 3.e5 (Advance Variation).' },
    es: { n: 'Defensa Francesa', the: 'la', d: '1.e4 e6, seguido de ...d5.', w: 'Una cadena de peones sólida; más tarde las negras contraatacan el centro con ...c5.', x: '2.d4 d5 3.Cc3 o 3.e5 (Variante del Avance).' },
    demo: { moves: 'e4 e6 d4 d5', arrows: [], marks: ['e6', 'd5'] }
  },
  caroKann: {
    cat: 'opening',
    en: { n: 'Caro-Kann Defense', the: 'the', d: '1.e4 c6, followed by ...d5.', w: 'Very solid: Black challenges the center while keeping the light-squared bishop free.', x: '2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5.' },
    es: { n: 'Defensa Caro-Kann', the: 'la', d: '1.e4 c6, seguido de ...d5.', w: 'Muy sólida: las negras disputan el centro y dejan libre el alfil de casillas blancas.', x: '2.d4 d5 3.Cc3 dxe4 4.Cxe4 Af5.' },
    demo: { moves: 'e4 c6 d4 d5', arrows: [['d5', 'e4']], marks: [] }
  },
  scandinavian: {
    cat: 'opening',
    en: { n: 'Scandinavian Defense', the: 'the', d: '1.e4 d5.', w: 'Black challenges e4 at once, but after 2.exd5 Qxd5 the queen can be chased.', x: '2.exd5 Qxd5 3.Nc3 Qa5.' },
    es: { n: 'Defensa Escandinava', the: 'la', d: '1.e4 d5.', w: 'Las negras desafían e4 de inmediato, pero tras 2.exd5 Dxd5 la dama puede ser hostigada.', x: '2.exd5 Dxd5 3.Cc3 Da5.' },
    demo: { moves: 'e4 d5', arrows: [['e4', 'd5']], marks: [] }
  },
  alekhine: {
    cat: 'opening',
    en: { n: 'Alekhine’s Defense', the: 'the', d: '1.e4 Nf6.', w: 'Black invites White’s pawns forward, hoping to attack them later as overextended targets.', x: '2.e5 Nd5 3.d4 d6.' },
    es: { n: 'Defensa Alekhine', the: 'la', d: '1.e4 Cf6.', w: 'Las negras invitan a los peones blancos a avanzar para atacarlos después como objetivos sobreextendidos.', x: '2.e5 Cd5 3.d4 d6.' },
    demo: { moves: 'e4 Nf6', arrows: [['f6', 'e4']], marks: [] }
  },
  pirc: {
    cat: 'opening',
    en: { n: 'Pirc Defense', the: 'the', d: '1.e4 d6 2.d4 Nf6 3.Nc3 g6.', w: 'Black lets White build a center and plans to strike it later from the flanks with a fianchettoed bishop.', x: '4.Nf3 Bg7 5.Be2 O-O.' },
    es: { n: 'Defensa Pirc', the: 'la', d: '1.e4 d6 2.d4 Cf6 3.Cc3 g6.', w: 'Las negras dejan que las blancas formen un centro y planean atacarlo después desde los flancos con un alfil en fianchetto.', x: '4.Cf3 Ag7 5.Ae2 O-O.' },
    demo: { moves: 'e4 d6 d4 Nf6 Nc3 g6', arrows: [], marks: ['g6'] }
  },
  modern: {
    cat: 'opening',
    en: { n: 'Modern Defense', the: 'the', d: '1.e4 g6.', w: 'A flexible, hypermodern setup: Black fianchettoes first and decides later how to fight the center.', x: '2.d4 Bg7 3.Nc3 d6.' },
    es: { n: 'Defensa Moderna', the: 'la', d: '1.e4 g6.', w: 'Un esquema flexible e hipermoderno: las negras hacen primero el fianchetto y deciden después cómo luchar por el centro.', x: '2.d4 Ag7 3.Cc3 d6.' },
    demo: { moves: 'e4 g6', arrows: [], marks: ['g6'] }
  },
  queensGambit: {
    cat: 'opening',
    en: { n: 'Queen’s Gambit', the: 'the', d: '1.d4 d5 2.c4.', w: 'White offers the c-pawn to pull Black’s d-pawn away from the center. It is not a real sacrifice: White usually gets the pawn back.', x: '2...e6 is the Queen’s Gambit Declined; 2...dxc4 is the Queen’s Gambit Accepted.' },
    es: { n: 'Gambito de Dama', the: 'el', d: '1.d4 d5 2.c4.', w: 'Las blancas ofrecen el peón c para desviar el peón d negro del centro. No es un sacrificio real: las blancas suelen recuperarlo.', x: '2...e6 es el Gambito de Dama Rehusado; 2...dxc4 es el Gambito de Dama Aceptado.' },
    demo: { moves: 'd4 d5 c4', arrows: [['c4', 'd5']], marks: [] }
  },
  qga: {
    cat: 'opening',
    en: { n: 'Queen’s Gambit Accepted', the: 'the', d: '1.d4 d5 2.c4 dxc4.', w: 'Black takes the pawn and gives up the center for a while, aiming for quick development and ...c5.', x: '3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5.' },
    es: { n: 'Gambito de Dama Aceptado', the: 'el', d: '1.d4 d5 2.c4 dxc4.', w: 'Las negras toman el peón y ceden el centro por un tiempo, buscando un desarrollo rápido y ...c5.', x: '3.Cf3 Cf6 4.e3 e6 5.Axc4 c5.' },
    demo: { moves: 'd4 d5 c4 dxc4', arrows: [], marks: ['c4'] }
  },
  qgd: {
    cat: 'opening',
    en: { n: 'Queen’s Gambit Declined', the: 'the', d: '1.d4 d5 2.c4 e6.', w: 'Black keeps a strong pawn on d5 — one of the most solid defenses in chess.', x: '3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O.' },
    es: { n: 'Gambito de Dama Rehusado', the: 'el', d: '1.d4 d5 2.c4 e6.', w: 'Las negras mantienen un peón fuerte en d5: una de las defensas más sólidas del ajedrez.', x: '3.Cc3 Cf6 4.Ag5 Ae7 5.e3 O-O.' },
    demo: { moves: 'd4 d5 c4 e6', arrows: [['e6', 'd5']], marks: [] }
  },
  slav: {
    cat: 'opening',
    en: { n: 'Slav Defense', the: 'the', d: '1.d4 d5 2.c4 c6.', w: 'Black supports d5 with a pawn and keeps the light-squared bishop free to develop.', x: '3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5.' },
    es: { n: 'Defensa Eslava', the: 'la', d: '1.d4 d5 2.c4 c6.', w: 'Las negras apoyan d5 con un peón y dejan libre el alfil de casillas blancas.', x: '3.Cf3 Cf6 4.Cc3 dxc4 5.a4 Af5.' },
    demo: { moves: 'd4 d5 c4 c6', arrows: [['c6', 'd5']], marks: [] }
  },
  london: {
    cat: 'opening',
    en: { n: 'London System', the: 'the', d: '1.d4 with an early Bf4, followed by e3, Nf3 and c3.', w: 'An easy-to-learn setup that works against almost anything Black plays.', x: '1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3.' },
    es: { n: 'Sistema Londres', the: 'el', d: '1.d4 con un temprano Af4, seguido de e3, Cf3 y c3.', w: 'Un esquema fácil de aprender que funciona contra casi todo lo que jueguen las negras.', x: '1.d4 d5 2.Af4 Cf6 3.e3 e6 4.Cf3 c5 5.c3.' },
    demo: { moves: 'd4 d5 Bf4 Nf6 e3 e6 Nf3', arrows: [], marks: ['f4', 'd4', 'e3'] }
  },
  indian: {
    cat: 'opening',
    en: { n: 'Indian Defense', the: 'the', d: '1.d4 Nf6 — the family of "Indian" defenses.', w: 'The knight stops e4 and keeps Black’s pawn structure flexible.', x: 'It can become the King’s Indian, Nimzo-Indian, Grünfeld and more.' },
    es: { n: 'Defensa India', the: 'la', d: '1.d4 Cf6: la familia de defensas "indias".', w: 'El caballo impide e4 y mantiene flexible la estructura de peones negra.', x: 'Puede transformarse en la India de Rey, la Nimzoindia, la Grünfeld y otras.' },
    demo: { moves: 'd4 Nf6', arrows: [['f6', 'e4']], marks: [] }
  },
  kingsIndian: {
    cat: 'opening',
    en: { n: 'King’s Indian Defense', the: 'the', d: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7.', w: 'Black lets White take the center, then attacks it with ...e5 or ...c5 and often launches a kingside attack.', x: '4.e4 d6 5.Nf3 O-O 6.Be2 e5.' },
    es: { n: 'Defensa India de Rey', the: 'la', d: '1.d4 Cf6 2.c4 g6 3.Cc3 Ag7.', w: 'Las negras ceden el centro y luego lo atacan con ...e5 o ...c5, a menudo con un ataque en el flanco de rey.', x: '4.e4 d6 5.Cf3 O-O 6.Ae2 e5.' },
    demo: { moves: 'd4 Nf6 c4 g6 Nc3 Bg7', arrows: [], marks: ['g7'] }
  },
  grunfeld: {
    cat: 'opening',
    en: { n: 'Grünfeld Defense', the: 'the', d: '1.d4 Nf6 2.c4 g6 3.Nc3 d5.', w: 'Black strikes at the center immediately and pressures it with the bishop on g7.', x: '4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7.' },
    es: { n: 'Defensa Grünfeld', the: 'la', d: '1.d4 Cf6 2.c4 g6 3.Cc3 d5.', w: 'Las negras golpean el centro de inmediato y lo presionan con el alfil de g7.', x: '4.cxd5 Cxd5 5.e4 Cxc3 6.bxc3 Ag7.' },
    demo: { moves: 'd4 Nf6 c4 g6 Nc3 d5', arrows: [['d5', 'c4']], marks: [] }
  },
  nimzoIndian: {
    cat: 'opening',
    en: { n: 'Nimzo-Indian Defense', the: 'the', d: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4.', w: 'The bishop pins the knight that wants to support e4, fighting for the center with pieces.', x: '4.e3 O-O 5.Bd3 d5.' },
    es: { n: 'Defensa Nimzoindia', the: 'la', d: '1.d4 Cf6 2.c4 e6 3.Cc3 Ab4.', w: 'El alfil clava al caballo que quiere apoyar e4 y lucha por el centro con piezas.', x: '4.e3 O-O 5.Ad3 d5.' },
    demo: { moves: 'd4 Nf6 c4 e6 Nc3 Bb4', arrows: [['b4', 'e1']], marks: ['c3'] }
  },
  queensIndian: {
    cat: 'opening',
    en: { n: 'Queen’s Indian Defense', the: 'the', d: '1.d4 Nf6 2.c4 e6 3.Nf3 b6.', w: 'Black fianchettoes the queen’s bishop to control e4 — very solid.', x: '4.g3 Bb7 5.Bg2 Be7.' },
    es: { n: 'Defensa India de Dama', the: 'la', d: '1.d4 Cf6 2.c4 e6 3.Cf3 b6.', w: 'Las negras hacen el fianchetto del alfil de dama para controlar e4; es muy sólida.', x: '4.g3 Ab7 5.Ag2 Ae7.' },
    demo: { moves: 'd4 Nf6 c4 e6 Nf3 b6', arrows: [], marks: ['b6'] }
  },
  catalan: {
    cat: 'opening',
    en: { n: 'Catalan Opening', the: 'the', d: '1.d4 Nf6 2.c4 e6 3.g3.', w: 'A Queen’s Gambit with a kingside fianchetto: the bishop on g2 presses on the long diagonal.', x: '3...d5 4.Bg2 Be7 5.Nf3 O-O.' },
    es: { n: 'Apertura Catalana', the: 'la', d: '1.d4 Cf6 2.c4 e6 3.g3.', w: 'Un Gambito de Dama con fianchetto en el flanco de rey: el alfil de g2 presiona en la gran diagonal.', x: '3...d5 4.Ag2 Ae7 5.Cf3 O-O.' },
    demo: { moves: 'd4 Nf6 c4 e6 g3 d5 Bg2', arrows: [['g2', 'b7']], marks: [] }
  },
  dutch: {
    cat: 'opening',
    en: { n: 'Dutch Defense', the: 'the', d: '1.d4 f5.', w: 'Black fights for e4 and prepares a kingside attack, accepting some weakness around the king.', x: '2.g3 Nf6 3.Bg2 e6 4.Nf3 Be7.' },
    es: { n: 'Defensa Holandesa', the: 'la', d: '1.d4 f5.', w: 'Las negras luchan por e4 y preparan un ataque en el flanco de rey, aceptando cierta debilidad alrededor del rey.', x: '2.g3 Cf6 3.Ag2 e6 4.Cf3 Ae7.' },
    demo: { moves: 'd4 f5', arrows: [], marks: ['f5', 'e4'] }
  },
  benoni: {
    cat: 'opening',
    en: { n: 'Benoni Defense', the: 'the', d: '1.d4 Nf6 2.c4 c5.', w: 'Black creates an unbalanced pawn structure and active piece play on the queenside.', x: '3.d5 e6 4.Nc3 exd5 5.cxd5 d6.' },
    es: { n: 'Defensa Benoni', the: 'la', d: '1.d4 Cf6 2.c4 c5.', w: 'Las negras crean una estructura de peones desequilibrada y juego activo de piezas en el flanco de dama.', x: '3.d5 e6 4.Cc3 exd5 5.cxd5 d6.' },
    demo: { moves: 'd4 Nf6 c4 c5', arrows: [['c5', 'd4']], marks: [] }
  },
  budapest: {
    cat: 'opening',
    en: { n: 'Budapest Gambit', the: 'the', d: '1.d4 Nf6 2.c4 e5.', w: 'Black offers a pawn for quick, active piece play and some tricky traps.', x: '3.dxe5 Ng4 4.Bf4 Nc6.' },
    es: { n: 'Gambito Budapest', the: 'el', d: '1.d4 Cf6 2.c4 e5.', w: 'Las negras ofrecen un peón a cambio de juego rápido y activo de piezas, con algunas trampas.', x: '3.dxe5 Cg4 4.Af4 Cc6.' },
    demo: { moves: 'd4 Nf6 c4 e5', arrows: [['e5', 'd4']], marks: [] }
  }
};

// Opening recognition: the longest matching prefix of the game wins.
const OPENINGS = [
  ['kingsPawn', 'e4'], ['queensPawn', 'd4'], ['english', 'c4'], ['reti', 'Nf3'], ['bird', 'f4'],
  ['italian', 'e4 e5 Nf3 Nc6 Bc4'], ['giuocoPiano', 'e4 e5 Nf3 Nc6 Bc4 Bc5'],
  ['twoKnights', 'e4 e5 Nf3 Nc6 Bc4 Nf6'], ['evans', 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4'],
  ['ruyLopez', 'e4 e5 Nf3 Nc6 Bb5'], ['scotch', 'e4 e5 Nf3 Nc6 d4'],
  ['fourKnights', 'e4 e5 Nf3 Nc6 Nc3 Nf6'], ['fourKnights', 'e4 e5 Nc3 Nf6 Nf3 Nc6'],
  ['petrov', 'e4 e5 Nf3 Nf6'], ['philidor', 'e4 e5 Nf3 d6'], ['kingsGambit', 'e4 e5 f4'],
  ['vienna', 'e4 e5 Nc3'], ['bishopsOpening', 'e4 e5 Bc4'],
  ['sicilian', 'e4 c5'], ['alapin', 'e4 c5 c3'],
  ['najdorf', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6'], ['dragon', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6'],
  ['french', 'e4 e6'], ['caroKann', 'e4 c6'], ['scandinavian', 'e4 d5'], ['alekhine', 'e4 Nf6'],
  ['pirc', 'e4 d6 d4 Nf6 Nc3 g6'], ['modern', 'e4 g6'],
  ['queensGambit', 'd4 d5 c4'], ['qga', 'd4 d5 c4 dxc4'], ['qgd', 'd4 d5 c4 e6'], ['slav', 'd4 d5 c4 c6'],
  ['london', 'd4 d5 Bf4'], ['london', 'd4 Nf6 Bf4'], ['london', 'd4 d5 Nf3 Nf6 Bf4'],
  ['indian', 'd4 Nf6'], ['kingsIndian', 'd4 Nf6 c4 g6 Nc3 Bg7'], ['grunfeld', 'd4 Nf6 c4 g6 Nc3 d5'],
  ['nimzoIndian', 'd4 Nf6 c4 e6 Nc3 Bb4'], ['queensIndian', 'd4 Nf6 c4 e6 Nf3 b6'],
  ['catalan', 'd4 Nf6 c4 e6 g3'], ['dutch', 'd4 f5'], ['benoni', 'd4 Nf6 c4 c5'], ['budapest', 'd4 Nf6 c4 e5'],
  ['reti', 'Nf3 d5 c4']
].map(([id, moves]) => ({ id, moves: moves.split(' ') }));

// Main lines the computer may follow at Medium level and above (for variety).
const BOOK_LINES = [
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O',
  'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O',
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O',
  'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6',
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6',
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5',
  'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Bb4 O-O O-O',
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5',
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7',
  'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5',
  'e4 c5 c3 Nf6 e5 Nd5 d4 cxd4',
  'e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7 e5 Nfd7',
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6',
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6',
  'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6',
  'e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4',
  'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O',
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6',
  'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5',
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5',
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6',
  'd4 Nf6 Bf4 e6 e3 d5 Nf3 c5',
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5',
  'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7',
  'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5',
  'd4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7',
  'd4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O',
  'd4 f5 g3 Nf6 Bg2 e6 Nf3 Be7',
  'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5',
  'c4 Nf6 Nc3 e6 e4 d5',
  'Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7',
  'Nf3 Nf6 c4 g6 Nc3 Bg7'
].map(l => l.split(' '));

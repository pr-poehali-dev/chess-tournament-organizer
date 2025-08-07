// Швейцарская система - механизм проведения турниров

export interface SwissPlayer {
  id: string;
  name: string;
  rating: number;
  points: number;
  buchholz: number; // Коэффициент Бухгольца
  sonnenborn: number; // Коэффициент Зонненборна-Бергера
  opponents: string[]; // ID противников в каждом туре
  colors: ('white' | 'black' | null)[]; // Цвета фигур в каждом туре
  results: (1 | 0.5 | 0 | null)[]; // Результаты партий: 1 - победа, 0.5 - ничья, 0 - поражение
  isWithdrawn: boolean; // Снялся с турнира
}

export interface SwissPairing {
  round: number;
  white: string;
  black: string;
  result: 1 | 0.5 | 0 | null; // Результат с точки зрения белых
  board: number; // Номер доски
}

export interface SwissTournament {
  players: SwissPlayer[];
  pairings: SwissPairing[];
  currentRound: number;
  totalRounds: number;
  isFinished: boolean;
}

// Основные принципы швейцарской системы:
// 1. Игроки играют равное количество партий
// 2. В каждом туре игрок встречается с новым противником
// 3. Жеребьевка проводится по принципу близости по очкам
// 4. Чередование цветов фигур для каждого игрока
// 5. Избежание повторных встреч

export class SwissSystemEngine {
  private tournament: SwissTournament;

  constructor(players: { id: string; name: string; rating: number }[], totalRounds: number) {
    this.tournament = {
      players: players.map(p => ({
        ...p,
        points: 0,
        buchholz: 0,
        sonnenborn: 0,
        opponents: [],
        colors: [],
        results: [],
        isWithdrawn: false
      })),
      pairings: [],
      currentRound: 1,
      totalRounds,
      isFinished: false
    };
  }

  // Создание пар для первого тура
  private createFirstRoundPairings(): SwissPairing[] {
    const activePlayers = this.tournament.players.filter(p => !p.isWithdrawn);
    
    // Сортируем игроков по рейтингу (по убыванию)
    const sortedPlayers = [...activePlayers].sort((a, b) => b.rating - a.rating);
    
    const pairings: SwissPairing[] = [];
    const half = Math.floor(sortedPlayers.length / 2);
    
    // Первая половина играет белыми против второй половины
    for (let i = 0; i < half; i++) {
      const white = sortedPlayers[i];
      const black = sortedPlayers[i + half];
      
      pairings.push({
        round: 1,
        white: white.id,
        black: black.id,
        result: null,
        board: i + 1
      });
      
      // Обновляем цвета
      white.colors[0] = 'white';
      black.colors[0] = 'black';
      
      // Добавляем противников
      white.opponents[0] = black.id;
      black.opponents[0] = white.id;
    }

    // Если нечетное количество игроков, последний проходит без игры
    if (sortedPlayers.length % 2 === 1) {
      const byePlayer = sortedPlayers[sortedPlayers.length - 1];
      byePlayer.results[0] = 1; // Засчитывается как победа
      byePlayer.points = 1;
    }

    return pairings;
  }

  // Создание пар для последующих туров
  private createSubsequentRoundPairings(round: number): SwissPairing[] {
    const activePlayers = this.tournament.players.filter(p => !p.isWithdrawn);
    
    // Группируем игроков по очкам
    const pointGroups = new Map<number, SwissPlayer[]>();
    activePlayers.forEach(player => {
      const points = player.points;
      if (!pointGroups.has(points)) {
        pointGroups.set(points, []);
      }
      pointGroups.get(points)!.push(player);
    });

    // Сортируем группы по количеству очков (по убыванию)
    const sortedGroups = Array.from(pointGroups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([_, players]) => players);

    const pairings: SwissPairing[] = [];
    const paired = new Set<string>();
    let boardNumber = 1;

    // Создаем пары в каждой группе очков
    for (const group of sortedGroups) {
      const availablePlayers = group.filter(p => !paired.has(p.id));
      if (availablePlayers.length < 2) continue;

      // Сортируем внутри группы по рейтингу
      availablePlayers.sort((a, b) => b.rating - a.rating);

      // Пытаемся создать пары
      const groupPairings = this.createPairsInGroup(availablePlayers, round, boardNumber);
      
      groupPairings.forEach(pairing => {
        pairings.push(pairing);
        paired.add(pairing.white);
        paired.add(pairing.black);
      });

      boardNumber += groupPairings.length;
    }

    // Обработка игроков, которые не нашли пару в своей группе очков
    const unpaired = activePlayers.filter(p => !paired.has(p.id));
    if (unpaired.length >= 2) {
      const crossGroupPairings = this.createCrossGroupPairs(unpaired, round, boardNumber);
      pairings.push(...crossGroupPairings);
    } else if (unpaired.length === 1) {
      // Проход без игры
      const byePlayer = unpaired[0];
      byePlayer.results[round - 1] = 1;
      byePlayer.points += 1;
    }

    return pairings;
  }

  // Создание пар внутри группы очков
  private createPairsInGroup(players: SwissPlayer[], round: number, startBoard: number): SwissPairing[] {
    const pairings: SwissPairing[] = [];
    const used = new Set<string>();
    let boardNumber = startBoard;

    for (let i = 0; i < players.length - 1; i++) {
      if (used.has(players[i].id)) continue;

      const player1 = players[i];

      for (let j = i + 1; j < players.length; j++) {
        if (used.has(players[j].id)) continue;

        const player2 = players[j];

        // Проверяем, не играли ли они уже друг с другом
        if (player1.opponents.includes(player2.id)) continue;

        // Определяем цвета с учетом баланса
        const colorAssignment = this.determineColors(player1, player2, round);

        pairings.push({
          round,
          white: colorAssignment.white.id,
          black: colorAssignment.black.id,
          result: null,
          board: boardNumber++
        });

        // Обновляем информацию об игроках
        colorAssignment.white.colors[round - 1] = 'white';
        colorAssignment.black.colors[round - 1] = 'black';
        colorAssignment.white.opponents[round - 1] = colorAssignment.black.id;
        colorAssignment.black.opponents[round - 1] = colorAssignment.white.id;

        used.add(player1.id);
        used.add(player2.id);
        break;
      }
    }

    return pairings;
  }

  // Создание пар между разными группами очков
  private createCrossGroupPairs(players: SwissPlayer[], round: number, startBoard: number): SwissPairing[] {
    const pairings: SwissPairing[] = [];
    const used = new Set<string>();
    let boardNumber = startBoard;

    // Сортируем по рейтингу
    players.sort((a, b) => b.rating - a.rating);

    for (let i = 0; i < players.length - 1; i += 2) {
      if (used.has(players[i].id) || used.has(players[i + 1].id)) continue;

      const player1 = players[i];
      const player2 = players[i + 1];

      // Проверяем, не играли ли они уже
      if (player1.opponents.includes(player2.id)) {
        // Пропускаем эту пару и ищем альтернативу
        continue;
      }

      const colorAssignment = this.determineColors(player1, player2, round);

      pairings.push({
        round,
        white: colorAssignment.white.id,
        black: colorAssignment.black.id,
        result: null,
        board: boardNumber++
      });

      colorAssignment.white.colors[round - 1] = 'white';
      colorAssignment.black.colors[round - 1] = 'black';
      colorAssignment.white.opponents[round - 1] = colorAssignment.black.id;
      colorAssignment.black.opponents[round - 1] = colorAssignment.white.id;

      used.add(player1.id);
      used.add(player2.id);
    }

    return pairings;
  }

  // Определение цветов фигур с учетом баланса
  private determineColors(player1: SwissPlayer, player2: SwissPlayer, round: number): {white: SwissPlayer, black: SwissPlayer} {
    const p1WhiteCount = player1.colors.filter(c => c === 'white').length;
    const p1BlackCount = player1.colors.filter(c => c === 'black').length;
    const p2WhiteCount = player2.colors.filter(c => c === 'white').length;
    const p2BlackCount = player2.colors.filter(c => c === 'black').length;

    // Стремимся к балансу цветов
    const p1NeedsWhite = p1WhiteCount < p1BlackCount;
    const p2NeedsWhite = p2WhiteCount < p2BlackCount;

    if (p1NeedsWhite && !p2NeedsWhite) {
      return { white: player1, black: player2 };
    } else if (!p1NeedsWhite && p2NeedsWhite) {
      return { white: player2, black: player1 };
    } else {
      // Если равные потребности, то более сильный игрок (по рейтингу) получает белые
      return player1.rating >= player2.rating 
        ? { white: player1, black: player2 }
        : { white: player2, black: player1 };
    }
  }

  // Создание пар для следующего тура
  public generateNextRoundPairings(): SwissPairing[] {
    if (this.tournament.isFinished) {
      throw new Error('Турнир уже завершен');
    }

    let pairings: SwissPairing[];

    if (this.tournament.currentRound === 1) {
      pairings = this.createFirstRoundPairings();
    } else {
      pairings = this.createSubsequentRoundPairings(this.tournament.currentRound);
    }

    this.tournament.pairings.push(...pairings);
    return pairings;
  }

  // Запись результата партии
  public recordResult(round: number, whiteId: string, blackId: string, result: 1 | 0.5 | 0): void {
    const pairing = this.tournament.pairings.find(
      p => p.round === round && p.white === whiteId && p.black === blackId
    );

    if (!pairing) {
      throw new Error('Партия не найдена');
    }

    pairing.result = result;

    // Обновляем очки игроков
    const whitePlayer = this.tournament.players.find(p => p.id === whiteId)!;
    const blackPlayer = this.tournament.players.find(p => p.id === blackId)!;

    whitePlayer.results[round - 1] = result;
    blackPlayer.results[round - 1] = result === 1 ? 0 : result === 0 ? 1 : 0.5;

    whitePlayer.points += result;
    blackPlayer.points += (result === 1 ? 0 : result === 0 ? 1 : 0.5);

    this.updateTiebreakers();
  }

  // Обновление коэффициентов
  private updateTiebreakers(): void {
    this.tournament.players.forEach(player => {
      // Коэффициент Бухгольца (сумма очков противников)
      player.buchholz = player.opponents
        .map(opponentId => {
          const opponent = this.tournament.players.find(p => p.id === opponentId);
          return opponent ? opponent.points : 0;
        })
        .reduce((sum, points) => sum + points, 0);

      // Коэффициент Зонненборна-Бергера (взвешенная сумма очков)
      player.sonnenborn = player.results
        .map((result, index) => {
          if (result === null) return 0;
          const opponentId = player.opponents[index];
          const opponent = this.tournament.players.find(p => p.id === opponentId);
          return result * (opponent ? opponent.points : 0);
        })
        .reduce((sum, weighted) => sum + weighted, 0);
    });
  }

  // Переход к следующему туру
  public advanceToNextRound(): void {
    if (this.tournament.currentRound >= this.tournament.totalRounds) {
      this.tournament.isFinished = true;
      return;
    }

    this.tournament.currentRound++;
  }

  // Получение текущих результатов турнира
  public getCurrentStandings(): SwissPlayer[] {
    return [...this.tournament.players]
      .sort((a, b) => {
        // Сортировка: очки -> Бухгольц -> Зонненборн-Бергер -> рейтинг
        if (a.points !== b.points) return b.points - a.points;
        if (a.buchholz !== b.buchholz) return b.buchholz - a.buchholz;
        if (a.sonnenborn !== b.sonnenborn) return b.sonnenborn - a.sonnenborn;
        return b.rating - a.rating;
      })
      .map((player, index) => ({ ...player, position: index + 1 }));
  }

  // Получение пар для текущего тура
  public getCurrentRoundPairings(): SwissPairing[] {
    return this.tournament.pairings.filter(p => p.round === this.tournament.currentRound);
  }

  // Проверка, завершен ли турнир
  public isCompleted(): boolean {
    return this.tournament.isFinished;
  }

  // Получение полной информации о турнире
  public getTournamentData(): SwissTournament {
    return { ...this.tournament };
  }

  // Снятие игрока с турнира
  public withdrawPlayer(playerId: string): void {
    const player = this.tournament.players.find(p => p.id === playerId);
    if (player) {
      player.isWithdrawn = true;
    }
  }
}

// Утилитарные функции для работы со швейцарской системой
export const SwissUtils = {
  // Расчет оптимального количества туров
  calculateOptimalRounds(playerCount: number): number {
    if (playerCount <= 8) return Math.ceil(Math.log2(playerCount));
    if (playerCount <= 16) return 7;
    if (playerCount <= 32) return 9;
    if (playerCount <= 64) return 11;
    return 13;
  },

  // Проверка корректности турнира
  validateTournament(tournament: SwissTournament): string[] {
    const errors: string[] = [];

    // Проверяем, что все игроки играли правильное количество партий
    tournament.players.forEach(player => {
      const expectedGames = Math.min(tournament.currentRound - 1, tournament.totalRounds);
      const actualGames = player.results.filter(r => r !== null).length;
      
      if (actualGames !== expectedGames && !player.isWithdrawn) {
        errors.push(`Игрок ${player.name} сыграл ${actualGames} партий, ожидалось ${expectedGames}`);
      }
    });

    // Проверяем корректность пар
    tournament.pairings.forEach(pairing => {
      if (pairing.white === pairing.black) {
        errors.push(`Некорректная партия в туре ${pairing.round}: игрок играет сам с собой`);
      }
    });

    return errors;
  }
};
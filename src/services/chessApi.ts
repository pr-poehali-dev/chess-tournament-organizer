const API_BASE_URL = 'https://functions.poehali.dev/a0e9b180-a9ee-43de-b355-df3032eca211';

export interface Player {
  id: number;
  name: string;
  rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
}

export interface Game {
  id: number;
  white_player: string;
  black_player: string;
  result: 'white_wins' | 'black_wins' | 'draw' | 'in_progress';
  moves_count: number;
  started_at: string;
  finished_at?: string;
}

export interface GameMove {
  move_number: number;
  player_color: 'white' | 'black';
  notation: string;
  board_state: string;
}

export interface GameDetails extends Game {
  moves: GameMove[];
}

class ChessApi {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Игроки
  async getPlayers(): Promise<Player[]> {
    const data = await this.makeRequest('/players');
    return data.players;
  }

  async createPlayer(name: string, email?: string): Promise<Player> {
    const data = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_player',
        name,
        email,
      }),
    });
    return data.player;
  }

  // Партии
  async getGames(limit: number = 50): Promise<Game[]> {
    const data = await this.makeRequest(`/games?limit=${limit}`);
    return data.games;
  }

  async getGame(gameId: number): Promise<GameDetails> {
    const data = await this.makeRequest(`/game?id=${gameId}`);
    return data.game;
  }

  async createGame(whitePlayerId: number, blackPlayerId: number, timeControl: string = '10+0'): Promise<number> {
    const data = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_game',
        white_player_id: whitePlayerId,
        black_player_id: blackPlayerId,
        time_control: timeControl,
      }),
    });
    return data.game_id;
  }

  async saveMove(
    gameId: number,
    moveNumber: number,
    playerColor: 'white' | 'black',
    moveNotation: string,
    boardState: string
  ): Promise<void> {
    await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'save_move',
        game_id: gameId,
        move_number: moveNumber,
        player_color: playerColor,
        move_notation: moveNotation,
        board_state: boardState,
      }),
    });
  }

  async finishGame(gameId: number, result: 'white_wins' | 'black_wins' | 'draw'): Promise<void> {
    await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'finish_game',
        game_id: gameId,
        result,
      }),
    });
  }
}

export const chessApi = new ChessApi();
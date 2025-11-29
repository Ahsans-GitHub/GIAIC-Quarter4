// frontend/app/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Game {
  id: number;
  date: string;
  time?: string;
  timestamp?: number;
  teams: {
    home: {
      id: number;
      name: string;
      logo?: string;
    };
    away: {
      id: number;
      name: string;
      logo?: string;
    };
  };
  scores?: {
    home: number | string;
    away: number | string;
  };
  goals?: {
    home: number | null;
    away: number | null;
  };
  status: {
    long: string;
    short: string;
  };
  fixture?: any; // Football-specific
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
  team?: {
    id: number;
    name: string;
    logo?: string;
  };
}

export interface Standing {
  rank: number;
  position?: number;
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  points: number;
  goalsDiff?: number;
  group?: string;
  form?: string;
  status?: string;
  description?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
  };
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  console.log(`Fetching: ${url}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        return response;
      }
      
      // If not the last retry and we got a server error, try again
      if (i < retries - 1 && response.status >= 500) {
        console.log(`Retrying in ${1000 * (i + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // For client errors or last retry, throw with details
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`);
      
    } catch (error) {
      console.error('Fetch error:', error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries reached');
}

export const sportsAPI = {
  async getSports(): Promise<string[]> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/sports`);
      const data = await response.json();
      console.log('Sports list:', data);
      return data.sports || [];
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  },

  async getGames(sport: string, league?: number, season?: string) {
    const params = new URLSearchParams();
    if (league) params.append('league', league.toString());
    if (season) params.append('season', season);
    
    const url = `${API_BASE_URL}/sports/${sport}/games${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetchWithRetry(url);
      const data = await response.json();
      console.log(`Games data for ${sport}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching games for ${sport}:`, error);
      throw error;
    }
  },

  async getStandings(sport: string, league?: number, season?: string) {
    const params = new URLSearchParams();
    if (league) params.append('league', league.toString());
    if (season) params.append('season', season);
    
    const url = `${API_BASE_URL}/sports/${sport}/standings${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetchWithRetry(url);
      const data = await response.json();
      console.log(`Standings data for ${sport}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching standings for ${sport}:`, error);
      throw error;
    }
  },

  async getTeams(sport: string, league?: number, season?: string) {
    const params = new URLSearchParams();
    if (league) params.append('league', league.toString());
    if (season) params.append('season', season);
    
    const url = `${API_BASE_URL}/sports/${sport}/teams${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetchWithRetry(url);
      const data = await response.json();
      console.log(`Teams data for ${sport}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching teams for ${sport}:`, error);
      throw error;
    }
  },
};
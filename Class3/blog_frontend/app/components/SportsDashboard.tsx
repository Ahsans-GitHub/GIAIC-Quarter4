// frontend/components/SportsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { sportsAPI, Game, Standing, Team } from '@/app/lib/api';

interface SportsDashboardProps {
  sport: string;
}

export default function SportsDashboard({ sport }: SportsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'games' | 'standings' | 'teams'>('games');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sport, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      console.log(`Fetching ${activeTab} for ${sport}...`);
      
      switch (activeTab) {
        case 'games':
          response = await sportsAPI.getGames(sport);
          break;
        case 'standings':
          response = await sportsAPI.getStandings(sport);
          break;
        case 'teams':
          response = await sportsAPI.getTeams(sport);
          break;
      }
      
      console.log('API Response:', response);
      
      // The API response structure is: { response: [...], results: N, ... }
      // Extract the actual data from the 'response' field
      const actualData = response.response || [];
      
      console.log('Extracted data:', actualData);
      
      // For standings, we need to flatten the nested structure
      if (activeTab === 'standings' && actualData.length > 0) {
        // Football/soccer standings come nested in league groups
        if (actualData[0].league && actualData[0].league.standings) {
          // Flatten all standings from all groups
          const flattened = actualData[0].league.standings.flat();
          setData(flattened);
        } else {
          setData(actualData);
        }
      } else {
        setData(actualData);
      }
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch data. Please try again.';
      setError(errorMsg);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading {activeTab}...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-4 font-medium">{error}</div>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No {activeTab} available for this sport at the moment.
          </div>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'games':
        return <GamesList games={data} sport={sport} />;
      case 'standings':
        return <StandingsTable standings={data} sport={sport} />;
      case 'teams':
        return <TeamsGrid teams={data} sport={sport} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 capitalize">
        {sport.replace('-', ' ')} Updates
      </h1>
      
      <div className="flex space-x-4 mb-8 justify-center flex-wrap gap-2">
        {(['games', 'standings', 'teams'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

// Games List Component
function GamesList({ games, sport }: { games: any[]; sport: string }) {
  if (games.length === 0) {
    return <div className="text-center py-8 text-gray-500">No games available</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.slice(0, 12).map((game, index) => {
        // Handle different API response structures for different sports
        const gameId = game.id || game.fixture?.id || index;
        const gameDate = game.date || game.fixture?.date || game.timestamp;
        const status = game.status || game.fixture?.status || { long: 'Unknown', short: 'N/A' };
        
        // Extract teams based on sport
        let homeTeam, awayTeam, homeScore, awayScore;
        
        if (sport === 'football') {
          homeTeam = game.teams?.home?.name || 'Home Team';
          awayTeam = game.teams?.away?.name || 'Away Team';
          homeScore = game.goals?.home ?? game.score?.fulltime?.home ?? '-';
          awayScore = game.goals?.away ?? game.score?.fulltime?.away ?? '-';
        } else {
          homeTeam = game.teams?.home?.name || game.home?.name || 'Home Team';
          awayTeam = game.teams?.away?.name || game.away?.name || 'Away Team';
          homeScore = game.scores?.home?.total || game.scores?.home || '-';
          awayScore = game.scores?.away?.total || game.scores?.away || '-';
        }

        return (
          <div key={gameId} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {new Date(gameDate).toLocaleDateString()}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                status.short === 'FT' || status.short === 'Match Finished' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.long || status.short}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="truncate mr-2">{homeTeam}</span>
                <span className="font-bold text-lg">{homeScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="truncate mr-2">{awayTeam}</span>
                <span className="font-bold text-lg">{awayScore}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Standings Table Component
function StandingsTable({ standings, sport }: { standings: any[]; sport: string }) {
  if (standings.length === 0) {
    return <div className="text-center py-8 text-gray-500">No standings available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.slice(0, 20).map((standing, index) => {
            const rank = standing.rank || standing.position || index + 1;
            const teamName = standing.team?.name || 'Unknown Team';
            const teamId = standing.team?.id || index;
            const played = standing.all?.played || standing.played || 0;
            const wins = standing.all?.win || standing.win || 0;
            const draws = standing.all?.draw || standing.draw || 0;
            const losses = standing.all?.lose || standing.loss || 0;
            const points = standing.points || 0;

            return (
              <tr key={teamId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rank}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teamName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{played}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{draws}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{losses}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Teams Grid Component
function TeamsGrid({ teams, sport }: { teams: any[]; sport: string }) {
  if (teams.length === 0) {
    return <div className="text-center py-8 text-gray-500">No teams available</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {teams.slice(0, 16).map((team, index) => {
        const teamId = team.id || team.team?.id || index;
        const teamName = team.name || team.team?.name || 'Unknown Team';
        const teamLogo = team.logo || team.team?.logo || '';

        return (
          <div key={teamId} className="bg-white rounded-lg shadow-md p-6 text-center border hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {teamLogo ? (
                <img src={teamLogo} alt={teamName} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-2xl">🏆</span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{teamName}</h3>
          </div>
        );
      })}
    </div>
  );
}
'use client'
import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const SportsBlog = () => {
  const [activeLeague, setActiveLeague] = useState<string>('39');
  const [standings, setStandings] = useState<any[] | null>(null);
  const [matches, setMatches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend API URL - change this to your FastAPI backend URL
  const BACKEND_URL = 'http://localhost:8000';

  const leagues = {
    '39': { name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    '78': { name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
    '135': { name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
    '140': { name: 'La Liga', country: 'Spain', flag: '🇪🇸' }
  };

  useEffect(() => {
    fetchLeagueData();
  }, [activeLeague]);

  const fetchLeagueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch standings using GET method
      const standingsResponse = await fetch(
        `${BACKEND_URL}/api/standings/${activeLeague}?season=2023`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!standingsResponse.ok) {
        throw new Error(`Standings API error: ${standingsResponse.status}`);
      }

      const standingsData = await standingsResponse.json();

      // Fetch matches using GET method
      const matchesResponse = await fetch(
        `${BACKEND_URL}/api/matches/${activeLeague}?season=2023`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!matchesResponse.ok) {
        throw new Error(`Matches API error: ${matchesResponse.status}`);
      }

      const matchesData = await matchesResponse.json();

      // Process standings data from API-Sports response
      if (standingsData.response && standingsData.response[0]?.league?.standings) {
        const standingsArray = standingsData.response[0].league.standings[0];
        setStandings(standingsArray);
      } else {
        setStandings([]);
      }

      // Process matches data from API-Sports response
      if (matchesData.response) {
        setMatches(matchesData.response.slice(0, 5)); // Show last 5 matches
      } else {
        setMatches([]);
      }

    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to fetch data: ${errMsg}. Make sure your FastAPI backend is running on ${BACKEND_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Trophy className="text-white" size={28} />
                </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Sports Central</h1>
                <p className="text-slate-400 text-sm">Live Football Statistics & Standings</p>
              </div>
            </div>
            <button
              onClick={fetchLeagueData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* League Selector */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-400" />
            Select League
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(leagues).map(([id, league]) => (
              <button
                key={id}
                onClick={() => setActiveLeague(id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activeLeague === id
                    ? 'bg-linear-to-br from-blue-500 to-purple-600 border-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-3xl mb-2">{league.flag}</div>
                <div className="text-white font-semibold">{league.name}</div>
                <div className="text-slate-400 text-sm">{league.country}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-blue-400 animate-spin mb-4" size={48} />
            <p className="text-slate-400">Fetching live data from API...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle size={24} className="shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-2">Error Loading Data</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-2 text-slate-400">
                  Make sure your FastAPI backend is running at: <code className="bg-slate-800 px-2 py-1 rounded">{BACKEND_URL}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && standings && matches && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Standings */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <Trophy size={24} />
                    League Standings - Season 2023
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {standings.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr className="text-slate-400 text-sm">
                          <th className="text-left px-6 py-3">Pos</th>
                          <th className="text-left px-6 py-3">Team</th>
                          <th className="text-center px-3 py-3">P</th>
                          <th className="text-center px-3 py-3">W</th>
                          <th className="text-center px-3 py-3">D</th>
                          <th className="text-center px-3 py-3">L</th>
                          <th className="text-center px-3 py-3">GF</th>
                          <th className="text-center px-3 py-3">GA</th>
                          <th className="text-center px-3 py-3">GD</th>
                          <th className="text-center px-6 py-3 font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team, idx) => (
                          <tr
                            key={idx}
                            className={`border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                              team.rank <= 4 ? 'bg-blue-500/5' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                team.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                team.rank <= 4 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-700 text-slate-300'
                              }`}>
                                {team.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {team.team.logo && (
                                  <img src={team.team.logo} alt={team.team.name} className="w-6 h-6" />
                                )}
                                <span className="text-white font-semibold">{team.team.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-center text-slate-300">{team.all.played}</td>
                            <td className="px-3 py-4 text-center text-green-400">{team.all.win}</td>
                            <td className="px-3 py-4 text-center text-yellow-400">{team.all.draw}</td>
                            <td className="px-3 py-4 text-center text-red-400">{team.all.lose}</td>
                            <td className="px-3 py-4 text-center text-slate-300">{team.all.goals.for}</td>
                            <td className="px-3 py-4 text-center text-slate-300">{team.all.goals.against}</td>
                            <td className="px-3 py-4 text-center text-slate-300">{team.goalsDiff}</td>
                            <td className="px-6 py-4 text-center text-white font-bold text-lg">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No standings data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <Calendar size={20} />
                    Recent Matches
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {matches.length > 0 ? (
                    matches.map((match, idx) => (
                      <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(match.fixture.date)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {match.teams.home.logo && (
                                <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-5 h-5" />
                              )}
                              <span className="text-white font-semibold">{match.teams.home.name}</span>
                            </div>
                            {match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN' ? (
                              <span className="text-2xl font-bold text-white px-3">{match.goals.home}</span>
                            ) : (
                              <span className="text-slate-500 px-3">-</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {match.teams.away.logo && (
                                <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-5 h-5" />
                              )}
                              <span className="text-white font-semibold">{match.teams.away.name}</span>
                            </div>
                            {match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN' ? (
                              <span className="text-2xl font-bold text-white px-3">{match.goals.away}</span>
                            ) : (
                              <span className="text-slate-500 px-3">-</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN'
                              ? 'bg-green-500/20 text-green-400' 
                              : match.fixture.status.short === 'LIVE'
                              ? 'bg-red-500/20 text-red-400 animate-pulse'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {match.fixture.status.long}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      No matches data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Info */}
        {!loading && !error && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Live API Data</h3>
                <p className="text-slate-400 text-sm">
                  Data is fetched from API-Sports.io via your FastAPI backend.
                  <br />
                  Sport: <span className="text-blue-400 font-mono">Football</span> | 
                  Season: <span className="text-blue-400 font-mono">2023</span> | 
                  League: <span className="text-blue-400 font-mono">{activeLeague}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-slate-800/50 border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Sports Central © 2024 - Powered by API-Sports.io</p>
          <p className="text-sm mt-2">Real-time football statistics and standings</p>
        </div>
      </footer>
    </div>
  );
};

export default SportsBlog;








// // frontend/app/page.tsx
// import Link from 'next/link'

// const sports = [
//   { name: 'baseball', icon: '⚾', description: 'Baseball News & Updates' },
//   { name: 'basketball', icon: '🏀', description: 'Basketball Scores & Standings' },
//   { name: 'football', icon: '⚽', description: 'Football/Soccer Live Updates' },
//   { name: 'tennis', icon: '🎾', description: 'Tennis Tournaments & Results' },
//   { name: 'cricket', icon: '🏏', description: 'Cricket Matches & Stats' },
//   { name: 'american-football', icon: '🏈', description: 'NFL & American Football' },
// ]

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
//       {/* Navigation */}
//       <nav className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
//               <span className="text-xl font-bold text-gray-900">SportsBlog AI</span>
//             </div>
//             <div className="flex space-x-4">
//               <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
//               <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="text-center">
//           <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
//             AI-Powered Sports
//             <span className="text-blue-600"> Blog</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
//             Real-time sports data, AI-generated insights, and comprehensive coverage 
//             across all major sports leagues worldwide.
//           </p>
//         </div>

//         {/* Sports Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
//           {sports.map((sport) => (
//             <Link
//               key={sport.name}
//               href={`/sports/${sport.name}`}
//               className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-blue-300"
//             >
//               <div className="flex items-center space-x-4">
//                 <span className="text-3xl">{sport.icon}</span>
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold text-gray-900 capitalize">
//                     {sport.name.replace('-', ' ')}
//                   </h3>
//                   <p className="text-gray-600 text-sm mt-1">
//                     {sport.description}
//                   </p>
//                 </div>
//                 <div className="text-gray-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* Features Section */}
//         <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div className="text-center">
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Data</h3>
//             <p className="text-gray-600">Live scores, standings, and statistics updated in real-time</p>
//           </div>
          
//           <div className="text-center">
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
//             <p className="text-gray-600">Smart analysis and predictions powered by artificial intelligence</p>
//           </div>
          
//           <div className="text-center">
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//               <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Sport</h3>
//             <p className="text-gray-600">Comprehensive coverage across all major sports worldwide</p>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }
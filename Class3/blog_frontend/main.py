from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import Optional

app = FastAPI(title="Sports Blog API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your API key
SPORTS_API_KEY = "0ab24350768643d07f223906ac7af498"
BASE_URL = "https://v3.football.api-sports.io"

# Headers for API-Sports.io
headers = {
    "x-apisports-key": SPORTS_API_KEY
}

@app.get("/")
async def root():
    return {
        "message": "Sports Blog API - Football Data", 
        "status": "running",
        "endpoints": {
            "standings": "/api/standings/{league_id}?season=2023",
            "matches": "/api/matches/{league_id}?season=2023",
            "leagues": "/api/leagues"
        }
    }

@app.get("/api/standings/{league_id}")
async def get_standings(league_id: int, season: int = 2023):
    """
    GET method - Fetch league standings
    Parameters:
    - league_id: 39 (Premier League), 78 (Bundesliga), 135 (Serie A), 140 (La Liga)
    - season: 2023
    - sport: football (automatic)
    """
    async with httpx.AsyncClient() as client:
        try:
            print(f"Fetching standings for league {league_id}, season {season}")
            response = await client.get(
                f"{BASE_URL}/standings",
                params={
                    "league": league_id,
                    "season": season
                },
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            print(f"Standings API Response: {data.get('results', 0)} results")
            return data
            
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"API-Sports error: {e.response.text}"
            )
        except httpx.RequestError as e:
            print(f"Request Error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to connect to API-Sports: {str(e)}"
            )

@app.get("/api/matches/{league_id}")
async def get_matches(league_id: int, season: int = 2023, last: int = 10):
    """
    GET method - Fetch recent matches
    Parameters:
    - league_id: 39, 78, 135, or 140
    - season: 2023
    - last: number of recent matches (default: 10)
    - sport: football (automatic)
    """
    async with httpx.AsyncClient() as client:
        try:
            print(f"Fetching matches for league {league_id}, season {season}")
            response = await client.get(
                f"{BASE_URL}/fixtures",
                params={
                    "league": league_id,
                    "season": season,
                    "last": last
                },
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            print(f"Matches API Response: {data.get('results', 0)} results")
            return data
            
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"API-Sports error: {e.response.text}"
            )
        except httpx.RequestError as e:
            print(f"Request Error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to connect to API-Sports: {str(e)}"
            )

@app.post("/api/match-report")
async def create_match_report(report_data: dict):
    """
    POST method - Submit match report/blog post
    This endpoint receives data from frontend and processes it
    """
    try:
        # You can save this to a database or process it
        print(f"Received match report: {report_data}")
        
        return {
            "status": "success",
            "message": "Match report created successfully",
            "data": report_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leagues")
async def get_leagues():
    """GET all available leagues with their IDs"""
    leagues = [
        {
            "id": 39,
            "name": "Premier League",
            "country": "England",
            "sport": "football",
            "season": 2023
        },
        {
            "id": 78,
            "name": "Bundesliga",
            "country": "Germany",
            "sport": "football",
            "season": 2023
        },
        {
            "id": 135,
            "name": "Serie A",
            "country": "Italy",
            "sport": "football",
            "season": 2023
        },
        {
            "id": 140,
            "name": "La Liga",
            "country": "Spain",
            "sport": "football",
            "season": 2023
        }
    ]
    return {"leagues": leagues, "sport": "football", "season": 2023}

@app.get("/api/test")
async def test_api_connection():
    """Test if API-Sports connection is working"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/status",
                headers=headers,
                timeout=10.0
            )
            return {
                "status": "success",
                "api_status": response.json()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import os
# import httpx
# from typing import Optional

# load_dotenv()

# app = FastAPI(title="Sports Blog AI API", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # For development - restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class SportsAPIAgent:
#     def __init__(self):
#         self.api_key = os.getenv("SPORTS_API_KEY")
#         if not self.api_key:
#             raise ValueError("SPORTS_API_KEY missing in .env file")

#         # Each sport has its own host for RapidAPI
#         self.configs = {
#             "baseball": {
#                 "base": "https://v1.baseball.api-sports.io",
#                 "host": "v1.baseball.api-sports.io",
#                 "endpoints": {
#                     "games": "/games",
#                     "teams": "/teams",
#                     "standings": "/standings"
#                 },
#                 "default_league": 1,  # MLB
#                 "default_season": "2024"
#             },
#             "basketball": {
#                 "base": "https://v1.basketball.api-sports.io",
#                 "host": "v1.basketball.api-sports.io",
#                 "endpoints": {
#                     "games": "/games",
#                     "teams": "/teams",
#                     "standings": "/standings"
#                 },
#                 "default_league": 12,  # NBA
#                 "default_season": "2024-2025"
#             },
#             "football": {
#                 "base": "https://v3.football.api-sports.io",
#                 "host": "v3.football.api-sports.io",
#                 "endpoints": {
#                     "games": "/fixtures",
#                     "teams": "/teams",
#                     "standings": "/standings"
#                 },
#                 "default_league": 39,  # Premier League
#                 "default_season": "2024"
#             },
#             "cricket": {
#                 "base": "https://v1.cricket.api-sports.io",
#                 "host": "v1.cricket.api-sports.io",
#                 "endpoints": {
#                     "games": "/fixtures",
#                     "teams": "/teams",
#                     "standings": "/standings"
#                 },
#                 "default_league": 1,
#                 "default_season": "2024"
#             },
#             "tennis": {
#                 "base": "https://v1.tennis.api-sports.io",
#                 "host": "v1.tennis.api-sports.io",
#                 "endpoints": {
#                     "games": "/games",
#                     "teams": "/players",
#                     "standings": "/rankings"
#                 },
#                 "default_league": None,
#                 "default_season": "2024"
#             },
#             "american-football": {
#                 "base": "https://v1.american-football.api-sports.io",
#                 "host": "v1.american-football.api-sports.io",
#                 "endpoints": {
#                     "games": "/games",
#                     "teams": "/teams",
#                     "standings": "/standings"
#                 },
#                 "default_league": 1,  # NFL
#                 "default_season": "2024"
#             }
#         }

#     async def fetch(self, sport: str, endpoint_key: str, params: dict):
#         if sport not in self.configs:
#             raise HTTPException(status_code=400, detail=f"Sport not supported: {sport}")

#         config = self.configs[sport]
#         endpoint = config["endpoints"].get(endpoint_key)
        
#         if not endpoint:
#             raise HTTPException(status_code=400, detail=f"Invalid endpoint '{endpoint_key}' for {sport}")

#         # Add default league/season if not provided
#         if "league" not in params and config["default_league"]:
#             params["league"] = config["default_league"]
#         if "season" not in params and config["default_season"]:
#             params["season"] = config["default_season"]

#         url = f"{config['base']}{endpoint}"
        
#         headers = {
#             "x-rapidapi-key": self.api_key,
#             "x-rapidapi-host": config["host"]
#         }

#         try:
#             async with httpx.AsyncClient(timeout=30.0) as client:
#                 print(f"Fetching: {url} with params: {params}")  # Debug log
#                 res = await client.get(url, headers=headers, params=params)
                
#                 if res.status_code != 200:
#                     error_text = res.text
#                     print(f"API Error: {res.status_code} - {error_text}")
#                     raise HTTPException(
#                         status_code=res.status_code,
#                         detail=f"API request failed: {error_text}"
#                     )
                
#                 return res.json()
                
#         except httpx.TimeoutException:
#             raise HTTPException(status_code=504, detail="API request timed out")
#         except httpx.RequestError as e:
#             raise HTTPException(status_code=503, detail=f"Connection error: {str(e)}")


# agent = SportsAPIAgent()


# @app.get("/api/sports/{sport}/games")
# async def get_games(sport: str, league: Optional[int] = None, season: Optional[str] = None):
#     params = {}
#     if league:
#         params["league"] = league
#     if season:
#         params["season"] = season
#     return await agent.fetch(sport, "games", params)


# @app.get("/api/sports/{sport}/teams")
# async def get_teams(sport: str, league: Optional[int] = None, season: Optional[str] = None):
#     params = {}
#     if league:
#         params["league"] = league
#     if season:
#         params["season"] = season
#     return await agent.fetch(sport, "teams", params)


# @app.get("/api/sports/{sport}/standings")
# async def get_standings(sport: str, league: Optional[int] = None, season: Optional[str] = None):
#     params = {}
#     if league:
#         params["league"] = league
#     if season:
#         params["season"] = season
#     return await agent.fetch(sport, "standings", params)


# @app.get("/api/sports")
# async def sports_list():
#     return {"sports": list(agent.configs.keys())}


# @app.get("/")
# async def root():
#     return {
#         "status": "running",
#         "message": "Sports Blog AI API",
#         "endpoints": {
#             "sports_list": "/api/sports",
#             "games": "/api/sports/{sport}/games",
#             "teams": "/api/sports/{sport}/teams",
#             "standings": "/api/sports/{sport}/standings"
#         }
#     }


# @app.get("/health")
# async def health():
#     return {"status": "healthy", "api_key_set": bool(agent.api_key)}
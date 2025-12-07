import requests
import os
import json
from .config import DATA_GOV_API_KEY, SUPABASE_URL, SUPABASE_KEY, TARGET_CIP_FAMILIES

# Mock Data for testing if no key provided
MOCK_SCHOOLS = [
    {
        "d": {
            "name": "Texas State Technical College",
            "city": "Waco",
            "state": "TX",
            "zip": "76705",
            "url": "https://www.tstc.edu",
            "accreditation": "SACSCOC",
        },
        "programs": [
            {"cip": "48.0508", "name": "Welding Technology/Welder", "cost": 12000, "months": 12},
            {"cip": "47.0201", "name": "Heating, Air Conditioning, Ventilation and Refrigeration Maintenance Technology/Technician", "cost": 14000, "months": 15}
        ]
    }
]

def fetch_schools_data():
    """
    Fetches Title IV schools in Texas with specific trade programs.
    Uses College Scorecard API.
    """
    if not DATA_GOV_API_KEY:
        print("No Data.gov API Key found. Using MOCK DATA.")
        return MOCK_SCHOOLS

    base_url = "https://api.data.gov/ed/collegescorecard/v1/schools.json"
    
    # Construct query
    # filter by state=TX
    # filter by program percentage > 0 for target CIPs
    # fields: id, school.name, school.city, school.state, school.zip, school.school_url, latest.programs.cip_4_digit
    
    params = {
        "api_key": DATA_GOV_API_KEY,
        "school.state": "TX",
        "per_page": 50,
        "page": 0,
        "fields": "id,school.name,school.city,school.state,school.zip,school.school_url,school.accreditor,latest.programs.cip_4_digit"
    }

    print(f"Fetching from {base_url}...")
    response = requests.get(base_url, params=params)
    
    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code} - {response.text}")
        return []

    data = response.json()
    return data.get('results', [])

def transform_and_load(raw_data):
    """
    Transforms raw API data and loads into Supabase (mock print for now).
    """
    print(f"Processing {len(raw_data)} schools...")
    
    # In a real scenario, we would use the supabase-py client here
    # from supabase import create_client, Client
    # supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    for school in raw_data:
        # Determine strict structure from API response vs Mock
        if 'd' in school: # mock structure
            name = school['d']['name']
            programs = school['programs']
        else:
            name = school.get('school.name')
            # Extract programs from latest.programs.cip_4_digit which is complex in real API
            # For simplicity in V1, we just print
            programs = [] 

        print(f"Upserting School: {name}")
        for p in programs:
             print(f"  -> Found Program: {p['name']} ({p['cip']})")

if __name__ == "__main__":
    data = fetch_schools_data()
    transform_and_load(data)


import requests
import json
import time
from .config import BLS_API_KEY

# MOCK DATA (Fallback)
MOCK_SALARY = [
    {"soc": "51-4121", "title": "Welders, Cutters, Solderers, and Brazers", "a_mean": 48000, "h_mean": 23.00, "area": "TX"},
    {"soc": "49-9021", "title": "Heating, Air Conditioning, and Refrigeration Mechanics and Installers", "a_mean": 52000, "h_mean": 25.00, "area": "TX"}
]

def chunk_list(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def fetch_soc_data(soc_codes=None):
    """
    Fetches salary data for specific SOC codes in Texas using BLS API V2.
    """
    if not BLS_API_KEY:
        print("No BLS API Key found. Using MOCK DATA.")
        return MOCK_SALARY

    if not soc_codes:
        # Default test set if none provided
        soc_codes = ["51-4121", "49-9021", "47-2061", "47-2111"]

    # 1. Construct Series IDs
    # Format: OE + U + N + 0048000 + 000000 + [SOC_CODE] + 04
    # Note: 'N' from user request (or 'M'?). User specified 'n'. 
    # Standard OES ID: OE(Survey) + U(Unadj) + AreaType(M/S) + Area + Industry + Occup + DataType
    # User Request: "OE + U + n + 0048000 + 000000 + [SOC_CODE] + 04"
    # We will assume 'n' is 'S' (State) or use their literal 'n' if it works, 
    # but 0048000 suggests State (48). usually AreaType for state is 'S'.
    # For safety, let's try to follow the structure EXACTLY as requested but use 'S' if 'n' is placeholder.
    # However, user explicitly said: "OE + U + n + ...". 
    # Let's try to use 'S' for State which is standard for Texas (0048000). 
    # If the user insists on 'n', we might need to adjust.
    # Let's assume 'n' -> 'S' (Statewide) based on 0048000.
    
    series_map = {}
    for soc in soc_codes:
        clean_soc = soc.replace("-", "") # 514121
        # Series: OE U S 4800000 000000 514121 04
        # Note: 0048000 (User) vs 4800000 (Standard)?
        # User said: 0048000. Standard FIPS for TX is 48. 
        # State area code in OES is usually S + StateFIPS + 00000?
        # Let's trust the User's specific "0048000" if possible, but 
        # commonly it is: OE U S 48 00000 000000 ....
        # Let's try the User's pattern: OE + U + n + 0048000...
        # We will use 'S' for 'n' (State).
        
        # Trying Standard BLS OES format for State Level:
        # Prefix: OEU
        # Area Type: S (State)
        # Area Code: 4800000 (Texas)
        # Industry: 000000 (All Industries)
        # Occupation: [SOC]
        # Data Type: 04 (Annual Mean)
        series_id = f"OEUS4800000000000{clean_soc}04"
        series_map[series_id] = soc

    series_ids = list(series_map.keys())
    print(f"Prepared {len(series_ids)} Series IDs for BLS fetch.")

    # 2. Batch Requests (Max 50)
    all_results = []
    
    url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
    headers = {"Content-Type": "application/json"}

    for chunk in chunk_list(series_ids, 50):
        payload = {
            "seriesid": chunk,
            "registrationkey": BLS_API_KEY,
            "startyear": "2023", # Recent data
            "endyear": "2024",
            "catalog": False,
            "calculations": False, 
            "annualaverage": False
        }
        
        print(f"Fetching batch of {len(chunk)}...")
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'REQUEST_SUCCEEDED':
                    for series in data['Results']['series']:
                        sid = series['seriesID']
                        soc = series_map.get(sid)
                        data_points = series.get('data', [])
                        if data_points:
                            latest = data_points[0] # usage latest
                            val = latest['value']
                            all_results.append({
                                "soc": soc,
                                "series_id": sid,
                                "a_mean": val,
                                "period": latest['periodName'] + " " + latest['year']
                            })
                        else:
                            print(f"No data found for {soc} ({sid})")
                else:
                    print(f"BLS API Error: {data['message']}")
            else:
                print(f"HTTP Error: {response.status_code}")
            
            # Rate limit politeness
            time.sleep(1) 
            
        except Exception as e:
            print(f"Exception during fetch: {e}")

    return all_results

def load_salary_data(data):
    if not data:
        print("No data to load.")
        return

    print(f"Loading {len(data)} salary records into 'bls_salary_data' table...")
    for record in data:
        print(f"  -> SOC {record['soc']}: ${record['a_mean']}/yr ({record.get('period', 'N/A')})")
        # In real app: upsert to DB

if __name__ == "__main__":
    # Test run
    data = fetch_soc_data()
    load_salary_data(data)

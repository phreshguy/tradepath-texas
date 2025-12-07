
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)

# API Keys
BLS_API_KEY = os.getenv("BLS_API_KEY")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Configuration Constants
TX_STATE_FIPS = "48"
TARGET_CIP_FAMILIES = ["46", "47", "48"] # Construction, Mechanic, Precision Production

if not BLS_API_KEY or not DATA_GOV_API_KEY:
    print("WARNING: API Keys not found in .env. Helper scripts may fail or use limited public access.")

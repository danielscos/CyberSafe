import uvicorn
import os
from main import app

if __name__ == "__main__":
    # Ensure the working directory is the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)

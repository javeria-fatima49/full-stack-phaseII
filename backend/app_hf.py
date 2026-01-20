# HuggingFace Spaces Deployment Configuration
# This file is used by HuggingFace to run your FastAPI backend

import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    # HuggingFace Spaces uses port 7860 by default
    port = int(os.getenv("PORT", 7860))

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

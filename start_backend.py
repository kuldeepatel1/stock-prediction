#!/usr/bin/env python
import os
import subprocess
import sys

# Change to backend directory
os.chdir('backend')

# Start the FastAPI server
subprocess.run([
    sys.executable, '-m', 'uvicorn', 
    'app.main:app', 
    '--host', '0.0.0.0', 
    '--port', '8000', 
    '--reload'
])

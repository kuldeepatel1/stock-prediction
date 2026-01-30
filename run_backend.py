#!/usr/bin/env python
import os
import subprocess
import sys

# Change to backend directory and set PYTHONPATH
backend_dir = os.path.join(os.getcwd(), 'backend')
os.chdir(backend_dir)
os.environ['PYTHONPATH'] = backend_dir

# Add current directory to Python path for relative imports
sys.path.insert(0, os.getcwd())

print(f"Starting backend from: {os.getcwd()}")
print(f"PYTHONPATH set to: {os.environ.get('PYTHONPATH')}")
print(f"sys.path[0] set to: {sys.path[0]}")

# Start the FastAPI server
result = subprocess.run([
    sys.executable, '-m', 'uvicorn', 
    'app.main:app', 
    '--host', '0.0.0.0', 
    '--port', '8000', 
    '--reload'
])

print(f"Backend server exited with code: {result.returncode}")

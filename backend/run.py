import os
import sys

# Add parent directory to system path to resolve the 'backend' package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    # Use environment variables if supplied, otherwise run locally on port 5000
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    print(f"Starting AgroMind Backend on {host}:{port} (debug={debug})...")
    app.run(host=host, port=port, debug=debug)

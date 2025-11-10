# Alternative startup script if port issues persist
import os

def find_free_port():
    """Find a free port to run the Flask server"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def start_server_with_free_port():
    """Start server on an available port"""
    from api_server import app
    
    # Try ports in order: 5001, 5002, 5003, or find a random free port
    preferred_ports = [num for num in range(5000,6000)]
    
    for port in preferred_ports:
        try:
            print(f"🚀 Trying to start server on port {port}...")
            app.run(debug=True, host='0.0.0.0', port=port)
            break
        except OSError as e:
            if "Address already in use" in str(e):
                print(f"❌ Port {port} is already in use")
                continue
            else:
                raise e
    else:
        # If all preferred ports are taken, use a random free port
        free_port = find_free_port()
        print(f"🚀 Starting server on available port {free_port}...")
        app.run(debug=True, host='0.0.0.0', port=free_port)

if __name__ == '__main__':
    start_server_with_free_port()
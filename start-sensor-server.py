#!/usr/bin/env python3
"""
AWTRIX Sensor Selector Server
Startet einen einfachen HTTP-Server für die externe Sensor-Auswahl
"""

import http.server
import socketserver
import os
import sys
import json
import webbrowser
from pathlib import Path

class SensorHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        if self.path == '/':
            self.path = '/sensor-selector.html'
        return super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/save-sensors':
            self.handle_save_sensors()
        else:
            self.send_error(404)
    
    def handle_save_sensors(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            sensor_data = json.loads(post_data.decode('utf-8'))
            # Save sensor data to a file that the main plugin can read
            with open('selected_sensors.json', 'w') as f:
                json.dump(sensor_data, f, indent=2)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

def find_free_port(start_port=8081, max_port=8090):
    """Findet einen freien Port zwischen start_port und max_port"""
    for port in range(start_port, max_port + 1):
        try:
            with socketserver.TCPServer(("", port), SensorHandler) as httpd:
                return port
        except OSError:
            continue
    return None

def start_server(port=None):
    """Startet den HTTP-Server"""
    if port is None:
        port = find_free_port()
        if port is None:
            print("❌ Kein freier Port zwischen 8081-8090 gefunden!")
            return None
    
    try:
        with socketserver.TCPServer(("", port), SensorHandler) as httpd:
            print(f"🚀 AWTRIX Sensor Server gestartet auf Port {port}")
            print(f"📱 URL: http://localhost:{port}")
            print(f"🌐 Externe URL: http://[RASPBERRY_PI_IP]:{port}")
            print("⏹️  Drücken Sie Ctrl+C zum Beenden")
            
            # Try to open browser (only works on local machine)
            try:
                webbrowser.open(f'http://localhost:{port}')
            except:
                pass
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server gestoppt")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} ist bereits belegt!")
            print("💡 Versuchen Sie einen anderen Port oder beenden Sie den anderen Server")
        else:
            print(f"❌ Fehler beim Starten des Servers: {e}")
        return None

def main():
    """Hauptfunktion"""
    print("🔧 AWTRIX Sensor Selector Server")
    print("=" * 40)
    
    # Check if port is provided as command line argument
    port = None
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
            print(f"🎯 Verwende Port {port}")
        except ValueError:
            print("❌ Ungültiger Port. Verwende automatische Port-Suche.")
    
    # Start server
    start_server(port)

if __name__ == "__main__":
    main()

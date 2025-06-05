#!/usr/bin/env python3
"""
Simple test script to verify database connection
"""

import os
import sys
from dotenv import load_dotenv

def test_connection():
    """Test connection to database"""
    try:
        print("Loading environment variables...")
        load_dotenv('../../backend/.env')
        
        # Parse SERVER_NODE to get host and port
        server_node = os.getenv('SERVER_NODE')
        db_username = os.getenv('DB_USERNAME')
        db_password = os.getenv('DB_PASSWORD')
        
        print(f"SERVER_NODE: {server_node}")
        print(f"DB_USERNAME: {db_username}")
        print(f"DB_PASSWORD: {'*' * len(db_password) if db_password else 'NOT SET'}")
        
        if not all([server_node, db_username, db_password]):
            print("❌ Missing required environment variables")
            return False
            
        # Parse host and port
        if server_node and ':' in server_node:
            host, port = server_node.split(':')
        else:
            host = server_node
            port = 443
            
        print(f"Host: {host}")
        print(f"Port: {port}")
        
        # Try to import hana_ml
        try:
            print("Importing hana_ml...")
            import hana_ml.dataframe as dataframe
            print("✅ hana_ml imported successfully")
            
            # Try connection
            print("Attempting database connection...")
            conn = dataframe.ConnectionContext(
                address=host,
                port=int(port),
                user=db_username,
                password=db_password
            )
            
            if conn.connection.isconnected():
                print("✅ Successfully connected to database")
                print(f"Schema: {conn.get_current_schema()}")
                conn.close()
                return True
            else:
                print("❌ Failed to connect to database")
                return False
                
        except ImportError as e:
            print(f"❌ hana_ml not available: {e}")
            print("💡 This library may not be installed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

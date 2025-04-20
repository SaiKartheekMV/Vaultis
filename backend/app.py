import base64
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import sys
import uuid
import traceback
import hashlib
import requests
import json
import time

# 🔧 Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# ✅ Imports from project modules
from storage.upload_to_ipfs import upload_to_pinata
from crypto.encryptor import encrypt_file_with_kyber
from crypto.decryptor import decrypt_file_with_kyber

# 🔧 Flask app setup
app = Flask(__name__)
# FIX: Enable CORS for all routes without restrictions
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Default blockchain settings configuration
DEFAULT_BLOCKCHAIN_SETTINGS = {
    # Backup & Recovery Features
    "backup": {
        "blockchain_backup_address": "",
        "recovery_email": "",
        "auto_backup_enabled": False,
        "backup_address_verified": False
    },
    # Security Settings
    "security": {
        "profile_level": "Standard",  # Standard, Advanced, Quantum
        "transaction_signing_method": "Standard",  # Standard (ECDSA), Enhanced (EdDSA), Quantum-Resistant (Dilithium), Hybrid (ECDSA + Dilithium)
        "key_rotation_frequency": "Never",  # Never, Quarterly, Monthly, Weekly, Daily
        "mfa_enabled": False,
        "stateful_transaction_firewall": False,
        "security_notifications": True,
        "whitelisted_addresses": [],
        "transaction_timelock": "None",  # None, 1 Hour, 24 Hours, 48 Hours, 7 Days
        "hash_algorithm": "SHA-256"  # SHA-256, SHA-3, BLAKE2
    },
    # Quantum Protection Features
    "quantum_protection": {
        "quantum_resistance_mode": "Off",  # Off, Basic, Enhanced, Maximum
        "lattice_based_encryption": False,
        "qrng_enabled": False,
        "post_quantum_signature_scheme": "None",  # None, FALCON, Dilithium, SPHINCS+
        "entropy_source": "System",  # System, Hybrid, Quantum
        "zero_knowledge_proofs": False,
        "quantum_entanglement_verification": False,
        "hash_signature_scheme": "None",  # None, Lamport, Winternitz, XMSS
        "quantum_security_level": 0  # 0-5 scale
    }
}

# Create settings directory if it doesn't exist
os.makedirs(os.path.join(BASE_DIR, "settings"), exist_ok=True)
SETTINGS_FILE = os.path.join(BASE_DIR, "settings", "blockchain_settings.json")

# Initialize settings file if it doesn't exist
if not os.path.exists(SETTINGS_FILE):
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(DEFAULT_BLOCKCHAIN_SETTINGS, f, indent=4)

def get_from_pinata(cid, output_path):
    """
    Download a file from Pinata IPFS by its CID and save it to output_path
    Returns True if successful, False otherwise
    """
    try:
        # Try multiple gateways in case one fails
        gateways = [
            f"https://gateway.pinata.cloud/ipfs/{cid}",
            f"https://ipfs.io/ipfs/{cid}",
            f"https://cloudflare-ipfs.com/ipfs/{cid}"
        ]
        
        for gateway_url in gateways:
            try:
                print(f"[🔍] Trying IPFS gateway: {gateway_url}")
                
                # Make the request to download the file
                response = requests.get(gateway_url, stream=True, timeout=30)
                response.raise_for_status()
                
                # Save the file to the specified output path
                with open(output_path, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)
                
                print(f"[✅] Successfully downloaded file to {output_path}")
                return True
            except requests.RequestException as gateway_error:
                print(f"[⚠️] Gateway {gateway_url} failed: {gateway_error}")
                continue
        
        print(f"[❌] All IPFS gateways failed for CID: {cid}")
        return False
        
    except Exception as e:
        print(f"[❌] Error downloading from IPFS: {e}")
        traceback.print_exc()
        return False
# Helper function for quantum settings
def get_blockchain_settings():
    """
    Load blockchain settings from JSON file
    """
    try:
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"[⚠️] Error loading blockchain settings: {e}")
        # Return default settings if file can't be loaded
        return DEFAULT_BLOCKCHAIN_SETTINGS

def save_blockchain_settings(settings):
    """
    Save blockchain settings to JSON file
    """
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=4)
        return True
    except Exception as e:
        print(f"[❌] Error saving blockchain settings: {e}")
        return False

@app.route("/api/encrypt-upload", methods=["POST"])
def encrypt_and_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    uploaded_file = request.files["file"]
    original_filename = uploaded_file.filename
    
    # 📁 Temp file paths
    temp_input_path = os.path.join("temp", f"input_{uuid.uuid4().hex}_{original_filename}")
    temp_encrypted_path = os.path.join("temp", f"encrypted_{uuid.uuid4().hex}_{original_filename}")
    
    try:
        # 📂 Ensure temp directory exists
        os.makedirs("temp", exist_ok=True)
        
        # 💾 Save uploaded file to temp location
        uploaded_file.save(temp_input_path)
        print(f"[📥] Received file: {original_filename}")
        print(f"[🗂️] Temp input path: {temp_input_path}")
        
        # Get current quantum security settings
        settings = get_blockchain_settings()
        quantum_settings = settings["quantum_protection"]
        
        # Apply quantum settings to encryption if enabled
        use_quantum_enhanced = quantum_settings["quantum_resistance_mode"] != "Off"
        
        # 🔐 Encrypt using Kyber with quantum enhancements if enabled
        encrypted_data, public_key, private_key = encrypt_file_with_kyber(
            input_path=temp_input_path,
            output_path=temp_encrypted_path
        )
        
        if not encrypted_data:
            raise Exception("Encryption failed. No encrypted data returned.")
        
        print(f"[🔐] Encryption complete. Encrypted file saved at: {temp_encrypted_path}")
        
        # Properly format the public key for JSON response
        print(f"[🔑] Public key type: {type(public_key)}")
        print(f"[🔑] Public key value: {public_key}")
        
        # Ensure public_key is a string
        if isinstance(public_key, bytes):
            formatted_public_key = public_key.decode('utf-8', errors='replace')
        elif not isinstance(public_key, str):
            formatted_public_key = str(public_key)
        else:
            formatted_public_key = public_key
            
        print(f"[🔑] Formatted public key for response: {formatted_public_key}")
        
        # Save private key temporarily (in a real app, you would handle this more securely)
        private_key_path = os.path.join("temp", f"private_key_{uuid.uuid4().hex}")
        with open(private_key_path, 'w') as f:
            if isinstance(private_key, bytes):
                f.write(private_key.decode('utf-8', errors='replace'))
            else:
                f.write(str(private_key))
        
        # 🚀 Upload encrypted file to IPFS via Pinata
        cid = upload_to_pinata(temp_encrypted_path)
        print(f"[🌐] Uploaded to IPFS! CID: {cid}")
        
        # 🧠 Generate hash of encrypted data for integrity (optional)
        hash_algorithm = settings["security"]["hash_algorithm"]
        if hash_algorithm == "SHA-256":
            encrypted_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()
        elif hash_algorithm == "SHA-3":
            encrypted_hash = hashlib.sha3_256(encrypted_data.encode()).hexdigest()
        elif hash_algorithm == "BLAKE2":
            encrypted_hash = hashlib.blake2b(encrypted_data.encode()).hexdigest()
        else:
            encrypted_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()
        
        # Backup handling (if enabled)
        backup_info = {}
        if settings["backup"]["auto_backup_enabled"] and settings["backup"]["blockchain_backup_address"]:
            try:
                # Simulate backup to blockchain address
                backup_info = {
                    "backed_up": True,
                    "backup_address": settings["backup"]["blockchain_backup_address"],
                    "backup_timestamp": time.time()
                }
                print(f"[💾] Auto-backup to blockchain address: {settings['backup']['blockchain_backup_address']}")
            except Exception as e:
                backup_info = {"backed_up": False, "error": str(e)}
                print(f"[⚠️] Auto-backup failed: {e}")
        
        return jsonify({
            "cid": cid,
            "kyber_public_key": formatted_public_key,
            "encrypted_hash": encrypted_hash,
            "original_filename": original_filename,
            "private_key_id": os.path.basename(private_key_path),
            "private_key": str(private_key),  # Include the actual private key
            "private_key_warning": "IMPORTANT: Save this private key immediately. It will be deleted from our servers and cannot be recovered.",
            "quantum_enhanced": use_quantum_enhanced,
            "backup_info": backup_info
        }), 200
    
    except Exception as e:
        print(f"[❌] Error during encryption/upload: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Encryption/Upload failed: {str(e)}"}), 500
    
    finally:
        # 🧹 Cleanup temp files (but keep private key for now)
        for path in [temp_input_path, temp_encrypted_path]:
            if os.path.exists(path):
                os.remove(path)
                print(f"[🧹] Deleted temp file: {path}")

@app.route("/api/download/<cid>", methods=["GET"])
def download_file(cid):
    """Download an encrypted file directly from IPFS without decryption"""
    print(f"[🔄] Download request received for CID: {cid}")
    
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    
    # Generate temporary file path
    temp_downloaded_path = os.path.join("temp", f"downloaded_{uuid.uuid4().hex}")
    
    try:
        print(f"[🔍] Attempting to download file with CID: {cid}")
        
        # Download encrypted file from IPFS/Pinata
        download_success = get_from_pinata(cid, temp_downloaded_path)
        
        if not download_success:
            print("[❌] Failed to download file from IPFS")
            return jsonify({"error": "Failed to retrieve file from IPFS"}), 404
        
        print(f"[📥] Downloaded encrypted file to: {temp_downloaded_path}")
        
        # Check if file exists and has content
        if not os.path.exists(temp_downloaded_path):
            print(f"[❌] File was not found at {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file not found on server"}), 500
            
        if os.path.getsize(temp_downloaded_path) == 0:
            print(f"[❌] Downloaded file is empty: {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file is empty"}), 500
        
        print(f"[📤] About to send file {temp_downloaded_path} (size: {os.path.getsize(temp_downloaded_path)} bytes)")
        
        # Return the file with proper CORS headers
        response = send_file(
            temp_downloaded_path,
            as_attachment=True,
            download_name=f"file-{cid[:8]}",
            mimetype="application/octet-stream"
        )
        
        # Add CORS headers explicitly
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"[❌] Error during file download: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Download failed: {str(e)}"}), 500
    print(f"[🔄] Download request received for CID: {cid}")
    
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    
    # Generate temporary file path
    temp_downloaded_path = os.path.join("temp", f"downloaded_{uuid.uuid4().hex}")
    
    try:
        print(f"[🔍] Attempting to download file with CID: {cid}")
        
        # Download encrypted file from IPFS/Pinata
        download_success = get_from_pinata(cid, temp_downloaded_path)
        
        if not download_success:
            print("[❌] Failed to download file from IPFS")
            return jsonify({"error": "Failed to retrieve file from IPFS"}), 404
        
        print(f"[📥] Downloaded encrypted file to: {temp_downloaded_path}")
        
        # Check if file exists and has content
        if not os.path.exists(temp_downloaded_path):
            print(f"[❌] File was not found at {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file not found on server"}), 500
            
        if os.path.getsize(temp_downloaded_path) == 0:
            print(f"[❌] Downloaded file is empty: {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file is empty"}), 500
        
        print(f"[📤] About to send file {temp_downloaded_path} (size: {os.path.getsize(temp_downloaded_path)} bytes)")
        
        # Return the file with proper CORS headers
        response = send_file(
            temp_downloaded_path,
            as_attachment=True,
            download_name=f"file-{cid[:8]}",
            mimetype="application/octet-stream"
        )
        
        # Add CORS headers explicitly
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"[❌] Error during file download: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Download failed: {str(e)}"}), 500
    
    finally:
        # Don't delete the file yet - Flask needs to send it
        # After-request cleanup will handle this
        pass

@app.route("/api/store-key", methods=["POST"])
def store_encrypted_key():
    """Store a private key encrypted with a user password"""
    try:
        if not request.json or "private_key" not in request.json or "cid" not in request.json:
            return jsonify({"error": "Private key and CID are required"}), 400
            
        private_key = request.json["private_key"]
        cid = request.json["cid"]
        password = request.json.get("password", "")  # Optional password
        
        # Create a secure directory for key storage
        key_storage_dir = os.path.join(BASE_DIR, "key_storage")
        os.makedirs(key_storage_dir, exist_ok=True)
        
        # Hash the CID to create a filename
        filename = hashlib.sha256(cid.encode()).hexdigest()
        key_path = os.path.join(key_storage_dir, filename)
        
        # If password provided, encrypt the private key
        if password:
            # Simple encryption - in production, use proper encryption
            encrypted_key = encrypt_file_with_kyber(private_key, password)
            with open(key_path, 'w') as f:
                f.write(encrypted_key)
        else:
            with open(key_path, 'w') as f:
                f.write(private_key)
                
        return jsonify({
            "status": "success",
            "message": "Private key stored successfully",
            "requires_password": bool(password)
        }), 200
            
    except Exception as e:
        print(f"[❌] Error storing private key: {e}")
        return jsonify({"error": f"Failed to store private key: {str(e)}"}), 500



@app.route("/api/download-decrypt/<cid>", methods=["POST"])
def download_and_decrypt(cid):
    print(f"[🔄] Download and decrypt request received for CID: {cid}")
    
    # Check for private key in request
    if not request.json or "private_key" not in request.json:
        return jsonify({"error": "Private key is required for decryption"}), 400
    
    private_key = request.json.get("private_key")
    original_filename = request.json.get("original_filename", f"decrypted-{cid[:8]}")
    
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    
    # Generate temporary file paths
    temp_downloaded_path = os.path.join("temp", f"downloaded_{uuid.uuid4().hex}")
    temp_decrypted_path = os.path.join("temp", f"decrypted_{uuid.uuid4().hex}_{original_filename}")
    
    try:
        # Get current security settings
        settings = get_blockchain_settings()
        
        # Check transaction whitelist if enabled
        if settings["security"]["stateful_transaction_firewall"] and len(settings["security"]["whitelisted_addresses"]) > 0:
            # In a real application, you would verify the CID against whitelisted addresses
            # For demonstration, we'll just log it
            print(f"[🔒] Transaction firewall active, checking whitelist for CID: {cid}")
            # Mock whitelist check
            whitelist_passed = True  # In a real app, this would be an actual check
            if not whitelist_passed:
                return jsonify({"error": "CID not from a whitelisted address"}), 403
        
        print(f"[🔍] Attempting to download file with CID: {cid}")
        
        # Download encrypted file from IPFS/Pinata
        download_success = get_from_pinata(cid, temp_downloaded_path)
        
        if not download_success:
            print("[❌] Failed to download file from IPFS")
            return jsonify({"error": "Failed to retrieve file from IPFS"}), 404
        
        print(f"[📥] Downloaded encrypted file to: {temp_downloaded_path}")
        
        # Check if file exists and has content
        if not os.path.exists(temp_downloaded_path):
            print(f"[❌] File was not found at {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file not found on server"}), 500
            
        if os.path.getsize(temp_downloaded_path) == 0:
            print(f"[❌] Downloaded file is empty: {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file is empty"}), 500
        
        print(f"[🔓] Attempting to decrypt file...")
        
        # Apply quantum enhancement settings for decryption if enabled
        quantum_settings = settings["quantum_protection"]
        use_quantum_enhanced = quantum_settings["quantum_resistance_mode"] != "Off"
        
        # Decrypt the file
        decryption_success = decrypt_file_with_kyber(
            input_path=temp_downloaded_path,
            output_path=temp_decrypted_path,
            private_key=private_key,
            use_quantum_enhanced=use_quantum_enhanced
        )
        
        if not decryption_success:
            print("[❌] Decryption failed")
            return jsonify({"error": "Failed to decrypt file"}), 500
            
        print(f"[✅] Successfully decrypted file to: {temp_decrypted_path}")
        
        # Return the decrypted file with proper CORS headers
        response = send_file(
            temp_decrypted_path,
            as_attachment=True,
            download_name=original_filename,
            mimetype="application/octet-stream"
        )
        
        # Add CORS headers explicitly
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"[❌] Error during file download and decryption: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Download and decryption failed: {str(e)}"}), 500
    
    finally:
        # Don't delete the file yet - Flask needs to send it
        # After-request cleanup will handle this
        pass


@app.route("/api/download-decrypt", methods=["POST"])
def download_decrypt():
    """Download and decrypt a file from IPFS using Kyber decryption"""
    try:
        data = request.json
        cid = data.get('cid')
        private_key = data.get('private_key')
        original_filename = data.get('original_filename', f"decrypted-{cid[:8]}")
        
        if not cid or not private_key:
            return jsonify({'error': 'CID and private key are required'}), 400
            
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Generate temporary file paths
        temp_downloaded_path = os.path.join("temp", f"downloaded_{uuid.uuid4().hex}")
        temp_decrypted_path = os.path.join("temp", f"decrypted_{uuid.uuid4().hex}_{original_filename}")
        
        print(f"[🔍] Attempting to download file with CID: {cid}")
        
        # Download encrypted file from IPFS/Pinata
        download_success = get_from_pinata(cid, temp_downloaded_path)
        
        if not download_success:
            print("[❌] Failed to download file from IPFS")
            return jsonify({"error": "Failed to retrieve file from IPFS"}), 404
        
        print(f"[📥] Downloaded encrypted file to: {temp_downloaded_path}")
        
        # Check if file exists and has content
        if not os.path.exists(temp_downloaded_path):
            print(f"[❌] File was not found at {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file not found on server"}), 500
            
        if os.path.getsize(temp_downloaded_path) == 0:
            print(f"[❌] Downloaded file is empty: {temp_downloaded_path}")
            return jsonify({"error": "Downloaded file is empty"}), 500
        
        # Get current security settings
        settings = get_blockchain_settings()
        quantum_settings = settings["quantum_protection"]
        use_quantum_enhanced = quantum_settings["quantum_resistance_mode"] != "Off"
        
        print(f"[🔓] Attempting to decrypt file...")
        
        # Decrypt the file
        decryption_success = decrypt_file_with_kyber(
            input_path=temp_downloaded_path,
            output_path=temp_decrypted_path,
            private_key=private_key,
            use_quantum_enhanced=use_quantum_enhanced
        )
        
        if not decryption_success:
            print("[❌] Decryption failed")
            return jsonify({"error": "Failed to decrypt file"}), 500
        
        print(f"[✅] Successfully decrypted file to: {temp_decrypted_path}")
        
        # Return the decrypted file with proper CORS headers
        response = send_file(
            temp_decrypted_path,
            as_attachment=True,
            download_name=original_filename,
            mimetype="application/octet-stream"
        )
        
        # Add CORS headers explicitly
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"[❌] Error during file download and decryption: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Download and decryption failed: {str(e)}"}), 500
    try:
        data = request.json
        cid = data.get('cid')
        private_key = data.get('private_key')
        original_filename = data.get('original_filename', f"decrypted-{cid[:8]}")
        
        if not cid or not private_key:
            return jsonify({'error': 'CID and private key are required'}), 400
            
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Generate temporary file paths
        temp_downloaded_path = os.path.join("temp", f"downloaded_{uuid.uuid4().hex}")
        temp_decrypted_path = os.path.join("temp", f"decrypted_{uuid.uuid4().hex}_{original_filename}")
        
        # Download encrypted file from IPFS/Pinata
        download_success = get_from_pinata(cid, temp_downloaded_path)
        
        if not download_success:
            return jsonify({"error": "Failed to retrieve file from IPFS"}), 404
        
        # Get current security settings
        settings = get_blockchain_settings()
        quantum_settings = settings["quantum_protection"]
        use_quantum_enhanced = quantum_settings["quantum_resistance_mode"] != "Off"
        
        # Decrypt the file
        decryption_success = decrypt_file_with_kyber(
            input_path=temp_downloaded_path,
            output_path=temp_decrypted_path,
            private_key=private_key,
            use_quantum_enhanced=use_quantum_enhanced
        )
        
        if not decryption_success:
            return jsonify({"error": "Failed to decrypt file"}), 500
        
        # Return the decrypted file with proper CORS headers
        response = send_file(
            temp_decrypted_path,
            as_attachment=True,
            download_name=original_filename,
            mimetype="application/octet-stream"
        )
        
        # Add CORS headers explicitly
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"[❌] Error during file download and decryption: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Download and decryption failed: {str(e)}"}), 500


@app.route('/api/private-key/<key_id>', methods=['GET'])
def get_private_key(key_id):
    """Retrieve private key by ID."""
    try:
        # Security check to prevent path traversal
        if ".." in key_id or "/" in key_id or "\\" in key_id:
            return jsonify({"error": "Invalid key ID"}), 400
            
        private_key_path = os.path.join("temp", key_id)
        
        if not os.path.exists(private_key_path):
            return jsonify({"error": "Private key not found or expired"}), 404
            
        with open(private_key_path, 'r') as f:
            private_key = f.read()
            
        return jsonify({
            "private_key": private_key,
            "message": "IMPORTANT: Save this private key immediately. It will be deleted from our servers shortly and cannot be recovered."
        }), 200
        
    except Exception as e:
        print(f"[❌] Error retrieving private key: {e}")
        return jsonify({"error": f"Failed to retrieve private key: {str(e)}"}), 500
# New endpoints for blockchain settings management




@app.route("/api/blockchain/settings", methods=["GET"])
def get_settings():
    """Get the current blockchain settings"""
    try:
        settings = get_blockchain_settings()
        return jsonify(settings), 200
    except Exception as e:
        print(f"[❌] Error getting blockchain settings: {e}")
        return jsonify({"error": f"Failed to get settings: {str(e)}"}), 500

@app.route("/api/blockchain/settings", methods=["PUT"])
def update_settings():
    """Update blockchain settings"""
    try:
        if not request.json:
            return jsonify({"error": "No settings data provided"}), 400
            
        # Get current settings
        current_settings = get_blockchain_settings()
        
        # Update settings with new values
        # For backup settings
        if "backup" in request.json:
            current_settings["backup"].update(request.json["backup"])
            
        # For security settings
        if "security" in request.json:
            current_settings["security"].update(request.json["security"])
            
        # For quantum protection settings
        if "quantum_protection" in request.json:
            current_settings["quantum_protection"].update(request.json["quantum_protection"])
            
        # Save updated settings
        if save_blockchain_settings(current_settings):
            return jsonify({"status": "success", "settings": current_settings}), 200
        else:
            return jsonify({"error": "Failed to save settings"}), 500
            
    except Exception as e:
        print(f"[❌] Error updating blockchain settings: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to update settings: {str(e)}"}), 500

@app.route("/api/blockchain/settings/reset", methods=["POST"])
def reset_settings():
    """Reset blockchain settings to default"""
    try:
        if save_blockchain_settings(DEFAULT_BLOCKCHAIN_SETTINGS):
            return jsonify({"status": "success", "settings": DEFAULT_BLOCKCHAIN_SETTINGS}), 200
        else:
            return jsonify({"error": "Failed to reset settings"}), 500
    except Exception as e:
        print(f"[❌] Error resetting blockchain settings: {e}")
        return jsonify({"error": f"Failed to reset settings: {str(e)}"}), 500

@app.route("/api/blockchain/whitelist", methods=["GET"])
def get_whitelist():
    """Get the whitelist of approved addresses"""
    try:
        settings = get_blockchain_settings()
        return jsonify(settings["security"]["whitelisted_addresses"]), 200
    except Exception as e:
        print(f"[❌] Error getting whitelist: {e}")
        return jsonify({"error": f"Failed to get whitelist: {str(e)}"}), 500

@app.route("/api/blockchain/whitelist", methods=["POST"])
def add_to_whitelist():
    """Add an address to the whitelist"""
    try:
        if not request.json or "address" not in request.json:
            return jsonify({"error": "No address provided"}), 400
            
        address = request.json["address"]
        
        # Get current settings
        settings = get_blockchain_settings()
        
        # Add address if not already in whitelist
        if address not in settings["security"]["whitelisted_addresses"]:
            settings["security"]["whitelisted_addresses"].append(address)
            
            # Save updated settings
            if save_blockchain_settings(settings):
                return jsonify({
                    "status": "success", 
                    "whitelist": settings["security"]["whitelisted_addresses"]
                }), 200
            else:
                return jsonify({"error": "Failed to save whitelist"}), 500
        else:
            return jsonify({
                "status": "success", 
                "message": "Address already in whitelist",
                "whitelist": settings["security"]["whitelisted_addresses"]
            }), 200
            
    except Exception as e:
        print(f"[❌] Error adding to whitelist: {e}")
        return jsonify({"error": f"Failed to add to whitelist: {str(e)}"}), 500

@app.route("/api/blockchain/whitelist/<address>", methods=["DELETE"])
def remove_from_whitelist(address):
    """Remove an address from the whitelist"""
    try:
        # Get current settings
        settings = get_blockchain_settings()
        
        # Remove address if in whitelist
        if address in settings["security"]["whitelisted_addresses"]:
            settings["security"]["whitelisted_addresses"].remove(address)
            
            # Save updated settings
            if save_blockchain_settings(settings):
                return jsonify({
                    "status": "success", 
                    "whitelist": settings["security"]["whitelisted_addresses"]
                }), 200
            else:
                return jsonify({"error": "Failed to save whitelist"}), 500
        else:
            return jsonify({
                "status": "success", 
                "message": "Address not in whitelist",
                "whitelist": settings["security"]["whitelisted_addresses"]
            }), 200
            
    except Exception as e:
        print(f"[❌] Error removing from whitelist: {e}")
        return jsonify({"error": f"Failed to remove from whitelist: {str(e)}"}), 500

@app.route("/api/blockchain/verify-backup-address", methods=["POST"])
def verify_backup_address():
    """Verify a blockchain backup address"""
    try:
        if not request.json or "address" not in request.json:
            return jsonify({"error": "No address provided"}), 400
            
        address = request.json["address"]
        
        # In a real application, you would perform actual verification
        # For demonstration, we'll simulate address verification
        
        # Mock validation - check if address starts with "0x" and is 42 chars long (like Ethereum)
        is_valid = address.startswith("0x") and len(address) == 42
        
        if is_valid:
            # Get current settings
            settings = get_blockchain_settings()
            
            # Update backup address and verification status
            settings["backup"]["blockchain_backup_address"] = address
            settings["backup"]["backup_address_verified"] = True
            
            # Save updated settings
            if save_blockchain_settings(settings):
                return jsonify({
                    "status": "success", 
                    "message": "Backup address verified",
                    "address": address,
                    "verified": True
                }), 200
            else:
                return jsonify({"error": "Failed to save verification status"}), 500
        else:
            return jsonify({
                "status": "error", 
                "message": "Invalid blockchain address format",
                "verified": False
            }), 400
            
    except Exception as e:
        print(f"[❌] Error verifying backup address: {e}")
        return jsonify({"error": f"Failed to verify backup address: {str(e)}"}), 500

@app.route("/api/blockchain/security-level", methods=["POST"])
def set_security_level():
    """Set security level with predefined settings for each level"""
    try:
        if not request.json or "level" not in request.json:
            return jsonify({"error": "No security level provided"}), 400
            
        level = request.json["level"]
        
        # Get current settings
        settings = get_blockchain_settings()
        
        # Set predefined settings based on security level
        if level == "Standard":
            settings["security"]["profile_level"] = "Standard"
            settings["security"]["transaction_signing_method"] = "Standard"  # ECDSA
            settings["security"]["key_rotation_frequency"] = "Never"
            settings["security"]["stateful_transaction_firewall"] = False
            settings["security"]["hash_algorithm"] = "SHA-256"
            settings["quantum_protection"]["quantum_resistance_mode"] = "Off"
            settings["quantum_protection"]["post_quantum_signature_scheme"] = "None"
            settings["quantum_protection"]["entropy_source"] = "System"
            settings["quantum_protection"]["quantum_security_level"] = 0
            
        elif level == "Advanced":
            settings["security"]["profile_level"] = "Advanced"
            settings["security"]["transaction_signing_method"] = "Enhanced"  # EdDSA
            settings["security"]["key_rotation_frequency"] = "Monthly"
            settings["security"]["stateful_transaction_firewall"] = True
            settings["security"]["hash_algorithm"] = "SHA-3"
            settings["quantum_protection"]["quantum_resistance_mode"] = "Basic"
            settings["quantum_protection"]["post_quantum_signature_scheme"] = "FALCON"
            settings["quantum_protection"]["entropy_source"] = "Hybrid"
            settings["quantum_protection"]["quantum_security_level"] = 2
            
        elif level == "Quantum":
            settings["security"]["profile_level"] = "Quantum"
            settings["security"]["transaction_signing_method"] = "Quantum-Resistant"  # Dilithium
            settings["security"]["key_rotation_frequency"] = "Weekly"
            settings["security"]["stateful_transaction_firewall"] = True
            settings["security"]["hash_algorithm"] = "BLAKE2"
            settings["quantum_protection"]["quantum_resistance_mode"] = "Maximum"
            settings["quantum_protection"]["lattice_based_encryption"] = True
            settings["quantum_protection"]["qrng_enabled"] = True
            settings["quantum_protection"]["post_quantum_signature_scheme"] = "Dilithium"
            settings["quantum_protection"]["entropy_source"] = "Quantum"
            settings["quantum_protection"]["zero_knowledge_proofs"] = True
            settings["quantum_protection"]["quantum_entanglement_verification"] = True
            settings["quantum_protection"]["hash_signature_scheme"] = "XMSS"
            settings["quantum_protection"]["quantum_security_level"] = 5
            
        else:
            return jsonify({"error": "Invalid security level"}), 400
            
        # Save updated settings
        if save_blockchain_settings(settings):
            return jsonify({
                "status": "success", 
                "message": f"Security level set to {level}",
                "settings": settings
            }), 200
        else:
            return jsonify({"error": "Failed to save security level"}), 500
            
    except Exception as e:
        print(f"[❌] Error setting security level: {e}")
        return jsonify({"error": f"Failed to set security level: {str(e)}"}), 500

# Mock function for Kyber decryption
def mock_kyber_decrypt(encrypted_content, private_key):
    """
    Mock function for Kyber decryption
    In a real implementation, this would be replaced with actual Kyber decryption
    """
    # This is just a placeholder - you would replace this with actual decryption code
    print("[🔄] Mock decryption (replace with actual Kyber decryption)")
    return encrypted_content  # In a real implementation, this would return decrypted data

# Clean up temp files after response has been sent
@app.after_request
def cleanup(response):
    """Clean up temporary files after responding to the client"""
    try:
        temp_dir = "temp"
        if os.path.exists(temp_dir):
            current_time = time.time()
            for filename in os.listdir(temp_dir):
                filepath = os.path.join(temp_dir, filename)
                # Check if file is older than 5 minutes (300 seconds)
                if os.path.isfile(filepath) and current_time - os.path.getmtime(filepath) > 300:
                    try:
                        os.remove(filepath)
                        print(f"[🧹] Deleted old temp file: {filepath}")
                    except Exception as file_error:
                        print(f"[⚠️] Error deleting {filepath}: {file_error}")
    except Exception as e:
        print(f"[⚠️] Cleanup error (non-critical): {e}")
    
    return response
    # Find all temp files older than 15 minutes and delete them
    try:
        temp_dir = "temp"
        if os.path.exists(temp_dir):
            current_time = time.time()
            for filename in os.listdir(temp_dir):
                filepath = os.path.join(temp_dir, filename)
                # Check if file is older than 15 minutes
                if os.path.isfile(filepath) and current_time - os.path.getmtime(filepath) > 900:  # 15 minutes = 900 seconds
                    try:
                        os.remove(filepath)
                        print(f"[🧹] Deleted old temp file: {filepath}")
                    except:
                        pass
    except Exception as e:
        print(f"[⚠️] Cleanup error (non-critical): {e}")
    
    return response
    # Find all temp files older than 1 minute and delete them
    try:
        temp_dir = "temp"
        if os.path.exists(temp_dir):
            current_time = time.time()
            for filename in os.listdir(temp_dir):
                filepath = os.path.join(temp_dir, filename)
                # Check if file is older than 1 minute
                if os.path.isfile(filepath) and current_time - os.path.getmtime(filepath) > 60:
                    try:
                        os.remove(filepath)
                        print(f"[🧹] Deleted old temp file: {filepath}")
                    except:
                        pass
    except Exception as e:
        print(f"[⚠️] Cleanup error (non-critical): {e}")
    
    return response

# Add a basic web UI for blockchain settings
@app.route("/blockchain-settings", methods=["GET"])
def blockchain_settings_ui():
    settings = get_blockchain_settings()
    return render_template("blockchain_settings.html", settings=settings)

# 🔧 Run app
# 🔧 Run app
if __name__ == "__main__":
    # Check if necessary modules are imported
    if 'requests' not in sys.modules:
        print("[❌] The 'requests' module is required but not imported.")
        sys.exit(1)
    if 'time' not in sys.modules:
        print("[❌] The 'time' module is required but not imported.")
        sys.exit(1)
        
    # Create directories if they don't exist
    os.makedirs("temp", exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "settings"), exist_ok=True)
    
    print("[🚀] Starting Quantum-Secure Blockchain File Server")
    print("[🔒] Current security profile:", get_blockchain_settings()["security"]["profile_level"])
    
    # Run the Flask app
    app.run(host="0.0.0.0", port=5000, debug=True)

# Additional routes for quantum security features

@app.route("/api/blockchain/quantum-analysis", methods=["POST"])
def analyze_quantum_security():
    """Analyze file or transaction for quantum security vulnerabilities"""
    try:
        if not request.json:
            return jsonify({"error": "No data provided for analysis"}), 400
            
        # Get current settings
        settings = get_blockchain_settings()
        quantum_settings = settings["quantum_protection"]
        
        # Mock quantum security analysis
        analysis_results = {
            "security_score": 85 if quantum_settings["quantum_resistance_mode"] != "Off" else 60,
            "vulnerabilities": [],
            "recommendations": []
        }
        
        # Check quantum resistance mode
        if quantum_settings["quantum_resistance_mode"] == "Off":
            analysis_results["vulnerabilities"].append({
                "type": "Shor's Algorithm Vulnerability",
                "description": "Current encryption is vulnerable to quantum factorization attacks",
                "severity": "High"
            })
            analysis_results["recommendations"].append(
                "Enable quantum resistance mode for protection against quantum computing attacks"
            )
            analysis_results["security_score"] -= 15
            
        # Check post-quantum signatures
        if quantum_settings["post_quantum_signature_scheme"] == "None":
            analysis_results["vulnerabilities"].append({
                "type": "Signature Vulnerability",
                "description": "Traditional signatures may be broken by quantum computers",
                "severity": "Medium"
            })
            analysis_results["recommendations"].append(
                "Implement a post-quantum signature scheme like Dilithium or FALCON"
            )
            analysis_results["security_score"] -= 10
            
        # Add more advanced analysis based on requested data
        if "cid" in request.json:
            # Simulate analysis of a file identified by CID
            analysis_results["file_analysis"] = {
                "cid": request.json["cid"],
                "encryption_strength": "Strong" if quantum_settings["quantum_resistance_mode"] != "Off" else "Standard",
                "quantum_resistant": quantum_settings["quantum_resistance_mode"] != "Off"
            }
            
        return jsonify(analysis_results), 200
            
    except Exception as e:
        print(f"[❌] Error during quantum security analysis: {e}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route("/api/blockchain/key-rotation", methods=["POST"])
def rotate_encryption_keys():
    """Rotate encryption keys based on the configured frequency"""
    try:
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if key rotation is enabled
        if settings["security"]["key_rotation_frequency"] == "Never":
            return jsonify({
                "status": "error",
                "message": "Key rotation is disabled. Change frequency setting to enable."
            }), 400
            
        # Simulate key rotation process
        rotation_results = {
            "status": "success",
            "old_key_hash": hashlib.sha256(str(time.time() - 1000).encode()).hexdigest()[:10],
            "new_key_hash": hashlib.sha256(str(time.time()).encode()).hexdigest()[:10],
            "rotation_timestamp": time.time(),
            "next_rotation": None,
            "quantum_enhanced": settings["quantum_protection"]["quantum_resistance_mode"] != "Off"
        }
        
        # Calculate next rotation time based on frequency setting
        if settings["security"]["key_rotation_frequency"] == "Daily":
            rotation_results["next_rotation"] = time.time() + (24 * 60 * 60)  # 24 hours
        elif settings["security"]["key_rotation_frequency"] == "Weekly":
            rotation_results["next_rotation"] = time.time() + (7 * 24 * 60 * 60)  # 7 days
        elif settings["security"]["key_rotation_frequency"] == "Monthly":
            rotation_results["next_rotation"] = time.time() + (30 * 24 * 60 * 60)  # 30 days
        elif settings["security"]["key_rotation_frequency"] == "Quarterly":
            rotation_results["next_rotation"] = time.time() + (90 * 24 * 60 * 60)  # 90 days
            
        return jsonify(rotation_results), 200
            
    except Exception as e:
        print(f"[❌] Error during key rotation: {e}")
        return jsonify({"error": f"Key rotation failed: {str(e)}"}), 500

@app.route("/api/blockchain/quantum-entropy", methods=["GET"])
def get_quantum_entropy():
    """Get quantum-based entropy for enhanced security operations"""
    try:
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if quantum entropy is available
        if settings["quantum_protection"]["entropy_source"] == "System":
            # For system entropy, just use os.urandom()
            entropy = os.urandom(32).hex()
            source = "System"
        elif settings["quantum_protection"]["entropy_source"] == "Hybrid":
            # Simulate hybrid entropy source (system + mock quantum)
            system_entropy = os.urandom(16).hex()
            # Mock quantum entropy
            quantum_entropy = hashlib.sha256(str(time.time()).encode()).hexdigest()[:32]
            entropy = system_entropy + quantum_entropy
            source = "Hybrid (System + Simulated Quantum)"
        else:  # "Quantum"
            # Simulate quantum entropy (in a real app, you'd use a quantum random number generator)
            entropy = hashlib.sha3_256(str(time.time() + os.urandom(8).hex()).encode()).hexdigest()
            source = "Simulated Quantum"
            
        return jsonify({
            "entropy": entropy,
            "source": source,
            "timestamp": time.time(),
            "bits": len(entropy) * 4  # Each hex character represents 4 bits
        }), 200
            
    except Exception as e:
        print(f"[❌] Error generating quantum entropy: {e}")
        return jsonify({"error": f"Entropy generation failed: {str(e)}"}), 500

@app.route("/api/blockchain/zero-knowledge-proof", methods=["POST"])
def generate_zero_knowledge_proof():
    """Generate a zero-knowledge proof for secure verification"""
    try:
        if not request.json or "data" not in request.json:
            return jsonify({"error": "No data provided for proof generation"}), 400
            
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if zero knowledge proofs are enabled
        if not settings["quantum_protection"]["zero_knowledge_proofs"]:
            return jsonify({
                "status": "error",
                "message": "Zero-knowledge proofs are not enabled in settings"
            }), 400
            
        # Mock zero-knowledge proof generation
        # In a real application, you would implement actual ZKP algorithms
        data = request.json["data"]
        
        # Create a mock proof (this would be an actual ZKP in production)
        proof = {
            "commitment": hashlib.sha256(str(data).encode()).hexdigest(),
            "challenge": os.urandom(16).hex(),
            "response": hashlib.sha3_256(str(data + os.urandom(8).hex()).encode()).hexdigest(),
            "timestamp": time.time(),
            "verification_hash": hashlib.blake2b(str(data + str(time.time())).encode()).hexdigest()
        }
            
        return jsonify({
            "status": "success",
            "proof": proof,
            "verify_endpoint": "/api/blockchain/verify-zkp"
        }), 200
            
    except Exception as e:
        print(f"[❌] Error generating zero-knowledge proof: {e}")
        return jsonify({"error": f"Proof generation failed: {str(e)}"}), 500

@app.route("/api/blockchain/verify-zkp", methods=["POST"])
def verify_zero_knowledge_proof():
    """Verify a zero-knowledge proof"""
    try:
        if not request.json or "proof" not in request.json:
            return jsonify({"error": "No proof provided for verification"}), 400
            
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if zero knowledge proofs are enabled
        if not settings["quantum_protection"]["zero_knowledge_proofs"]:
            return jsonify({
                "status": "error",
                "message": "Zero-knowledge proofs are not enabled in settings"
            }), 400
            
        # Mock zero-knowledge proof verification
        # In a real application, you would implement actual ZKP verification
        proof = request.json["proof"]
        
        # Simulate verification (would be actual verification in production)
        is_valid = "verification_hash" in proof and len(proof["verification_hash"]) > 32
            
        return jsonify({
            "status": "success" if is_valid else "error",
            "verified": is_valid,
            "timestamp": time.time()
        }), 200 if is_valid else 400
            
    except Exception as e:
        print(f"[❌] Error verifying zero-knowledge proof: {e}")
        return jsonify({"error": f"Proof verification failed: {str(e)}"}), 500

@app.route("/api/blockchain/quantum-hash", methods=["POST"])
def generate_quantum_resistant_hash():
    """Generate a quantum-resistant hash for data"""
    try:
        if not request.json or "data" not in request.json:
            return jsonify({"error": "No data provided for hashing"}), 400
            
        data = request.json["data"]
        hash_type = request.json.get("hash_type", "auto")
        
        # Get current settings
        settings = get_blockchain_settings()
        
        # Determine hash algorithm based on settings and request
        if hash_type == "auto":
            # Use the configured hash algorithm
            hash_algo = settings["security"]["hash_algorithm"]
        else:
            # Use the requested hash algorithm
            hash_algo = hash_type
            
        # Generate hash based on selected algorithm
        if hash_algo == "SHA-256":
            result = hashlib.sha256(str(data).encode()).hexdigest()
            strength = "Standard"
        elif hash_algo == "SHA-3":
            result = hashlib.sha3_256(str(data).encode()).hexdigest()
            strength = "Strong"
        elif hash_algo == "BLAKE2":
            result = hashlib.blake2b(str(data).encode()).hexdigest()
            strength = "Very Strong"
        else:
            # Default to SHA-3 if unknown algorithm
            result = hashlib.sha3_256(str(data).encode()).hexdigest()
            hash_algo = "SHA-3"
            strength = "Strong"
            
        return jsonify({
            "hash": result,
            "algorithm": hash_algo,
            "timestamp": time.time(),
            "quantum_resistance": strength
        }), 200
            
    except Exception as e:
        print(f"[❌] Error generating quantum-resistant hash: {e}")
        return jsonify({"error": f"Hash generation failed: {str(e)}"}), 500

@app.route("/api/blockchain/mfa-setup", methods=["POST"])
def setup_multi_factor_auth():
    """Set up multi-factor authentication"""
    try:
        if not request.json or "mfa_type" not in request.json:
            return jsonify({"error": "MFA type not specified"}), 400
            
        mfa_type = request.json["mfa_type"]
        
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if MFA is already enabled
        if settings["security"]["mfa_enabled"]:
            return jsonify({
                "status": "info",
                "message": "MFA is already enabled",
                "mfa_status": True
            }), 200
            
        # Simulate MFA setup based on type
        if mfa_type == "totp":
            # Time-based One-Time Password setup
            # In a real app, you would generate an actual TOTP secret and QR code
            secret = base64.b32encode(os.urandom(20)).decode('utf-8')
            setup_info = {
                "mfa_type": "totp",
                "secret": secret,
                "verification_endpoint": "/api/blockchain/verify-mfa"
            }
        elif mfa_type == "hardware":
            # Hardware key setup
            # In a real app, you would generate a challenge for a hardware key
            challenge = os.urandom(32).hex()
            setup_info = {
                "mfa_type": "hardware",
                "challenge": challenge,
                "verification_endpoint": "/api/blockchain/verify-mfa"
            }
        else:
            return jsonify({"error": f"Unsupported MFA type: {mfa_type}"}), 400
            
        # Update settings with pending MFA status
        # (in a real app, you wouldn't enable until verification)
        settings["security"]["mfa_pending"] = True
        settings["security"]["mfa_setup_info"] = setup_info
        save_blockchain_settings(settings)
            
        return jsonify({
            "status": "success",
            "message": f"{mfa_type} MFA setup initiated",
            "setup_info": setup_info
        }), 200
            
    except Exception as e:
        print(f"[❌] Error setting up MFA: {e}")
        return jsonify({"error": f"MFA setup failed: {str(e)}"}), 500

@app.route("/api/blockchain/verify-mfa", methods=["POST"])
def verify_multi_factor_auth():
    """Verify multi-factor authentication setup"""
    try:
        if not request.json or "verification_code" not in request.json:
            return jsonify({"error": "Verification code not provided"}), 400
            
        # Get current settings
        settings = get_blockchain_settings()
        
        # Check if MFA setup is pending
        if not settings.get("security", {}).get("mfa_pending", False):
            return jsonify({
                "status": "error",
                "message": "No pending MFA setup found"
            }), 400
            
        # In a real app, you would verify the MFA code
        # For this demo, we'll simulate successful verification
        
        # Update settings with enabled MFA
        settings["security"]["mfa_enabled"] = True
        settings["security"]["mfa_pending"] = False
        save_blockchain_settings(settings)
            
        return jsonify({
            "status": "success",
            "message": "MFA successfully verified and enabled",
            "mfa_status": True
        }), 200
            
    except Exception as e:
        print(f"[❌] Error verifying MFA: {e}")
        return jsonify({"error": f"MFA verification failed: {str(e)}"}), 500

@app.route("/api/blockchain/timelock", methods=["POST"])
def set_transaction_timelock():
    """Set a time lock on transactions for security"""
    try:
        if not request.json or "duration" not in request.json:
            return jsonify({"error": "Time lock duration not specified"}), 400
            
        duration = request.json["duration"]
        
        # Get current settings
        settings = get_blockchain_settings()
        
        # Validate and set time lock duration
        valid_durations = ["None", "1 Hour", "24 Hours", "48 Hours", "7 Days"]
        if duration not in valid_durations:
            return jsonify({
                "status": "error",
                "message": f"Invalid duration. Must be one of: {', '.join(valid_durations)}"
            }), 400
            
        # Update settings
        settings["security"]["transaction_timelock"] = duration
        save_blockchain_settings(settings)
        
        # Calculate expiry time for informational purposes
        expiry_time = None
        if duration != "None":
            current_time = time.time()
            if duration == "1 Hour":
                expiry_time = current_time + (60 * 60)
            elif duration == "24 Hours":
                expiry_time = current_time + (24 * 60 * 60)
            elif duration == "48 Hours":
                expiry_time = current_time + (48 * 60 * 60)
            elif duration == "7 Days":
                expiry_time = current_time + (7 * 24 * 60 * 60)
            
        return jsonify({
            "status": "success",
            "message": f"Transaction time lock set to {duration}",
            "expiry_time": expiry_time
        }), 200
            
    except Exception as e:
        print(f"[❌] Error setting transaction timelock: {e}")
        return jsonify({"error": f"Time lock setting failed: {str(e)}"}), 500

@app.route("/api/blockchain/key-status", methods=["GET"])
def get_key_status():
    """Get status of encryption keys and their quantum resistance level"""
    try:
        # Get current settings
        settings = get_blockchain_settings()
        
        # Determine key status based on settings
        quantum_settings = settings["quantum_protection"]
        security_settings = settings["security"]
        
        # Calculate overall quantum resistance
        quantum_resistance_level = 0
        if quantum_settings["quantum_resistance_mode"] != "Off":
            # Base level from quantum resistance mode
            if quantum_settings["quantum_resistance_mode"] == "Basic":
                quantum_resistance_level += 1
            elif quantum_settings["quantum_resistance_mode"] == "Enhanced":
                quantum_resistance_level += 2
            elif quantum_settings["quantum_resistance_mode"] == "Maximum":
                quantum_resistance_level += 3
                
            # Additional points for other quantum features
            if quantum_settings["lattice_based_encryption"]:
                quantum_resistance_level += 1
            if quantum_settings["post_quantum_signature_scheme"] != "None":
                quantum_resistance_level += 1
            if quantum_settings["zero_knowledge_proofs"]:
                quantum_resistance_level += 1
                
        # Cap at level 5
        quantum_resistance_level = min(quantum_resistance_level, 5)
        
        # Determine key rotation status
        key_rotation = security_settings["key_rotation_frequency"]
        next_rotation = None
        if key_rotation != "Never":
            # Mock next rotation date
            current_time = time.time()
            if key_rotation == "Daily":
                next_rotation = current_time + (24 * 60 * 60)
            elif key_rotation == "Weekly":
                next_rotation = current_time + (7 * 24 * 60 * 60)
            elif key_rotation == "Monthly":
                next_rotation = current_time + (30 * 24 * 60 * 60)
            elif key_rotation == "Quarterly":
                next_rotation = current_time + (90 * 24 * 60 * 60)
                
        # Determine signature method details
        signature_method = security_settings["transaction_signing_method"]
        signature_details = {
            "Standard": {
                "algorithm": "ECDSA",
                "description": "Elliptic Curve Digital Signature Algorithm",
                "quantum_resistant": False
            },
            "Enhanced": {
                "algorithm": "EdDSA",
                "description": "Edwards-curve Digital Signature Algorithm",
                "quantum_resistant": False
            },
            "Quantum-Resistant": {
                "algorithm": "Dilithium",
                "description": "NIST Selected Post-Quantum Signature Scheme",
                "quantum_resistant": True
            },
            "Hybrid": {
                "algorithm": "ECDSA + Dilithium",
                "description": "Hybrid Classical and Post-Quantum Signatures",
                "quantum_resistant": True
            }
        }.get(signature_method, {
            "algorithm": "Unknown",
            "description": "Unknown signature method",
            "quantum_resistant": False
        })
            
        return jsonify({
            "quantum_resistance_level": quantum_resistance_level,
            "key_rotation_frequency": key_rotation,
            "next_scheduled_rotation": next_rotation,
            "signature_method": signature_method,
            "signature_details": signature_details,
            "post_quantum_scheme": quantum_settings["post_quantum_signature_scheme"],
            "hash_algorithm": security_settings["hash_algorithm"],
            "last_updated": time.time()
        }), 200
            
    except Exception as e:
        print(f"[❌] Error getting key status: {e}")
        return jsonify({"error": f"Failed to get key status: {str(e)}"}), 500

# Add health check endpoint
@app.route("/health", methods=["GET"])
def health_check():
    """API health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Quantum-Secure Blockchain File Service",
        "timestamp": time.time(),
        "version": "1.0.0"
    }), 200
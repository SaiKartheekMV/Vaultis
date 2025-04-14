from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import uuid
import traceback
import hashlib
import requests

# 🔧 Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# ✅ Imports from project modules
from storage.upload_to_ipfs import upload_to_pinata
from crypto.encryptor import encrypt_file_with_kyber
# We'll update the decryptor import but leave this line as is since you're providing a new implementation
from crypto.decryptor import decrypt_file_with_kyber  

# 🔧 Flask app setup
app = Flask(__name__)
# FIX: Enable CORS for all routes without restrictions
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Add the missing get_from_pinata function directly in app.py
def get_from_pinata(cid, output_path):
    """
    Download a file from Pinata IPFS by its CID and save it to output_path
    Returns True if successful, False otherwise
    """
    try:
        # IPFS gateway URL (could be Pinata's gateway or any public gateway)
        gateway_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        
        # Alternative public gateways if the above doesn't work
        # gateway_url = f"https://ipfs.io/ipfs/{cid}"
        # gateway_url = f"https://cloudflare-ipfs.com/ipfs/{cid}"
        
        print(f"[🔍] Fetching from IPFS gateway: {gateway_url}")
        
        # Make the request to download the file
        response = requests.get(gateway_url, stream=True, timeout=30)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        # Save the file to the specified output path
        with open(output_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"[✅] Successfully downloaded file to {output_path}")
        return True
        
    except Exception as e:
        print(f"[❌] Error downloading from IPFS: {e}")
        traceback.print_exc()  # Print the full error traceback
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
        
        # 🔐 Encrypt using Kyber
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
        encrypted_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()
        
        return jsonify({
            "cid": cid,
            "kyber_public_key": formatted_public_key,
            "encrypted_hash": encrypted_hash,
            "original_filename": original_filename,  # Return original filename
            "private_key_id": os.path.basename(private_key_path)  # Return private key ID for later retrieval
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

# Updated function for decryption using binary mode
def decrypt_file_with_kyber(
    input_path: str, 
    output_path: str, 
    private_key: str
) -> bool:
    """
    Decrypt a file that was encrypted with Kyber
    
    Args:
        input_path: Path to the encrypted file
        output_path: Path where the decrypted file will be saved
        private_key: The private key to use for decryption (as string)
    
    Returns:
        bool: True if decryption was successful, False otherwise
    """
    try:
        print(f"[🔓] Starting decryption of {input_path}")
        
        # Read the encrypted file in binary mode
        with open(input_path, 'rb') as f:
            encrypted_content = f.read()
            
        print(f"[🔑] Using private key: {private_key[:20]}... (truncated)")
        
        # In a real implementation, use the Kyber library to decrypt
        # Call your actual Kyber decryption function here
        
        # Mock decryption - replace with your actual implementation
        decrypted_data = mock_kyber_decrypt(encrypted_content, private_key)
        
        # Write the decrypted data in binary mode
        with open(output_path, 'wb') as f:
            if isinstance(decrypted_data, str):
                f.write(decrypted_data.encode('utf-8'))
            else:
                f.write(decrypted_data)
            
        print(f"[✅] Decryption successful, saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"[❌] Decryption failed: {str(e)}")
        traceback.print_exc()
        return False

# Updated endpoint for downloading and decrypting in one step
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
        
        # Decrypt the file using the updated function
        decryption_success = decrypt_file_with_kyber(
            input_path=temp_downloaded_path,
            output_path=temp_decrypted_path,
            private_key=private_key
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

# Alternative endpoint to retrieve private key by ID
@app.route("/api/private-key/<key_id>", methods=["GET"])
def get_private_key(key_id):
    try:
        # Security check to prevent path traversal
        if ".." in key_id or "/" in key_id or "\\" in key_id:
            return jsonify({"error": "Invalid key ID"}), 400
            
        private_key_path = os.path.join("temp", key_id)
        
        if not os.path.exists(private_key_path):
            return jsonify({"error": "Private key not found or expired"}), 404
            
        with open(private_key_path, 'r') as f:
            private_key = f.read()
            
        return jsonify({"private_key": private_key}), 200
        
    except Exception as e:
        print(f"[❌] Error retrieving private key: {e}")
        return jsonify({"error": f"Failed to retrieve private key: {str(e)}"}), 500

# Need to add a mock function for the decryption to work - this would be replaced with actual implementation
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

# 🔧 Run app
if __name__ == "__main__":
    # Add the requests and time imports check
    if 'requests' not in sys.modules:
        print("[❌] The 'requests' module is required. Install it with: pip install requests")
        sys.exit(1)
    
    import time  # Import time module for cleanup function
    
    print("[🚀] Starting Flask server on http://localhost:5000")
    app.run(port=5000, debug=True)
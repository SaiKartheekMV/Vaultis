from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import uuid
import traceback
import hashlib

# 🔧 Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# ✅ Imports
from storage.upload_to_ipfs import upload_to_pinata
from crypto.encryptor import encrypt_file_with_kyber

# 🔧 Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

        # 🚀 Upload encrypted file to IPFS via Pinata
        cid = upload_to_pinata(temp_encrypted_path)
        print(f"[🌐] Uploaded to IPFS! CID: {cid}")

        # 🧠 Generate hash of encrypted data for integrity (optional)
        encrypted_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()

        return jsonify({
            "cid": cid,
            "kyber_public_key": formatted_public_key,
            "encrypted_hash": encrypted_hash
        }), 200

    except Exception as e:
        print(f"[❌] Error during encryption/upload: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Encryption/Upload failed: {str(e)}"}), 500

    finally:
        # 🧹 Cleanup temp files
        for path in [temp_input_path, temp_encrypted_path]:
            if os.path.exists(path):
                os.remove(path)
                print(f"[🧹] Deleted temp file: {path}")

# 🔧 Run app
if __name__ == "__main__":
    app.run(port=5000, debug=True)
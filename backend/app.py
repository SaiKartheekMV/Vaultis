from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import uuid
import traceback

# 🔧 Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# ✅ Correct imports
from storage.upload_to_ipfs import upload_to_pinata
from crypto.encryptor import encrypt_file_with_kyber

# 🔧 Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/api/encrypt-upload", methods=["POST"])
def encrypt_and_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    original_filename = uploaded_file.filename

    # Generate unique temp file paths
    temp_input_path = os.path.join("temp", f"input_{uuid.uuid4().hex}_{original_filename}")
    temp_encrypted_path = os.path.join("temp", f"encrypted_{uuid.uuid4().hex}_{original_filename}")

    try:
        # Ensure temp dir exists
        os.makedirs("temp", exist_ok=True)

        uploaded_file.save(temp_input_path)
        print(f"[📥] Received file: {temp_input_path}")

        # 🔐 Encrypt file with Kyber
        encrypted_data, public_key, private_key = encrypt_file_with_kyber(
            input_path=temp_input_path,
            output_path=temp_encrypted_path
        )
        print(f"[🔐] Encrypted file saved to: {temp_encrypted_path}")

        # 🚀 Upload to IPFS via Pinata
        cid = upload_to_pinata(temp_encrypted_path)
        print(f"[🚀] Uploaded to IPFS! CID: {cid}")

        return jsonify({
            "cid": cid,
            "kyber_public_key": public_key.decode() if isinstance(public_key, bytes) else str(public_key)
        }), 200

    except Exception as e:
        print(f"[❌] Upload failed: {e}")
        traceback.print_exc()  # 🔥 Logs full traceback
        return jsonify({"error": f"Encryption/Upload failed: {str(e)}"}), 500

    finally:
        # 🧹 Clean up temp files
        for path in [temp_input_path, temp_encrypted_path]:
            if os.path.exists(path):
                os.remove(path)
                print(f"[🧹] Deleted temp file: {path}")

if __name__ == "__main__":
    app.run(port=5000, debug=True)

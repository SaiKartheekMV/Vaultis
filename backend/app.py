from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Allow Python to find the 'storage' package by appending the project root folder to the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from storage.upload_to_ipfs import upload_to_pinata
from storage.download_from_ipfs import download_from_ipfs

app = Flask(__name__)
CORS(app)  # allow React to call backend

@app.route("/api/encrypt-upload", methods=["POST"])
def encrypt_and_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    file_path = f"temp_{uploaded_file.filename}"
    uploaded_file.save(file_path)

    try:
        # TODO: Insert encryption here if needed in the future
        cid = upload_to_pinata(file_path)
        return jsonify({"cid": cid})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Cleanup the temporary file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    app.run(port=5000)


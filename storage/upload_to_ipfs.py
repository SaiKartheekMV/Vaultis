import requests
import json
import os

def upload_to_pinata(file_path):
    # Determine the absolute path to pinata_config.json in the storage folder
    config_path = os.path.join(os.path.dirname(__file__), 'pinata_config.json')
    with open(config_path) as f:
        keys = json.load(f)

    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": keys["pinata_api_key"],
        "pinata_secret_api_key": keys["pinata_secret_api_key"]
    }

    # Open the file to upload
    with open(file_path, "rb") as fp:
        files = {"file": (os.path.basename(file_path), fp)}
        response = requests.post(url, files=files, headers=headers)

    if response.status_code == 200:
        return response.json()["IpfsHash"]
    else:
        raise Exception("Failed to upload to Pinata: " + response.text)

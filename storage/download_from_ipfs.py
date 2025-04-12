import requests

def download_from_ipfs(cid, output_path="downloaded_file"):
    url = f"https://gateway.pinata.cloud/ipfs/{cid}"
    response = requests.get(url)
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ Downloaded: {output_path}")
    else:
        print("❌ Failed:", response.status_code, response.text)

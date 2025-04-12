import os

def read_file_as_bytes(filepath):
    if not os.path.isfile(filepath):
        raise FileNotFoundError(f"[❌] File not found: {filepath}")
    
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
            print(f"[📥] Read {len(data)} bytes from {filepath}")
            return data
    except Exception as e:
        raise IOError(f"[❌] Failed to read file: {e}")

def save_bytes_to_file(data, output_path):
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'wb') as f:
            f.write(data)
            print(f"[💾] Saved {len(data)} bytes to {output_path}")
    except Exception as e:
        raise IOError(f"[❌] Failed to write file: {e}")

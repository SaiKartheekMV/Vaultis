import base64
import hashlib
from crypto.pqc import kyber, sphincs, dilithium
# In crypto/encryptor.py
from .file_utils import read_file_as_bytes, save_bytes_to_file


def encrypt_file_with_kyber(input_path, output_path):
    try:
        # Key generation
        public_key, private_key = kyber.generate_keys()

        # Read and encode file
        file_data = read_file_as_bytes(input_path)
        encoded_data = base64.b64encode(file_data).decode()

        # Encrypt using Kyber
        encrypted = kyber.encrypt(encoded_data, public_key)

        # Save encrypted content to file
        save_bytes_to_file(encrypted.encode(), output_path)
        print(f"[✔] Encrypted using Kyber. Output saved to: {output_path}")

        return encrypted, public_key, private_key

    except Exception as e:
        print(f"[❌] Encryption failed: {e}")
        return None, None, None

def sign_file_with_sphincs(data, private_key="sphincs_priv"):
    # Create a hash of the file data (as would happen before signing)
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    return sphincs.sign(hashed_data, private_key)

def verify_signature_with_sphincs(signature, data, public_key="sphincs_pub"):
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    return sphincs.verify(signature, hashed_data, public_key)

def sign_file_with_dilithium(data, private_key="dilithium_priv"):
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    return dilithium.sign(hashed_data, private_key)

def verify_signature_with_dilithium(signature, data, public_key="dilithium_pub"):
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    return dilithium.verify(signature, hashed_data, public_key)

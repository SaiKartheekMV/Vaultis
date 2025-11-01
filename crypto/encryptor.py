import base64
import hashlib
import json
import secrets
from Crypto.Cipher import AES
from crypto.pqc import kyber, sphincs, dilithium
from .file_utils import read_file_as_bytes, save_bytes_to_file


def encrypt_file_with_kyber(input_path, output_path):
    """
    Hybrid encrypt a file:
    - Generate random AES-GCM key to encrypt file bytes
    - "Wrap" AES key using simulated Kyber (string-based) for transport

    Output file is JSON with base64 fields. Returns (encrypted_json_str, public_key, private_key).
    """
    try:
        # Generate Kyber keypair (simulated)
        public_key, private_key = kyber.generate_keys()
        public_key_str = public_key if isinstance(public_key, str) else base64.b64encode(public_key).decode('utf-8')

        # Read file bytes
        plaintext = read_file_as_bytes(input_path)

        # AES-GCM
        aes_key = secrets.token_bytes(32)  # 256-bit key
        nonce = secrets.token_bytes(12)    # 96-bit nonce recommended for GCM
        cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext)

        # Wrap AES key using simulated Kyber (works on strings)
        aes_key_b64 = base64.b64encode(aes_key).decode('utf-8')
        encrypted_key = kyber.encrypt(aes_key_b64, public_key_str)

        # Package as JSON (all binary fields base64)
        envelope = {
            "version": 1,
            "scheme": "AES-256-GCM + Kyber(sim)",
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "tag": base64.b64encode(tag).decode('utf-8'),
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
            "encrypted_key": encrypted_key,
        }
        encrypted_json = json.dumps(envelope, separators=(',', ':'))

        # Save encrypted JSON to disk
        save_bytes_to_file(encrypted_json.encode('utf-8'), output_path)
        print(f"[✔] Encrypted file saved to: {output_path}")

        return encrypted_json, public_key_str, private_key

    except Exception as e:
        print(f"[❌] Encryption failed: {e}")
        return None, None, None


def sign_file_with_sphincs(data, private_key="sphincs_priv"):
    """
    Digitally signs data using SPHINCS+.

    Args:
        data (str): The raw data to sign.
        private_key (str): SPHINCS+ private key.

    Returns:
        str: Signature
    """
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    print("[✍️] Signing with SPHINCS+...")
    return sphincs.sign(hashed_data, private_key)


def verify_signature_with_sphincs(signature, data, public_key="sphincs_pub"):
    """
    Verifies a SPHINCS+ signature.

    Args:
        signature (str): Signature to verify.
        data (str): Original data.
        public_key (str): SPHINCS+ public key.

    Returns:
        bool: True if valid, False otherwise.
    """
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    print("[🔎] Verifying SPHINCS+ signature...")
    return sphincs.verify(signature, hashed_data, public_key)


def sign_file_with_dilithium(data, private_key="dilithium_priv"):
    """
    Digitally signs data using Dilithium.

    Args:
        data (str): Raw data to sign.
        private_key (str): Dilithium private key.

    Returns:
        str: Signature
    """
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    print("[✍️] Signing with Dilithium...")
    return dilithium.sign(hashed_data, private_key)


def verify_signature_with_dilithium(signature, data, public_key="dilithium_pub"):
    """
    Verifies a Dilithium signature.

    Args:
        signature (str): Signature to verify.
        data (str): Original data.
        public_key (str): Dilithium public key.

    Returns:
        bool: True if valid, False otherwise.
    """
    hashed_data = hashlib.sha256(data.encode()).hexdigest()
    print("[🔎] Verifying Dilithium signature...")
    return dilithium.verify(signature, hashed_data, public_key)
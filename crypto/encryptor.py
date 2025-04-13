import base64
import hashlib
from crypto.pqc import kyber, sphincs, dilithium
from .file_utils import read_file_as_bytes, save_bytes_to_file


def encrypt_file_with_kyber(input_path, output_path):
    """
    Encrypts a file using Kyber public-key encryption.

    Args:
        input_path (str): Path to the input file.
        output_path (str): Path to save the encrypted output.

    Returns:
        tuple: (encrypted_data, public_key, private_key)
    """
    try:
        # 🔐 Step 1: Generate Kyber keys
        public_key, private_key = kyber.generate_keys()
        print("[🔑] Kyber keys generated.")
        
        # Ensure public key is properly formatted
        if isinstance(public_key, bytes):
            public_key_str = base64.b64encode(public_key).decode('utf-8')
        else:
            public_key_str = str(public_key)
        
        print(f"[🔑] Public key format: {type(public_key_str)}")
        print(f"[🔑] Public key sample: {public_key_str[:30]}...")

        # 📥 Step 2: Read file and base64 encode its content
        file_data = read_file_as_bytes(input_path)
        encoded_data = base64.b64encode(file_data).decode()
        print(f"[📦] File encoded for encryption. Size: {len(encoded_data)} characters")

        # 🔒 Step 3: Encrypt encoded data using Kyber
        encrypted = kyber.encrypt(encoded_data, public_key_str)
        print("[🔐] File encrypted successfully.")

        # 💾 Step 4: Save encrypted data to file
        save_bytes_to_file(encrypted.encode(), output_path)
        print(f"[✔] Encrypted file saved to: {output_path}")

        return encrypted, public_key_str, private_key

    except Exception as e:
        print(f"[❌] Kyber encryption failed: {e}")
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
import base64
import secrets
import uuid

# Simulated Kyber KEM functions

def generate_keys():
    """
    Generate simulated Kyber key pair with unique values
    
    Returns:
        tuple: (public_key, private_key) - both as strings
    """
    try:
        # Generate a unique identifier for this key pair
        key_id = str(uuid.uuid4())[:8]
        
        # Create unique keys using the identifier
        public_key_base = f"kyber_pubkey_{key_id}"
        private_key = f"kyber_privkey_{key_id}"
        
        # For a more realistic key, add some random data
        random_data = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        public_key = f"{public_key_base}_{random_data}"
        
        print(f"[✅] Generated unique simulated Kyber key pair: {key_id}")
        
        return public_key, private_key
    except Exception as e:
        print(f"[❌] Error generating Kyber keys: {e}")
        return None, None

def encrypt(data, public_key):
    """
    Simulate Kyber encryption
    
    Args:
        data (str): Data to encrypt
        public_key (str): Kyber public key
        
    Returns:
        str: Encrypted data
    """
    try:
        # Ensure public_key is a string
        if isinstance(public_key, bytes):
            public_key = public_key.decode('utf-8')
            
        # Extract the key ID for logging (if possible)
        try:
            key_parts = public_key.split('_')
            key_id = key_parts[2] if len(key_parts) > 2 else "unknown"
        except:
            key_id = "unknown"
            
        # Simulate encryption by base64 encoding the data and wrapping it
        encoded_data = base64.b64encode(data.encode()).decode()
        encrypted = f"kyber_encrypted({encoded_data})_with_{public_key}"
        
        print(f"[✅] Data encrypted with simulated Kyber using key ID: {key_id}")
        return encrypted
    except Exception as e:
        print(f"[❌] Kyber encryption error: {e}")
        return None

def decrypt(encrypted_data, private_key):
    """
    Simulate Kyber decryption
    
    Args:
        encrypted_data (str): Data to decrypt
        private_key (str): Kyber private key
        
    Returns:
        str: Decrypted data
    """
    try:
        # Ensure private_key is a string
        if isinstance(private_key, bytes):
            private_key = private_key.decode('utf-8')
            
        # Extract the encoded part - with dynamic parsing
        prefix = "kyber_encrypted("
        if encrypted_data.startswith(prefix):
            # Find the closing parenthesis
            close_paren_idx = encrypted_data.rfind(")")
            if close_paren_idx > len(prefix):
                encoded_part = encrypted_data[len(prefix):close_paren_idx]
                decoded_data = base64.b64decode(encoded_part.encode()).decode()
                
                print(f"[✅] Data successfully decrypted with simulated Kyber")
                return decoded_data
        
        raise ValueError("Invalid encrypted format or mismatched key")
    except Exception as e:
        print(f"[❌] Kyber decryption error: {e}")
        return f"[Decryption Error] {str(e)}"
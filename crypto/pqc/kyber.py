import base64

# Simulated Kyber KEM functions

def generate_keys():
    public_key = "kyber_pubkey_123"
    private_key = "kyber_privkey_123"
    return public_key, private_key

def encrypt(data, public_key):
    # Simulate encryption by base64 encoding the data and wrapping it
    encoded_data = base64.b64encode(data.encode()).decode()
    return f"kyber_encrypted({encoded_data})_with_{public_key}"

def decrypt(encrypted_data, private_key):
    try:
        # Extract the encoded part
        prefix = "kyber_encrypted("
        suffix = f")_with_kyber_pubkey_123"
        if encrypted_data.startswith(prefix) and encrypted_data.endswith(suffix):
            encoded_part = encrypted_data[len(prefix):-len(suffix)]
            decoded_data = base64.b64decode(encoded_part.encode()).decode()
            return decoded_data
        else:
            raise ValueError("Invalid encrypted format or mismatched key")
    except Exception as e:
        return f"[Decryption Error] {str(e)}"

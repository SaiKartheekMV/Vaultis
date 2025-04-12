import hashlib

# Simulated Dilithium signature scheme

def sign(data, private_key):
    # Hash the data and simulate a signature
    data_hash = hashlib.sha256(data.encode()).hexdigest()
    return f"dilithium_signature({data_hash})_by_{private_key}"

def verify(signature, data, public_key):
    expected_hash = hashlib.sha256(data.encode()).hexdigest()
    expected_signature = f"dilithium_signature({expected_hash})_by_{public_key.replace('pub', 'priv')}"
    return signature == expected_signature

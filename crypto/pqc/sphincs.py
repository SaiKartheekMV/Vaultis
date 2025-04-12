import hashlib

# Simulated SPHINCS+ digital signature scheme

def sign(data, private_key):
    data_hash = hashlib.sha256(data.encode()).hexdigest()
    return f"sphincs_signature({data_hash})_by_{private_key}"

def verify(signature, data, public_key):
    expected_hash = hashlib.sha256(data.encode()).hexdigest()
    expected_signature = f"sphincs_signature({expected_hash})_by_{public_key.replace('pub', 'priv')}"
    return signature == expected_signature

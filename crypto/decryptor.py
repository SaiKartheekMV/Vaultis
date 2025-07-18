# crypto/decryptor.py
# Real implementation of decryption using Kyber-512/768/1024 with fallback options

import os
import json
import base64
import traceback
from typing import Union, Tuple, Optional, Dict, Any
import sys

# For real Kyber implementation - multiple attempts to find working libraries
KYBER_AVAILABLE = False
OQS_AVAILABLE = False
PQCRYPTO_AVAILABLE = False

# Try pqcrypto first (but check what's actually available)
try:
    import pqcrypto
    PQCRYPTO_AVAILABLE = True
    print(f"[✅] pqcrypto found, version: {getattr(pqcrypto, '__version__', 'unknown')}")
    
    # Check what KEM algorithms are actually available
    try:
        import pqcrypto.kem
        available_kems = [attr for attr in dir(pqcrypto.kem) if not attr.startswith('_')]
        print(f"[📋] Available KEMs: {available_kems}")
        
        # Try to import Kyber variants (these might not exist)
        kyber512_decrypt = None
        kyber768_decrypt = None
        kyber1024_decrypt = None
        
        try:
            from pqcrypto.kem.kyber512 import decrypt as kyber512_decrypt
            print("[✅] Kyber512 available in pqcrypto")
        except ImportError:
            print("[⚠️] Kyber512 not available in pqcrypto")
            
        try:
            from pqcrypto.kem.kyber768 import decrypt as kyber768_decrypt
            print("[✅] Kyber768 available in pqcrypto")
        except ImportError:
            print("[⚠️] Kyber768 not available in pqcrypto")
            
        try:
            from pqcrypto.kem.kyber1024 import decrypt as kyber1024_decrypt
            print("[✅] Kyber1024 available in pqcrypto")
        except ImportError:
            print("[⚠️] Kyber1024 not available in pqcrypto")
            
        # Only set KYBER_AVAILABLE if at least one variant works
        if any([kyber512_decrypt, kyber768_decrypt, kyber1024_decrypt]):
            KYBER_AVAILABLE = True
            
    except ImportError as e:
        print(f"[⚠️] pqcrypto.kem not available: {e}")
        
except ImportError:
    print("[⚠️] pqcrypto library not found. Install with: pip install pqcrypto")

# Try oqs-python as alternative
try:
    import oqs
    OQS_AVAILABLE = True
    print("[✅] OQS library found")
    
    # Test if Kyber algorithms are available
    try:
        test_kem = oqs.KeyEncapsulation('Kyber512')
        print("[✅] Kyber algorithms available in OQS")
    except Exception as e:
        print(f"[⚠️] Kyber not available in OQS: {e}")
        OQS_AVAILABLE = False
        
except ImportError:
    print("[⚠️] OQS library not found. Install with: pip install git+https://github.com/open-quantum-safe/liboqs-python.git")

# Fallback: Mock implementation for development/testing
class MockKyberDecryptor:
    """Mock Kyber implementation for testing when real libraries aren't available"""
    
    @staticmethod
    def decrypt(ciphertext: bytes, private_key: bytes) -> bytes:
        """
        Mock decryption - just returns a deterministic "shared secret"
        DO NOT USE IN PRODUCTION!
        """
        print("[⚠️] Using MOCK Kyber decryption - NOT SECURE!")
        # Generate a deterministic but fake shared secret for testing
        import hashlib
        fake_secret = hashlib.sha256(private_key + ciphertext[:32]).digest()
        return fake_secret

def detect_kyber_variant(private_key_bytes: bytes) -> str:
    """
    Detect which Kyber variant to use based on private key size
    
    Args:
        private_key_bytes: The private key as bytes
        
    Returns:
        str: The Kyber variant ('kyber512', 'kyber768', or 'kyber1024')
    """
    key_size = len(private_key_bytes)
    
    # Standard Kyber private key sizes
    if key_size == 1632:  # Kyber-512 private key size
        return 'kyber512'
    elif key_size == 2400:  # Kyber-768 private key size  
        return 'kyber768'
    elif key_size == 3168:  # Kyber-1024 private key size
        return 'kyber1024'
    else:
        print(f"[⚠️] Unknown private key size: {key_size} bytes")
        return 'kyber768'  # Default fallback

def decrypt_with_pqcrypto(ciphertext: bytes, private_key: bytes, variant: str) -> bytes:
    """
    Decrypt using the pqcrypto library
    
    Args:
        ciphertext: The encrypted data
        private_key: The private key bytes
        variant: Kyber variant to use
        
    Returns:
        bytes: The decrypted shared secret
    """
    if variant == 'kyber512' and kyber512_decrypt:
        return kyber512_decrypt(ciphertext, private_key)
    elif variant == 'kyber768' and kyber768_decrypt:
        return kyber768_decrypt(ciphertext, private_key)
    elif variant == 'kyber1024' and kyber1024_decrypt:
        return kyber1024_decrypt(ciphertext, private_key)
    else:
        raise ValueError(f"Kyber variant {variant} not available in pqcrypto")

def decrypt_with_oqs(ciphertext: bytes, private_key: bytes, variant: str) -> bytes:
    """
    Decrypt using the OQS library
    
    Args:
        ciphertext: The encrypted data
        private_key: The private key bytes
        variant: Kyber variant to use
        
    Returns:
        bytes: The decrypted shared secret
    """
    # Map variant names to OQS algorithm names
    algorithm_map = {
        'kyber512': 'Kyber512',
        'kyber768': 'Kyber768', 
        'kyber1024': 'Kyber1024'
    }
    
    algorithm_name = algorithm_map.get(variant, 'Kyber768')
    
    try:
        # Create KEM instance
        kem = oqs.KeyEncapsulation(algorithm_name)
        
        # Decrypt to get shared secret
        shared_secret = kem.decap_secret(ciphertext, private_key)
        return shared_secret
    except Exception as e:
        raise RuntimeError(f"OQS decryption failed: {e}")

def decrypt_file_with_kyber(
    input_path: str, 
    output_path: str, 
    private_key: str,
    use_quantum_enhanced: bool = False,
    kyber_variant: str = 'auto',
    allow_mock: bool = False
) -> bool:
    """
    Decrypt a file that was encrypted with Kyber KEM + AES
    
    Args:
        input_path: Path to the encrypted file
        output_path: Path where the decrypted file will be saved
        private_key: The private key (base64 encoded string or hex string)
        use_quantum_enhanced: Whether to use quantum-enhanced mode
        kyber_variant: Kyber variant ('kyber512', 'kyber768', 'kyber1024', or 'auto')
        allow_mock: Whether to allow mock decryption for testing
    
    Returns:
        bool: True if decryption was successful, False otherwise
    """
    try:
        print(f"[🔓] Starting Kyber decryption of {input_path}")
        print(f"[🔑] Using private key: {private_key[:20]}... (truncated)")
        
        if use_quantum_enhanced:
            print("[⚛️] Using quantum-enhanced mode for decryption")
        
        # Read and parse the encrypted file
        encrypted_data = load_encrypted_file(input_path)
        
        # Convert private key from string to bytes
        private_key_bytes = decode_key(private_key)
        
        # Auto-detect Kyber variant if needed
        if kyber_variant == 'auto':
            kyber_variant = detect_kyber_variant(private_key_bytes)
            
        print(f"[🔧] Using Kyber variant: {kyber_variant}")
        
        # Perform the actual Kyber decryption
        decrypted_data = perform_kyber_decryption(
            encrypted_data, 
            private_key_bytes, 
            kyber_variant,
            allow_mock=allow_mock
        )
        
        # Save the decrypted data
        with open(output_path, 'wb') as f:
            f.write(decrypted_data)
            
        print(f"[✅] Kyber decryption successful, saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"[❌] Kyber decryption failed: {str(e)}")
        traceback.print_exc()
        return False

def load_encrypted_file(file_path: str) -> Dict[str, Any]:
    """
    Load and parse encrypted file data
    
    Args:
        file_path: Path to encrypted file
        
    Returns:
        Dict containing parsed encrypted data
    """
    with open(file_path, 'r') as f:
        content = f.read()
    
    try:
        # Try to parse as JSON first
        data = json.loads(content)
        
        # Validate required fields for Kyber encryption
        required_fields = ['kyber_ciphertext', 'encrypted_data', 'nonce']
        if all(field in data for field in required_fields):
            return data
        else:
            raise ValueError("Missing required encryption fields in JSON")
            
    except json.JSONDecodeError:
        raise ValueError("Encrypted file is not in valid JSON format")

def decode_key(key_string: str) -> bytes:
    """
    Convert key string to bytes (supports base64 and hex)
    
    Args:
        key_string: Key as string
        
    Returns:
        bytes: Key as bytes
    """
    try:
        # Try base64 first
        return base64.b64decode(key_string)
    except:
        try:
            # Try hex
            return bytes.fromhex(key_string)
        except:
            # Try as raw bytes
            return key_string.encode('utf-8')

def perform_kyber_decryption(
    encrypted_data: Dict[str, Any], 
    private_key: bytes, 
    variant: str,
    allow_mock: bool = False
) -> bytes:
    """
    Perform the actual Kyber decryption process
    
    Args:
        encrypted_data: Dictionary containing encrypted data components
        private_key: Private key as bytes
        variant: Kyber variant to use
        allow_mock: Whether to allow mock decryption
        
    Returns:
        bytes: Decrypted data
    """
    # Extract components
    kyber_ciphertext = base64.b64decode(encrypted_data['kyber_ciphertext'])
    encrypted_content = base64.b64decode(encrypted_data['encrypted_data'])
    nonce = base64.b64decode(encrypted_data['nonce'])
    
    print(f"[🔧] Kyber ciphertext size: {len(kyber_ciphertext)} bytes")
    print(f"[🔧] Encrypted content size: {len(encrypted_content)} bytes")
    
    # Step 1: Use Kyber to decrypt the shared secret
    shared_secret = None
    
    if KYBER_AVAILABLE:
        print("[🔧] Using pqcrypto library for Kyber decryption")
        shared_secret = decrypt_with_pqcrypto(kyber_ciphertext, private_key, variant)
    elif OQS_AVAILABLE:
        print("[🔧] Using OQS library for Kyber decryption")  
        shared_secret = decrypt_with_oqs(kyber_ciphertext, private_key, variant)
    elif allow_mock:
        print("[🔧] Using MOCK Kyber decryption (NOT SECURE!)")
        mock_decryptor = MockKyberDecryptor()
        shared_secret = mock_decryptor.decrypt(kyber_ciphertext, private_key)
    else:
        raise RuntimeError(
            "No Kyber implementation available. Install one of:\n"
            "  pip install git+https://github.com/open-quantum-safe/liboqs-python.git\n"
            "  Or run with --allow-mock for testing (NOT SECURE!)"
        )
    
    print(f"[🔑] Recovered shared secret: {len(shared_secret)} bytes")
    
    # Step 2: Use the shared secret to decrypt the actual data (typically with AES)
    decrypted_content = decrypt_with_aes(encrypted_content, shared_secret, nonce)
    
    return decrypted_content

def decrypt_with_aes(encrypted_data: bytes, key: bytes, nonce: bytes) -> bytes:
    """
    Decrypt data using AES-GCM with the shared secret from Kyber
    
    Args:
        encrypted_data: The encrypted data
        key: The shared secret from Kyber (will be hashed to proper AES key size)
        nonce: The nonce/IV used for encryption
        
    Returns:
        bytes: Decrypted data
    """
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.kdf.hkdf import HKDF
        
        # Derive proper AES key from shared secret
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # 32 bytes for AES-256
            salt=None,
            info=b'kyber-aes-encryption'
        )
        aes_key = hkdf.derive(key)
        
        # Decrypt using AES-GCM
        aesgcm = AESGCM(aes_key)
        decrypted = aesgcm.decrypt(nonce, encrypted_data, None)
        
        print("[🔓] AES decryption successful")
        return decrypted
        
    except ImportError:
        print("[⚠️] cryptography library not found. Install with: pip install cryptography")
        raise
    except Exception as e:
        print(f"[❌] AES decryption failed: {str(e)}")
        raise

def verify_installation():
    """
    Verify that required libraries are installed
    """
    print("[🔍] Checking required libraries...")
    
    libraries = []
    if KYBER_AVAILABLE:
        libraries.append("✅ Kyber via pqcrypto - Available")
    elif PQCRYPTO_AVAILABLE:
        libraries.append("⚠️ pqcrypto found but Kyber variants not available")
    else:
        libraries.append("❌ pqcrypto - Not available")
        
    if OQS_AVAILABLE:
        libraries.append("✅ oqs-python - Available") 
    else:
        libraries.append("❌ oqs-python - Not available")
    
    try:
        import cryptography
        libraries.append("✅ cryptography - Available")
    except ImportError:
        libraries.append("❌ cryptography - Not available (pip install cryptography)")
    
    for lib in libraries:
        print(f"  {lib}")
    
    has_kyber = KYBER_AVAILABLE or OQS_AVAILABLE
    
    if not has_kyber:
        print("\n[⚠️] No Kyber implementation found!")
        print("Install one of these:")
        print("  pip install git+https://github.com/open-quantum-safe/liboqs-python.git")
        print("  Or check if your pqcrypto version supports Kyber")
        print("\nFor testing only, you can use --allow-mock (NOT SECURE!)")
        return False
        
    return True

# CLI interface
if __name__ == "__main__":
    print("🔐 Kyber Decryption Tool")
    print("=" * 40)
    
    # Parse command line arguments
    allow_mock = '--allow-mock' in sys.argv
    if allow_mock:
        sys.argv.remove('--allow-mock')
        print("[⚠️] Mock mode enabled - NOT SECURE, for testing only!")
    
    # Verify installation
    if not verify_installation() and not allow_mock:
        sys.exit(1)
    
    if len(sys.argv) < 4:
        print("\nUsage: python decryptor.py <encrypted_file> <output_file> <private_key> [variant] [--allow-mock]")
        print("\nVariants: kyber512, kyber768, kyber1024, auto (default)")
        print("Options:")
        print("  --allow-mock    Use mock decryption for testing (NOT SECURE!)")
        print("\nExample:")
        print("  python decryptor.py encrypted.json decrypted.txt your_base64_private_key")
        print("  python decryptor.py encrypted.json decrypted.txt your_base64_private_key --allow-mock")
        sys.exit(1)
        
    encrypted_file = sys.argv[1]
    output_file = sys.argv[2] 
    private_key = sys.argv[3]
    variant = sys.argv[4] if len(sys.argv) > 4 else 'auto'
    
    print(f"\n[📁] Input file: {encrypted_file}")
    print(f"[📁] Output file: {output_file}")
    print(f"[🔧] Kyber variant: {variant}")
    if allow_mock:
        print("[⚠️] Mock mode: ENABLED (NOT SECURE!)")
    
    success = decrypt_file_with_kyber(
        encrypted_file, 
        output_file, 
        private_key,
        kyber_variant=variant,
        allow_mock=allow_mock
    )
    
    if success:
        print(f"\n🎉 Successfully decrypted {encrypted_file} to {output_file}")
    else:
        print(f"\n💥 Failed to decrypt {encrypted_file}")
        sys.exit(1)
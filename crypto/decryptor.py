# crypto/decryptor.py
# Implementation of decryption using Kyber

import os
import json
import base64
import traceback
from typing import Union, Tuple, Optional
import sys
from Crypto.Cipher import AES

# Add the project root to system path to import pqc modules
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# Import the actual Kyber implementation
from crypto.pqc.kyber import decrypt as kyber_decrypt

def decrypt_file_with_kyber(
    input_path: str, 
    output_path: str, 
    private_key: str,
    use_quantum_enhanced: bool = False
) -> bool:
    """
    Decrypt a file that was encrypted with Kyber
    
    Args:
        input_path: Path to the encrypted file
        output_path: Path where the decrypted file will be saved
        private_key: The private key to use for decryption (as string)
        use_quantum_enhanced: Whether to use quantum-enhanced mode
    
    Returns:
        bool: True if decryption was successful, False otherwise
    """
    try:
        print(f"[🔓] Starting decryption of {input_path}")
        print(f"[🔑] Using private key: {private_key[:20]}... (truncated)")
        
        if use_quantum_enhanced:
            print("[⚛️] Using quantum-enhanced mode for decryption")
        
        # Read the encrypted file - always read as binary first, then decode to text
        with open(input_path, 'rb') as f:
            file_bytes = f.read()
        
        # Try to decode as UTF-8 for parsing (both old and new formats are text-based)
        try:
            encrypted_content = file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If UTF-8 fails, try with error handling (shouldn't happen but be safe)
            encrypted_content = file_bytes.decode('utf-8', errors='replace')
            print("[⚠️] File had some invalid UTF-8, using error replacement")
        
        # Try NEW format first (AES-GCM with JSON envelope)
        try:
            data = json.loads(encrypted_content)
            required_fields = {"nonce", "tag", "ciphertext", "encrypted_key"}
            
            if required_fields.issubset(data.keys()):
                print("[🔓] Detected new AES-GCM format, decrypting...")
                
                # Unwrap AES key using simulated Kyber
                wrapped = data["encrypted_key"]
                key_b64 = kyber_decrypt(wrapped, private_key)
                aes_key = base64.b64decode(key_b64)
                
                # AES-GCM decrypt
                nonce = base64.b64decode(data["nonce"]) 
                tag = base64.b64decode(data["tag"]) 
                ciphertext = base64.b64decode(data["ciphertext"]) 

                cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
                plaintext = cipher.decrypt_and_verify(ciphertext, tag)

                # Verify plaintext is bytes
                if not isinstance(plaintext, bytes):
                    print(f"[❌] Plaintext is not bytes, type: {type(plaintext)}")
                    return False
                
                # Log first few bytes for verification (JPEG: FF D8, PNG: 89 50 4E 47)
                if len(plaintext) >= 4:
                    hex_preview = plaintext[:4].hex()
                    print(f"[🔍] Decrypted file first 4 bytes (hex): {hex_preview}")
                    print(f"[📊] Decrypted file size: {len(plaintext)} bytes")

                with open(output_path, 'wb') as f:
                    f.write(plaintext)

                print(f"[✅] Decryption successful (new format), saved {len(plaintext)} bytes to {output_path}")
                
                # Double-check the written file
                with open(output_path, 'rb') as f:
                    written_data = f.read()
                    if written_data != plaintext:
                        print(f"[❌] ERROR: Written data doesn't match plaintext!")
                        return False
                    print(f"[✅] Verified: Written file matches decrypted data ({len(written_data)} bytes)")
                
                return True
        except (json.JSONDecodeError, KeyError, ValueError, Exception) as e:
            print(f"[⚠️] New format decryption failed: {e}, trying old format...")
            # Fall through to old format
        
        # OLD format (legacy simulated Kyber - string wrapper with double base64)
        try:
            print("[🔓] Detected old Kyber format, decrypting...")
            decrypted_data = kyber_decrypt(encrypted_content, private_key)
            
            # The old format: file bytes -> base64 string -> kyber encrypt (adds another base64 layer)
            # So kyber.decrypt returns the inner base64 string, we need to decode it to get original bytes
            if not decrypted_data or decrypted_data.startswith("[Decryption Error]"):
                print(f"[❌] Kyber decryption returned error: {decrypted_data}")
                return False
            
            # Try to decode the base64 string to get original file bytes
            try:
                decoded_bytes = base64.b64decode(decrypted_data, validate=True)
                
                # Log first few bytes for verification
                if len(decoded_bytes) >= 4:
                    hex_preview = decoded_bytes[:4].hex()
                    print(f"[🔍] Decrypted file first 4 bytes (hex): {hex_preview}")
                    print(f"[📊] Decrypted file size: {len(decoded_bytes)} bytes")
                
                with open(output_path, 'wb') as f:
                    f.write(decoded_bytes)
                print(f"[✅] Decryption successful (old format), saved {len(decoded_bytes)} bytes to {output_path}")
                
                # Double-check the written file
                with open(output_path, 'rb') as f:
                    written_data = f.read()
                    if written_data != decoded_bytes:
                        print(f"[❌] ERROR: Written data doesn't match decoded bytes!")
                        return False
                    print(f"[✅] Verified: Written file matches decrypted data ({len(written_data)} bytes)")
                
                return True
            except Exception as decode_err:
                print(f"[⚠️] Base64 decode failed: {decode_err}, trying as raw data...")
                # If base64 decode fails, write as-is (shouldn't happen but handle gracefully)
                with open(output_path, 'wb') as f:
                    if isinstance(decrypted_data, str):
                        f.write(decrypted_data.encode('utf-8'))
                    else:
                        f.write(decrypted_data)
                print(f"[⚠️] Decryption completed (old format, raw), saved to {output_path}")
                return True
                
        except Exception as e:
            print(f"[❌] Old format decryption also failed: {e}")
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"[❌] Decryption failed: {str(e)}")
        traceback.print_exc()
        return False

def mock_kyber_decrypt(encrypted_data: str, private_key: str) -> str:
    """
    Mock implementation of Kyber decryption
    
    In a real application, replace this with actual Kyber decryption
    
    Args:
        encrypted_data: The data to decrypt
        private_key: The private key to use
        
    Returns:
        The decrypted data
    """
    # This is a placeholder - only used for testing when actual implementation fails
    return f"This is a mock decryption of the original file.\n\nThe actual implementation would use the Kyber algorithm with the provided private key to properly decrypt the content."

# Optional: Add a command-line interface for testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: python decryptor.py <encrypted_file> <output_file> <private_key>")
        sys.exit(1)
        
    encrypted_file = sys.argv[1]
    output_file = sys.argv[2]
    private_key = sys.argv[3]
    
    success = decrypt_file_with_kyber(encrypted_file, output_file, private_key)
    
    if success:
        print(f"Successfully decrypted {encrypted_file} to {output_file}")
    else:
        print(f"Failed to decrypt {encrypted_file}")
        sys.exit(1)
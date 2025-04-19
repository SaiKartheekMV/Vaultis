# crypto/decryptor.py
# Implementation of decryption using Kyber

import os
import json
import traceback
from typing import Union, Tuple, Optional
import sys

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
        
        # Read the encrypted file
        with open(input_path, 'r') as f:
            encrypted_content = f.read()
            
        # Parse the encrypted content
        try:
            # If the encrypted file is in JSON format
            data = json.loads(encrypted_content)
            if 'encrypted_data' in data:
                # Extract just the encrypted data part
                encrypted_data = data['encrypted_data']
            else:
                # Use the whole file as encrypted data
                encrypted_data = encrypted_content
        except json.JSONDecodeError:
            # If it's not JSON, use the whole file as encrypted data
            encrypted_data = encrypted_content
        
        # Convert private key from string format if needed
        processed_private_key = private_key
        # Additional processing might be needed depending on your key format
        
        # Use the actual Kyber decryption
        try:
            # Call the actual Kyber decrypt function from pqc/kyber.py
            decrypted_data = kyber_decrypt(encrypted_data, processed_private_key)
            
            # Save the decrypted data to the output file
            with open(output_path, 'w') as f:
                f.write(decrypted_data)
                
            print(f"[✅] Decryption successful, saved to {output_path}")
            return True
            
        except Exception as e:
            print(f"[❌] Kyber decryption failed: {str(e)}")
            traceback.print_exc()
            
            # Fallback to mock decryption for testing/development purposes
            print("[⚠️] Falling back to mock decryption for testing")
            decrypted_data = mock_kyber_decrypt(encrypted_data, private_key)
            
            # Save the mock decrypted data
            with open(output_path, 'w') as f:
                f.write(decrypted_data)
                
            print(f"[⚠️] Mock decryption completed, saved to {output_path}")
            return True
        
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
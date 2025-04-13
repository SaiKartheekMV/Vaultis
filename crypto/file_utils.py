def read_file_as_bytes(file_path):
    """
    Read a file from disk and return its contents as bytes.

    Args:
        file_path (str): Path to the file to read

    Returns:
        bytes: The file contents as bytes
    """
    try:
        with open(file_path, 'rb') as file:
            return file.read()
    except Exception as e:
        print(f"[❌] Error reading file {file_path}: {e}")
        raise

def save_bytes_to_file(data, file_path):
    """
    Save bytes to a file on disk.

    Args:
        data (bytes): The data to save
        file_path (str): Path where the file should be saved
    """
    try:
        with open(file_path, 'wb') as file:
            file.write(data)
    except Exception as e:
        print(f"[❌] Error saving to file {file_path}: {e}")
        raise
# Vaultis: Quantum-Secure Decentralized Storage Platform

![Vaultis Animation](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2/g7GKcSzwQfugw/giphy.gif)

## 🚀 Overview
Vaultis is a next-generation decentralized storage platform that combines blockchain, post-quantum cryptography, and IPFS to provide ultra-secure, privacy-focused file management. It empowers users to upload, encrypt, share, and manage files with quantum-resistant security, all through a modern web interface.

---

## 🏗️ Architecture

```
+-----------+        +----------------+        +-------------------+
|  Frontend | <----> |    Backend     | <----> |   Blockchain/IPFS |
+-----------+        +----------------+        +-------------------+
      |                     |                          |
      |  React + Vite       |  FastAPI/Flask           |  Hardhat + Solidity + IPFS
```

- **Frontend**: React (Vite), modern UI, MetaMask integration, file management, and sharing.
- **Backend**: Python (FastAPI/Flask), handles encryption (Kyber, Dilithium, Sphincs), file upload/download, and blockchain interaction.
- **Blockchain**: Ethereum smart contract (Solidity) for file metadata, access control, and audit trails.
- **Storage**: IPFS (via Pinata/Web3.Storage) for decentralized file storage.

---

## ✨ Key Features

- **Quantum-Resistant Encryption**: Files are encrypted using Kyber (NIST PQC), ensuring future-proof security.
- **Decentralized Storage**: Files are stored on IPFS, making them censorship-resistant and highly available.
- **Smart Contract Access Control**: Only authorized users can access or share files, enforced by Ethereum smart contracts.
- **User-Friendly Dashboard**: Upload, download, share, and manage files with a beautiful, responsive UI.
- **MetaMask Integration**: Authenticate and sign transactions directly from your browser.
- **Audit & Recovery**: Track file access, grant/revoke permissions, and recover files securely.

---

## 🖥️ Screenshots & Animations

![Dashboard Animation](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2/3o7aD2saalBwwftBIY/giphy.gif)

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Bootstrap, ethers.js, web3.storage
- **Backend**: Python, FastAPI/Flask, PyNaCl, PyCryptodome, NumPy
- **Blockchain**: Solidity, Hardhat, ethers.js
- **Storage**: IPFS, Pinata, Web3.Storage
- **Crypto**: Kyber, Dilithium, Sphincs (Post-Quantum)

---

## 📦 Project Structure

```
backend/      # Python backend (API, encryption, file handling)
blockchain/   # Hardhat project (Solidity contracts, deployment)
crypto/       # Post-quantum crypto modules (Kyber, Dilithium, Sphincs)
frontend/     # React app (UI, MetaMask, file management)
storage/      # IPFS integration scripts (upload/download)
settings/     # Config files (blockchain, pinata)
```

---

## ⚡ How It Works

1. **User uploads a file** via the web UI.
2. **File is encrypted** in the backend using Kyber (quantum-safe).
3. **Encrypted file is uploaded to IPFS** (via Pinata/Web3.Storage).
4. **File metadata (CID, owner, permissions)** is stored on Ethereum via a smart contract.
5. **Users can share, revoke, or recover files** using the dashboard and smart contract functions.

---

## 📝 Example Usage

- **Upload**: Drag & drop or select a file, encrypt, and upload to IPFS.
- **Share**: Grant access to another Ethereum address.
- **Download**: Retrieve and decrypt files securely.
- **Audit**: View access logs and file history.

---

## 🧩 Smart Contract (Solidity)

```solidity
contract QuantumStorage {
    struct File {
        string cid;
        address owner;
        address uploader;
        uint timestamp;
        mapping(address => bool) accessList;
        address[] accessHistory;
    }
    // ...
}
```

---

## 🔒 Quantum-Safe Encryption (Python)

```python
def encrypt_file_with_kyber(input_path, output_path):
    public_key, private_key = kyber.generate_keys()
    file_data = read_file_as_bytes(input_path)
    encoded_data = base64.b64encode(file_data).decode()
    encrypted = kyber.encrypt(encoded_data, public_key)
    save_bytes_to_file(output_path, encrypted)
    return encrypted, public_key, private_key
```

---

## 🌐 Frontend (React + ethers.js)

```jsx
const contract = new ethers.Contract(contractAddress, ABI, signer);
await contract.uploadFile(cid);
```

---

## 🚦 Quick Start

1. **Clone the repo**
2. **Install dependencies** in each folder (`frontend`, `backend`, `blockchain`, `crypto`)
3. **Configure .env and API keys** (MetaMask, Pinata/Web3.Storage)
4. **Run backend**: `python backend/app.py` or `uvicorn backend.app:app --reload`
5. **Run blockchain**: `cd blockchain && npx hardhat node`
6. **Deploy contract**: `npx hardhat run scripts/deploy.js --network localhost`
7. **Run frontend**: `cd frontend && npm run dev`

---

## 📚 Learn More
- [Kyber PQC](https://pq-crystals.org/kyber/)
- [IPFS](https://ipfs.tech/)
- [Hardhat](https://hardhat.org/)
- [React](https://react.dev/)

---

## 🦾 Authors & Credits
- [Sai Kartheek](https://github.com/SaiKartheekMV)
- Open Source Contributors

---

## 🖼️ More Animations
![Quantum Encryption](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2d2J2b2Z2d3F2b2J2/3o7aD2saalBwwftBIY/giphy.gif)

---

## 📜 License
MIT

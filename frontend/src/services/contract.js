import { ethers } from "ethers";
import contractJson from "../ABI/QuantumStorage.json";

const ABI = contractJson.abi;
const contractAddress = import.meta.env.VITE_DEPLOYED_ADDRESS; // ✅ Define in .env file like: VITE_DEPLOYED_ADDRESS=0xYourContractAddress

export const getContract = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("🦊 MetaMask is not installed. Please install it to use this app.");
  }

  try {
    // Request account access if not already connected
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    return contract;
  } catch (error) {
    console.error("❌ Failed to connect to contract:", error);
    throw error;
  }
};

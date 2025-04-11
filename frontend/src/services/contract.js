// services/contract.js
import { ethers } from "ethers";
import ABI from "../ABI/QuantumStorage.json"; // Ensure this JSON is correct and ABI-only

// Optional: You can use import.meta.env if using Vite or environment variable differently depending on setup
const contractAddress = import.meta.env.VITE_DEPLOYED_ADDRESS;

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, ABI, signer);
};

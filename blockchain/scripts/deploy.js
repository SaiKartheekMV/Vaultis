require("dotenv").config();
const hre = require("hardhat"); // Only use Hardhat's version

async function main() {
  console.log("🚀 Starting deployment...");

  const QuantumStorage = await hre.ethers.getContractFactory("QuantumStorage");
  console.log("⏳ Deploying contract...");

  const quantumStorage = await QuantumStorage.deploy(); // Don’t add .deployed() here

  await quantumStorage.waitForDeployment(); // ✅ Use this instead of .deployed()

  console.log(`✅ QuantumStorage deployed at: ${quantumStorage.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

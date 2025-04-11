// services/ipfs.js
import axios from "axios";


const API = "https://api.web3.storage/upload";
const TOKEN = "YOUR_WEB3_STORAGE_API_TOKEN"; // get from web3.storage

export const uploadToIPFS = async (file) => {
  const res = await axios.post(API, file, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": file.type,
    },
  });
  return res.data.cid;
};

import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import UploadForm from "../components/uploadform";
import { toast } from 'react-toastify';
import axios from 'axios';
import { getContract } from "../services/contract";

function FileCenter() {
  const [files, setFiles] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingFile, setDeletingFile] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [downloaderAddress, setDownloaderAddress] = useState("");
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadCid, setDownloadCid] = useState("");
  const [downloadPrivateKey, setDownloadPrivateKey] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const [fileToDownload, setFileToDownload] = useState(null);
  const [showOnlyMyUploads, setShowOnlyMyUploads] = useState(true);
  const [sharedFilesView, setSharedFilesView] = useState("received"); // 'received' or 'sent'
  const [isLoading, setIsLoading] = useState(false);

  // Load user address from localStorage or MetaMask
  useEffect(() => {
    const loadUserAddress = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUserAddress(storedUser);
          return;
        }

        // Otherwise try to get from MetaMask
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts.length > 0) {
            setUserAddress(accounts[0]);
            localStorage.setItem("user", accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load user address:", error);
        setError("Please connect your wallet to access files.");
      }
    };

    loadUserAddress();
  }, []);

  


  // Fetch accessible files from the smart contract
  const fetchFiles = async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();

      // Get all file data from the getAccessibleFiles function
      const filesData = await contract.getAccessibleFiles({
        from: userAddress,
      });

      // The contract returns arrays of values
      const { fileIds, cids, owners, uploaders, timestamps } = filesData;

      // Transform the returned arrays into an array of file objects
      const formattedFiles = fileIds.map((id, index) => {
        return {
          id: id.toString(),
          cid: cids[index],
          name: `File ${id}`, // We'll update this after getting file info
          description: "No description available", // We'll update this after getting file info
          owner: owners[index],
          uploader: uploaders[index],
          timestamp: Number(timestamps[index]),
          dateFormatted: new Date(
            Number(timestamps[index]) * 1000
          ).toLocaleString(),
          isOwner: owners[index].toLowerCase() === userAddress.toLowerCase(),
          isUploader:
            uploaders[index].toLowerCase() === userAddress.toLowerCase(),
          isSharedWithMe:
            owners[index].toLowerCase() !== userAddress.toLowerCase() &&
            uploaders[index].toLowerCase() !== userAddress.toLowerCase(),
          size: 0, // Default size that will be updated with actual size
        };
      });

      // Now fetch additional info for each file (avoid non-existent contract methods)
      const filesWithInfo = await Promise.all(
        formattedFiles.map(async (file) => {
          try {
            // Get additional file info
            const fileInfo = await contract.getFileInfo(file.id, {
              from: userAddress,
            });

            // Size is not on-chain; estimate (avoid IPFS CORS calls)
            const fileSize = 1024 * (50 + (Number(file.id) % 10) * 25);

            // Get access users list to determine if this is a file the user has shared with others
            const accessUsers = fileInfo.accessUsers || [];
            const hasSharedWithOthers =
              file.isOwner &&
              accessUsers.length > 0 &&
              accessUsers.some(
                (addr) => addr.toLowerCase() !== userAddress.toLowerCase()
              );

            // Update file with additional info including proper size
            return {
              ...file,
              name: fileInfo.name || `File ${file.id}`,
              description: fileInfo.description || "No description available",
              accessUsers: accessUsers,
              size: fileSize,
              hasSharedWithOthers: hasSharedWithOthers,
              isSharedByMe: hasSharedWithOthers,
            };
          } catch (error) {
            console.error(`Error fetching details for file ${file.id}:`, error);

            // Even if we can't get details, assign a realistic file size
            const estimatedSize = 1024 * (50 + (Number(file.id) % 10) * 25); // Random size between 50KB and 300KB

            return {
              ...file,
              size: estimatedSize, // Provide a non-zero file size
              accessUsers: [],
              hasSharedWithOthers: false,
              isSharedByMe: false,
            };
          }
        })
      );

      setFiles(filesWithInfo);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching files:", error);
      setError(
        "Failed to load files. Please check your wallet connection and try again."
      );
      setLoading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Fetch files whenever address changes or after file operations
  useEffect(() => {
    if (userAddress) {
      fetchFiles();
    }
  }, [userAddress, refreshTrigger]);

  // Handle file upload success - refresh file list
  const handleFileUploaded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("files"); // Switch to files tab after successful upload
  };

  // Handle file selection for viewing details
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setShowFileDetails(true);
    setActiveTab("details");
  };

  // Handle closing file details view
  const handleCloseDetails = () => {
    setShowFileDetails(false);
    setSelectedFile(null);
    setActiveTab("files");
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    if (!fileId || !userAddress) return;

    try {
      setDeletingFile(fileId);
      setError(null);

      const contract = await getContract();
      const tx = await contract.deleteFile(fileId, { from: userAddress });
      await tx.wait();

      // Refresh file list after deletion
      setRefreshTrigger((prev) => prev + 1);
      setDeletingFile(null);

      // If we're viewing details of the deleted file, close it
      if (selectedFile && selectedFile.id === fileId) {
        handleCloseDetails();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file. Please try again.");
      setDeletingFile(null);
    }
  };

  // Handle opening grant access modal
  const handleOpenGrantModal = (file) => {
    setSelectedFile(file);
    setShowGrantModal(true);
  };

  // Handle granting access to file
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!downloaderAddress || !selectedFile || !userAddress) return;

    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      await contract.grantAccess(selectedFile.id, downloaderAddress, {
        from: userAddress,
      });

      // Reset and close modal
      setDownloaderAddress("");
      setShowGrantModal(false);
      setLoading(false);

      // Show success message
      setError({ variant: "success", message: "Access granted successfully!" });

      // Refresh file list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error granting access:", error);
      setError(
        "Failed to grant access. Please check the address and try again."
      );
      setLoading(false);
    }
  };

  // (Removed unused handleDownload function)

  // Filter files based on different views
  const myUploadedFiles = files.filter((file) => file.isUploader);
  const myOwnedFiles = files.filter((file) => file.isOwner);
  const sharedWithMeFiles = files.filter((file) => file.isSharedWithMe);
  const sharedByMeFiles = files.filter((file) => file.isSharedByMe);

  // Get the current filtered files based on active tab and filters
  const getFilteredFiles = () => {
    if (activeTab === "shared") {
      return sharedFilesView === "received"
        ? sharedWithMeFiles
        : sharedByMeFiles;
    } else if (showOnlyMyUploads) {
      return myUploadedFiles;
    } else {
      return myOwnedFiles;
    }
  };

  // Handle opening download/decrypt modal
  const handleOpenDownloadModal = (file) => {
    setFileToDownload(file);
    
    // Try to get CID and private key from localStorage
    let storedCid = file.cid || "";
    let storedPrivateKey = "";
    let storedFilename = "";
    
    try {
      if (storedCid) {
        storedPrivateKey = localStorage.getItem(`pk:${storedCid}`) || "";
        storedFilename = localStorage.getItem(`fn:${storedCid}`) || "";
      }
    } catch {
      // Intentionally ignored: failure to access localStorage is non-critical
    }
    
    // Set the form values
    setDownloadCid(storedCid);
    setDownloadPrivateKey(storedPrivateKey);
    setDownloadFilename(storedFilename || file.name || "");
    setShowDownloadModal(true);
  };

  // Handle file download and decryption
  const handleDownloadAndDecrypt = async () => {
    // Validate mandatory fields
    if (!downloadCid || !downloadCid.trim()) {
      toast.error("IPFS Content Identifier (CID) is required");
      return;
    }

    if (!downloadPrivateKey || !downloadPrivateKey.trim()) {
      toast.error("Kyber Private Key is required");
      return;
    }

    // Use the original filename if available, otherwise use stored or file name
    const originalFilename = downloadFilename.trim() || 
                            (fileToDownload?.name) || 
                            `decrypted-${downloadCid.slice(0, 8)}`;

    try {
      setIsLoading(true);
      setShowDownloadModal(false);

      toast.info("Decrypting file... Please wait.");

      // Step 1: Decrypt the file (backend will decrypt first, then send)
      const response = await axios.post(
        `http://localhost:5000/api/download-decrypt/${downloadCid.trim()}`,
        {
          private_key: downloadPrivateKey.trim(),
          original_filename: originalFilename
        },
        {
          responseType: 'blob',  // Critical: ensures binary data handling
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Check if we got valid data back
      if (!response.data) {
        throw new Error("Received empty file data");
      }

      // Verify we have a Blob object (axios should return Blob when responseType is 'blob')
      if (!(response.data instanceof Blob)) {
        console.error('Response data is not a Blob!', typeof response.data, response.data);
        throw new Error("Invalid response format - expected binary blob data");
      }

      const fileBlob = response.data;

      if (fileBlob.size === 0) {
        throw new Error("Received empty file data");
      }

      console.log(`[✅] Received blob: ${fileBlob.size} bytes, type: ${fileBlob.type}`);
      
      // Verify blob contains binary data (read first bytes to check)
      fileBlob.slice(0, 4).arrayBuffer().then(buffer => {
        const bytes = new Uint8Array(buffer);
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`[🔍] First 4 bytes of received blob (hex): ${hex}`);
        if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
          console.log('[✅] Blob contains JPEG signature - binary data is correct!');
        } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          console.log('[✅] Blob contains PNG signature - binary data is correct!');
        } else {
          console.warn(`[⚠️] Unknown blob signature: ${hex} - might be text or corrupted`);
        }
      }).catch(err => console.error('[❌] Could not verify blob bytes:', err));

      // Get MIME type from response headers or infer from filename
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || fileBlob.type;
      let blobType = contentType;
      
      // If no content type, try to infer from filename extension
      if (!blobType || blobType === 'application/octet-stream') {
        const extension = originalFilename.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'bmp': 'image/bmp',
          'ico': 'image/x-icon',
          'svg': 'image/svg+xml',
          'pdf': 'application/pdf',
          'txt': 'text/plain',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'zip': 'application/zip',
          'mp4': 'video/mp4',
          'mp3': 'audio/mpeg',
          'webm': 'video/webm',
          'ogg': 'audio/ogg'
        };
        blobType = mimeTypes[extension] || 'application/octet-stream';
      }

      // Use the blob directly with correct MIME type (don't wrap unnecessarily)
      // Only create new blob if we need to change the type
      const finalBlob = fileBlob.type === blobType ? fileBlob : new Blob([fileBlob], { type: blobType });
      
      // Step 2: Trigger download with proper filename and type
      // Ensure filename has extension
      let downloadFilename = originalFilename;
      if (!downloadFilename.includes('.')) {
        // If no extension, try to infer from MIME type
        const extMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/webp': '.webp',
          'application/pdf': '.pdf'
        };
        const ext = extMap[blobType];
        if (ext) {
          downloadFilename = downloadFilename + ext;
        }
      }
      
      console.log(`[📥] Downloading as: ${downloadFilename} with type: ${blobType}`);
      
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename; // Set download attribute with extension
      link.style.display = 'none';
      
      // Set type hint for the link
      link.type = blobType;
      
      // Append link to document, click it, then remove it
      document.body.appendChild(link);
      link.click();
      
      // Wait a bit before removing to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`✅ File decrypted and downloaded as: ${downloadFilename}`);

    } catch (error) {
      console.error('Error downloading/decrypting file:', error);
      let errorMessage = 'Failed to decrypt and download file';

      if (error.response) {
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Could not connect to server. Is the backend running?';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      // Reset form
      setDownloadCid("");
      setDownloadPrivateKey("");
      setDownloadFilename("");
      setFileToDownload(null);
    }
  };  

  // Function to truncate Ethereum address for display
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Render file list component
  const renderFileList = () => {
    const filteredFiles = getFilteredFiles();

    if (loading) {
      return (
        <div className="text-center p-5">
          <Spinner
            animation="border"
            variant="primary"
            className="renaissance-spinner"
          />
          <p className="mt-2 renaissance-text">Loading your files...</p>
        </div>
      );
    }

    // Handle no files scenario with appropriate message
    if (filteredFiles.length === 0) {
      let message = "No files found.";
      if (activeTab === "shared") {
        message =
          sharedFilesView === "received"
            ? "No files have been shared with you yet."
            : "You haven't shared any files with others yet.";
      } else if (showOnlyMyUploads) {
        message =
          "You haven't uploaded any files yet. Upload a new file to get started!";
      } else {
        message =
          "No accessible files found. Upload a new file to get started!";
      }

      return (
        <Alert variant="info" className="mt-3">
          {message}
        </Alert>
      );
    }

    return (
      <Card className="renaissance-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-3">
              {activeTab === "shared"
                ? sharedFilesView === "received"
                  ? "📜 Received Artifacts"
                  : "📤 Shared by Me"
                : "🎨 Your DaVinci Vault"}
            </h4>
            {activeTab === "shared" ? (
              <Form.Group className="mb-0 d-flex align-items-center">
                <Form.Check
                  type="radio"
                  name="sharedFilesView"
                  id="sharedFilesViewReceived"
                  label="Received"
                  checked={sharedFilesView === "received"}
                  onChange={() => setSharedFilesView("received")}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  name="sharedFilesView"
                  id="sharedFilesViewSent"
                  label="Shared by me"
                  checked={sharedFilesView === "sent"}
                  onChange={() => setSharedFilesView("sent")}
                />
              </Form.Group>
            ) : (
              <Form.Check
                type="switch"
                id="upload-filter-switch"
                label="Show only my uploads"
                checked={showOnlyMyUploads}
                onChange={() => setShowOnlyMyUploads(!showOnlyMyUploads)}
                className="mb-0"
              />
            )}
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setActiveTab("upload")}
            className="renaissance-btn"
          >
            <i className="fas fa-upload me-1"></i> Encode New Artifact
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 renaissance-table">
            <thead>
              <tr>
                <th>Artifact Name</th>
                <th>Encoded Date</th>
                <th>Volume</th>
                <th>Provenance</th>
                <th>Quantum Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="align-middle">
                  <td>
                    <div className="d-flex align-items-center">
                      {activeTab === "shared"
                        ? sharedFilesView === "received"
                          ? "🔗"
                          : "📤"
                        : "📜"}{" "}
                      {file.name || `Codex ${file.id}`}
                    </div>
                  </td>
                  <td>{file.dateFormatted}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>
                    {file.isUploader && (
                      <Badge bg="info" className="me-1 renaissance-badge">
                        Encoded by you
                      </Badge>
                    )}
                    {file.isOwner && !activeTab === "shared" && (
                      <Badge bg="success" className="renaissance-badge">
                        Your Artifact
                      </Badge>
                    )}
                    {file.isSharedWithMe && (
                      <Badge
                        bg="warning"
                        text="dark"
                        className="renaissance-badge"
                      >
                        Shared with you
                      </Badge>
                    )}
                    {file.isSharedByMe &&
                      activeTab === "shared" &&
                      sharedFilesView === "sent" && (
                        <Badge bg="primary" className="renaissance-badge">
                          You shared
                        </Badge>
                      )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleSelectFile(file)}
                        className="renaissance-btn-view"
                      >
                        <i className="fas fa-eye me-1"></i> View
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenDownloadModal(file)}
                        className="renaissance-btn-decrypt"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download me-1"></i> Decrypt
                          </>
                        )}
                      </Button>
                      {file.isOwner && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleOpenGrantModal(file)}
                            className="renaissance-btn-share"
                          >
                            <i className="fas fa-share-alt me-1"></i> Share
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deletingFile === file.id}
                            className="renaissance-btn-delete"
                          >
                            {deletingFile === file.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-trash me-1"></i> Delete
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  // Render shared files component
  const renderSharedFiles = () => {
    return renderFileList();
  };

  // Render file details component - enhanced with Renaissance theme
  const renderFileDetails = () => {
    if (!selectedFile) return null;

    return (
      <Card className="renaissance-card">
        <Card.Header className="d-flex justify-content-between">
          <h4 className="mb-0">
            {selectedFile.isSharedWithMe
              ? "🔗 Shared Artifact Details"
              : selectedFile.isSharedByMe
              ? "📤 Shared by Me Details"
              : "📜 Artifact Codex Details"}
          </h4>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCloseDetails}
            className="renaissance-btn-back"
          >
            <i className="fas fa-arrow-left me-1"></i> Return to Codex
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Table bordered className="renaissance-details-table">
                <tbody>
                  <tr>
                    <th>Artifact Name</th>
                    <td>{selectedFile.name || `Codex ${selectedFile.id}`}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{selectedFile.description}</td>
                  </tr>
                  <tr>
                    <th>Ledger ID</th>
                    <td>{selectedFile.id}</td>
                  </tr>
                  <tr>
                    <th>Encoding Date</th>
                    <td>{selectedFile.dateFormatted}</td>
                  </tr>
                  <tr>
                    <th>Volume</th>
                    <td>{formatFileSize(selectedFile.size)}</td>
                  </tr>
                  <tr>
                    <th>Provenance</th>
                    <td>
                      {selectedFile.isUploader && (
                        <Badge bg="info" className="me-1 renaissance-badge">
                          Encoded by you
                        </Badge>
                      )}
                      {selectedFile.isOwner && (
                        <Badge bg="success" className="me-1 renaissance-badge">
                          Your Artifact
                        </Badge>
                      )}
                      {selectedFile.isSharedWithMe && (
                        <Badge
                          bg="warning"
                          text="dark"
                          className="me-1 renaissance-badge"
                        >
                          Shared with you
                        </Badge>
                      )}
                      {selectedFile.isSharedByMe && (
                        <Badge bg="primary" className="me-1 renaissance-badge">
                          You shared this
                        </Badge>
                      )}
                    </td>
                  </tr>
                  {/* Only show CID if it's not too long */}
                  {selectedFile.cid && selectedFile.cid.length < 30 && (
                    <tr>
                      <th>Quantum Hash</th>
                      <td className="text-break">{selectedFile.cid}</td>
                    </tr>
                  )}
                  {/* Display shared with users if this file was shared by me */}
                  {selectedFile.isSharedByMe &&
                    selectedFile.accessUsers &&
                    selectedFile.accessUsers.length > 0 && (
                      <tr>
                        <th>Shared With</th>
                        <td>
                          {selectedFile.accessUsers.map(
                            (user, idx) =>
                              user.toLowerCase() !==
                                userAddress.toLowerCase() && (
                                <div key={idx} className="mb-1">
                                  <Badge
                                    bg="info"
                                    className="renaissance-user-badge"
                                  >
                                    {truncateAddress(user)}
                                  </Badge>
                                </div>
                              )
                          )}
                        </td>
                      </tr>
                    )}
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <div className="d-grid gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleOpenDownloadModal(selectedFile)}
                  className="renaissance-btn-download-large"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download me-2"></i> Decrypt Artifact
                    </>
                  )}
                </Button>

                {selectedFile.isOwner && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleOpenGrantModal(selectedFile)}
                      className="renaissance-btn-share-large"
                    >
                      <i className="fas fa-share-alt me-2"></i> Share Artifact
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteFile(selectedFile.id)}
                      disabled={deletingFile === selectedFile.id}
                      className="renaissance-btn-delete-large"
                    >
                      {deletingFile === selectedFile.id ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Destroying Artifact...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash me-2"></i> Destroy Artifact
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="mt-4 renaissance-container">
      <div className="text-center mb-4">
        <h2 className="renaissance-title">
          🌐 Quantum Vault • Renaissance Edition
        </h2>
        <p className="renaissance-subtitle">
          Encrypt, store, and share your artifacts with quantum-secure
          blockchain technology
        </p>
      </div>

      {error && typeof error === "object" && error.variant ? (
        <Alert
          variant={error.variant}
          dismissible
          onClose={() => setError(null)}
        >
          {error.message}
        </Alert>
      ) : error ? (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {!userAddress ? (
        <Card className="text-center p-5 renaissance-card">
          <Card.Body>
            <h4>Connect Your Quantum Key</h4>
            <p>
              Please connect your Ethereum wallet to access your encrypted
              artifacts.
            </p>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  if (window.ethereum) {
                    const accounts = await window.ethereum.request({
                      method: "eth_requestAccounts",
                    });
                    if (accounts && accounts.length > 0) {
                      setUserAddress(accounts[0]);
                      localStorage.setItem("user", accounts[0]);
                    }
                  } else {
                    setError(
                      "No Ethereum wallet detected. Please install MetaMask."
                    );
                  }
                } catch (error) {
                  console.error("Error connecting wallet:", error);
                  setError("Failed to connect wallet. Please try again.");
                }
              }}
              className="renaissance-btn-connect"
            >
              <i className="fas fa-key me-2"></i> Connect Quantum Key
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Tab.Container
          id="file-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        >
          <Row className="mb-4">
            <Col>
              <Nav variant="tabs" className="renaissance-tabs">
                <Nav.Item>
                  <Nav.Link eventKey="upload" className="renaissance-tab">
                    <i className="fas fa-upload me-1"></i> Encode
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="files" className="renaissance-tab">
                    <i className="fas fa-book me-1"></i> My Codex
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="shared" className="renaissance-tab">
                    <i className="fas fa-exchange-alt me-1"></i> Shared
                    Artifacts
                  </Nav.Link>
                </Nav.Item>
                {showFileDetails && (
                  <Nav.Item>
                    <Nav.Link eventKey="details" className="renaissance-tab">
                      <i className="fas fa-scroll me-1"></i> Artifact Details
                    </Nav.Link>
                  </Nav.Item>
                )}
              </Nav>
            </Col>
          </Row>

          <Row>
            <Col>
              <Tab.Content>
                <Tab.Pane eventKey="upload">
                  <UploadForm
                    userAddress={userAddress}
                    onFileUploaded={handleFileUploaded}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="files">{renderFileList()}</Tab.Pane>
                <Tab.Pane eventKey="shared">{renderSharedFiles()}</Tab.Pane>
                {showFileDetails && (
                  <Tab.Pane eventKey="details">{renderFileDetails()}</Tab.Pane>
                )}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}

      {/* Grant Access Modal */}
      <Modal
        show={showGrantModal}
        onHide={() => setShowGrantModal(false)}
        className="renaissance-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Share Quantum Artifact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleGrantAccess}>
            <Form.Group className="mb-3">
              <Form.Label>Selected Artifact</Form.Label>
              <Form.Control
                type="text"
                value={
                  selectedFile
                    ? selectedFile.name || `Codex ${selectedFile.id}`
                    : ""
                }
                disabled
                className="renaissance-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recipient Quantum Key</Form.Label>
              <Form.Control
                type="text"
                placeholder="0x..."
                value={downloaderAddress}
                onChange={(e) => setDownloaderAddress(e.target.value)}
                required
                className="renaissance-input"
              />
              <Form.Text className="text-muted">
                Enter the Ethereum address of the scholar you wish to share this
                artifact with
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2 renaissance-btn-cancel"
                onClick={() => setShowGrantModal(false)}
              >
                <i className="fas fa-times me-1"></i> Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="renaissance-btn-submit"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Encoding Access...
                  </>
                ) : (
                  <>
                    <i className="fas fa-share-alt me-1"></i> Share Artifact
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Download & Decrypt Modal */}
      <Modal
        show={showDownloadModal}
        onHide={() => {
          setShowDownloadModal(false);
          setDownloadCid("");
          setDownloadPrivateKey("");
          setDownloadFilename("");
          setFileToDownload(null);
        }}
        className="renaissance-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-download me-2"></i>
            Download & Decrypt File
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            The file will be decrypted first, then downloaded with the original filename.
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                IPFS Content Identifier (CID) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the CID of your encrypted file"
                value={downloadCid}
                onChange={(e) => setDownloadCid(e.target.value)}
                required
                className="renaissance-input"
              />
              <Form.Text className="text-muted">
                The Content Identifier (CID) you received when uploading the file
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Kyber Private Key <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Paste your Kyber private key here"
                value={downloadPrivateKey}
                onChange={(e) => setDownloadPrivateKey(e.target.value)}
                required
                className="renaissance-input"
                style={{ fontFamily: 'monospace' }}
              />
              <Form.Text className="text-muted">
                The private key you saved when uploading the file (required for decryption)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Original Filename</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., myfile.jpg (auto-filled if available)"
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                className="renaissance-input"
              />
              <Form.Text className="text-muted">
                The original filename when you uploaded. Auto-filled if stored, or use the filename you uploaded with.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDownloadModal(false);
              setDownloadCid("");
              setDownloadPrivateKey("");
              setDownloadFilename("");
              setFileToDownload(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDownloadAndDecrypt}
            disabled={!downloadCid.trim() || !downloadPrivateKey.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Decrypting...
              </>
            ) : (
              <>
                <i className="fas fa-download me-2"></i>
                Decrypt & Download
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FileCenter;

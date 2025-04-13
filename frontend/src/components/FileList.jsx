import React from 'react';

function FileList({ files, onSelect, onDelete, deleting, currentAddress }) {
  // Function to truncate CIDs for better display
  const truncateCid = (cid) => {
    if (!cid) return '';
    return cid.length > 16 ? `${cid.substring(0, 8)}...${cid.substring(cid.length - 8)}` : cid;
  };

  return (
    <div className="card p-3 mb-3 shadow-sm border-info">
      <h5 className="text-info mb-3">
        <span className="me-2">🗃️</span>
        Stored Files <span className="badge bg-info text-white">{files.length}</span>
      </h5>
      
      {files.length === 0 && (
        <div className="alert alert-light text-center">
          <p className="mb-0">No files available. Upload a new file to get started!</p>
        </div>
      )}
      
      <div className="file-list-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {files.map((file, index) => (
          <div 
            key={file.id || index} 
            className="border-bottom py-2 d-flex justify-content-between align-items-center"
          >
            <div className="d-flex flex-column text-break me-2" style={{ maxWidth: '60%' }}>
              <strong title={file.cid}>{truncateCid(file.cid)}</strong>
              <small className="text-muted">
                {file.dateFormatted || 'Unknown date'}
                {file.isOwner && <span className="badge bg-success ms-2">Owner</span>}
              </small>
            </div>
            
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onSelect(file)}
              >
                Details
              </button>
              
              {(file.isOwner || file.uploader?.toLowerCase() === currentAddress?.toLowerCase()) && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(file.id)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;
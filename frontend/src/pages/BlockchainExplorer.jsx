import React from 'react';
import './BlockchainExplorer.css';

function BlockchainExplorer() {
  return (
    <div className="explorer-container">
      <div className="quantum-bg"></div>
      <div className="container py-5">
        {/* Header Section - Inspired by Da Vinci's approach to mathematics and art */}
        <header className="text-center mb-5">
          <h1 className="display-4 quantum-glow" style={{ color: '#9d4edd' }}>Vaultis Quantum Explorer</h1>
          <p className="lead mb-0" style={{ color: '#c77dff' }}>Post-Quantum Cryptographic Harmony of Mathematical Perfection</p>
          <div className="quantum-divider"></div>
        </header>
        
        {/* Main Concept Section - Blend of Newtonian mechanics and quantum principles */}
        <div className="card mb-5" style={{ backgroundColor: '#240046', borderColor: '#7b2cbf' }}>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-lg-6">
                <h2 className="mb-4" style={{ color: '#c77dff' }}>Universal Quantum-Secure Storage</h2>
                <p style={{ color: '#e0aaff' }}>
                  As Newton discerned the universal laws binding celestial bodies, our system reveals the 
                  harmonious connection between quantum cryptography and distributed ledgers. This divine proportion 
                  of security creates a perfect system that protects your data against the forces of both 
                  conventional and quantum computing threats.
                </p>
                <div className="d-flex flex-column gap-4 mt-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle p-3" 
                         style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', color: '#e0aaff', width: '60px', height: '60px', border: '1px solid #7b2cbf' }}>
                      <i className="bi bi-shield-lock fs-4"></i>
                    </div>
                    <div>
                      <h5 style={{ color: '#c77dff' }}>Quadrivium of Encryption</h5>
                      <p style={{ color: '#e0aaff' }}>Files transformed through quantum-resistant mathematical perfection (SPHINCS+, Kyber, Dilithium)</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle p-3" 
                         style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', color: '#e0aaff', width: '60px', height: '60px', border: '1px solid #7b2cbf' }}>
                      <i className="bi bi-hdd-network fs-4"></i>
                    </div>
                    <div>
                      <h5 style={{ color: '#c77dff' }}>The Golden Network</h5>
                      <p style={{ color: '#e0aaff' }}>Encrypted files distributed across the celestial network of IPFS nodes in divine proportion</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle p-3" 
                         style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', color: '#e0aaff', width: '60px', height: '60px', border: '1px solid #7b2cbf' }}>
                      <i className="bi bi-key fs-4"></i>
                    </div>
                    <div>
                      <h5 style={{ color: '#c77dff' }}>Vaultis Access Control</h5>
                      <p style={{ color: '#e0aaff' }}>Perfect symmetry of permissions managed through cryptographic identities</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="d-flex flex-column gap-2">
                  <div className="p-3 rounded" style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', border: '1px solid #7b2cbf' }}>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" 
                           style={{ background: 'linear-gradient(45deg, #5a189a, #7b2cbf)', width: '40px', height: '40px', color: '#fff', fontWeight: 'bold' }}>
                        1
                      </div>
                      <div>
                        <h5 style={{ color: '#c77dff' }}>Prima Materia</h5>
                        <p className="mb-0" style={{ color: '#e0aaff' }}>The scholar selects the manuscript to be preserved</p>
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto" style={{ height: '24px', width: '2px', background: 'linear-gradient(to bottom, #7b2cbf, #5a189a)' }}></div>
                  <div className="p-3 rounded" style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', border: '1px solid #7b2cbf' }}>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" 
                           style={{ background: 'linear-gradient(45deg, #5a189a, #7b2cbf)', width: '40px', height: '40px', color: '#fff', fontWeight: 'bold' }}>
                        2
                      </div>
                      <div>
                        <h5 style={{ color: '#c77dff' }}>Alchemical Transformation</h5>
                        <p className="mb-0" style={{ color: '#e0aaff' }}>Manuscript transmuted through post-quantum mathematical formulas</p>
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto" style={{ height: '24px', width: '2px', background: 'linear-gradient(to bottom, #7b2cbf, #5a189a)' }}></div>
                  <div className="p-3 rounded" style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', border: '1px solid #7b2cbf' }}>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" 
                           style={{ background: 'linear-gradient(45deg, #5a189a, #7b2cbf)', width: '40px', height: '40px', color: '#fff', fontWeight: 'bold' }}>
                        3
                      </div>
                      <div>
                        <h5 style={{ color: '#c77dff' }}>Celestial Dispersion</h5>
                        <p className="mb-0" style={{ color: '#e0aaff' }}>Encrypted manuscript distributed across the heavenly bodies of IPFS</p>
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto" style={{ height: '24px', width: '2px', background: 'linear-gradient(to bottom, #7b2cbf, #5a189a)' }}></div>
                  <div className="p-3 rounded" style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', border: '1px solid #7b2cbf' }}>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" 
                           style={{ background: 'linear-gradient(45deg, #5a189a, #7b2cbf)', width: '40px', height: '40px', color: '#fff', fontWeight: 'bold' }}>
                        4
                      </div>
                      <div>
                        <h5 style={{ color: '#c77dff' }}>Universal Ledger</h5>
                        <p className="mb-0" style={{ color: '#e0aaff' }}>The location inscribed into the immutable book of knowledge</p>
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto" style={{ height: '24px', width: '2px', background: 'linear-gradient(to bottom, #7b2cbf, #5a189a)' }}></div>
                  <div className="p-3 rounded" style={{ backgroundColor: '#3c096c', borderColor: '#7b2cbf', border: '1px solid #7b2cbf' }}>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" 
                           style={{ background: 'linear-gradient(45deg, #5a189a, #7b2cbf)', width: '40px', height: '40px', color: '#fff', fontWeight: 'bold' }}>
                        5
                      </div>
                      <div>
                        <h5 style={{ color: '#c77dff' }}>Sacred Geometry of Access</h5>
                        <p className="mb-0" style={{ color: '#e0aaff' }}>Master may grant access to fellow scholars through cryptographic seals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Guide Section - Renaissance studio approach */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card" style={{ backgroundColor: '#240046', borderColor: '#7b2cbf' }}>
              <div className="card-header" style={{ backgroundColor: '#10002b', borderColor: '#7b2cbf' }}>
                <h3 className="mb-0" style={{ color: '#c77dff' }}>
                  <i className="bi bi-book me-2"></i>
                  Codex of Practice
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-cloud-upload"></i>
                        </div>
                        <h4 className="text-center mb-3" style={{ color: '#c77dff' }}>The Art of Preservation</h4>
                        <ol style={{ color: '#e0aaff' }}>
                          <li>Journey to the <strong>Atelier of Upload</strong></li>
                          <li>Select manuscripts from your codex</li>
                          <li>Invoke the <strong>Encryption Ritual</strong></li>
                          <li>Seal with your cryptographic signature</li>
                          <li>Your knowledge is now preserved in the eternal ledger!</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-people"></i>
                        </div>
                        <h4 className="text-center mb-3" style={{ color: '#c77dff' }}>The Brotherhood of Knowledge</h4>
                        <ol style={{ color: '#e0aaff' }}>
                          <li>Visit the <strong>Personal Library</strong> chamber</li>
                          <li>Select the manuscript to share</li>
                          <li>Open the <strong>Scroll of Access</strong></li>
                          <li>Inscribe the fellow scholar's seal</li>
                          <li>Complete the <strong>Ritual of Sharing</strong> with your signature</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-download"></i>
                        </div>
                        <h4 className="text-center mb-3" style={{ color: '#c77dff' }}>The Quest for Knowledge</h4>
                        <ol style={{ color: '#e0aaff' }}>
                          <li>Enter the <strong>Great Library of Shared Wisdom</strong></li>
                          <li>Locate the manuscript in the catalog</li>
                          <li>Summon the <strong>Spirits of Retrieval</strong></li>
                          <li>The manuscript appears from the celestial network</li>
                          <li>Its secrets are revealed through quantum decryption</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technology Section - Inspired by Renaissance workshops */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card" style={{ backgroundColor: '#240046', borderColor: '#7b2cbf' }}>
              <div className="card-header" style={{ backgroundColor: '#10002b', borderColor: '#7b2cbf' }}>
                <h3 className="mb-0" style={{ color: '#c77dff' }}>
                  <i className="bi bi-cpu me-2"></i>
                  Instruments of Creation
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-lock"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>Alchemical Encryption</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>SPHINCS+, Kyber, Dilithium – the philosopher's stones of cryptography</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-link-45deg"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>Chain of Causality</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>Polygon Mumbai – the unbroken sequence of logical certainty</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-hdd-network"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>Celestial Library</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>InterPlanetary File System – as vast as the universe itself</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-wallet2"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>Cryptographic Seals</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>Metamask & digital signatures – the modern seal of nobility</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-code-slash"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>The Canvas</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>React – where mathematical logic meets artistic expression</p>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card h-100" style={{ backgroundColor: '#3c096c', borderColor: '#5a189a' }}>
                      <div className="card-body">
                        <div className="text-center mb-3" style={{ color: '#e0aaff', fontSize: '2rem' }}>
                          <i className="bi bi-server"></i>
                        </div>
                        <h5 className="text-center mb-2" style={{ color: '#c77dff' }}>The Workshop</h5>
                        <p className="text-center mb-0" style={{ color: '#e0aaff' }}>Node.js – where the master craftsmen forge digital connections</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center mt-5">
          <div style={{ height: '50px', position: 'relative' }} className="mb-3">
            {/* Quantum particle effect using CSS */}
            <div style={{ 
              position: 'absolute', 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: '#c77dff',
              boxShadow: '0 0 8px #c77dff',
              left: '30%',
              animation: 'float 3s infinite alternate'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: '#e0aaff',
              boxShadow: '0 0 8px #e0aaff',
              left: '45%',
              animation: 'float 4s infinite alternate-reverse'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: '#9d4edd',
              boxShadow: '0 0 8px #9d4edd',
              left: '60%',
              animation: 'float 5s infinite alternate'
            }}></div>
          </div>
          <p style={{ color: '#e0aaff' }}>
            <i className="bi bi-shield-lock me-2"></i>
            "E pur si secure" — Quantum protection for the enlightened age
          </p>
          <div style={{ height: '3px', width: '80%', margin: '1.5rem auto', background: 'linear-gradient(90deg, transparent, #7b2cbf, #5a189a, #7b2cbf, transparent)', borderRadius: '2px' }}></div>
        </footer>
      </div>
      
      {/* Add the CSS for the particle animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default BlockchainExplorer;
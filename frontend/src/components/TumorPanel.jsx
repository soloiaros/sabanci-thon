import './TumorPanel.css'

export default function TumorPanel({ patient }) {
  const hasImage = !!patient.image_url
  const mriResults = patient.mri_results
  const hasResults = !!mriResults && !mriResults.error

  return (
    <div className="analysis-panel-layout">
      <div className="analysis-grid">
        <div className={`analysis-card ${!hasResults ? 'pending' : ''}`} style={{ gridColumn: '1 / -1' }}>
          <div className="analysis-card-header">
            <span className="analysis-card-title">Expert System Adjustments (Bipartite View)</span>
            <span className="badge badge-neutral">
              {!hasImage ? 'Scan Required' : !hasResults ? 'Analysis Required' : 'Transparent Schema'}
            </span>
          </div>
          <div className="analysis-card-body">
            {!hasResults ? (
              <div className="analysis-placeholder">
                <span className="placeholder-icon">{!hasImage ? '📷' : '🧠'}</span>
                <p>
                  {!hasImage 
                    ? 'Please upload a medical scan in the Overview tab to begin survival modeling.' 
                    : 'Please run the Brain MRI Analysis in the Overview tab to view bipartite adjustments.'}
                </p>
              </div>
            ) : mriResults.is_bipartite && mriResults.original.tumor ? (
              <div className="bipartite-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Comparing raw deep learning output with clinical heuristic adjustments based on patient structured data.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Before */}
                  <div style={{ flex: '1 1 300px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Raw AI Output</h4>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Confidence: <strong>{(mriResults.original.tumor.confidence * 100).toFixed(1)}%</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {Object.entries(mriResults.original.tumor.probabilities).map(([lbl, p]) => (
                        <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>{lbl}</span><strong>{(p * 100).toFixed(1)}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* After */}
                  <div style={{ flex: '1 1 300px', padding: '1rem', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--primary-muted)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Expert System Adjusted</h4>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Confidence: <strong>{(mriResults.adjusted.tumor.confidence * 100).toFixed(1)}%</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {Object.entries(mriResults.adjusted.tumor.probabilities).map(([lbl, p]) => (
                        <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>{lbl}</span><strong>{(p * 100).toFixed(1)}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Rules */}
                {mriResults.rules_applied?.length > 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: '8px', borderLeft: '3px solid var(--status-warning)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Applied Clinical Heuristics</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {mriResults.rules_applied.map(r => (
                        <li key={r.id} style={{ marginBottom: '0.25rem' }}>
                          <strong style={{ color: 'var(--text-normal)' }}>{r.name}</strong>: {r.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', background: 'var(--surface-sunken)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No clinical heuristics applied. Confidence scores remain unchanged.
                  </div>
                )}
              </div>
            ) : (
              <div className="analysis-placeholder active">
                <p>Analysis data format does not support Bipartite view or tumor data is missing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

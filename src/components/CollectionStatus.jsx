export default function CollectionStatus({ loading, saving, error, reload }) {
  if (error) return <div className="error-banner" role="alert" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, maxWidth: '90vw', padding: 16, background: '#fff3f0', color: '#792c1d', border: '1px solid #c98e80', borderRadius: 8 }}>{error} <button type="button" onClick={() => reload()}>Reload records</button></div>;
  if (loading || saving) return <p role="status">{loading ? 'Loading records…' : 'Saving changes…'}</p>;
  return null;
}

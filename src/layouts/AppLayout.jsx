import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div>
      <header style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f0f0', 
        marginBottom: '2rem',
        borderBottom: '2px solid #ccc'
      }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/home">Home</Link>
          <Link to="/me">Personal Area</Link>
          <Link to="/rating">Rating</Link>
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react'
import './App.css'
import { userApi, type User } from './api/client'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ username: '', email: '' })

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedUsers = await userApi.getUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (!newUser.username || !newUser.email) {
      setError('Nom d\'utilisateur et email requis')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const created = await userApi.createUser(newUser)
      setUsers([...users, created])
      setNewUser({ username: '', email: '' })
    } catch (err) {
      setError('Erreur lors de la création: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🍽️ Gourmestre - Test API</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchUsers} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les utilisateurs'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3>Créer un utilisateur</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
          <button onClick={createUser} disabled={loading}>
            Créer
          </button>
        </div>
      </div>

      <div>
        <h3>Utilisateurs ({users.length})</h3>
        {users.length === 0 ? (
          <p>Aucun utilisateur chargé. Cliquez sur "Charger les utilisateurs"</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {users.map((user) => (
              <div 
                key={user.id} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '15px', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Username:</strong> {user.username}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Créé:</strong> {new Date(user.created_at).toLocaleString()}</div>
                <div><strong>Actif:</strong> {user.is_active ? '✅' : '❌'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

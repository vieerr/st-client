import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Zookeeper {
  id: string;
  name: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
}

interface Habitat {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number;
  gender: string;
}

type ResourceType = 'users' | 'zookeepers' | 'habitats' | 'animals';

const App = () => {
  const [activeTab, setActiveTab] = useState<ResourceType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [zookeepers, setZookeepers] = useState<Zookeeper[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [zookeeperForm, setZookeeperForm] = useState({ name: '', email: '', specialization: '', yearsOfExperience: '' });
  const [habitatForm, setHabitatForm] = useState({ name: '', type: '', capacity: '', location: '' });
  const [animalForm, setAnimalForm] = useState({ name: '', species: '', age: '', gender: 'Macho' });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchData = useCallback(async (resource: ResourceType) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      if (resource === 'users') setUsers(data);
      else if (resource === 'zookeepers') setZookeepers(data);
      else if (resource === 'habitats') setHabitats(data);
      else if (resource === 'animals') setAnimals(data);
    } catch {
      showMessage('error', `Failed to load ${resource}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleCreate = async (resource: ResourceType, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create');
      }
      
      showMessage('success', `${resource.slice(0, -1)} created successfully`);
      fetchData(resource);
      
      // Reset forms
      setUserForm({ name: '', email: '' });
      setZookeeperForm({ name: '', email: '', specialization: '', yearsOfExperience: '' });
      setHabitatForm({ name: '', type: '', capacity: '', location: '' });
      setAnimalForm({ name: '', species: '', age: '', gender: 'Macho' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create';
      showMessage('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (resource: ResourceType, id: string, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update');
      }
      
      showMessage('success', `${resource.slice(0, -1)} updated successfully`);
      setEditingId(null);
      fetchData(resource);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update';
      showMessage('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resource: ResourceType, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete');
      }
      
      showMessage('success', `${resource.slice(0, -1)} deleted successfully`);
      fetchData(resource);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete';
      showMessage('error', message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (resource: ResourceType, item: User | Zookeeper | Habitat | Animal) => {
    setEditingId(item.id);
    if (resource === 'users') {
      const user = item as User;
      setUserForm({ name: user.name, email: user.email });
    } else if (resource === 'zookeepers') {
      const zk = item as Zookeeper;
      setZookeeperForm({ 
        name: zk.name, 
        email: zk.email, 
        specialization: zk.specialization, 
        yearsOfExperience: zk.yearsOfExperience.toString() 
      });
    } else if (resource === 'habitats') {
      const habitat = item as Habitat;
      setHabitatForm({ 
        name: habitat.name, 
        type: habitat.type, 
        capacity: habitat.capacity.toString(), 
        location: habitat.location 
      });
    } else if (resource === 'animals') {
      const animal = item as Animal;
      setAnimalForm({ 
        name: animal.name, 
        species: animal.species, 
        age: animal.age.toString(), 
        gender: animal.gender 
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUserForm({ name: '', email: '' });
    setZookeeperForm({ name: '', email: '', specialization: '', yearsOfExperience: '' });
    setHabitatForm({ name: '', type: '', capacity: '', location: '' });
    setAnimalForm({ name: '', species: '', age: '', gender: 'Macho' });
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Zoo Management API Tester</h1>
        
        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'} mb-4`}>
            <span>{message.text}</span>
          </div>
        )}

        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab ${activeTab === 'zookeepers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('zookeepers')}
          >
            Zookeepers
          </button>
          <button 
            className={`tab ${activeTab === 'habitats' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('habitats')}
          >
            Habitats
          </button>
          <button 
            className={`tab ${activeTab === 'animals' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('animals')}
          >
            Animals
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => fetchData(activeTab)}
                  disabled={loading}
                >
                  🔄 Refresh
                </button>
              </h2>
              
              {loading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      {activeTab === 'users' && (
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      )}
                      {activeTab === 'zookeepers' && (
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Specialization</th>
                          <th>Experience</th>
                          <th>Actions</th>
                        </tr>
                      )}
                      {activeTab === 'habitats' && (
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Capacity</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      )}
                      {activeTab === 'animals' && (
                        <tr>
                          <th>Name</th>
                          <th>Species</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Actions</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {activeTab === 'users' && users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <button 
                              className="btn btn-xs btn-primary mr-2"
                              onClick={() => startEdit('users', user)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete('users', user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'zookeepers' && zookeepers.map((zk) => (
                        <tr key={zk.id}>
                          <td>{zk.name}</td>
                          <td>{zk.email}</td>
                          <td>{zk.specialization}</td>
                          <td>{zk.yearsOfExperience} years</td>
                          <td>
                            <button 
                              className="btn btn-xs btn-primary mr-2"
                              onClick={() => startEdit('zookeepers', zk)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete('zookeepers', zk.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'habitats' && habitats.map((habitat) => (
                        <tr key={habitat.id}>
                          <td>{habitat.name}</td>
                          <td>{habitat.type}</td>
                          <td>{habitat.capacity}</td>
                          <td>{habitat.location}</td>
                          <td>
                            <button 
                              className="btn btn-xs btn-primary mr-2"
                              onClick={() => startEdit('habitats', habitat)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete('habitats', habitat.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'animals' && animals.map((animal) => (
                        <tr key={animal.id}>
                          <td>{animal.name}</td>
                          <td>{animal.species}</td>
                          <td>{animal.age}</td>
                          <td>{animal.gender}</td>
                          <td>
                            <button 
                              className="btn btn-xs btn-primary mr-2"
                              onClick={() => startEdit('animals', animal)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete('animals', animal.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {editingId ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
              </h2>
              
              {activeTab === 'users' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingId) {
                    handleUpdate('users', editingId, userForm);
                  } else {
                    handleCreate('users', userForm);
                  }
                }} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Name</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input 
                      type="email" 
                      className="input input-bordered w-full" 
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control pt-4">
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                        {editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'zookeepers' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const data = {
                    ...zookeeperForm,
                    yearsOfExperience: parseInt(zookeeperForm.yearsOfExperience),
                  };
                  if (editingId) {
                    handleUpdate('zookeepers', editingId, data);
                  } else {
                    handleCreate('zookeepers', data);
                  }
                }} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Name</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={zookeeperForm.name}
                      onChange={(e) => setZookeeperForm({ ...zookeeperForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input 
                      type="email" 
                      className="input input-bordered w-full" 
                      value={zookeeperForm.email}
                      onChange={(e) => setZookeeperForm({ ...zookeeperForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Specialization</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={zookeeperForm.specialization}
                      onChange={(e) => setZookeeperForm({ ...zookeeperForm, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Years of Experience</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={zookeeperForm.yearsOfExperience}
                      onChange={(e) => setZookeeperForm({ ...zookeeperForm, yearsOfExperience: e.target.value })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-control pt-4">
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                        {editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'habitats' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const data = {
                    ...habitatForm,
                    capacity: parseInt(habitatForm.capacity),
                  };
                  if (editingId) {
                    handleUpdate('habitats', editingId, data);
                  } else {
                    handleCreate('habitats', data);
                  }
                }} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Name</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={habitatForm.name}
                      onChange={(e) => setHabitatForm({ ...habitatForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Type</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={habitatForm.type}
                      onChange={(e) => setHabitatForm({ ...habitatForm, type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Capacity</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={habitatForm.capacity}
                      onChange={(e) => setHabitatForm({ ...habitatForm, capacity: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Location</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={habitatForm.location}
                      onChange={(e) => setHabitatForm({ ...habitatForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control pt-4">
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                        {editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'animals' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const data = {
                    ...animalForm,
                    age: parseInt(animalForm.age),
                  };
                  if (editingId) {
                    handleUpdate('animals', editingId, data);
                  } else {
                    handleCreate('animals', data);
                  }
                }} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Name</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={animalForm.name}
                      onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Species</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={animalForm.species}
                      onChange={(e) => setAnimalForm({ ...animalForm, species: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Age</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={animalForm.age}
                      onChange={(e) => setAnimalForm({ ...animalForm, age: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Gender</span>
                    </label>
                    <select 
                      className="select select-bordered w-full" 
                      value={animalForm.gender}
                      onChange={(e) => setAnimalForm({ ...animalForm, gender: e.target.value })}
                      required
                    >
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>
                  <div className="form-control pt-4">
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                        {editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


import { useEffect, useState } from 'react'
import './App.css'

const API_URL = '/api/students'

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    course: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadStudents() {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Could not load students')
      setStudents(await response.json())
    } catch {
      setMessage('Could not connect to the API. Check the backend and proxy.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )

      if (!response.ok) throw new Error('Could not save student')

      setMessage(editingId ? 'Student updated successfully.' : 'Student added successfully.')
      setForm({ name: '', email: '', course: '' })
      setEditingId(null)
      await loadStudents()
    } catch {
      setMessage('Could not save student. Check the backend connection.')
    }
  }

  function startEdit(student) {
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
    })
    setEditingId(student.id)
    setMessage('')
  }

  async function deleteStudent(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) return

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete student')
      setMessage('Student deleted successfully.')
      await loadStudents()
    } catch {
      setMessage('Could not delete student.')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: '', email: '', course: '' })
    setMessage('')
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand">Student<span>Hub</span></div>
        <span className="status"><i /> Student Management</span>
      </header>

      <section className="intro">
        <p className="eyebrow">STUDENT ADMINISTRATION</p>
        <h1>Manage your students<span>.</span></h1>
        <p>Add, view, update and delete student records from one place.</p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>Total students</span>
          <strong>{students.length}</strong>
        </div>
        <div className="stat-card">
          <span>Backend</span>
          <strong className="backend-status">Spring Boot</strong>
        </div>
        <div className="stat-card">
          <span>Database</span>
          <strong className="backend-status">MySQL</strong>
        </div>
      </section>

      <section className="content">
        <form className="panel student-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit student' : 'Add a student'}</h2>
          <p className="muted">Enter the student's details below.</p>

          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name}
            onChange={handleChange} placeholder="e.g. Mallesh" required />

          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="student@example.com" required />

          <label htmlFor="course">Course</label>
          <input id="course" name="course" value={form.course}
            onChange={handleChange} placeholder="e.g. DevOps" required />

          <button className="primary-btn" type="submit">
            {editingId ? 'Save changes' : '+ Add student'}
          </button>
          {editingId && (
            <button className="secondary-btn" type="button" onClick={cancelEdit}>
              Cancel editing
            </button>
          )}
          {message && <p className="message" role="status">{message}</p>}
        </form>

        <section className="panel student-list">
          <div className="list-heading">
            <div>
              <h2>Student records</h2>
              <p className="muted">Your saved student information</p>
            </div>
            <button className="refresh-btn" onClick={loadStudents} type="button">
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="empty">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="empty">No students yet. Add your first student.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong></td>
                      <td>{student.email}</td>
                      <td><span className="course-tag">{student.course}</span></td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => startEdit(student)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => deleteStudent(student.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <footer>StudentHub · React + Spring Boot + MySQL</footer>
    </main>
  )
}

export default App


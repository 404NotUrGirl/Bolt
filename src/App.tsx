import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/AuthForm'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import DocumentList from './components/DocumentList'
import DocumentForm from './components/DocumentForm'
import Profile from './components/Profile'
import { Document } from './lib/supabase'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  const handleAddDocument = () => {
    setEditingDocument(null)
    setShowDocumentForm(true)
  }

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document)
    setShowDocumentForm(true)
  }

  const handleCloseForm = () => {
    setShowDocumentForm(false)
    setEditingDocument(null)
  }

  const handleSaveDocument = () => {
    // Refresh the current page data
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onAddDocument={handleAddDocument} />
      case 'documents':
        return (
          <DocumentList
            onAddDocument={handleAddDocument}
            onEditDocument={handleEditDocument}
          />
        )
      case 'profile':
        return <Profile />
      default:
        return <Dashboard onAddDocument={handleAddDocument} />
    }
  }

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </Layout>

      {showDocumentForm && (
        <DocumentForm
          document={editingDocument}
          onClose={handleCloseForm}
          onSave={handleSaveDocument}
        />
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
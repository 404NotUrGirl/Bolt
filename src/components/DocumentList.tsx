import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Document } from '../lib/supabase'
import { getDaysUntilExpiry, getExpiryStatus, formatDate } from '../lib/utils'
import { Plus, Search, Filter, Edit2, Trash2, FileText, Calendar } from 'lucide-react'

interface DocumentListProps {
  onAddDocument: () => void
  onEditDocument: (document: Document) => void
}

export default function DocumentList({ onAddDocument, onEditDocument }: DocumentListProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('expiry_date')

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  useEffect(() => {
    filterAndSortDocuments()
  }, [documents, searchTerm, filterType, sortBy])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('expiry_date', { ascending: true })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDocuments = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch = 
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (filterType === 'all') return true

      const days = getDaysUntilExpiry(doc.expiry_date)
      switch (filterType) {
        case 'expired':
          return days < 0
        case 'expiring':
          return days >= 0 && days <= 90
        case 'safe':
          return days > 90
        default:
          return true
      }
    })

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expiry_date':
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        case 'document_name':
          return a.document_name.localeCompare(b.document_name)
        case 'person_name':
          return a.person_name.localeCompare(b.person_name)
        default:
          return 0
      }
    })

    setFilteredDocuments(filtered)
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage your document expiry dates</p>
        </div>
        <button
          onClick={onAddDocument}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Documents</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
              <option value="safe">Safe</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="expiry_date">Sort by Expiry Date</option>
              <option value="document_name">Sort by Document Name</option>
              <option value="person_name">Sort by Person Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {documents.length === 0 ? 'No documents yet' : 'No documents match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {documents.length === 0 
              ? 'Start by adding your first document to track its expiry date'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {documents.length === 0 && (
            <button onClick={onAddDocument} className="btn-primary">
              Add Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => {
            const expiryStatus = getExpiryStatus(doc.expiry_date)
            return (
              <div key={doc.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        expiryStatus.color === 'red' ? 'bg-red-100' :
                        expiryStatus.color === 'yellow' ? 'bg-yellow-100' :
                        expiryStatus.color === 'orange' ? 'bg-orange-100' :
                        'bg-green-100'
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          expiryStatus.color === 'red' ? 'text-red-600' :
                          expiryStatus.color === 'yellow' ? 'text-yellow-600' :
                          expiryStatus.color === 'orange' ? 'text-orange-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {doc.document_name}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            expiryStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                            expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {expiryStatus.message}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Person:</span> {doc.person_name} ({doc.relationship})
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {doc.document_type}
                          </div>
                          {doc.document_number && (
                            <div>
                              <span className="font-medium">Number:</span> {doc.document_number}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Expires:</span> {formatDate(doc.expiry_date)}
                          </div>
                        </div>
                        
                        {doc.notes && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEditDocument(doc)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
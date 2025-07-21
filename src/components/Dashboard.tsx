import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getDaysUntilExpiry, getExpiryStatus, formatDate } from '../lib/utils'
import { AlertTriangle, Calendar, FileText, Users, Plus, Clock } from 'lucide-react'

interface Document {
  id: string
  document_type: string
  document_name: string
  document_number: string | null
  expiry_date: string
  person_name: string
  relationship: string
  notes: string | null
}

interface DashboardProps {
  onAddDocument: () => void
}

export default function Dashboard({ onAddDocument }: DashboardProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    expiring: 0,
    expired: 0,
    safe: 0
  })

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('expiry_date', { ascending: true })

      if (error) throw error

      setDocuments(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (docs: Document[]) => {
    const total = docs.length
    let expiring = 0
    let expired = 0
    let safe = 0

    docs.forEach(doc => {
      const days = getDaysUntilExpiry(doc.expiry_date)
      if (days < 0) {
        expired++
      } else if (days <= 90) {
        expiring++
      } else {
        safe++
      }
    })

    setStats({ total, expiring, expired, safe })
  }

  const getUpcomingExpirations = () => {
    return documents
      .filter(doc => {
        const days = getDaysUntilExpiry(doc.expiry_date)
        return days >= 0 && days <= 90
      })
      .slice(0, 5)
  }

  const getRecentlyExpired = () => {
    return documents
      .filter(doc => getDaysUntilExpiry(doc.expiry_date) < 0)
      .slice(0, 3)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your document expiry dates</p>
        </div>
        <button
          onClick={onAddDocument}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Safe</p>
              <p className="text-2xl font-bold text-green-600">{stats.safe}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Expirations */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Expirations</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          {getUpcomingExpirations().length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming expirations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getUpcomingExpirations().map((doc) => {
                const expiryStatus = getExpiryStatus(doc.expiry_date)
                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      expiryStatus.color === 'red' ? 'bg-red-50 border-red-400' :
                      expiryStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-400' :
                      expiryStatus.color === 'orange' ? 'bg-orange-50 border-orange-400' :
                      'bg-green-50 border-green-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                        <p className="text-sm text-gray-600">{doc.person_name} ({doc.relationship})</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Expires: {formatDate(doc.expiry_date)}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        expiryStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                        expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {expiryStatus.message}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Expired */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recently Expired</h2>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>

          {getRecentlyExpired().length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expired documents</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getRecentlyExpired().map((doc) => {
                const expiryStatus = getExpiryStatus(doc.expiry_date)
                return (
                  <div key={doc.id} className="expiry-danger">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                        <p className="text-sm text-gray-600">{doc.person_name} ({doc.relationship})</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Expired: {formatDate(doc.expiry_date)}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                        {expiryStatus.message}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
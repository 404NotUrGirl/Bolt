import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { X, Save, Calendar, User, FileText } from 'lucide-react'

interface Document {
  id?: string
  document_type: string
  document_name: string
  document_number: string
  issue_date: string
  expiry_date: string
  person_name: string
  relationship: string
  notes: string
}

interface DocumentFormProps {
  document?: Document | null
  onClose: () => void
  onSave: () => void
}

const documentTypes = [
  'Passport',
  'Emirates ID',
  'Visa',
  'Driving License',
  'Insurance Policy',
  'Contract',
  'Membership',
  'Certification',
  'Other'
]

const relationships = [
  'Self',
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Other Family',
  'Friend',
  'Employee',
  'Other'
]

export default function DocumentForm({ document, onClose, onSave }: DocumentFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Document>({
    document_type: '',
    document_name: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    person_name: '',
    relationship: 'Self',
    notes: ''
  })

  useEffect(() => {
    if (document) {
      setFormData({
        document_type: document.document_type,
        document_name: document.document_name,
        document_number: document.document_number || '',
        issue_date: document.issue_date || '',
        expiry_date: document.expiry_date,
        person_name: document.person_name,
        relationship: document.relationship,
        notes: document.notes || ''
      })
    }
  }, [document])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const documentData = {
        user_id: user?.id,
        document_type: formData.document_type,
        document_name: formData.document_name,
        document_number: formData.document_number || null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date,
        person_name: formData.person_name,
        relationship: formData.relationship,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      }

      if (document?.id) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', document.id)

        if (error) throw error
      } else {
        // Create new document
        const { error } = await supabase
          .from('documents')
          .insert({
            ...documentData,
            created_at: new Date().toISOString()
          })

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Document, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {document ? 'Edit Document' : 'Add New Document'}
              </h2>
              <p className="text-sm text-gray-600">
                {document ? 'Update document information' : 'Add a new document to track'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => handleChange('document_type', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={formData.document_name}
                onChange={(e) => handleChange('document_name', e.target.value)}
                placeholder="e.g., UAE Passport, Health Insurance"
                className="input-field"
                required
              />
            </div>

            {/* Person Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person Name *
              </label>
              <input
                type="text"
                value={formData.person_name}
                onChange={(e) => handleChange('person_name', e.target.value)}
                placeholder="Full name"
                className="input-field"
                required
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => handleChange('relationship', e.target.value)}
                className="input-field"
                required
              >
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Number
              </label>
              <input
                type="text"
                value={formData.document_number}
                onChange={(e) => handleChange('document_number', e.target.value)}
                placeholder="Document ID/Number"
                className="input-field"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Expiry Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or reminders..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
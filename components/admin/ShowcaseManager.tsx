'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Video } from 'lucide-react'

interface ShowcaseItem {
  id: string
  mediaType: string
  mediaUrl: string
  name: string
  prize: string
  order: number
}

export default function ShowcaseManager() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null)
  const [formData, setFormData] = useState({
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '',
    name: '',
    prize: '',
    order: 0,
  })
  const [uploadingMedia, setUploadingMedia] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/showcase')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMedia(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'showcase')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setFormData((f) => ({ ...f, mediaUrl: data.url, mediaType: file.type.startsWith('video/') ? 'video' : 'image' }))
      else alert(data.error || 'Erro no upload')
    } catch {
      alert('Erro ao enviar arquivo')
    } finally {
      setUploadingMedia(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem
        ? `/api/admin/showcase/${editingItem.id}`
        : '/api/admin/showcase'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchItems()
        setShowModal(false)
        resetForm()
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao salvar')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este item?')) return
    try {
      const res = await fetch(`/api/admin/showcase/${id}`, { method: 'DELETE' })
      if (res.ok) fetchItems()
    } catch (e) {
      console.error(e)
      alert('Erro ao remover')
    }
  }

  const resetForm = () => {
    setFormData({
      mediaType: 'image',
      mediaUrl: '',
      name: '',
      prize: '',
      order: items.length,
    })
    setEditingItem(null)
  }

  const openEdit = (item: ShowcaseItem) => {
    setEditingItem(item)
    setFormData({
      mediaType: (item.mediaType as 'image' | 'video') || 'image',
      mediaUrl: item.mediaUrl,
      name: item.name,
      prize: item.prize,
      order: item.order,
    })
    setShowModal(true)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Prêmios todos os dias</h2>
        <button
          onClick={() => {
            resetForm()
            setFormData((f) => ({ ...f, order: items.length }))
            setShowModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo item
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Fotos e vídeos exibidos na seção &quot;Prêmios todos os dias&quot; na página inicial.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum item. Clique em &quot;Novo item&quot; para adicionar fotos ou vídeos.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden flex items-center justify-center">
                {item.mediaType === 'video' ? (
                  <video
                    src={item.mediaUrl}
                    className="max-h-full max-w-full object-contain"
                    controls
                    muted
                    playsInline
                  />
                ) : item.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={48} className="text-gray-400" />
                )}
              </div>
              <p className="font-bold text-gray-900">{item.prize}</p>
              <p className="text-sm text-gray-700">{item.name}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold p-4 border-b text-gray-900">
              {editingItem ? 'Editar item' : 'Novo item'}
            </h3>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Tipo</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) =>
                    setFormData({ ...formData, mediaType: e.target.value as 'image' | 'video' })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                >
                  <option value="image">Foto</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Mídia (foto ou vídeo) *</label>
                <div className="flex gap-2 mb-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 text-sm">
                    <Upload size={16} />
                    {uploadingMedia ? 'Enviando...' : 'Enviar arquivo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingMedia}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="URL ou envie um arquivo acima"
                  required
                />
                {formData.mediaUrl && (
                  <div className="mt-2">
                    {formData.mediaType === 'video' ? (
                      <video
                        src={formData.mediaUrl}
                        className="max-h-32 rounded border"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.mediaUrl}
                        alt="Preview"
                        className="max-h-24 rounded border"
                      />
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Valor do prêmio *</label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="R$ 1.000,00"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Ordem</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  min={0}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

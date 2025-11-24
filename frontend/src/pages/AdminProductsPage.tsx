import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input, Select } from '@/components/ui'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import { productsService } from '@/lib/api'
import { Product, ProductFormData, ProductCategory } from '@/types'
import toast from 'react-hot-toast'

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: ProductCategory.DRINKS,
    variant: '',
    member_price: 0,
    guest_price: 0,
    tax_rate: 0.19,
    track_stock: false,
    stock_quantity: undefined,
    is_available: true,
    sort_order: 0,
  })

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', false], // available_only = false to show all
    queryFn: () => productsService.getAll(undefined, false),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt erstellt!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Erstellen')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt aktualisiert!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Aktualisieren')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt gelöscht!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Löschen')
    },
  })

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        variant: product.variant || '',
        member_price: product.member_price,
        guest_price: product.guest_price,
        tax_rate: product.tax_rate,
        track_stock: product.track_stock,
        stock_quantity: product.stock_quantity,
        is_available: product.is_available,
        sort_order: product.sort_order,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        category: ProductCategory.DRINKS,
        variant: '',
        member_price: 0,
        guest_price: 0,
        tax_rate: 0.19,
        track_stock: false,
        stock_quantity: undefined,
        is_available: true,
        sort_order: 0,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Produkt "${name}" wirklich löschen?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="p-8">Lade Produkte...</div>
  }

    const categoryLabels: Record<ProductCategory, string> = {
    [ProductCategory.DRINKS]: 'Getränke',
    [ProductCategory.SNACKS]: 'Snacks',
    [ProductCategory.FOOD]: 'Essen',
    [ProductCategory.OTHER]: 'Anderes',
   }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produktverwaltung</h1>
          <p className="text-gray-600 mt-2">Produkte hinzufügen, bearbeiten und löschen</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => openModal()}>
          Neues Produkt
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mitglied</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gast</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bestand</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500">{product.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {categoryLabels[product.category]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.variant || '-'}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {product.member_price.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {product.guest_price.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {product.track_stock ? (
                      <span className={product.stock_quantity! > 0 ? 'text-success-600' : 'text-error-600'}>
                        {product.stock_quantity}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_available
                          ? 'bg-success-100 text-success-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_available ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Bearbeiten"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-error-600 hover:bg-error-50 rounded-lg"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products?.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Produkte vorhanden</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Variante"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    placeholder="z.B. 0.5L, groß"
                  />
                </div>

                <Input
                  label="Beschreibung"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                  <Select
                  label="Kategorie *"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  required
                 >
                 <option value={ProductCategory.DRINKS}>Getränke</option>
                 <option value={ProductCategory.SNACKS}>Snacks</option>
                 <option value={ProductCategory.FOOD}>Essen</option>
                 <option value={ProductCategory.OTHER}>Anderes</option>
                </Select>                

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Mitgliederpreis *"
                    type="number"
                    step="0.01"
                    value={formData.member_price}
                    onChange={(e) => setFormData({ ...formData, member_price: parseFloat(e.target.value) })}
                    required
                  />

                  <Input
                    label="Gästepreis *"
                    type="number"
                    step="0.01"
                    value={formData.guest_price}
                    onChange={(e) => setFormData({ ...formData, guest_price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="MwSt.-Satz *"
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                    required
                  />

                  <Input
                    label="Sortierung"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.track_stock}
                      onChange={(e) => setFormData({ ...formData, track_stock: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Bestand verfolgen</span>
                  </label>

                  {formData.track_stock && (
                    <Input
                      label="Lagerbestand"
                      type="number"
                      value={formData.stock_quantity || 0}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    />
                  )}
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Produkt ist verfügbar</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProduct ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                  <Button type="button" variant="ghost" fullWidth onClick={closeModal}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

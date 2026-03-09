import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '../../common/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onGuardar: (nombre: string, descripcion: string) => void
  cafeNombre: string
  impacto: number
}

export const GuardarEscenarioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onGuardar,
  cafeNombre,
  impacto
}) => {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nombre.trim()) {
      onGuardar(nombre, descripcion)
      setNombre('')
      setDescripcion('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-cloud-white">
              💾 Guardar Escenario
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-cloud-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Café
              </label>
              <input
                type="text"
                value={cafeNombre}
                disabled
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Impacto estimado
              </label>
              <div className={`px-3 py-2 rounded-lg font-bold ${
                impacto > 0 
                  ? 'bg-green-900/50 text-green-400 border border-green-700' 
                  : 'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {impacto > 0 ? '+' : ''}{impacto.toFixed(1)}%
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre del escenario *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Subida moderada Colombia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Por qué este escenario es interesante?"
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={!nombre.trim()}>
                Guardar
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

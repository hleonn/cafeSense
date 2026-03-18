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
        {/* Overlay con opacidad */}
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        {/* Contenedor principal centrado */}
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
          <Dialog.Panel className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-auto border border-gray-700 overflow-hidden">

            {/* Header del modal */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
              <Dialog.Title className="text-base sm:text-lg font-semibold text-cloud-white">
                💾 Guardar Escenario
              </Dialog.Title>
              <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-cloud-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">

              {/* Café (solo lectura) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Café
                </label>
                <input
                    type="text"
                    value={cafeNombre}
                    disabled
                    className="w-full px-3 py-2 sm:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white text-sm sm:text-base disabled:opacity-75"
                />
              </div>

              {/* Impacto estimado */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Impacto estimado
                </label>
                <div className={`px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-bold ${
                    impacto > 0
                        ? 'bg-green-900/50 text-green-400 border border-green-700'
                        : 'bg-red-900/50 text-red-400 border border-red-700'
                }`}>
                  {impacto > 0 ? '+' : ''}{impacto.toFixed(1)}%
                </div>
              </div>

              {/* Nombre del escenario */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Nombre del escenario <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Subida moderada Colombia"
                    className="w-full px-3 py-2 sm:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                    required
                    maxLength={50}
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {nombre.length}/50
                </p>
              </div>

              {/* Descripción (opcional) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Descripción <span className="text-gray-500">(opcional)</span>
                </label>
                <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="¿Por qué este escenario es interesante?"
                    rows={3}
                    className="w-full px-3 py-2 sm:py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-cloud-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue resize-none"
                    maxLength={200}
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {descripcion.length}/200
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse xs:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    type="button"
                    className="w-full xs:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={!nombre.trim()}
                    className="w-full xs:w-auto text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Guardar Escenario
                </Button>
              </div>

              {/* Mensaje de ayuda */}
              <p className="text-xs text-center text-gray-500 mt-2">
                Los escenarios guardados aparecerán en tu lista personal
              </p>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
  )
}
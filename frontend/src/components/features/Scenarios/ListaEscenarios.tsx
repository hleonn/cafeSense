import React, { useState } from 'react'
import { EscenarioGuardado } from '../../../types/escenario'
import { Card } from '../../common/Card'
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { Button } from '../../common/Button'
import { PDFGenerator } from '../PDFGenerator'

interface Props {
  escenarios: EscenarioGuardado[]
  onSelect?: (escenario: EscenarioGuardado) => void
  onEliminar?: (id: number) => Promise<boolean>
}

export const ListaEscenarios: React.FC<Props> = ({ escenarios, onSelect, onEliminar }) => {
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [escenarioAEliminar, setEscenarioAEliminar] = useState<EscenarioGuardado | null>(null)
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<EscenarioGuardado | null>(null)

  const handleEliminarClick = (esc: EscenarioGuardado, e: React.MouseEvent) => {
    e.stopPropagation()
    setEscenarioAEliminar(esc)
    setMostrarConfirmacion(true)
  }

  const handleSelectEscenario = (esc: EscenarioGuardado) => {
    setEscenarioSeleccionado(esc)
    onSelect?.(esc)
  }

  const confirmarEliminar = async () => {
    if (escenarioAEliminar && onEliminar) {
      setEliminandoId(escenarioAEliminar.id)
      await onEliminar(escenarioAEliminar.id)
      setEliminandoId(null)
      setMostrarConfirmacion(false)
      setEscenarioAEliminar(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  if (escenarios.length === 0) {
    return (
        <Card title="📋 Escenarios Guardados" className="p-4 sm:p-6">
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <p className="text-3xl sm:text-4xl mb-2">💾</p>
            <p className="text-sm sm:text-base">No hay escenarios guardados</p>
            <p className="text-xs sm:text-sm mt-2">Guarda tus simulaciones favoritas</p>
          </div>
        </Card>
    )
  }

  return (
      <>
        <Card title={`📋 Escenarios Guardados (${escenarios.length})`} className="p-4 sm:p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {escenarios.map((esc) => (
                <div
                    key={esc.id}
                    onClick={() => handleSelectEscenario(esc)}
                    className="bg-gray-800/50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer border border-gray-700/50 hover:border-electric-blue/50 relative group"
                >
                  {/* Botón de eliminar (visible al hacer hover) */}
                  <button
                      onClick={(e) => handleEliminarClick(esc, e)}
                      disabled={eliminandoId === esc.id}
                      className="absolute top-2 right-2 p-1.5 bg-gray-900 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 z-10"
                      title="Eliminar escenario"
                  >
                    {eliminandoId === esc.id ? (
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <TrashIcon className="h-4 w-4 text-red-400 hover:text-red-300" />
                    )}
                  </button>

                  {/* Contenido principal */}
                  <div className="pr-8">
                    {/* Título y fecha */}
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-1 xs:gap-2 mb-2">
                      <h4 className="text-sm sm:text-base font-semibold text-cloud-white line-clamp-1">
                        {esc.nombre || 'Sin nombre'}
                      </h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                    <CalendarIcon className="h-3 w-3" />
                        {esc.fecha ? formatDate(esc.fecha) : 'Sin fecha'}
                  </span>
                    </div>

                    {/* Descripción (si existe) */}
                    {esc.descripcion && (
                        <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">
                          {esc.descripcion}
                        </p>
                    )}

                    {/* Detalles del escenario */}
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mt-2">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[150px] xs:max-w-[200px]">
                    {esc.cafe_nombre || 'Café desconocido'}
                  </span>

                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {/* Precios */}
                        <span className="text-gray-400">
                      <span className="hidden xs:inline">$</span>
                          {esc.precio_original?.toFixed(2) || '0.00'}
                          <span className="text-gray-600 mx-1">→</span>
                      <span className="text-cyan-neon font-medium">
                        ${esc.precio_nuevo?.toFixed(2) || '0.00'}
                      </span>
                    </span>

                        {/* Impacto con color */}
                        <span className={`flex items-center gap-1 font-bold ${
                            (esc.impacto_rf || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                      {(esc.impacto_rf || 0) > 0 ? (
                          <ArrowUpIcon className="h-3 w-3" />
                      ) : (
                          <ArrowDownIcon className="h-3 w-3" />
                      )}
                          <span>
                        {(esc.impacto_rf || 0) > 0 ? '+' : ''}{(esc.impacto_rf || 0).toFixed(1)}%
                      </span>
                    </span>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Botón PDF para el escenario seleccionado */}
          {escenarioSeleccionado && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <PDFGenerator
                    escenario={escenarioSeleccionado}
                    tipo="escenario"
                />
              </div>
          )}
        </Card>

        {/* Modal de confirmación para eliminar (responsivo) */}
        <Dialog open={mostrarConfirmacion} onClose={() => setMostrarConfirmacion(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
            <Dialog.Panel className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto border border-gray-700">
              <div className="p-4 sm:p-6">
                <Dialog.Title className="text-base sm:text-lg font-semibold text-cloud-white mb-3 sm:mb-4">
                  🗑️ Confirmar eliminación
                </Dialog.Title>

                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  ¿Estás seguro de que deseas eliminar el escenario <span className="font-semibold text-cloud-white">"{escenarioAEliminar?.nombre}"</span>?
                  <br />
                  <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
                  Esta acción no se puede deshacer.
                </span>
                </p>

                <div className="flex flex-col-reverse xs:flex-row gap-2 sm:gap-3">
                  <Button
                      variant="secondary"
                      onClick={() => setMostrarConfirmacion(false)}
                      className="w-full xs:w-auto text-sm sm:text-base py-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                      variant="danger"
                      onClick={confirmarEliminar}
                      className="w-full xs:w-auto text-sm sm:text-base py-2"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </>
  )
}
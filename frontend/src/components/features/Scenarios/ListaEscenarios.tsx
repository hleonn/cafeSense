import React, { useState } from 'react'
import { EscenarioGuardado } from '../../../types/escenario'
import { Card } from '../../common/Card'
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { Button } from '../../common/Button'
import { PDFGenerator } from '../PDFGenerator'  // ✅ Import agregado

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

  if (escenarios.length === 0) {
    return (
      <Card title="📋 Escenarios Guardados">
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">💾</p>
          <p>No hay escenarios guardados</p>
          <p className="text-sm mt-2">Guarda tus simulaciones favoritas</p>
        </div>
      </Card>
    )
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

  return (
    <>
      <Card title={`📋 Escenarios Guardados (${escenarios.length})`}>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {escenarios.map((esc) => (
            <div
              key={esc.id}
              onClick={() => handleSelectEscenario(esc)}
              className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 relative group"
            >
              <button
                onClick={(e) => handleEliminarClick(esc, e)}
                disabled={eliminandoId === esc.id}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                title="Eliminar escenario"
              >
                {eliminandoId === esc.id ? (
                  <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4 text-red-500" />
                )}
              </button>

              <div className="flex justify-between items-start mb-2 pr-8">
                <h4 className="font-semibold text-gray-800">{esc.nombre || 'Sin nombre'}</h4>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {esc.fecha ? formatDate(esc.fecha) : 'Sin fecha'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {esc.descripcion || 'Sin descripción'}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  {esc.cafe_nombre || 'Café desconocido'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    ${esc.precio_original?.toFixed(2) || '0.00'} → ${esc.precio_nuevo?.toFixed(2) || '0.00'}
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${
                    (esc.impacto_rf || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(esc.impacto_rf || 0) > 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {(esc.impacto_rf || 0) > 0 ? '+' : ''}{(esc.impacto_rf || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón PDF para el escenario seleccionado */}
        {escenarioSeleccionado && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <PDFGenerator
              escenario={escenarioSeleccionado}
              tipo="escenario"
            />
          </div>
        )}
      </Card>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={mostrarConfirmacion} onClose={() => setMostrarConfirmacion(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">
              🗑️ Confirmar eliminación
            </Dialog.Title>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el escenario "{escenarioAEliminar?.nombre}"?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmarEliminar}
              >
                Eliminar
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}

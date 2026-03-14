import { Select } from '../../common/Select'
import { Cafe } from '../../../hooks/useCafes'

interface Props {
  cafes: Cafe[]
  selectedCafe: Cafe | null
  onSelect: (cafe: Cafe) => void
}

export const CafeSelector = ({ cafes, selectedCafe, onSelect }: Props) => {
  return (
    <div className="space-y-4">
      <Select
        items={cafes}
        selected={selectedCafe || undefined}
        onChange={onSelect}
        getLabel={(cafe) => `${cafe.nombre} (${cafe.origen})`}
        placeholder="Seleccionar café..."
      />

      {selectedCafe && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 space-y-2 text-sm border border-gray-700">
          <h4 className="font-semibold text-electric-blue mb-2">📋 Detalles del café</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-400 text-xs">Origen:</p>
              <p className="font-medium text-cloud-white text-sm">{selectedCafe.origen}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs">Tipo:</p>
              <p className="font-medium text-cloud-white text-sm">{selectedCafe.tipo}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs">Tostado:</p>
              <p className="font-medium text-cloud-white text-sm">{selectedCafe.tostado}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs">Formato:</p>
              <p className="font-medium text-cloud-white text-sm">{selectedCafe.formato}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700 mt-2">
            <p className="text-gray-400 text-xs">Precio actual:</p>
            <p className="text-xl font-bold text-cyan-neon">
              ${selectedCafe.precio_sugerido}
            </p>
          </div>
          
          {selectedCafe.descripcion && (
            <div className="pt-1 text-xs text-gray-500 italic border-t border-gray-700 mt-2">
              {selectedCafe.descripcion}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

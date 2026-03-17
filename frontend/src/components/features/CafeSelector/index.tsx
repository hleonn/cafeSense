import { Select } from '../../common/Select'
import { Cafe } from '../../../hooks/useCafes'

interface Props {
    cafes: Cafe[]
    selectedCafe: Cafe | null
    onSelect: (cafe: Cafe) => void
}

export const CafeSelector = ({ cafes, selectedCafe, onSelect }: Props) => {
    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Selector principal */}
            <Select
                items={cafes}
                selected={selectedCafe || undefined}
                onChange={onSelect}
                getLabel={(cafe) => `${cafe.nombre} (${cafe.origen})`}
                placeholder="Seleccionar café..."
            />

            {/* Detalles del café seleccionado */}
            {selectedCafe && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 text-sm border border-gray-700">

                    {/* Título */}
                    <h4 className="text-sm sm:text-base font-semibold text-electric-blue mb-1 sm:mb-2">
                        📋 Detalles del café
                    </h4>

                    {/* Grid de información - 2 columnas en móvil, igual en desktop */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs">Origen:</p>
                            <p className="font-medium text-cloud-white truncate">{selectedCafe.origen}</p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs">Tipo:</p>
                            <p className="font-medium text-cloud-white truncate">{selectedCafe.tipo}</p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs">Tostado:</p>
                            <p className="font-medium text-cloud-white truncate">{selectedCafe.tostado}</p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs">Formato:</p>
                            <p className="font-medium text-cloud-white truncate">{selectedCafe.formato}</p>
                        </div>
                    </div>

                    {/* Precio - Destacado */}
                    <div className="pt-2 sm:pt-3 border-t border-gray-700 mt-1 sm:mt-2">
                        <p className="text-gray-400 text-xs">Precio actual:</p>
                        <p className="text-lg sm:text-xl font-bold text-cyan-neon">
                            ${selectedCafe.precio_sugerido}
                        </p>
                    </div>

                    {/* Descripción (si existe) */}
                    {selectedCafe.descripcion && (
                        <div className="pt-1 sm:pt-2 text-xs text-gray-500 italic border-t border-gray-700 mt-1 sm:mt-2">
                            {selectedCafe.descripcion.length > 80
                                ? `${selectedCafe.descripcion.substring(0, 80)}...`
                                : selectedCafe.descripcion}
                        </div>
                    )}

                    {/* Badge de origen (opcional, para dar más color) */}
                    <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-electric-blue/20 text-electric-blue">
              {selectedCafe.origen}
            </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-neon/20 text-cyan-neon">
              {selectedCafe.tipo}
            </span>
                    </div>
                </div>
            )}
        </div>
    )
}
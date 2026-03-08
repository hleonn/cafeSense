import { Select } from '../../common/Select'
import { Cafe } from '../../../hooks/useCafes'

interface Props {
    cafes: Cafe[]
    selectedCafe: Cafe | null
    onSelect: (cafe:Cafe)=>void
}

export const CafeSelector = ({ cafes, selectedCafe, onSelect }: Props) => {
    return (
        <div className="space-y-4">
            <Select
                items={cafes}
                selected={selectedCafe}
                onChange={onSelect}
                getLabel={(cafe) => `${cafe.nombre} (${cafe.origen})`}
                placeholder="Seleccionar café..."
            />
            {selectedCafe && (
                <div className="bg-brown-50 p-4 rounded-lg space-y-2 text-sm">
                    <h4 className="font-semibold text-brown-800 mb-2">Detalles del café</h4>
                    <div className="grid grid-cols-2 gap-2">

                        <div>
                            <p className="text-gray-600">Origen:</p>
                            <p className="font-medium">{selectedCafe.origen}</p>
                        </div>

                        <div>
                            <p className="text-gray-600">Tipo:</p>
                            <p className="font-medium">{selectedCafe.tipo}</p>
                        </div>

                        <div>
                            <p className="text-gray-600">Tostado:</p>
                            <p className="font-medium">{selectedCafe.tostado}</p>
                        </div>

                        <div>
                            <p className="text-gray-600">Formato:</p>
                            <p className="font-medium">{selectedCafe.formato}</p>
                        </div>

                    </div>
                    <div className="pt-2 border-t border-brown-200">
                        <p className="text-gray-600">Precio actual:</p>
                        <p className="text-xl font-bold text-brown-700">
                            ${selectedCafe.precio_sugerido}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}


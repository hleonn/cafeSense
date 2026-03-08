import { useState } from 'react'

interface Props {
  precioActual: number
  onChange: (porcentaje: number) => void
}

export const PriceSlider = ({ precioActual, onChange }: Props) => {
  const [porcentaje, setPorcentaje] = useState(10)
  const nuevoPrecio = precioActual * (1 + porcentaje / 100)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number(e.target.value)
    setPorcentaje(valor)
    onChange(valor)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Precio actual:</span>
        <span className="font-bold">${precioActual.toFixed(2)}</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cambio: {porcentaje > 0 ? '+' : ''}{porcentaje}%
        </label>
        <input
          type="range"
          min="-30"
          max="30"
          value={porcentaje}
          onChange={handleChange}
          className="w-full h-2 bg-brown-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-30%</span>
          <span>0%</span>
          <span>+30%</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-700">Nuevo precio:</span>
          <span className="text-lg font-bold text-blue-800">
            ${nuevoPrecio.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

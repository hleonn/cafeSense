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
        <span className="text-sm text-gray-400">Precio actual:</span>
        <span className="font-bold text-cloud-white">${precioActual.toFixed(2)}</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cambio: <span className={porcentaje > 0 ? 'text-cyan-neon' : 'text-red-400'}>
            {porcentaje > 0 ? '+' : ''}{porcentaje}%
          </span>
        </label>
        <input
          type="range"
          min="-30"
          max="30"
          value={porcentaje}
          onChange={handleChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-electric-blue
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:hover:bg-cyan-neon
            [&::-webkit-slider-thumb]:transition-colors"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-30%</span>
          <span>0%</span>
          <span>+30%</span>
        </div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Nuevo precio:</span>
          <span className="text-lg font-bold text-electric-blue">
            ${nuevoPrecio.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

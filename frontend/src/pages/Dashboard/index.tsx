import React, {useState} from 'react'
import axios from 'axios'

interface Cafe {
    id: number
    nombre: string
    origen: string
    precio_sugerido: number
}

export const Dashboard: React.FC = () => {
    const[backendStatus,setBackendStatus]=useState<string>('No probado')
    const[cafes,setCafes]=useState<Cafe[]>([])

    const probarBackend =async()=>{
        try{
            const response = await axios.get('/api/health')
            setBackendStatus(`✅ Conectado: ${JSON.stringify(response.data)}`)
        }catch(error){
            setBackendStatus(`❌ Error: ${error}`)
        }
    }

    const probarCafes = async()=>{
        try{
            const response = await axios.get('/api/cafes')
            setCafes(response.data)
            setBackendStatus(`✅ ${response.data.length} cafes cargados`)
        }catch(error){
            setBackendStatus(`❌ Error cargando cafés: ${error}`)
        }
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brown-800 mb-6">
        ☕ CafeSense - Dashboard
      </h1>
        <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Prueba de conexión al backend</h2>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={probarBackend}
                    className="btn-primary"
                >
                    Probar Health
                </button>
                <button
                    onClick={probarCafes}
                    className="btn-primary"
                >
                    Probar Cafes
                </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-mono text-sm">{backendStatus}</p>
            </div>
            {cafes.length >0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Cafés disponibles:</h3>
                    <ul className="list-disc pl-5">
                        {cafes.map((cafe) => (
                            <li key={cafe.id}>
                                {cafe.nombre} ({cafe.origen}) - ${cafe.precio_sugerido}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="card">
                <p className="text-gray-600">
                    El frontend está funcionando correctamente. Ahora conectaremos con el backend.
                </p>
            </div>
        </div>
    </div>
  )
}

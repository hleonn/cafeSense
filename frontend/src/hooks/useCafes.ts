import { useState, useEffect } from 'react'
import axios from 'axios'

export interface Cafe {
    id: number
    nombre: string
    origen: string
    tipo: string
    tostado: string
    formato: string
    precio_sugerido: number
    descripcion: string
}

export const useCafes = () => {
    const [cafes, setCafes] = useState<Cafe[]>([])
    const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCafes = async () => {
            try {
                const response = await axios.get('/api/cafes')
                setCafes(response.data)
                if (response.data.length > 0) {
                    setSelectedCafe(response.data[0])
                }
            } catch (err) {
                setError('Error al cargar los cafés')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCafes()
    }, [])

    return { cafes, selectedCafe, setSelectedCafe, loading, error }
}
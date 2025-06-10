'use client'
import { useState, useEffect } from 'react'

export function useKart() {
  const [kart, setKart] = useState<(string | number)[]>([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('kart') || '[]')
    setKart(stored.map((item: { id: string | number }) => item.id))
  }, [])

  const handleAddToKart = (item: { id: string | number }) => {
    const current = JSON.parse(localStorage.getItem('kart') || '[]')
    if (current.some((i: { id: string | number }) => i.id === item.id)) return
    const updated = [...current, item]
    localStorage.setItem('kart', JSON.stringify(updated))
    setKart(updated.map((i: { id: string | number }) => i.id))
  }

  const handleRemoveFromKart = (item: { id: string | number }) => {
    const current = JSON.parse(localStorage.getItem('kart') || '[]')
    const updated = current.filter((i: { id: string | number }) => i.id !== item.id)
    localStorage.setItem('kart', JSON.stringify(updated))
    setKart(updated.map((i: { id: string | number }) => i.id))
  }

  return { kart, handleAddToKart, handleRemoveFromKart }
}

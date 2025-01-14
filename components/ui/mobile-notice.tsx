"use client"

import { useEffect, useState } from "react"
import { Monitor, ArrowUpRight } from "lucide-react"

export function MobileNotice() {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if mobile on mount
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
    }
  }, [])

  if (!isMobile || dismissed) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '300px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: '#dbeafe',
            borderRadius: '9999px',
            padding: '12px',
            width: 'fit-content',
            margin: '0 auto 16px auto'
          }}>
            <Monitor style={{ 
              width: '24px', 
              height: '24px',
              color: '#2563eb'
            }} />
          </div>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '12px'
          }}>
            Desktop Recommended
          </h2>
          <p style={{ 
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '16px'
          }}>
            For the best experience, please use MateMatch on a desktop or laptop computer.
          </p>
          <button 
            onClick={() => setDismissed(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#2563eb',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 auto',
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            Continue anyway
            <ArrowUpRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  )
} 
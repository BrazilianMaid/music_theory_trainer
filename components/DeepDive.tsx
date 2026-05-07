'use client'

import { useState } from 'react'

interface DeepDiveProps {
  content: string
}

export function DeepDive({ content }: DeepDiveProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={[
          'w-full bg-transparent border-t border-border text-text-dim font-sans',
          'text-[0.65rem] py-2 px-4 cursor-pointer text-left tracking-[0.08em] uppercase',
          'flex justify-between items-center transition-colors hover:text-accent hover:bg-surface-alt',
        ].join(' ')}
      >
        <span>{open ? 'Explain Less' : 'Explain More'}</span>
        <span
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="deep-dive px-4 py-[14px] border-t border-border bg-surface-alt"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </>
  )
}

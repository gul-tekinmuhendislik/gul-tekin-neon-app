import React from 'react'
import { cn } from '@/lib/utils'

export const FlipWords = ({
  words,
  className,
}: {
  words: string[]
  duration?: number
  className?: string
}) => {
  return (
    <span className={cn('inline-block', className)}>
      {words[0] || ''}
    </span>
  )
}

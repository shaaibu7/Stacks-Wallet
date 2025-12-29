
import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50'

        const variants = {
            primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200/80',
            outline: 'border border-gray-200 bg-transparent hover:bg-gray-100 hover:text-gray-900',
            ghost: 'hover:bg-gray-100 hover:text-gray-900'
        }

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-9 px-4 py-2',
            lg: 'h-10 px-8'
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

export { Button }

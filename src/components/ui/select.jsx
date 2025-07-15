import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import React from 'react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn('relative', className)} ref={ref} {...props}>
    {children}
  </div>
));
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
  <span
    className={cn('block truncate', className)}
    ref={ref}
    {...props}
  />
));
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      'absolute top-full z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4" />
    </span>
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
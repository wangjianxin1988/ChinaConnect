import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogRoot>
  );
}

function DialogRoot({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange?.(false)} />

      {/* Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogContent({ className, children }: DialogContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return <h2 className={cn("text-xl font-semibold", className)}>{children}</h2>;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function DialogTrigger({ asChild, children, onClick }: DialogTriggerProps) {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function DialogClose({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
    >
      ✕
    </button>
  );
}

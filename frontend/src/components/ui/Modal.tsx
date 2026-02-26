'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  return <>{children}</>;
};

const ModalTrigger = DialogTrigger;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => (
  <DialogContent ref={ref} className={cn(className)} {...props}>
    {children}
  </DialogContent>
));
ModalContent.displayName = 'ModalContent';

const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <DialogHeader className={cn(className)} {...props} />
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = DialogTitle;
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = DialogDescription;
ModalDescription.displayName = 'ModalDescription';

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
};

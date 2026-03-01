import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteEntityDialogProps {
  isOpen: boolean;
  entityType: 'transaction' | 'category';
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteEntityDialog({
  isOpen,
  entityType,
  label,
  onCancel,
  onConfirm,
}: DeleteEntityDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black text-slate-800">Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600">
            Delete {entityType === 'transaction' ? 'transaction' : 'category'} "{label}"?
          </AlertDialogDescription>
          <p className="text-xs text-slate-400">This action cannot be undone.</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="rounded-xl" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

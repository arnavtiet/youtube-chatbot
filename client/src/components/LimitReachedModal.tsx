import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface LimitReachedModalProps {
  open: boolean;
  onClose: () => void;
}

export const LimitReachedModal = ({ open, onClose }: LimitReachedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 shadow-glow-primary">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl text-foreground">Question Limit Reached</DialogTitle>
          <DialogDescription className="text-center text-base pt-2 text-muted-foreground">
            You've reached the free limit of 5 questions. To continue asking questions about your videos, please log in or
            upgrade to a premium plan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-primary transition-all">
            <Sparkles className="mr-2 h-5 w-5" />
            View Pricing
          </Button>
          <Button variant="outline" className="w-full h-12 text-base border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all">
            Log In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sports } from '@/lib/mock-data';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [sport, setSport] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) return;
    toast({ title: 'Post created!', description: 'Your post has been published to the feed.' });
    setContent('');
    setSport('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[120px] bg-elevated border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="bg-elevated border-border text-foreground">
              <SelectValue placeholder="Tag a sport (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {sports.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full min-h-[44px] font-semibold active:scale-[0.97] transition-transform"
          >
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

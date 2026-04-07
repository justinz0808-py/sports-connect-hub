import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Camera, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SPORTS = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Track & Field', 'Volleyball', 'Swimming', 'Tennis', 'Golf', 'Lacrosse', 'Wrestling', 'Other'];
const MAX_CHARS = 500;

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export default function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [sport, setSport] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please choose an image under 5MB.', variant: 'destructive' });
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    // Clear video if image chosen
    removeVideo();
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'Video too large', description: 'Please choose a video under 50MB.', variant: 'destructive' });
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    // Clear image if video chosen
    removeImage();
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const resetForm = () => {
    setContent('');
    setSport('');
    removeImage();
    removeVideo();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to post.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    let image_url: string | null = null;
    let video_url: string | null = null;

    if (imageFile) {
      setIsUploading(true);
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('Posts').upload(path, imageFile, { upsert: true });
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          toast({ title: 'Image upload failed', description: 'Post will be created without the image.' });
        } else {
          image_url = supabase.storage.from('Posts').getPublicUrl(path).data.publicUrl;
          console.log('image_url being inserted into post:', image_url);
        }
      } catch (err) {
        console.error('Image upload exception:', err);
      }
      setIsUploading(false);
    }

    if (videoFile) {
      setIsUploading(true);
      try {
        const ext = videoFile.name.split('.').pop();
        const path = `${user.id}/videos/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('Posts').upload(path, videoFile, { upsert: true });
        if (uploadError) {
          console.error('Video upload error:', uploadError);
          toast({ title: 'Video upload failed', description: 'Post will be created without the video.' });
        } else {
          video_url = supabase.storage.from('Posts').getPublicUrl(path).data.publicUrl;
          console.log('video_url being inserted into post:', video_url);
        }
      } catch (err) {
        console.error('Video upload exception:', err);
      }
      setIsUploading(false);
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      ...(sport ? { sport } : {}),
      ...(image_url ? { image_url } : {}),
      ...(video_url ? { video_url } : {}),
    });

    if (error) {
      toast({ title: 'Failed to post', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    toast({ title: 'Posted!', description: 'Your post is live.' });
    resetForm();
    setIsSubmitting(false);
    onOpenChange(false);
    onPostCreated?.();
  };

  const charsLeft = MAX_CHARS - content.length;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
              className="min-h-[120px] bg-elevated border-border text-foreground placeholder:text-muted-foreground resize-none pb-6"
            />
            {/* Character counter */}
            <span className={`absolute bottom-2 right-3 text-[10px] ${charsLeft < 50 ? (charsLeft < 10 ? 'text-destructive' : 'text-yellow-500') : 'text-muted-foreground'}`}>
              {content.length}/{MAX_CHARS}
            </span>
          </div>

          {/* Image preview */}
          {imagePreviewUrl && (
            <div className="relative rounded-lg overflow-hidden">
              <img src={imagePreviewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border"
              >
                <X className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          )}

          {/* Video preview */}
          {videoPreviewUrl && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video src={videoPreviewUrl} controls className="w-full max-h-48 rounded-lg" playsInline />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border"
              >
                <X className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          )}

          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="bg-elevated border-border text-foreground">
              <SelectValue placeholder="Tag a sport (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {SPORTS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {/* Image picker */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Add image"
              className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            {/* Video picker */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              title="Add video"
              className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <Video className="h-5 w-5" />
            </button>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoSelect} />

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="flex-1 min-h-[44px] font-semibold active:scale-[0.97] transition-transform gap-2"
            >
              {isUploading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                : isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Post'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

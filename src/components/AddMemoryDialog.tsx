import { useState } from 'react';
import { db, storage } from '@/integrations/firebase/client';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebaseAuth } from '@/lib/firebase-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload } from 'lucide-react';

interface AddMemoryDialogProps {
  tripId: string;
  onMemoryAdded: () => void;
}

export const AddMemoryDialog = ({ tripId, onMemoryAdded }: AddMemoryDialogProps) => {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    let photoUrl = null;

    // Upload photo if provided
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.uid}/${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, `travel-photos/${fileName}`);

        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to upload photo',
          variant: 'destructive',
        });
        setLoading(false);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    // Parse tags
    const tagsInput = formData.get('tags') as string;
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    try {
      await addDoc(collection(db, 'memories'), {
        trip_id: tripId,
        user_id: user.uid,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        photo_url: photoUrl,
        tags,
        date: formData.get('date') as string,
        created_at: new Date().toISOString(),
      });

      toast({ title: 'Memory added successfully!' });
      setOpen(false);
      setPhotoFile(null);
      onMemoryAdded();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add memory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Memory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Sunset at the beach" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your memory..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="flex-1"
              />
              {photoFile && (
                <span className="text-sm text-muted-foreground">{photoFile.name}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="restaurant, sunset, future visit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading || uploadingPhoto}>
            {uploadingPhoto ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading photo...
              </>
            ) : loading ? (
              'Adding...'
            ) : (
              'Add Memory'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

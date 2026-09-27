import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { uploadAvatar } from '@/services/firebase/storageService';
import { getFriendlyError } from '@/utils/errors';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export interface AvatarEditorProps {
  name: string;
  avatar: string;
  onAvatarChange: (url: string) => Promise<void>;
  disabled?: boolean;
}

export function AvatarEditor({ name, avatar, onAvatarChange, disabled = false }: AvatarEditorProps) {
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      await onAvatarChange(url);
      toast.success('Image uploaded', 'Your new avatar is live.');
    } catch (error) {
      const message = getFriendlyError(error, 'We could not upload that image.');
      toast.error('Upload failed', message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name={name} src={avatar} size="xl" />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id="avatar-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
          loadingText="Uploading…"
          disabled={disabled}
          leadingIcon={<Upload className="size-3.5" aria-hidden />}
        >
          Upload image
        </Button>
        {avatar ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAvatarChange('')}
            disabled={disabled}
            leadingIcon={<Trash2 className="size-3.5" aria-hidden />}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <p className="w-full text-xs text-ink-subtle">
        <ImagePlus className="mr-1 inline size-3.5" aria-hidden />
        JPG, PNG, WebP, GIF or AVIF up to 2 MB. You can also paste an image URL below.
      </p>
    </div>
  );
}

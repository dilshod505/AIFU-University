// FancyFileInput.tsx
import { cn } from "@/lib/utils";
import { File as FileIcon, Loader2, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api, baseBackendUrl } from "../models/axios";

interface FancyFileInputProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  value?: File | null | any;
  onChange: (url: string) => void; // endi string (uploadPath) qaytaradi
  onUploadSuccess?: (url: string) => void;
  fileType?: "image" | "file" | "video" | "audio";
  size?: "small" | "large";
  clearAfter?: boolean;
}

const isImageType = (fileType: string | undefined) => {
  return !!fileType && fileType.startsWith("image/");
};

export const FancyFileInput: React.FC<FancyFileInputProps> = ({
  accept,
  multiple,
  disabled,
  clearAfter = false,
  value,
  onChange,
  onUploadSuccess,
  fileType,
  size = "large",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof value === "string" && value) {
      const url = `${baseBackendUrl}/${value.split("\\").pop()}`;
      setPreviewUrl(url);
      setIsImage((fileType && fileType === "image") || false); // crude check
    } else {
      setPreviewUrl(null);
      setIsImage(false);
    }
  }, [value]);

  const handleClick = () => inputRef.current?.click();

  const uploadFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (accept && !accept.split(",").includes(file.type)) {
        toast.error(t("invalid file type"));
        return null;
      }

      const response = await api.post(
        `/admin/upload/${accept === "application/pdf" ? "pdf" : "image"}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadPath = response?.data?.data;

      if (!uploadPath) {
        throw new Error("URL qaytmadi");
      }

      onChange(uploadPath);
      onUploadSuccess?.(uploadPath);
      toast.success("Fayl muvaffaqiyatli yuklandi!");
      if (clearAfter) {
        setPreviewUrl(null);
        setIsImage(false);
      }
      return uploadPath;
    } catch (error) {
      // toast.error("Fayl yuklashda xatolik yuz berdi");
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const uploadedUrl = await uploadFile(file);

    if (uploadedUrl) {
      if (isImageType(file.type)) {
        setPreviewUrl(uploadedUrl);
        setIsImage(true);
      } else {
        setPreviewUrl(null);
        setIsImage(false);
      }
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {size === "small" ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium rounded-md border transition-all bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/50",
            "dark:hover:bg-muted-foreground/30"
          )}
        >
          <UploadCloud className="size-5" />
          <span className="hidden sm:block">{t("selectFile")}</span>
        </button>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "w-[112px] h-[112px] relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30",
            "hover:bg-muted/50 cursor-pointer transition-all text-sm text-muted-foreground",
            "dark:hover:bg-muted/30",
            loading && "opacity-70 cursor-wait"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : previewUrl && isImage ? (
            <Link href={previewUrl} target="_blank">
              <Image
                src={previewUrl}
                alt="Preview"
                width={95}
                height={95}
                priority
                quality={100}
                className="w-[95px] h-[95px] object-contain rounded-xl overflow-hidden"
                draggable={false}
              />
            </Link>
          ) : previewUrl && !isImage ? (
            <Link href={previewUrl} target="_blank">
              <FileIcon className="w-10 h-10 text-muted-foreground" />
            </Link>
          ) : (
            <>
              <UploadCloud className="size-7" />
              <span className="text-[12px] w-fit">{t("selectFile")}</span>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        className="hidden"
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        ref={inputRef}
        onChange={onFileChange}
      />
    </div>
  );
};

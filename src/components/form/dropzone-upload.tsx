import axios from "axios";
import { File as FileIcon, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const isImageType = (file: File) => file && file.type.startsWith("image/");

const DropzoneComponent = ({
  accept,
  maxFileSize,
  onFinish,
  uploadUrl,
  uploadFieldName = "file",
}: {
  accept?: Accept;
  maxFileSize?: number;
  onFinish?: (data: any) => void;
  uploadUrl?: string;
  uploadFieldName?: string;
}) => {
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  if (!uploadUrl || !maxFileSize || !accept || !onFinish) return null;

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any) => {
      clearErrors("file");

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
          setError("file", {
            type: "manual",
            message: `Fayl hajmi ${maxFileSize / (1024 * 1024)} MB dan oshmasligi kerak.`,
          });
        } else if (rejection.errors[0].code === "file-invalid-type") {
          setError("file", {
            type: "manual",
            message: "Notoʻgʻri fayl turi.",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        if (isImageType(file)) {
          setPreviewUrl(URL.createObjectURL(file));
          setIsImage(true);
        } else {
          setPreviewUrl(null);
          setIsImage(false);
        }
      }
    },
    [maxFileSize, setError, clearErrors]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize: maxFileSize,
    multiple: false,
  });

  const uploadFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append(uploadFieldName, file);

    try {
      const response = await axios.post(uploadUrl, formData);
      const uploadPath = response?.data?.url || response?.data;

      if (!uploadPath) {
        throw new Error("Server URL qaytarmadi");
      }

      onFinish(uploadPath);
      toast.success("Fayl muvaffaqiyatli yuklandi!");

      return uploadPath;
    } catch (error) {
      console.error("Fayl yuklashda xatolik:", error);
      setError("file", {
        type: "manual",
        message:
          "Fayl yuklashda xatolik yuz berdi. Iltimos, qayta urinib koʻring.",
      });
      toast.error("Fayl yuklashda xatolik yuz berdi");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedFile) {
      setError("file", {
        type: "manual",
        message: "Iltimos, fayl tanlang.",
      });
      return;
    }

    await uploadFile(selectedFile);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <Controller
        name="file"
        control={control}
        render={() => (
          <div
            {...getRootProps()}
            className="w-[160px] h-[160px] relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/50 transition-all text-sm text-muted-foreground dark:hover:bg-muted/30"
          >
            <input {...getInputProps()} />

            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : previewUrl && isImage ? (
              <Link href={previewUrl} target="_blank">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={140}
                  height={140}
                  className="w-[140px] h-[140px] object-contain rounded-xl overflow-hidden"
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
                <span className="text-[12px]">Faylni tanlang</span>
              </>
            )}
          </div>
        )}
      />

      {errors.file && (
        // @ts-ignore
        <p className="text-red-500 text-sm mt-2">{errors.file.message}</p>
      )}

      <button
        type="submit"
        disabled={loading || !selectedFile}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Yuklanmoqda..." : "Yuklash"}
      </button>
    </form>
  );
};

export default DropzoneComponent;

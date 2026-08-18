"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  ExternalLink,
  X,
  Maximize2,
  Trash2,
  Paperclip,
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import type { AttachmentDto } from "@/lib/types";

interface MediaGalleryProps {
  attachments: AttachmentDto[];
  onDelete?: (attachmentId: string) => void;
  canDelete?: boolean;
  title?: string;
}

export function MediaGallery({
  attachments,
  onDelete,
  canDelete = false,
  title = "Tệp đính kèm & Hình ảnh / Video minh họa",
}: MediaGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<AttachmentDto | null>(null);
  const [videoModal, setVideoModal] = useState<AttachmentDto | null>(null);

  if (!attachments || attachments.length === 0) return null;

  function formatBytes(bytes?: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const images = attachments.filter(
    (a) => a.fileType === "image" || a.mimeType?.startsWith("image/")
  );
  const videos = attachments.filter(
    (a) => a.fileType === "video" || a.mimeType?.startsWith("video/")
  );
  const documents = attachments.filter(
    (a) => a.fileType !== "image" && a.fileType !== "video" && !a.mimeType?.startsWith("image/") && !a.mimeType?.startsWith("video/")
  );

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs border-b border-line/60 pb-1.5">
        <span className="font-bold text-foreground flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-accent" />
          <span>{title}</span>
        </span>
        <span className="text-[10px] text-muted font-mono">{attachments.length} tệp</span>
      </div>

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-accent" />
            <span>Hình ảnh ({images.length})</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {images.map((img) => (
              <div
                key={img.id || img.fileUrl}
                className="group relative aspect-video rounded-xl border border-line bg-surface-2 overflow-hidden shadow-sm hover:border-accent transition-all cursor-pointer"
                onClick={() => setLightboxImage(img)}
              >
                <img
                  src={img.fileUrl}
                  alt={img.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <a
                      href={img.fileUrl}
                      download={img.fileName}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-lg bg-black/60 text-white hover:text-accent hover:bg-black/90 transition-colors"
                      title="Tải ảnh gốc"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(img.id);
                        }}
                        className="p-1 rounded-lg bg-black/60 text-white hover:text-red-400 hover:bg-black/90 transition-colors"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="truncate text-[10px] text-white font-medium drop-shadow">
                    {img.fileName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Gallery Grid */}
      {videos.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
            <Video className="w-3 h-3 text-purple-400" />
            <span>Video quay lỗi ({videos.length})</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map((vid) => (
              <div
                key={vid.id || vid.fileUrl}
                className="rounded-xl border border-line bg-surface-2 p-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground truncate" title={vid.fileName}>
                    {vid.fileName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={vid.fileUrl}
                      download={vid.fileName}
                      className="text-muted hover:text-white transition-colors"
                      title="Tải video"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(vid.id)}
                        className="text-muted hover:text-red-400 transition-colors"
                        title="Xóa video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
                  <video
                    src={vid.fileUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents & Log Files List */}
      {documents.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <FileText className="w-3 h-3 text-blue-400" />
            <span>Tài liệu & Log đính kèm ({documents.length})</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id || doc.fileUrl}
                className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-surface-3 text-blue-400 border border-line shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs font-semibold text-foreground hover:text-accent hover:underline block"
                    >
                      {doc.fileName}
                    </a>
                    <span className="text-[10px] text-muted font-mono">{formatBytes(doc.fileSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-3 transition-colors"
                    title="Tải về"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface-3 transition-colors cursor-pointer"
                      title="Xóa tệp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX DIALOG FOR IMAGE FULL VIEW */}
      {lightboxImage && (
        <Dialog
          visible={!!lightboxImage}
          onHide={() => setLightboxImage(null)}
          header={
            <div className="flex items-center justify-between w-full pr-4 text-xs">
              <span className="font-bold text-white truncate max-w-md">{lightboxImage.fileName}</span>
              <a
                href={lightboxImage.fileUrl}
                download={lightboxImage.fileName}
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh gốc</span>
              </a>
            </div>
          }
          className="w-full max-w-5xl border border-line bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-center p-2 max-h-[80vh] overflow-hidden">
            <img
              src={lightboxImage.fileUrl}
              alt={lightboxImage.fileName}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}

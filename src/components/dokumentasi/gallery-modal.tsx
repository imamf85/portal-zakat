'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, ZoomIn, Images } from 'lucide-react';
import { formatTanggal } from '@/lib/utils';
import type { Dokumentasi } from '@/lib/supabase';

interface GalleryModalProps {
  dokumentasi: Dokumentasi[];
}

interface ModalState {
  docIndex: number;
  fotoIndex: number;
}

// Get foto urls with fallback
function getFotoUrls(doc: Dokumentasi): string[] {
  if (doc.foto_urls && doc.foto_urls.length > 0) {
    return doc.foto_urls;
  }
  return doc.url_foto ? [doc.url_foto] : [];
}

export function GalleryWithModal({ dokumentasi }: GalleryModalProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const openModal = (docIndex: number, fotoIndex: number = 0) => {
    setModalState({ docIndex, fotoIndex });
    document.body.style.overflow = 'hidden';
  };

  const closeModal = useCallback(() => {
    setModalState(null);
    document.body.style.overflow = 'unset';
  }, []);

  const currentDoc = modalState !== null ? dokumentasi[modalState.docIndex] : null;
  const currentFotos = currentDoc ? getFotoUrls(currentDoc) : [];
  const currentFoto = modalState !== null ? currentFotos[modalState.fotoIndex] : null;

  const goToPrevious = useCallback(() => {
    if (modalState === null) return;

    if (modalState.fotoIndex > 0) {
      // Previous foto in same album
      setModalState({ ...modalState, fotoIndex: modalState.fotoIndex - 1 });
    } else if (modalState.docIndex > 0) {
      // Go to previous album's last foto
      const prevDoc = dokumentasi[modalState.docIndex - 1];
      const prevFotos = getFotoUrls(prevDoc);
      setModalState({
        docIndex: modalState.docIndex - 1,
        fotoIndex: prevFotos.length - 1,
      });
    }
  }, [modalState, dokumentasi]);

  const goToNext = useCallback(() => {
    if (modalState === null) return;

    const currentFotos = getFotoUrls(dokumentasi[modalState.docIndex]);

    if (modalState.fotoIndex < currentFotos.length - 1) {
      // Next foto in same album
      setModalState({ ...modalState, fotoIndex: modalState.fotoIndex + 1 });
    } else if (modalState.docIndex < dokumentasi.length - 1) {
      // Go to next album's first foto
      setModalState({
        docIndex: modalState.docIndex + 1,
        fotoIndex: 0,
      });
    }
  }, [modalState, dokumentasi]);

  const canGoPrevious = modalState !== null && (modalState.fotoIndex > 0 || modalState.docIndex > 0);
  const canGoNext = modalState !== null && (
    modalState.fotoIndex < currentFotos.length - 1 ||
    modalState.docIndex < dokumentasi.length - 1
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalState === null) return;

      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState, closeModal, goToPrevious, goToNext]);

  return (
    <>
      {/* Grid Album */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dokumentasi.map((doc, docIndex) => {
          const fotos = getFotoUrls(doc);
          const coverFoto = fotos[0];
          const extraCount = fotos.length - 1;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openModal(docIndex, 0)}
            >
              {/* Cover Image */}
              <div className="aspect-video relative bg-gray-100">
                {coverFoto && (
                  <Image
                    src={coverFoto}
                    alt={doc.judul}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Photo count badge */}
                {extraCount > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                    <Images className="w-4 h-4" />
                    +{extraCount}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#599E6E] transition-colors">
                  {doc.judul}
                </h3>
                {doc.deskripsi && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {doc.deskripsi}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTanggal(doc.created_at)}</span>
                  </div>
                  <span>{fotos.length} foto</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {currentDoc && currentFoto && modalState !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation - Previous */}
            {canGoPrevious && (
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full mr-4 text-white/80 hover:text-white transition-colors p-2 hidden md:block"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            {/* Navigation - Next */}
            {canGoNext && (
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 text-white/80 hover:text-white transition-colors p-2 hidden md:block"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {/* Image Container */}
            <div className="relative bg-black rounded-t-xl overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
                <Image
                  src={currentFoto}
                  alt={`${currentDoc.judul} - ${modalState.fotoIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              </div>
            </div>

            {/* Caption & Thumbnails */}
            <div className="bg-white rounded-b-xl p-4">
              {/* Title & Date */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentDoc.judul}
                  </h3>
                  {currentDoc.deskripsi && (
                    <p className="mt-1 text-gray-600 text-sm">
                      {currentDoc.deskripsi}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTanggal(currentDoc.created_at)}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {currentFotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentFotos.map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => setModalState({ ...modalState, fotoIndex: index })}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === modalState.fotoIndex
                          ? 'border-[#599E6E]'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={foto}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile Navigation */}
              <div className="flex items-center justify-between mt-3 md:hidden">
                <button
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                  className="flex items-center gap-1 text-sm text-gray-600 disabled:text-gray-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-400">
                  {modalState.fotoIndex + 1} / {currentFotos.length}
                </span>
                <button
                  onClick={goToNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-1 text-sm text-gray-600 disabled:text-gray-300"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop Counter */}
              <div className="hidden md:block text-center mt-2">
                <span className="text-sm text-gray-400">
                  Foto {modalState.fotoIndex + 1} dari {currentFotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

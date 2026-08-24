'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthContext } from '@/components/AuthProvider';
import { boardingProceduresAPI } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { BoardingProcedure } from '@/lib/types';

const ImageGallery = dynamic(() => import('@/components/ImageGallery').then(mod => ({ default: mod.ImageGallery })), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500">Loading gallery...</div>
});

const YouTubeEmbedForm = dynamic(() => import('@/components/YouTubeEmbedForm').then(mod => ({ default: mod.YouTubeEmbedForm })), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500">Loading video form...</div>
});

const YouTubePlayer = dynamic(() => import('@/components/YouTubePlayer').then(mod => ({ default: mod.YouTubePlayer })), {
  ssr: false,
});

export default function BoardingPage() {
  const { user, isLoading } = useAuthContext();
  const [procedures, setProcedures] = useState<BoardingProcedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<BoardingProcedure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<BoardingProcedure | null>(null);

  useEffect(() => {
    loadProcedures();
  }, []);

  useEffect(() => {
    filterProcedures();
  }, [procedures, searchTerm, selectedCategory]);

  const loadProcedures = async () => {
    setIsLoadingData(true);
    try {
      const data = await boardingProceduresAPI.getAll();
      setProcedures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load procedures');
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterProcedures = () => {
    let filtered = procedures;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.overview?.toLowerCase().includes(term)
      );
    }

    setFilteredProcedures(filtered);
  };

  const categories = Array.from(
    new Set(procedures.map(p => p.category).filter(Boolean))
  ).sort();

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boarding Procedures</h1>
          <p className="text-gray-600 mt-1">Manage boarding procedures and guidelines</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setSelectedProcedure(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            + New Procedure
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search procedures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Procedures Grid */}
      {isLoadingData ? (
        <div className="text-center py-12 text-gray-600">Loading procedures...</div>
      ) : filteredProcedures.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {procedures.length === 0 ? 'No procedures yet' : 'No procedures match your search'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProcedures.map(procedure => (
            <div
              key={procedure.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedProcedure(procedure);
                setIsFormOpen(true);
              }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {procedure.category && (
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {procedure.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{procedure.title}</h3>
                  {procedure.overview && (
                    <div className="text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: typeof procedure.overview === 'string' ? procedure.overview : '' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <ProcedureFormModal
          procedure={selectedProcedure}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedProcedure(null);
          }}
          onSave={() => {
            setIsFormOpen(false);
            setSelectedProcedure(null);
            loadProcedures();
          }}
          isReadOnly={!canEdit}
        />
      )}
    </div>
  );
}

interface ProcedureFormModalProps {
  procedure: BoardingProcedure | null;
  onClose: () => void;
  onSave: () => void;
  isReadOnly: boolean;
}

function ProcedureFormModal({ procedure, onClose, onSave, isReadOnly }: ProcedureFormModalProps) {
  const [title, setTitle] = useState(procedure?.title || '');
  const [category, setCategory] = useState(procedure?.category || '');
  const [overview, setOverview] = useState(procedure?.overview || '');
  const [content, setContent] = useState(procedure?.overview || '');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [youtubeThumbnail, setYoutubeThumbnail] = useState('');
  const [youtubeWidth, setYoutubeWidth] = useState('100%');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(
    procedure?.content && typeof procedure.content === 'object' && (procedure.content as Record<string, unknown>).pdf_url
      ? (procedure.content as Record<string, unknown>).pdf_url as string
      : ''
  );

  // Initialize gallery images and YouTube from procedure
  useEffect(() => {
    if (procedure?.content && typeof procedure.content === 'object') {
      const contentObj = procedure.content as Record<string, unknown>;
      if (Array.isArray(contentObj.gallery_images)) {
        setGalleryImages(contentObj.gallery_images as string[]);
      }
      if (contentObj.youtube_url) {
        setYoutubeUrl(contentObj.youtube_url as string);
        setYoutubeVideoId(contentObj.youtube_video_id as string || '');
        setYoutubeThumbnail(contentObj.youtube_thumbnail as string || '');
        setYoutubeWidth((contentObj.youtube_width as string) || '100%');
      }
    }
  }, [procedure]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !procedure) return;

    setIsUploadingPdf(true);
    try {
      const result = await boardingProceduresAPI.uploadPdf(procedure.id, file);
      setPdfUrl(result.pdfUrl);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) {
      setError('Title and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const contentData: Record<string, unknown> = {
        gallery_images: galleryImages,
        ...(pdfUrl && { pdf_url: pdfUrl }),
      };

      if (youtubeVideoId) {
        contentData.youtube_url = youtubeUrl;
        contentData.youtube_video_id = youtubeVideoId;
        contentData.youtube_thumbnail = youtubeThumbnail;
        contentData.youtube_width = youtubeWidth;
      }

      if (procedure) {
        await boardingProceduresAPI.update(procedure.id, {
          title,
          category,
          overview: content || overview,
          content: contentData,
        });
      } else {
        await boardingProceduresAPI.create({
          title,
          category,
          overview: content,
          content: contentData,
        });
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save procedure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {procedure ? 'View Procedure' : 'New Procedure'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="Procedure title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="e.g., Pre-Boarding, During Boarding"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overview
            </label>
            <textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="Brief summary of this procedure"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details & Instructions
            </label>
            {isReadOnly ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Add procedure details, instructions, and guidelines..."
                disabled={isReadOnly}
              />
            )}
          </div>

          {procedure && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              {pdfUrl && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    📄 {pdfUrl.split('/').pop()}
                  </a>
                  {!isReadOnly && (
                    <label className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                      Replace
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        disabled={isUploadingPdf}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
              {!pdfUrl && !isReadOnly && (
                <label className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-gray-600">
                    {isUploadingPdf ? 'Uploading...' : '📄 Click to upload PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={isUploadingPdf}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {procedure && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Gallery
              </label>
              {isReadOnly ? (
                galleryImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {galleryImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )
              ) : (
                <ImageGallery
                  images={galleryImages}
                  onChange={setGalleryImages}
                  disabled={isReadOnly}
                  maxImages={20}
                />
              )}
            </div>
          )}

          {procedure && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Video
              </label>
              {isReadOnly ? (
                youtubeVideoId && (
                  <YouTubePlayer videoId={youtubeVideoId} width={youtubeWidth} />
                )
              ) : (
                <YouTubeEmbedForm
                  videoUrl={youtubeUrl}
                  videoId={youtubeVideoId}
                  thumbnail={youtubeThumbnail}
                  youtubeWidth={youtubeWidth}
                  onUrlChange={setYoutubeUrl}
                  onVideoIdChange={setYoutubeVideoId}
                  onThumbnailChange={setYoutubeThumbnail}
                  onWidthChange={setYoutubeWidth}
                  disabled={isReadOnly}
                />
              )}
            </div>
          )}

          {!isReadOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {isSubmitting ? 'Saving...' : procedure ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

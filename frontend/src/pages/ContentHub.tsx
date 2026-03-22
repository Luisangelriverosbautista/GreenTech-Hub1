import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { contentService } from '../services/content.service';
import { uploadService } from '../services/upload.service';
import type { BlogPost, CreateBlogPayload, CreateVideoPayload, VideoPost } from '../types/content.types';

type TabType = 'videos' | 'blogs';

const ContentHub = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [videoForm, setVideoForm] = useState<CreateVideoPayload>({
    title: '',
    description: '',
    url: '',
    tags: [],
    status: 'published',
  });

  const [blogForm, setBlogForm] = useState<CreateBlogPayload>({
    title: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    tags: [],
    status: 'draft',
  });

  const canPublish = useMemo(() => user?.role === 'creator', [user?.role]);

  const parseTags = (raw: string): string[] => {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [videoData, blogData] = await Promise.all([
        contentService.getVideos('published'),
        contentService.getBlogs('published'),
      ]);
      setVideos(videoData || []);
      setBlogs(blogData || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(t('No se pudo cargar el contenido. Intenta nuevamente.', 'The content could not be loaded. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    try {
      setError(null);
      setSuccess(null);
      const created = await contentService.createVideo(videoForm);
      setVideos((prev) => [created, ...prev]);
      setVideoForm({
        title: '',
        description: '',
        url: '',
        tags: [],
        status: 'published',
      });
      setSuccess(t('Video publicado correctamente.', 'Video published successfully.'));
    } catch (err: any) {
      setSuccess(null);
      setError(err?.response?.data?.error || t('No se pudo crear el video.', 'The video could not be created.'));
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    try {
      setError(null);
      const submitEvent = e.nativeEvent as SubmitEvent;
      const submitter = submitEvent.submitter as HTMLButtonElement | null;
      const submitStatus = submitter?.value === 'published' ? 'published' : 'draft';

      const created = await contentService.createBlog({
        ...blogForm,
        status: submitStatus,
      });
      if (created.status === 'published') {
        setBlogs((prev) => [created, ...prev]);
      }
      setBlogForm({
        title: '',
        excerpt: '',
        content: '',
        coverImageUrl: '',
        tags: [],
        status: 'draft',
      });
      setSuccess(
        created.status === 'published'
          ? t('Blog publicado correctamente.', 'Blog published successfully.')
          : t('Borrador guardado correctamente.', 'Draft saved successfully.')
      );
    } catch (err: any) {
      setSuccess(null);
      setError(err?.response?.data?.error || t('No se pudo crear el blog.', 'The blog could not be created.'));
    }
  };

  const handleBlogCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setError(null);
      setIsUploadingCover(true);
      const uploaded = await uploadService.uploadImage(file);
      setBlogForm((prev) => ({
        ...prev,
        coverImageUrl: uploaded.url
      }));
    } catch (err: any) {
      setError(err?.response?.data?.error || t('No se pudo subir la imagen de portada.', 'The cover image could not be uploaded.'));
    } finally {
      setIsUploadingCover(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">{t('Contenido de la Comunidad', 'Community Content')}</h1>
        <p className="text-gray-600 mt-2">
          {t('Publica videos por enlace (YouTube/Vimeo) y escribe blogs para compartir avances.', 'Publish videos by link (YouTube/Vimeo) and write blogs to share progress updates.')}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-md ${activeTab === 'videos' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
        >
          {t('Videos', 'Videos')}
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 rounded-md ${activeTab === 'blogs' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
        >
          {t('Blogs', 'Blogs')}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md">{success}</div>}

      {canPublish && activeTab === 'videos' && (
        <form onSubmit={handleCreateVideo} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">{t('Publicar Video', 'Publish Video')}</h2>
          <input
            required
            value={videoForm.title}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t('Título del video', 'Video title')}
            className="w-full border rounded-md px-3 py-2"
          />
          <textarea
            value={videoForm.description}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={t('Descripción', 'Description')}
            className="w-full border rounded-md px-3 py-2"
            rows={3}
          />
          <input
            required
            value={videoForm.url}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, url: e.target.value }))}
            placeholder={t('URL de YouTube o Vimeo', 'YouTube or Vimeo URL')}
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            onChange={(e) => setVideoForm((prev) => ({ ...prev, tags: parseTags(e.target.value) }))}
            placeholder={t('Tags separados por coma', 'Tags separated by commas')}
            className="w-full border rounded-md px-3 py-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" type="submit">
            {t('Guardar Video', 'Save Video')}
          </button>
        </form>
      )}

      {canPublish && activeTab === 'blogs' && (
        <form onSubmit={handleCreateBlog} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">{t('Escribir Blog', 'Write Blog')}</h2>
          <input
            required
            value={blogForm.title}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t('Título del blog', 'Blog title')}
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder={t('Resumen corto', 'Short summary')}
            className="w-full border rounded-md px-3 py-2"
          />
          <textarea
            required
            value={blogForm.content}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder={t('Contenido del blog', 'Blog content')}
            className="w-full border rounded-md px-3 py-2"
            rows={7}
          />
          <div className="space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleBlogCoverUpload}
              className="w-full border rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-500">{t('Imagen de portada opcional (JPG, PNG, WEBP o GIF, max 5MB).', 'Optional cover image (JPG, PNG, WEBP, or GIF, max 5MB).')}</p>
            {isUploadingCover && (
              <p className="text-sm text-blue-700">{t('Subiendo portada...', 'Uploading cover...')}</p>
            )}
            {blogForm.coverImageUrl && (
              <img
                src={blogForm.coverImageUrl}
                alt={t('Vista previa portada', 'Cover preview')}
                className="w-full h-44 object-cover rounded-md"
              />
            )}
          </div>
          <input
            onChange={(e) => setBlogForm((prev) => ({ ...prev, tags: parseTags(e.target.value) }))}
            placeholder={t('Tags separados por coma', 'Tags separated by commas')}
            className="w-full border rounded-md px-3 py-2"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              value="draft"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
            >
              {t('Guardar como borrador', 'Save as draft')}
            </button>
            <button
              type="submit"
              value="published"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {t('Publicar Blog', 'Publish Blog')}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'videos' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('Videos Publicados', 'Published Videos')}</h2>
          {isLoading ? (
            <div className="bg-white p-4 rounded-md">{t('Cargando videos...', 'Loading videos...')}</div>
          ) : videos.length === 0 ? (
            <div className="bg-white p-4 rounded-md">{t('Aún no hay videos publicados.', 'There are no published videos yet.')}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <article key={video._id || video.id || `video-${index}`} className="bg-white p-4 rounded-lg shadow space-y-3">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  {video.description && <p className="text-gray-600 text-sm">{video.description}</p>}
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {video.author?.name || video.author?.email || t('Comunidad', 'Community')}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'blogs' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('Blogs Publicados', 'Published Blogs')}</h2>
          {isLoading ? (
            <div className="bg-white p-4 rounded-md">{t('Cargando blogs...', 'Loading blogs...')}</div>
          ) : blogs.length === 0 ? (
            <div className="bg-white p-4 rounded-md">{t('Aún no hay blogs publicados.', 'There are no published blogs yet.')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map((blog, index) => (
                <article key={blog._id || blog.id || `blog-${index}`} className="bg-white p-4 rounded-lg shadow space-y-2">
                  {blog.coverImageUrl && (
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-44 object-cover object-center bg-gray-100 rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-lg font-semibold">{blog.title}</h3>
                  {blog.excerpt && <p className="text-gray-600 text-sm">{blog.excerpt}</p>}
                  <p className="text-sm text-gray-700 line-clamp-4">{blog.content}</p>
                  <div className="text-xs text-gray-500">
                    {blog.author?.name || blog.author?.email || t('Comunidad', 'Community')}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ContentHub;

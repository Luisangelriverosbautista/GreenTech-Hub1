import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { contentService } from '../services/content.service';
import type { BlogPost, CreateBlogPayload, CreateVideoPayload, VideoPost } from '../types/content.types';

type TabType = 'videos' | 'blogs';

const ContentHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('No se pudo cargar el contenido. Intenta nuevamente.');
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
      const created = await contentService.createVideo(videoForm);
      setVideos((prev) => [created, ...prev]);
      setVideoForm({
        title: '',
        description: '',
        url: '',
        tags: [],
        status: 'published',
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo crear el video.');
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    try {
      setError(null);
      const created = await contentService.createBlog(blogForm);
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
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo crear el blog.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">Contenido de la Comunidad</h1>
        <p className="text-gray-600 mt-2">
          Publica videos por enlace (YouTube/Vimeo) y escribe blogs para compartir avances.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-md ${activeTab === 'videos' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 rounded-md ${activeTab === 'blogs' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Blogs
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}

      {canPublish && activeTab === 'videos' && (
        <form onSubmit={handleCreateVideo} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">Publicar Video</h2>
          <input
            required
            value={videoForm.title}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Título del video"
            className="w-full border rounded-md px-3 py-2"
          />
          <textarea
            value={videoForm.description}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción"
            className="w-full border rounded-md px-3 py-2"
            rows={3}
          />
          <input
            required
            value={videoForm.url}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="URL de YouTube o Vimeo"
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            onChange={(e) => setVideoForm((prev) => ({ ...prev, tags: parseTags(e.target.value) }))}
            placeholder="Tags separados por coma"
            className="w-full border rounded-md px-3 py-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" type="submit">
            Guardar Video
          </button>
        </form>
      )}

      {canPublish && activeTab === 'blogs' && (
        <form onSubmit={handleCreateBlog} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">Escribir Blog</h2>
          <input
            required
            value={blogForm.title}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Título del blog"
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Resumen corto"
            className="w-full border rounded-md px-3 py-2"
          />
          <textarea
            required
            value={blogForm.content}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Contenido del blog"
            className="w-full border rounded-md px-3 py-2"
            rows={7}
          />
          <input
            value={blogForm.coverImageUrl}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
            placeholder="URL de imagen de portada (opcional)"
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            onChange={(e) => setBlogForm((prev) => ({ ...prev, tags: parseTags(e.target.value) }))}
            placeholder="Tags separados por coma"
            className="w-full border rounded-md px-3 py-2"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBlogForm((prev) => ({ ...prev, status: 'draft' }))}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
            >
              Guardar como borrador
            </button>
            <button
              type="submit"
              onClick={() => setBlogForm((prev) => ({ ...prev, status: 'published' }))}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Publicar Blog
            </button>
          </div>
        </form>
      )}

      {activeTab === 'videos' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Videos Publicados</h2>
          {isLoading ? (
            <div className="bg-white p-4 rounded-md">Cargando videos...</div>
          ) : videos.length === 0 ? (
            <div className="bg-white p-4 rounded-md">Aún no hay videos publicados.</div>
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
                    {video.author?.name || video.author?.email || 'Comunidad'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'blogs' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Blogs Publicados</h2>
          {isLoading ? (
            <div className="bg-white p-4 rounded-md">Cargando blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="bg-white p-4 rounded-md">Aún no hay blogs publicados.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map((blog, index) => (
                <article key={blog._id || blog.id || `blog-${index}`} className="bg-white p-4 rounded-lg shadow space-y-2">
                  {blog.coverImageUrl && (
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-44 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-lg font-semibold">{blog.title}</h3>
                  {blog.excerpt && <p className="text-gray-600 text-sm">{blog.excerpt}</p>}
                  <p className="text-sm text-gray-700 line-clamp-4">{blog.content}</p>
                  <div className="text-xs text-gray-500">
                    {blog.author?.name || blog.author?.email || 'Comunidad'}
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

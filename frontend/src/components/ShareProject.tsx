import { useState } from 'react';

interface ShareProjectProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
}

export const ShareProject = ({ 
  projectId, 
  projectTitle, 
  projectDescription
}: ShareProjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const projectUrl = `${baseUrl}/project/${projectId}`;
  
  const shareText = `¡Mira este increíble proyecto en GreenTech Hub!\n\n${projectTitle}\n\n${projectDescription}\n\n¡Únete y ayuda a hacer un impacto ambiental real!`;
  const shortShareText = `${projectTitle} - Un proyecto sostenible en GreenTech Hub\n${projectUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`${shortShareText}`);
    window.open(
      `https://wa.me/?text=${message}`,
      '_blank',
      'width=500,height=600'
    );
  };

  const shareToFacebook = () => {
    const message = encodeURIComponent(shareText);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}&quote=${message}`,
      '_blank',
      'width=600,height=600'
    );
  };

  const shareToTwitter = () => {
    const message = encodeURIComponent(`${projectTitle} - Un proyecto sostenible en @GreenTechHub\n${projectUrl}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${message}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToLinkedin = () => {
    const message = encodeURIComponent(shareText);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(projectTitle)}&summary=${message}`,
      '_blank',
      'width=600,height=600'
    );
  };

  const shareToTelegram = () => {
    const message = encodeURIComponent(`${shortShareText}`);
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(projectUrl)}&text=${message}`,
      '_blank',
      'width=500,height=600'
    );
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(`Mira este proyecto en GreenTech Hub: ${projectTitle}`);
    const body = encodeURIComponent(`${shareText}\n\nVer proyecto completo: ${projectUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors gap-2"
      >
        <span>📤</span>
        Compartir Proyecto
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl z-50 p-4 min-w-80">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Compartir en Redes
            </h3>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">💬</span>
                WhatsApp
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">f</span>
                Facebook
              </button>

              {/* Twitter/X */}
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">𝕏</span>
                Twitter
              </button>

              {/* LinkedIn */}
              <button
                onClick={shareToLinkedin}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition"
              >
                <span className="text-xl">in</span>
                LinkedIn
              </button>

              {/* Telegram */}
              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-cyan-500 rounded-lg font-medium transition"
              >
                <span className="text-xl">✈️</span>
                Telegram
              </button>

              {/* Email */}
              <button
                onClick={shareToEmail}
                className="flex items-center justify-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg font-medium transition"
              >
                <span className="text-xl">✉️</span>
                Email
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Copy Link */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600">Copiar enlace</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 px-3 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareProject;

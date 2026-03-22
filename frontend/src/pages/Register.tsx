import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { uploadService } from '../services/upload.service';

const ALLOWED_KYC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_KYC_FILE_BYTES = 5 * 1024 * 1024;
const API_BASE_FOR_DEBUG = import.meta.env.VITE_API_URL || 'https://greentech-hub1-2.onrender.com/api';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'donor' as 'donor' | 'creator',
    creatorValidation: {
      country: '',
      organizationName: '',
      governmentId: '',
      website: '',
      verificationDocumentUrl: ''
    }
  });
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string[];
    name?: string;
    confirmPassword?: string;
    creatorValidation?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Validar email
    if (!validateEmail(formData.email)) {
      newErrors.email = t('Por favor, ingresa un correo electrónico válido', 'Please enter a valid email address');
      isValid = false;
    }

    // Validar nombre
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
      isValid = false;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors;
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('Las contraseñas no coinciden', 'Passwords do not match');
      isValid = false;
    }

    if (formData.role === 'creator') {
      if (!formData.creatorValidation.country.trim() || !formData.creatorValidation.governmentId.trim() || !formData.creatorValidation.verificationDocumentUrl.trim()) {
        newErrors.creatorValidation = t('Para creadores debes completar país, identificación y documento de validación.', 'Creators must complete country, identification, and validation document fields.');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Error during registration:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleCreatorValidationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      creatorValidation: {
        ...prev.creatorValidation,
        [name]: value
      }
    }));
    setErrors(prev => ({ ...prev, creatorValidation: undefined }));
  };

  const handleCreatorDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_KYC_TYPES.includes(file.type.toLowerCase())) {
      setErrors(prev => ({
        ...prev,
        creatorValidation: t('Formato no permitido. Usa JPG, PNG, WEBP o GIF.', 'Unsupported format. Use JPG, PNG, WEBP, or GIF.')
      }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_KYC_FILE_BYTES) {
      setErrors(prev => ({
        ...prev,
        creatorValidation: t('La imagen supera 5MB. Usa un archivo más liviano.', 'The image exceeds 5MB. Use a smaller file.')
      }));
      event.target.value = '';
      return;
    }

    try {
      setErrors(prev => ({ ...prev, creatorValidation: undefined }));
      setIsUploadingDocument(true);
      const uploaded = await uploadService.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        creatorValidation: {
          ...prev.creatorValidation,
          verificationDocumentUrl: uploaded.url
        }
      }));
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : t('No se pudo subir el documento de validación.', 'The validation document could not be uploaded.');
      const message = rawMessage.includes('backend actual todavía exige sesión')
        ? `${rawMessage} API actual: ${API_BASE_FOR_DEBUG}`
        : rawMessage;
      setErrors(prev => ({
        ...prev,
        creatorValidation: message
      }));
    } finally {
      setIsUploadingDocument(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">
          {t('Registro en GreenTech Hub', 'Sign Up for GreenTech Hub')}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {authError && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {authError}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('Nombre Completo', 'Full Name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('Correo Electrónico', 'Email Address')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('Contraseña', 'Password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.password && (
                <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                  {errors.password.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('Confirmar Contraseña', 'Confirm Password')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                {t('Tipo de Usuario', 'User Type')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="donor">{t('Donante', 'Donor')}</option>
                <option value="creator">{t('Creador de Proyectos', 'Project Creator')}</option>
              </select>
            </div>

            {formData.role === 'creator' && (
              <div className="space-y-4 border border-emerald-200 rounded-md p-4 bg-emerald-50">
                <p className="text-sm font-semibold text-emerald-900">{t('Validación adicional para creadores', 'Additional validation for creators')}</p>
                <input
                  type="text"
                  name="country"
                  value={formData.creatorValidation.country}
                  onChange={handleCreatorValidationChange}
                  placeholder={t('País', 'Country')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  name="organizationName"
                  value={formData.creatorValidation.organizationName}
                  onChange={handleCreatorValidationChange}
                  placeholder={t('Organización (opcional para individuos)', 'Organization (optional for individuals)')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="governmentId"
                  value={formData.creatorValidation.governmentId}
                  onChange={handleCreatorValidationChange}
                  placeholder={t('Identificación oficial / RFC / registro', 'Official ID / Tax ID / registration')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <input
                  type="url"
                  name="website"
                  value={formData.creatorValidation.website}
                  onChange={handleCreatorValidationChange}
                  placeholder={t('Sitio web (opcional)', 'Website (optional)')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleCreatorDocumentUpload}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">{t('Sube comprobante de identidad/registro (JPG, PNG, WEBP o GIF, máx. 5MB).', 'Upload proof of identity/registration (JPG, PNG, WEBP, or GIF, max 5MB).')}</p>
                  {isUploadingDocument && <p className="text-sm text-blue-700 mt-1">{t('Subiendo documento...', 'Uploading document...')}</p>}
                  {formData.creatorValidation.verificationDocumentUrl && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-emerald-700">{t('Documento cargado correctamente.', 'Document uploaded successfully.')}</p>
                      <img
                        src={formData.creatorValidation.verificationDocumentUrl}
                        alt={t('Documento de verificación cargado', 'Uploaded verification document')}
                        className="w-full max-w-xs h-32 object-cover rounded border border-emerald-200 bg-white"
                      />
                    </div>
                  )}
                </div>
                {errors.creatorValidation && (
                  <p className="text-sm text-red-600">{errors.creatorValidation}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isUploadingDocument}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              {isUploadingDocument ? t('Subiendo documento...', 'Uploading document...') : t('Registrarse', 'Sign Up')}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {t('¿Ya tienes una cuenta?', 'Already have an account?')}{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 hover:text-green-700"
          >
            {t('Inicia Sesión', 'Sign In')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
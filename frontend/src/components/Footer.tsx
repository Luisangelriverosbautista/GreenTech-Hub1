function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-bold">GreenTech</span>
            <span className="text-yellow-600 font-bold">Hub</span>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            © 2024 GreenTech Hub. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
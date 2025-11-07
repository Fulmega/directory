import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface FulmegaLogoProps {
  variant?: 'horizontal' | 'symbol' | 'mono';
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  className?: string;
  showText?: boolean;
}

export default function FulmegaLogo({ 
  variant = 'symbol', 
  size = 'medium', 
  clickable = false, 
  className = '',
  showText = true
}: FulmegaLogoProps) {
  const { theme } = useTheme();
  
  // Size configurations
  const sizeConfig = {
    small: {
      symbol: { width: 'w-8', height: 'h-8', text: 'text-lg' },
      horizontal: { width: 'w-8', height: 'h-8', text: 'text-lg' },
      mono: { width: 'w-6', height: 'h-6', text: 'text-sm' }
    },
    medium: {
      symbol: { width: 'w-10', height: 'h-10', text: 'text-xl' },
      horizontal: { width: 'w-10', height: 'h-10', text: 'text-xl' },
      mono: { width: 'w-8', height: 'h-8', text: 'text-lg' }
    },
    large: {
      symbol: { width: 'w-12', height: 'h-12', text: 'text-2xl' },
      horizontal: { width: 'w-12', height: 'h-12', text: 'text-2xl' },
      mono: { width: 'w-10', height: 'h-10', text: 'text-xl' }
    }
  };

  const config = sizeConfig[size][variant];
  
  // Responsive adjustments for mobile
  const responsiveSize = size === 'large' ? 'md:w-12 md:h-12 w-10 h-10' : 
                        size === 'medium' ? 'md:w-10 md:h-10 w-8 h-8' : 
                        'md:w-8 md:h-8 w-6 h-6';

  // Logo image paths based on variant and theme
  const getLogoPath = () => {
    if (variant === 'horizontal') return '/logos/fulmega_texto_completo.png';
    if (variant === 'mono') return '/logos/fulmega_f_logo_oscuro.png';
    // symbol variant
    return theme === 'dark' ? '/logos/fulmega_f_logo_oscuro.png' : '/logos/fulmega_f_logo_principal.png';
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${className}`}>
      <div className={`${config.width} ${config.height} flex items-center justify-center overflow-hidden`}>
        {variant === 'symbol' || variant === 'mono' ? (
          <img 
            src={getLogoPath()} 
            alt="Fulmega Logo" 
            className="w-full h-full object-contain"
            loading="eager"
          />
        ) : (
          <img 
            src={getLogoPath()} 
            alt="Fulmega Logo" 
            className="w-full h-full object-contain"
            loading="eager"
          />
        )}
      </div>
      
      {showText && (
        <span className={`${config.text} font-bold text-foreground transition-colors duration-200`}>
          Fulmega.eu
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link 
        to="/" 
        className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1"
        title="Ir a la página principal"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

// Quick export for different use cases
export const FulmegaLogoHeader = (props: Omit<FulmegaLogoProps, 'variant' | 'size' | 'clickable'>) => (
  <FulmegaLogo {...props} variant="symbol" size="medium" clickable />
);

export const FulmegaLogoModal = (props: Omit<FulmegaLogoProps, 'variant' | 'size' | 'clickable' | 'showText'>) => {
  // Modal always uses principal logo for consistency
  const { className } = props || {};
  
  return (
    <div className={`w-12 h-12 flex items-center justify-center overflow-hidden ${className || ''}`}>
      <img 
        src="/logos/fulmega_f_logo_principal.png" 
        alt="Fulmega Logo" 
        className="w-full h-full object-contain"
        loading="eager"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};

export const FulmegaLogoFooter = (props: Omit<FulmegaLogoProps, 'variant' | 'size' | 'clickable'>) => (
  <FulmegaLogo {...props} variant="symbol" size="small" clickable />
);

export const FulmegaLogoHorizontal = (props: Omit<FulmegaLogoProps, 'variant' | 'clickable'>) => (
  <FulmegaLogo {...props} variant="horizontal" clickable={true} />
);
export const Button = ({ children, onClick, variant = 'default', className = '', type = 'button', style, disabled, ...props }) => {
  const baseClass = 'app-button';
  const variantClass = variant === 'primary' ? 'primary' : '';
  
  return (
    <button 
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

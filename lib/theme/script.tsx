export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('theme') || 'auto';
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        const reduceMotion = localStorage.getItem('reduceMotion') === 'true';

        let resolvedTheme = theme;
        if (theme === 'auto') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.setAttribute('data-font-size', fontSize);

        if (reduceMotion) {
          document.documentElement.style.setProperty('--motion-duration', '0.01ms');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}

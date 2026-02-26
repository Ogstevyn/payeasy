import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';

/**
 * GET /api/deeplink
 * 
 * Redirect service for mobile deep links.
 * Checks for mobile user agents and attempts to redirect to the native app scheme.
 * Falls back to the web version if the app is not installed or on desktop.
 * 
 * Parameters:
 * - path: The destination path (e.g., 'pay')
 * - ...otherParams: Any other parameters to pass to the destination
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    // Extract all other parameters to forward them
    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== 'path') {
            forwardParams.append(key, value);
        }
    });

    const queryString = forwardParams.toString();
    const destination = queryString ? `${path}?${queryString}` : path;

    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

    // Log for analytics
    logger.info({
        event: 'deep_link_visited',
        path,
        isMobile,
        userAgent,
        params: Object.fromEntries(forwardParams.entries())
    }, 'Deep link accessed');

    // If mobile, we can provide a landing page that tries to open the app
    // or use a structured redirect. For simplicity in this implementation, 
    // we redirect to the custom scheme if mobile, but often a "smart banner" 
    // or a middle-page is better for UX.

    if (isMobile) {
        const nativeUrl = `payeasy://${destination}`;

        // Using a meta-refresh or a script-based redirect is often more reliable 
        // for deep links than a 302 redirect for certain mobile browsers.
        // Here we return a small HTML that attempts to open the app and falls back.

        const webFallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${destination}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Opening PayEasy...</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <p>Redirecting you to the app...</p>
          <script>
            window.location.href = "${nativeUrl}";
            setTimeout(function() {
              window.location.href = "${webFallbackUrl}";
            }, 2500);
          </script>
        </body>
      </html>
    `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // Desktop or non-mobile fallback
    return NextResponse.redirect(new URL(`/${destination}`, request.url));
}

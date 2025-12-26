import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: '#F59E0B', // Safety Orange (Amber 500)
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F172A', // Navy 900
                    borderRadius: '4px', // Rounded corners
                    position: 'relative',
                }}
            >
                {/* Gear Icon Background */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        width: '24px',
                        height: '24px',
                        color: '#0F172A',
                        opacity: 0.9,
                        position: 'absolute',
                    }}
                >
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    <circle cx="12" cy="12" r="7" />
                </svg>

                {/* Upward Arrow Overlay */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        zIndex: 10,
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            width: '16px',
                            height: '16px',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                        }}
                    >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}

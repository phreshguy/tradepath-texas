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
                    borderRadius: '4px', // Slight rounded corners
                    fontWeight: 800,
                }}
            >
                T
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TradePath - Texas Trade School ROI Engine';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0F172A', // Industrial Navy
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: 'white', fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em' }}>TRADE</div>
                    <div style={{ color: '#F59E0B', fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em' }}>PATH</div>
                </div>
                <div style={{
                    color: '#CBD5E1',
                    fontSize: 30,
                    marginTop: 20,
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.1)',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    border: '1px solid #334155'
                }}>
                    Texas Trade School ROI Engine
                </div>
                <div style={{ display: 'flex', marginTop: 40, gap: '20px' }}>
                    <div style={{ color: '#10B981', fontSize: 24, fontWeight: 'bold' }}>+$50k Salaries</div>
                    <div style={{ color: '#64748B', fontSize: 24 }}>•</div>
                    <div style={{ color: '#10B981', fontSize: 24, fontWeight: 'bold' }}>Gov Verified Data</div>
                </div>
            </div>
        ),
        { ...size }
    );
}

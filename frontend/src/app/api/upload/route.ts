import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { projectId, fileName, fileSize } = await request.json();

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({
    uploadUrl: `https://mock-upload.myairbridge.com/${projectId}`,
    token: 'mock_jwt_token_123'
  });
}

import { NextResponse } from 'next/server';
import type { Project, ProjectWizardState, Currency } from '@/types';

// Mock projects data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    title: 'Neon Horizon - Single',
    service: {} as any, // Placeholder
    status: 'IN_PROGRESS',
    progress: 65,
    createdAt: '2023-10-15',
    dueDate: '2023-10-25',
    price: 150,
    currency: 'USD' as Currency,
    isPaid: true,
    paymentType: 'FULL',
    files: [
      { id: 'f1', name: 'Vocals_Dry.wav', size: '45MB', uploadDate: '2023-10-15', type: 'STEM' },
      { id: 'f2', name: 'Beat_Stem.wav', size: '120MB', uploadDate: '2023-10-15', type: 'STEM' },
      { id: 'f3', name: 'Reference.mp3', size: '5MB', uploadDate: '2023-10-15', type: 'REFERENCE' },
    ]
  },
  {
    id: 'PRJ-002',
    title: 'Acoustic Sessions EP',
    service: {} as any,
    status: 'PENDING_PAYMENT',
    progress: 0,
    createdAt: '2023-10-20',
    dueDate: '2023-11-01',
    price: 240000,
    currency: 'COP' as Currency,
    isPaid: false,
    files: []
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json(MOCK_PROJECTS);
}

export async function POST(request: Request) {
  const wizardData: ProjectWizardState = await request.json();

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const project: Project = {
    id: `PRJ-${Math.floor(Math.random() * 10000)}`,
    title: wizardData.context?.substring(0, 20) || 'New Project',
    service: {} as any,
    status: 'PENDING_PAYMENT',
    progress: 0,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    price: wizardData.estimatedPrice,
    currency: 'USD' as Currency,
    isPaid: false,
    files: []
  };

  return NextResponse.json(project);
}

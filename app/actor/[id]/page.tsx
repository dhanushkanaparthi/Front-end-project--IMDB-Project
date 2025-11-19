import { Header } from '@/components/header';
import { ActorProfile } from '@/components/actor-profile';
import { Metadata } from 'next';

export const runtime = 'edge';

export const revalidate = 86400;

interface ActorPageProps {
  params: { id: string };
}

async function getActorData(id: string) {
  return {
    id,
    name: 'Brad Pitt',
    biography: 'An acclaimed American actor and film producer who has received multiple awards and nominations.',
    birthday: '1963-12-18',
    place_of_birth: 'Shawnee, Oklahoma, USA',
    profile_path: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg',
    known_for_department: 'Acting',
    also_known_as: ['William Bradley Pitt'],
    credits: [
      { id: '550', title: 'Fight Club', character: 'Tyler Durden', year: '1999', poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
      { id: '807', title: 'Se7en', character: 'Detective David Mills', year: '1995', poster: '/6yoghtyTpznpBik8EngEmJskVUO.jpg' },
    ],
  };
}

export async function generateMetadata({ params }: ActorPageProps): Promise<Metadata> {
  const actor = await getActorData(params.id);

  return {
    title: `${actor.name} - MovieDB`,
    description: actor.biography.slice(0, 160),
  };
}

export default async function ActorPage({ params }: ActorPageProps) {
  const actor = await getActorData(params.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ActorProfile actor={actor} />
    </div>
  );
}
